var gulp = require('gulp');
var gutil = require('gulp-util');
var bower = require('bower');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var sh = require('shelljs');
var util = require('gulp-util');

var DEFAULT_CONFIG = 'staging';

var paths = {
  sass: ['./scss/**/*.scss']
};

gulp.task('default', ['sass']);

gulp.task('sass', function (done) {
  gulp.src('./scss/*.scss')
          .pipe(sass({
            errLogToConsole: true
          }))
          .pipe(gulp.dest('./www/css/'))
          .pipe(minifyCss({
            keepSpecialComments: 0
          }))
          .pipe(rename({extname: '.min.css'}))
          .pipe(gulp.dest('./www/css/'))
          .on('end', done);
});

gulp.task('watch', function () {
  gulp.watch(paths.sass, ['sass']);
});

gulp.task('install', ['git-check'], function () {
  return bower.commands.install()
          .on('log', function (data) {
            gutil.log('bower', gutil.colors.cyan(data.id), data.message);
          });
});

gulp.task('git-check', function (done) {
  if (!sh.which('git')) {
    console.log(
            '  ' + gutil.colors.red('Git is not installed.'),
            '\n  Git, the version control system, is required to download Ionic.',
            '\n  Download git here:', gutil.colors.cyan('http://git-scm.com/downloads') + '.',
            '\n  Once git is installed, run \'' + gutil.colors.cyan('gulp install') + '\' again.'
            );
    process.exit(1);
  }
  done();
});

function setConfig(config) {
  gulp.src('./www/config/' + config + '.js')
          .pipe(rename({basename: 'config'}))
          .pipe(gulp.dest('./www/js/'));
}

gulp.task('setconfig', function () {
  var env = DEFAULT_CONFIG;
  if (util.env.prod) {
    env = 'prod';
  }
  if (util.env.dev) {
    env = 'dev';
  }
  setConfig(env);
});

gulp.task('check-config-exists', function () {
  var fs = require('fs');
  if (!fs.existsSync('./www/js/config.js')) {
    setConfig('staging');
  }
});

#!/usr/bin/env node

var fs = require('fs');
var path = require('path');

var filestocopy = [{
  'resources/android/push-notification-logo/drawable-hdpi-v11/pushnotificationlogo.png' : 'platforms/android/res/drawable-hdpi-v11/pushnotificationlogo.png',
  'resources/android/push-notification-logo/drawable-hdpi/pushnotificationlogo.png' : 'platforms/android/res/drawable-hdpi/pushnotificationlogo.png',
  'resources/android/push-notification-logo/drawable-mdpi-v11/pushnotificationlogo.png' : 'platforms/android/res/drawable-mdpi-v11/pushnotificationlogo.png',
  'resources/android/push-notification-logo/drawable-mdpi/pushnotificationlogo.png' : 'platforms/android/res/drawable-mdpi/pushnotificationlogo.png',
  'resources/android/push-notification-logo/drawable-xhdpi-v11/pushnotificationlogo.png' : 'platforms/android/res/drawable-xhdpi-v11/pushnotificationlogo.png',
  'resources/android/push-notification-logo/drawable-xhdpi/pushnotificationlogo.png' : 'platforms/android/res/drawable-xhdpi/pushnotificationlogo.png',
  'resources/android/push-notification-logo/drawable-xxhdpi-v11/pushnotificationlogo.png' : 'platforms/android/res/drawable-xxhdpi-v11/pushnotificationlogo.png',
  'resources/android/push-notification-logo/drawable-xxhdpi/pushnotificationlogo.png' : 'platforms/android/res/drawable-xxhdpi/pushnotificationlogo.png',
  'resources/android/push-notification-logo/drawable-xxxhdpi-v11/pushnotificationlogo.png' : 'platforms/android/res/drawable-xxxhdpi-v11/pushnotificationlogo.png',
  'resources/android/push-notification-logo/drawable-xxxhdpi/pushnotificationlogo.png' : 'platforms/android/res/drawable-xxxhdpi/pushnotificationlogo.png'
}];

var rootdir = process.argv[2];

filestocopy.forEach(function (obj) {
  Object.keys(obj).forEach(function (key) {
    var val = obj[key];
    var srcfile = path.join(rootdir, key);
    var destfile = path.join(rootdir, val);
    var destdir = path.dirname(destfile);
    if (fs.existsSync(srcfile) && fs.existsSync(destdir)) {
      fs.createReadStream(srcfile).pipe(
              fs.createWriteStream(destfile));
      console.log("[✓] Copied " + key + " to " + val);
    }
  });
});
#!/usr/bin/env node

var fs = require('fs');
var path = require('path');

var filestocopy = [{
  "resources/notification_icon.png": "platforms/android/res/drawable-xhdpi/notification_icon.png"
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
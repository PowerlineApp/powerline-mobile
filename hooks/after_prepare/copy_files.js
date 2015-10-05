#!/usr/bin/env node
var fs = require('fs');
var path = require('path');
var filestocopy = [{
    "resources/notification_icon.png": "platforms/android/res/drawable-xhdpi/notification_icon.png",
	"frameworks/FlurryAnalytics-4.1.0.jar": "platforms/android/libs/FlurryAnalytics-4.1.0.jar",
	"frameworks/libFlurry_6.2.0.a": "platforms/ios/libFlurry_6.2.0.a"
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
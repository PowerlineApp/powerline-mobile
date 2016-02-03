/**
 * Initialize filters module
 */

angular.module('app.filters', []).filter('elapsed', function () {

  function str(value, item, showZero) {
    if (value) {
      return value + ' ' + item + ' ';
    } else if (showZero) {
      return value + ' ' + item + ' ';
    }
    return '';
  }

  return function (input) {
    if (input) {
      var current = new Date();
      var elapsed = new Date(current - new Date(input));
      var days = Math.floor(elapsed.getTime() / 86400000);
      if (elapsed.getTime() < 0) {
        return '0 m';
      }
      if (days) {
        return str(days, 'd') + str(elapsed.getUTCHours(), 'h');
      } else {
        return str(elapsed.getUTCHours(), 'h') + str(elapsed.getUTCMinutes(), 'm', true);
      }
    }
    return '';
  };
}).filter('orShow', function () {
  return function (input, truthful, untruthful) {
    return input ? truthful : untruthful;
  };
}).filter('createGoogleMapsLink', function () {
  return function (input) {
    return 'http://maps.google.com/maps?q=' + encodeURIComponent(input);
  };
}).filter('iJoin', function () {
  return function (input, separator) {
    return _.compact(input || []).join(separator);
  };
}).filter('iTel', function () {
  var replacement = /[^\d]/g;
  return function (input) {
    return 'tel:' + String(input).replace(replacement, '');
  };
}).filter('replace', function () {
  return function (input, pattern, replacement, modifiers) {
    return (input || '').replace(new RegExp(pattern, modifiers), replacement);
  };
}).filter('trim', function () {
  return function (input) {
    if (typeof (input) !== 'string') {
      return input;
    }
    return input.replace(/^\s*/, '').replace(/\s*$/, '');
  };
}).filter('imgix', function (serverConfig, $window) {
  return function (imgURL, options) {
    options = options || {};
    if (!options.w && !options.h) {
      options.w = $window.innerWidth;
    }
    var patts = imgURL.replace('http://', '').replace('https://', '').split(/\//g);
    if (patts[0].indexOf('amazonaws.com') === -1) {
      return imgURL;
    }
    patts.splice(0, 1);
    var newURL = 'http://powerline-' + serverConfig.env + '.imgix.net/' + patts.join('/');
    newURL += newURL.indexOf('?') === -1 ? '?' : '&';
    angular.forEach(options, function (val, key) {
      newURL += key + '=' + val + '&';
    });
    if (newURL.substr(newURL.length - 1) === '&') {
      newURL = newURL.substr(0, newURL.length - 1);
    }
    return newURL;
  };
});

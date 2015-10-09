/**
 * Initialize filters module
 */

angular.module('app.filters', []).filter('elapsed',function () {

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
}).filter('orShow',function () {
  return function (input, truthful, untruthful) {
    return input ? truthful : untruthful;
  };
}).filter('createGoogleMapsLink',function () {
  return function (input) {
    return 'http://maps.google.com/maps?q=' + encodeURIComponent(input);
  };
}).filter('iJoin',function () {
  return function (input, separator) {
    return _.compact(input || []).join(separator);
  };
}).filter('iTel',function () {
  var replacement = /[^\d]/g;
  return function (input) {
    return 'tel:' + String(input).replace(replacement, '');
  };
}).filter('replace', function () {
  return function (input, pattern, replacement, modifiers) {
    return (input || '').replace(new RegExp(pattern, modifiers), replacement);
  };
});

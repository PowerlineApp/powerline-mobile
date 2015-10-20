angular.module('app.services').factory('iStorage',function ($window) {

  var keyPrefix = 'POWERLINE-'

  return {
    set: function (key, value) {
      if (typeof(value) !== 'undefined') {
        $window.localStorage.setItem(keyPrefix + key, angular.toJson(value));
      } else {
        $window.localStorage.removeItem(keyPrefix + key);
      }
    },

    get: function (key) {
      var str = $window.localStorage.getItem(keyPrefix + key);
      return str ? angular.fromJson(str) : null;
    }
  };

}).factory('iStorageMemory', function ($cacheFactory) {
  return $cacheFactory('iStorageMemory');
});
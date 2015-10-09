angular.module('app.services').factory('iStorage',function ($window) {

  return {
    set: function (key, value) {
      if (value) {
        $window.localStorage.setItem(key, angular.toJson(value));
      } else {
        $window.localStorage.removeItem(key);
      }
    },

    get: function (key) {
      var str = $window.localStorage.getItem(key);
      return str ? angular.fromJson(str) : null;
    }
  };

}).factory('iStorageMemory', function ($cacheFactory) {
  return $cacheFactory('iStorageMemory');
});
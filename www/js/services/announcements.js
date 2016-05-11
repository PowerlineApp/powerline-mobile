angular.module('app.services').factory('announcements',function ($q, AnnouncementsResource, iStorage) {
  var announcements = [],
    LAST_VIEWED_ANNOUNCEMENTS_KEY = 'announcements_viewed_date',
    start = new Date(Date.now() - 86400000),
    lastViewedDate = new Date(Date.now() - 86400000),
    numberOfNew = 0
    ;

  var strDate = iStorage.get(LAST_VIEWED_ANNOUNCEMENTS_KEY);
  if (strDate) {
    lastViewedDate = new Date(strDate);
  }

  function prepare(data) {
    numberOfNew = 0;
    _(data).each(function (item) {
      item.published_at_date = new Date(item.published_at);
      if (item.published_at_date > lastViewedDate) {
        numberOfNew++;
      }
    });
  }

  return {
    get: function () {
      return announcements;
    },

    load: function () {
      var deferred = $q.defer();
      start.setTime(Date.now() - 7776000000 * 2);
      AnnouncementsResource.query(function (data) {
        var data = $.map(data, function(value, index) {
          return [value];
        });
        prepare(data);
        announcements = data;
        // console.log(JSON.stringify(announcements));
        deferred.resolve(announcements);
      }, function () {
        deferred.reject();
      });
      return deferred.promise;
    },

    getNumberOfNew: function () {
      return numberOfNew;
    },

    setViewed: function () {
      lastViewedDate = new Date(Date.now());
      iStorage.set(LAST_VIEWED_ANNOUNCEMENTS_KEY, lastViewedDate.toUTCString());
    },

    updateNumberOfNew: function () {
      numberOfNew = 0;
      _(announcements).each(function (item) {
        if (item.published_at_date > lastViewedDate) {
          numberOfNew++;
        }
      });
    }
  };

}).factory('AnnouncementsResource', function ($resource, serverConfig, iStorage) {
  start = new Date(Date.now() - 7776000000 * 2);
  return $resource(serverConfig.url + '/api/announcements', {start: start}, {
    query: {
      method: 'GET',
      // headers: {
      //   token: iStorage.get('token')
      // }
    }
  });
});




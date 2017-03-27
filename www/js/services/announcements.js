angular.module('app.services').factory('announcements',function ($q, $http, serverConfig, AnnouncementsResource, iStorage) {

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
      if (!item.is_read) {
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
      AnnouncementsResource.query({start: start.toUTCString()}, function (response) {
        var data = response.payload
        prepare(data);
        announcements = data;
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

      var ids = [];

      _(announcements).each(function (item) {
        if (!item.is_read) {
          ids.push(item.id);
        }
      });

      // Mark announcements as read.
      if (ids.length > 0) {
        var data = {
          announcements: ids,
          read: true
        };

        console.log('---- setViewed ----');

        $http({
          method: 'PATCH',
          url: serverConfig.url + '/api/v2/announcements',
          data: data,
          headers: {
            'Content-Type': 'application/json'
          }
        }).then(function (response) {
          console.log('successed to mark announcements as read');
          console.log(response);

          _(response.data).each(function (item) {

            if (item.is_read) {
              var announcement = _.where(announcements, {id: item.id});
              announcement[0].is_read = item.is_read;
            }
          });

          // Update announcements
          prepare(announcements);
          console.log("after - numberOfNew: " + numberOfNew);
        }, function(error){
          console.log('failed to mark announcements as read')
          console.log(error)
        });
      }
    },

    updateNumberOfNew: function () {
      numberOfNew = 0;
      _(announcements).each(function (item) {
        if (!item.is_read) {
          numberOfNew++;
        }
      });
    }
  };

}).factory('AnnouncementsResource', function ($resource, serverConfig) {
  var strDate = new Date(Date.now() - 86400000);
  return $resource(serverConfig.url + '/api/v2/announcements', {},{
    query: {
      method: 'GET',
      params: {start: strDate},
      isArray: false
    }
  });
});

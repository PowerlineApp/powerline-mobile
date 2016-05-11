angular.module('app.services').factory('representatives', function ($resource, serverConfig, $q, $http) {

  var Representatives = $resource(serverConfig.url + '/api/representatives\\', {}, {
    get: {
      method: 'GET',
      isArray: false,
      params: {
        representativeId: 0,
        storageId: 0
      },
      url: serverConfig.url + '/api/representatives/info/:representativeId/:storageId'
    },

    getQuestions: {
      method: 'GET',
      isArray: true,
      url: serverConfig.url + '/api/poll/question/representative/:representativeId'
    }
  });
  var representativesGroups = [],
    representativeById = {},
    representativeByStorageId = {}
    ;

  var groupTypes = {
    US: ['US House', 'US Senate', 'Office of the President'],
    STATE: ['Office of the Governor', 'State Senate', 'State Assembly'],
    LOCAL: ['Town Council', 'Local']
  };

  var service = {
    getRepresentativesGroups: function () {
      return representativesGroups;
    },

    getRepresentativesByGroupType: function (type) {
      // console.log(type);
      return _(representativesGroups).reduce(function (memo, group) {
        // console.log("memo:" + JSON.stringify(memo));
        // console.log("group:" + JSON.stringify(group));
        if (_.contains(groupTypes[type], group.title)) {
          return memo.concat(group.representatives);
        }
        return memo;
      }, []);
    },

    load: function () {
      var deferred = $q.defer();

      var results = Representatives.query(
        function () {
          representativesGroups = results;
          parseRepresentativesGroups(representativesGroups);
          deferred.resolve(representativesGroups);
        },
        function (data) {
          var error = 'Error occurred.';
          deferred.reject(error);
        }
      );

      return deferred.promise;
    },

    loadCommittees: function (storageId) {
      return $http({
        method: 'GET',
        url: serverConfig.url + '/api/representatives/info/committee/' + storageId
      }).then(function (response) {
        return response.data;
      });
    },

    loadSponsoredBills: function (storageId) {
      return $http({
        method: 'GET',
        url: serverConfig.url + '/api/representatives/info/sponsored-bills/' + storageId
      }).then(function (response) {
        return response.data;
      });
    },

    loadInfo: function (representativeId, storageId) {
      var deferred = $q.defer();

      var representativeInfo = Representatives.get(
        {
          representativeId: representativeId,
          storageId: storageId
        },
        function () {
          representativeInfo.questions = [];
          parseInfo(representativeInfo);
          if (representativeId) {
            representativeById[representativeId] = representativeInfo;
          } else {
            representativeByStorageId[storageId] = representativeInfo;
          }
          service.updateInfo(representativeId);
          deferred.resolve(representativesGroups);
        },
        function () {
          var error = 'Error occurred.';
          deferred.reject(error);
        }
      );

      return deferred.promise;
    },

    get: function (representativeId, storageId) {
      return representativeId ? representativeById[representativeId] : representativeByStorageId[storageId];
    },

    updateInfo: function (representativeId) {
      var representativeInfo = representativeById[representativeId];
      if (representativeInfo) {
        representativeInfo.questions = Representatives.getQuestions({representativeId: representativeInfo.id}, function () {
//                    activity.parse(representativeInfo.questions);
        });
      }
    }
  };

  function parseRepresentativesGroups(groups) {
    _(groups).each(function (group) {
      _(group.representatives).each(function (item) {
        if (item.representative) {
          item.first_name = item.first_name || item.representative.first_name;
          item.last_name = item.last_name || item.representative.last_name;
          item.official_title = item.official_title || item.representative.official_title;
          item.avatar_file_path = item.avatar_file_path || item.representative.avatar_file_path;
        }
        item.storage_id = item.storage_id || 0;
      });
    });
  }

  function parseInfo(data) {
    data.full_address = _.compact([data.official_address, data.city, data.state, data.country]).join(', ');
    data.location = _.compact([data.city, data.state, data.country]).join(', ');
  }

  return service;
});

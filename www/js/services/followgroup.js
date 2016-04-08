angular.module('app.services').factory('followgroup',function (followGroupResource, followGroupData, $q, iStorage, $http, serverConfig, follows) {

  var LAST_APPROVE_FOLLOWING_QUERY_DATE = 'last-approve-following-query-date';

  var service = {
    get: function (id) {
      return followGroupData.byId[id];
    }
  };

  return service;

}).factory('followGroupResource',function (serverConfig, $resource) {
  return $resource(serverConfig.url + '', null, {
    get: {
      method: 'GET',
      isArray: true,
      url: serverConfig.url + '/api/profile/info/:id'
    }
  });
}).value('followGroupData', {
  byId: {}
});

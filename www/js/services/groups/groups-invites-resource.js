angular.module('app.services').factory('GroupsInvitesResource', function ($resource, serverConfig) {
  return $resource(serverConfig.url + '/api/groups/invites', null, {
    approve: {
      method: 'POST',
      params: {id: '@id'},
      url: serverConfig.url + '/api/groups/invites/approve/:id'
    },
    reject: {
      method: 'POST',
      params: {id: '@id'},
      url: serverConfig.url + '/api/groups/invites/reject/:id'
    }
  });
})
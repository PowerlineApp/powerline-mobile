angular.module('app.services').factory('invites', function (JsCollection, $http, serverConfig) {
  var invites = new JsCollection();
  return {
    load: function () {
      return $http.get(serverConfig.url + '/api/invites/').then(function (response) {
        invites = new JsCollection(response.data);
        return invites;
      });
    },
    get: function () {
      return invites;
    },
    invite: function (id, usernames) {
      var data = {users: usernames};
      var payload = JSON.stringify(data)
      var headers = {headers: {'Content-Type': 'application/json'}}
      return $http.put(serverConfig.url + '/api/v2/groups/'+id+'/users', payload, headers)
    },

    remove: function (invite) {
      invites.models = invites.without(invite);
      return $http['delete'](serverConfig.url + '/api/invites/' + invite.get('id'));
    }
  };
});

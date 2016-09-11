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

    remove: function (invite) {
      invites.models = invites.without(invite);
      return $http['delete'](serverConfig.url + '/api/invites/' + invite.get('id'));
    }
  };
});

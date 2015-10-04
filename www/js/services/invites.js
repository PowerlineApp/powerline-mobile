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
    invite: function (id, followers) {
      var data = [];
      _(followers).each(function (followerId) {
        data.push({
          type: 'user-to-group',
          group: {id: id},
          user: {id: followerId}
        });
      });

      return $http.post(serverConfig.url + '/api/invites/', data);
    },

    remove: function (invite) {
      invites.models = invites.without(invite);
      return $http['delete'](serverConfig.url + '/api/invites/' + invite.get('id'));
    }
  };
});

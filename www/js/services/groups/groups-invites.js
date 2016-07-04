angular.module('app.services').factory('groupsInvites',function (GroupsInvitesResource, $q) {

  var invites = [];

  return {
    load: function () {
      var deferred = $q.defer();
      var results = GroupsInvitesResource.query(function () {
        invites = results;
        deferred.resolve();
      }, function () {
        deferred.reject();
      });
      return deferred.promise;
    },

    get: function () {
      return invites;
    },

    hasInvite: function (id) {
      return _(invites).any(function (item) {
        return item.id === id;
      });
    }
  };
})

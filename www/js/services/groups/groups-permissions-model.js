angular.module('app.services').factory('PermissionsModel', function (JsModel, $http, serverConfig) {
  return JsModel.extend({
    keys: ['permissions_name', 'permissions_contacts', 'permissions_responses'],

    parsers: {
      permissions_approved_at: 'date'
    },
    hasNew: function () {
      var self = this;
      var group = this.get('group');
      if (group.permissions_changed_at && new Date(group.permissions_changed_at) < this.get('permissions_approved_at')) {
        return false;
      }
      return _(this.get('group').required_permissions).some(function (permission) {
        return !self.get(permission);
      });
    },
    getNew: function () {
      var self = this;
      return _(this.get('group').required_permissions).reduce(function (memo, permission) {
        if (!self.get(permission)) {
          memo.push(permission);
        }
        return memo;
      }, []);
    },
    approveNew: function () {
      var self = this;
      _(this.get('group').required_permissions).each(function (permission) {
        self.set(permission, true);
      });
      return this;
    },
    save: function () {
      var data = {};
      var self = this;
      _(this.keys).each(function (key) {
        data[key] = self.get(key);
      });

      return $http.post(serverConfig.url + '/api/groups/' + this.get('group').id + '/permissions', data);
    }
  });
});
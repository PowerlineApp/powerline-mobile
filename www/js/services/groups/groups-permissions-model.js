angular.module('app.services').factory('PermissionsModel', function (JsModel, $http, serverConfig) {
    var permissionsLabels = {
      permissions_name: 'Name',
      permissions_contacts: 'Contact information',
      permissions_responses: 'Responses',
      permissions_address: 'Street Address',
      permissions_city: 'City',
      permissions_state: 'State',
      permissions_country: 'Country',
      permissions_zip_code: 'Zip Code',
      permissions_email: 'Email',
      permissions_phone: 'Phone Number'
    }

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
    hasPermissions: function(){
      return this.get('required_permissions') && this.get('required_permissions').length > 0;
    },
    setUnconfirmedPermission: function(permissionsHash){
      var permissionsRequidedByGroup = this.get('required_permissions')
      var permissionsConfirmedByUser = []
      _.each(permissionsHash,function(isConfirmed, permission){
        if(isConfirmed == true)
          permissionsConfirmedByUser.push(permission)
      })
      this._permissionsToConfirmByUser = _.difference(permissionsRequidedByGroup, permissionsConfirmedByUser)
    },
    getPermissionsToConfirmByUserForHumans: function(){
      return this._permissionsToConfirmByUser.map(function(perm){
        return permissionsLabels[perm]
      })
    },
    getPermissionsRequiredByGroupForHumans: function(){
      return this.get('required_permissions').map(function(p){
        return permissionsLabels[p]
      })
    },
    confirmPermissions: function(){
      var data = {}
      this._permissionsToConfirmByUser.forEach(function(p){
        data[p] = true
      })
      var payload = JSON.stringify(data)
      var headers = {headers: {'Content-Type': 'application/json'}}
      return $http.put(serverConfig.url + '/api/v2/groups/'+this.get('group').id+'/permissions', payload, headers)
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
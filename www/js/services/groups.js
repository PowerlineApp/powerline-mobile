angular.module('app.services').factory('groups',function ($resource, serverConfig, $q, $http, PermissionsModel, iStorage, GroupModel, $rootScope) {
  var GROUPS_CACHE_ID = 'group-items';
  
//        GROUP_TYPE_COUNTRY = 1,
//        GROUP_TYPE_STATE = 2,
//        GROUP_TYPE_LOCAL = 3
    
  var Groups = $resource(serverConfig.url + '/api/groups', null, {
    query: {
      method: 'GET',
      isArray: false,
      url: serverConfig.url + '/api/v2/user/groups'
    },

    get: {
      method: 'GET',
      isArray: false,
      url: serverConfig.url + '/api/v2/groups/:id'
    },

    getActivities: {
      method: 'GET',
      isArray: true,
      url: serverConfig.url + '/api/poll/question/group/:id'
    }
  });

  var JoinGroups = $resource(serverConfig.url + '/api/groups/:sort', {sort: ''});
  var groupsById = {};
  var lettersGroups = [];

  var popularGroups = [];
  var newGroups = [];

  var service = {
    load: function (doNotEmitGroupsUpdatedEvent) {
      var that = this
      return  $http.get(serverConfig.url + '/api/v2/user/groups').then(function (response){
        _createGroupModels(response.data.payload);
        if(!doNotEmitGroupsUpdatedEvent)
          $rootScope.$broadcast('groups-updated');
        iStorage.set('GROUPS_RAW_DATA', response.data.payload)
      });
    },

    loadSuggested: loadJoinCollections,

    join: function (id, passcode, answeredFields) {
      var payload = {}
      var headers = {headers: {'Content-Type': 'application/json'}}
      if(passcode)
        payload['passcode'] = passcode

      if(answeredFields){
        payload['fields'] = answeredFields.map(function(f){
          return {'field': {'id': f.field.id}, 'field_value': f.field_value}
        })
      }
      
      payload = JSON.stringify(payload)

      return $http.put(serverConfig.url + '/api/v2/user/groups/' + id, payload, headers).then(function (response) {
        return response.status;
      });   
    },

    unjoin: function (id) {
      var that = this
      var group = this.get(id)
      promise = group.unjoin()
      promise.then(function(){
        _createLettersGroups()
      })
      return promise
    },

    getAllUserGroups: function () {
      var groups = _.values(groupsById);
      var sortedGroups = _.chain(groups).compact().sortBy('upper_title').value();
      return(sortedGroups)
    },

    get: function(id) {
      return groupsById[id]
    },

    getLettersGroups: function () {
      return lettersGroups;
    },

    getPopularGroups: function () {
      return popularGroups
    },

    getNewGroups: function () {
      return newGroups;
    },

    groupsJoinedByCurrentUser: function () {
      var result = service.getAllUserGroups().filter(function(g){
        return g.joinedByCurrentUser()
      })

      return _(result).sortBy(function (item) {
        return -item.group_type;
      });
    },

    search: function(query){
      return $http.get(serverConfig.url + '/api/search?query='+query).then(function (response) {
        return(response.data.groups)
      });        
    },

    getGroup: function (id) {
      return groupsById[id];
    },

    hasGroup: function (id) {
      return groupsById[id] && groupsById[id].joined === 1;
    },

    loadAllDetails: function (id) {
      var that = this
      var deferred = $q.defer();
      var data = Groups.get({id: id}, function () {
        parseInfo(data);
        var group = that.get(id) || new GroupModel()
        group.fillWith(data)
        groupsById[id] = group
        deferred.resolve(group);
      }, function (data, status) {
        deferred.reject(data, status);
      });

      return deferred.promise;
    },

    loadActivities: function (id) {
      var group = this.get(id)
      if (group) {
        group.activities = Groups.getActivities({id: id}, function () {
          activity.parse(group.activities);
        });
      }
    },

    create: function (data) {
      var that = this
      var payload = JSON.stringify(data)
      var headers = {headers: {'Content-Type': 'application/json'}}
      return $http.post(serverConfig.url + '/api/v2/user/groups', payload, headers).then(function (response) {
        that.load()
        return response.data;
      });
    },

    permissionsLabels: {
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
    },

    loadPermissions: function (id) {
      var that = this
      return $http.get(serverConfig.url + '/api/v2/groups/'+id+'/permission-settings').then(function (response) {
        var model = new PermissionsModel(response.data);
        model.set('group',that.get(id));
        return model;
      });
    }
  }

  function parseInfo(data) {
    data.full_address = _.compact([data.official_address, data.official_city, data.official_state]).join(', ');
  }

  function _createGroupModels(rawGroupsData) {
    rawGroupsData.forEach(function (rawGroupData) {
        var group = new GroupModel()
        if(rawGroupData.official_title){
          group.fillWith(rawGroupData)
          groupsById[group.id] = group;
        } else {
          console.log('unable to process group data:')
          console.log(JSON.stringify(rawGroupData))
        }
      })

    _createLettersGroups();
  }

  function _createLettersGroups() {
    lettersGroups = [];
    var lettersHash = {};
    _(service.getAllUserGroups()).each(function (group) {
      if (!group.groupTypeIsCommon() || !group.joinedByCurrentUser()) {
        return;
      }
      var letter = group.upper_title[0];
      if (!lettersHash[letter]) {
        lettersHash[letter] = {
          letter: letter,
          groups: []
        };
        
      }
      lettersHash[letter].groups.push(group);
    });
    
    Object.keys(lettersHash).sort().forEach(function(letter){
      lettersGroups.push(lettersHash[letter]);
    })
  }

  function loadJoinCollections() {
    var deferred = $q.defer();
    popularGroups = JoinGroups.query({sort: 'popular'});
    newGroups = JoinGroups.query({sort: 'new'}, deferred.resolve, deferred.reject);

    return deferred.promise;
  }

  if(iStorage.get('GROUPS_RAW_DATA'))
    _createGroupModels(iStorage.get('GROUPS_RAW_DATA'))
  
    

  return service;
})
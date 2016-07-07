angular.module('app.services').factory('groups',function ($resource, serverConfig, $q, $http, PermissionsModel, iStorage, GroupModel) {
  var GROUPS_CACHE_ID = 'group-items';
  var GROUP_TYPE_COMMON = 0;
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
  var unjoinedGroups = [];
  /* only joined */
  var lettersGroups = [];

  var popularGroups = [];
  var newGroups = [];

  var service = {
    load: function () {
      var that = this
      return  $http.get(serverConfig.url + '/api/v2/user/groups').then(function (response){
        _createGroupModels(response.data.payload);
      });
    },

    loadSuggested: loadJoinCollections,

    loadFields: function (id) {
      return $http.get(serverConfig.url + '/api/groups/' + id + '/fields').then(function (response) {
        return response.data;
      });
    },

    join: function (id) {
      return $http.put(serverConfig.url + '/api/v2/user/groups/' + id).then(function (response) {
        return response.data.status;
      });
    },

    unjoin: function (id) {
      return $http.delete(serverConfig.url + '/api/v2/user/groups/' + id);
    },

    getAll: function () {
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
      return $http.get(serverConfig.url + '/api/groups/popular').then(function (response) {
        return response.data.status;
      });
    },

    getNewGroups: function () {
      return newGroups;
    },

    groupsJoinedByCurrentUser: function () {
      var result = service.getAll().filter(function(g){
        return g.joinedByCurrentUser()
      })

      return _(result).sortBy(function (item) {
        return -item.group_type;
      });
    },

    search: search,

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
      var payload = JSON.stringify(data)
      var headers = {headers: {'Content-Type': 'application/json'}}
      return $http.post(serverConfig.url + '/api/v2/user/groups', payload, headers).then(function (response) {
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
      return $http.get(serverConfig.url + '/api/groups/' + id + '/permissions').then(function (response) {
        var model = new PermissionsModel(response.data);
        model.set('group', groupsInfo[id]);

        return model;
      });
    }
  };

  function parseInfo(data) {
    data.full_address = _.compact([data.official_address, data.official_city, data.official_state]).join(', ');
  }

  var EMPTY_SEARCH_ITEMS = [], lastSearchItems = [], lastSearchQuery = '';

  function search(query) {
    if (!query) {
      return EMPTY_SEARCH_ITEMS;
    }

    if (lastSearchQuery !== query) {
      var searchQuery = query.toUpperCase();
      lastSearchItems = _(this.getAll()).filter(function (item) {
        if (item.group_type !== 0) {
          return false;
        }
        if (item.acronym && item.acronym.toUpperCase().slice(0, searchQuery.length) === searchQuery) {
          return true;
        }
        if (item.username && item.username.toUpperCase().slice(0, searchQuery.length) === searchQuery) {
          return true;
        }
        return item.upper_title.slice(0, searchQuery.length) === searchQuery;
      });
    }
    lastSearchQuery = query;
    return lastSearchItems;
  }

  function _createGroupModels(rawGroupsData) {
    rawGroupsData.forEach(function (rawGroupData) {
        var group = new GroupModel()
        group.fillWith(rawGroupData)
        groupsById[group.id] = group;
        return group;
      })

    _createLettersGroups();
    _createUnjoinedGroups();
  }

  function _createLettersGroups() {
    lettersGroups = [];
    var lettersHash = {};
    _(service.getAll()).each(function (item) {
      if (item.group_type !== GROUP_TYPE_COMMON) {
        return;
      }
      var letter = item.upper_title[0];
      if (!lettersHash[letter]) {
        lettersHash[letter] = {
          letter: letter,
          items: []
        };
        
      }
      lettersHash[letter].items.push(item);
    });
    
    Object.keys(lettersHash).sort().forEach(function(letter){
      lettersGroups.push(lettersHash[letter]);
    })
  }

  function _createUnjoinedGroups(){
    unjoinedGroups = _(service.getAll()).filter(function (group) {
      return !group.joined && group.group_type === GROUP_TYPE_COMMON;
    });
  }

  function loadJoinCollections() {
    var deferred = $q.defer();
    popularGroups = JoinGroups.query({sort: 'popular'});
    newGroups = JoinGroups.query({sort: 'new'}, deferred.resolve, deferred.reject);

    return deferred.promise;
  }

  return service;
})
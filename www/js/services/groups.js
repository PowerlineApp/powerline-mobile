angular.module('app.services').factory('groups',function ($resource, serverConfig, $q, $http, PermissionsModel, iStorage, $rootScope) {
  var GROUPS_CACHE_ID = 'group-items';
  var USER_GROUPS_CACHE_ID = 'user-group-items';
  var GROUP_TYPE_COMMON = 0;
//        GROUP_TYPE_COUNTRY = 1,
//        GROUP_TYPE_STATE = 2,
//        GROUP_TYPE_LOCAL = 3
    
  var Groups = $resource(serverConfig.url + '/api/groups', null, {
    query: {
      method: 'GET',
      isArray: false,
      url: serverConfig.url + '/api/groups/user-groups'
    },

    get: {
      method: 'GET',
      isArray: false,
      url: serverConfig.url + '/api/groups/info/:id'
    },

    getActivities: {
      method: 'GET',
      isArray: true,
      url: serverConfig.url + '/api/poll/question/group/:id'
    }
  });

  var JoinGroups = $resource(serverConfig.url + '/api/groups/:sort', {sort: ''});
  var groups = [];
  var groupsById = {};
  var unjoinedGroups = [];
  /* only joined */
  var lettersGroups = [];

  var popularGroups = [];
  var newGroups = [];
  var groupsInfo = {};
  var userGroups = iStorage.get(USER_GROUPS_CACHE_ID) || [];
  var userGroupsIds = _([]);
  var userGroupsByGroupId = {};

  var service = {
    load: function () {
      // var deferred = $q.defer();
      // var results = Groups.query(
      //   function () {
      //     deferred.resolve();
      //   },
      //   function () {
      //     var error = 'Error occurred.';
      //     deferred.reject(error);
      //   }
      // );

      // return $q.all([loadUserGroups(), deferred.promise]).then(function () {
      //   createCollections(results);
      // });

      return  $http.get(serverConfig.url + '/api/groups/user-groups/').then(function (response){
        results = response.data;
        createCollections(results);
      });
    },

    loadUserGroups:loadUserGroups,

    loadSuggested: loadJoinCollections,

    loadFields: function (id) {
      return $http.get(serverConfig.url + '/api/groups/' + id + '/fields').then(function (response) {
        return response.data;
      });
    },

    join: function (id, data) {
      return $http.post(serverConfig.url + '/api/groups/join/' + id, data).then(function (response) {
        return response.data.status;
      });
    },

    unjoin: function (id) {
      return $http({method: 'DELETE', url: serverConfig.url + '/api/groups/join/' + id});
    },

    getAll: function () {
      return groups;
    },

    getUserGroups: function () {
      return userGroups;
    },

    getLettersGroups: function () {
      return lettersGroups;
    },

    getPopularGroups: function () {
      return $rootScope.popularGroups;
    },

    getNewGroups: function () {
      return newGroups;
    },

    getGroupsOptions: function () {
      var result = _(userGroups).reduce(function (memo, userGroup) {
        var item = userGroup.group;
        if (item.joined) {
          memo.push({
            id: item.id,
            official_title: item.official_title,
            avatar_file_path: item.avatar_file_path,
            group_type: item.group_type,
            acronym: item.acronym,
            petition_per_month: item.petition_per_month,
            getTitle: function () {
              return this.acronym || this.official_title;
            },
            getIconWhite: function () {
              return 0 === this.group_type ? this.avatar_file_path : 'images/v2/icons/location-group-white.png';
            },
            getIcon: function () {
              return 0 === this.group_type ? this.avatar_file_path : 'images/v2/icons/location-group.png';
            }
          });
        }
        return memo;
      }, []);

      return _(result).sortBy(function (item) {
        return -item.group_type;
      });
    },

    search: search,

    get: function (id) {
      return groupsInfo[id];
    },

    getGroup: function (id) {
      return groupsById[id];
    },

    getUserGroup: function (id) {
      return userGroupsByGroupId[id];
    },

    hasGroup: function (id) {
      return groupsById[id] && groupsById[id].joined === 1;
    },

    hasUserGroup: function (id) {
      return userGroupsIds.contains(id);
    },

    loadInfo: function (id) {
      var deferred = $q.defer();
      var data = Groups.get({id: id}, function () {
        parseInfo(data);
        groupsInfo[id] = data;
        deferred.resolve();
      }, function (data, status) {
        deferred.reject(data, status);
      });

      return deferred.promise;
    },

    resetInfo: function (id) {
      groupsInfo[id] = null;
    },

    loadActivities: function (id) {
      if (groupsInfo[id]) {
        groupsInfo[id].activities = Groups.getActivities({id: id}, function () {
          activity.parse(groupsInfo[id].activities);
        });
      }
    },

    create: function (data) {
      return $http.post(serverConfig.url + '/api/groups/', data).then(function (response) {
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

  function updateStatus() {
    var ids = [];
    _(userGroups).each(function (userGroup) {
      userGroupsByGroupId[userGroup.id] = userGroup;
      var group = _.find(groups, function (item) {
        return item.id === userGroup.id;
      });
      if (group) {
        group.status = userGroup.status;
      }
      if (userGroup.joined) {
        ids.push(userGroup.id);
      }
    });
    userGroupsIds = _(ids);
  }

  var EMPTY_SEARCH_ITEMS = [], lastSearchItems = [], lastSearchQuery = '';

  function search(query) {
    if (!query) {
      return EMPTY_SEARCH_ITEMS;
    }

    if (lastSearchQuery !== query) {
      var searchQuery = query.toUpperCase();
      lastSearchItems = _(groups).filter(function (item) {
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

  function createCollections(items) {
    groups = _.chain(items)
      .map(function (item) {
        if (!item.group.official_title) {
          return;
        }
        item.group.upper_title = item.group.official_title.toUpperCase();
        groupsById[item.id] = item;
        return item;
      })
      .compact()
      .sortBy('upper_title').value();

    updateStatus();
    updateUnjoinedGroups();
    createLettersGroups();
  }

  function createLettersGroups() {
    lettersGroups = [];
    var lettersHash = {};
    _(groups).each(function (item) {
      if (typeof item.status === 'undefined' || item.group.group_type !== GROUP_TYPE_COMMON) {
        return;
      }
      var letter = item.group.upper_title[0];
      if (!lettersHash[letter]) {
        lettersHash[letter] = {
          letter: letter,
          items: []
        };
        lettersGroups.push(lettersHash[letter]);
      }
      lettersHash[letter].items.push(item);
    });
  }

  function updateUnjoinedGroups() {
    unjoinedGroups = _(groups).filter(function (item) {
      return !item.joined && item.group_type === GROUP_TYPE_COMMON;
    });
    lastSearchQuery = '';
  }

  function loadJoinCollections() {
    $http.get(serverConfig.url + '/api/groups/popular', {
      query: {
        method: 'GET',
        isArray: false,  
        headers: {Token: iStorage.get('token')}
      }
    }).then(function (response) {
      var result = response.data;
      var groups = $.map(result, function(array, index) {
        return array;
      });
      $rootScope.popularGroups = groups;
    });
  }

  function loadUserGroups() {
    return $http.get(serverConfig.url + '/api/groups/user-groups/').then(function (response) {
      userGroups = response.data;
      iStorage.set(USER_GROUPS_CACHE_ID, userGroups);
      updateStatus();
    });
  }

  //call this function initially because cache may be loaded
  updateStatus();

  return service;
}).factory('groupsInvites',function (GroupsInvitesResource, $q) {

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
}).factory('GroupsInvitesResource', function ($resource, serverConfig) {
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
}).factory('PermissionsModel', function (JsModel, $http, serverConfig) {
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

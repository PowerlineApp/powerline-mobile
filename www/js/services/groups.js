angular.module('app.services').factory('groups',function ($resource, serverConfig, $q, $http, PermissionsModel, iStorage) {
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
  var groups = [];
  var abc = '1';
  var groupsById = {};
  var unjoinedGroups = [];
  /* only joined */
  var lettersGroups = [];

  var popularGroups = [];
  var newGroups = [];
  var groupsInfo = {};
  var userGroupsIds = _([]);
  var userGroupsByGroupId = {};

  var service = {
    load: function () {
      var that = this
      return  $http.get(serverConfig.url + '/api/v2/user/groups').then(function (response){
        results = response.data.payload;
        createCollections(results);
      });
    },

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
      return groups;
    },

    getLettersGroups: function () {
      return lettersGroups;
    },

    getPopularGroups: function () {
      return $http.get(serverConfig.url + '/api/groups/popular').then(function (response) {
        return response.data.status;
      });

      // var deferred = $q.defer();
      //   $http({
      //     method: 'GET',
      //     url: serverConfig.url + '/api/groups/popular',
      //     headers: {token: iStorage.get('token')}
      //   }).success(function (response) {
      //     return response;
      //   }).error(function (response, status) {
      //     deferred.reject(status);
      //   });
      //   return deferred.promise;
    },

    getNewGroups: function () {
      return newGroups;
    },

    getGroupsOptions: function () {
      var result = _(groups).reduce(function (memo, item) {
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

  function updateStatus() {
    var ids = [];
    _(groups).each(function (userGroup) {
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
        item.upper_title = item.official_title.toUpperCase();
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

  function updateUnjoinedGroups() {
    unjoinedGroups = _(groups).filter(function (item) {
      return !item.joined && item.group_type === GROUP_TYPE_COMMON;
    });
    lastSearchQuery = '';
  }

  function loadJoinCollections() {
    var deferred = $q.defer();
    popularGroups = JoinGroups.query({sort: 'popular'});
    newGroups = JoinGroups.query({sort: 'new'}, deferred.resolve, deferred.reject);

    return deferred.promise;
  }

  //call this function initially because cache may be loaded
  updateStatus();

  return service;
})
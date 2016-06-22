angular.module('app.services').factory('petitions',function ($q, PetitionsResource, iStorage, formatOptions,
  JsCollection, JsModel, serverConfig, $http, iParse, $sce) {

  var petitions = [],
    petitionsByGroup = {}
    ;

  var PetitionModel = JsModel.extend({
    parsers: {
      created_at: 'date',
      expire_at: 'date'
    }
  });

  function setOwner(item) {
    item.owner = {
      id: item.publish_status ? item.group.id : item.user.id,
      avatar: item.publish_status ? item.group.avatar_file_path : item.user.avatar_file_name,
      type: item.publish_status ? 'group' : 'user',
      name: item.publish_status ? item.group.official_title : item.user.first_name + ' ' + item.user.last_name
    };
  }

  function format(data) {
    petitions = [];
    petitionsByGroup = {};
    _(data).each(function (item) {
      if (!petitionsByGroup[item.group_id]) {
        petitionsByGroup[item.group_id] = {
          group: item.group,
          petitions: []
        };
      }
      petitionsByGroup[item.group_id].petitions.push(item);
      item.created_at_date = new Date(item.created_at);
      item.expired_at_date = new Date(item.expire_at);
      if (!item.publish_status) {
        item.count_to_quorum = Math.max(item.quorum_count - item.responses_count, 1);
        item.completed_percent = Math.min(item.responses_count / item.quorum_count * 100, 100);
      }
      setOwner(item);
      petitions.push(item);
    });
  }

  function formatInfo(data) {
    data.expired = new Date() >= new Date(data.expire_at);
    data.expired_at_date = new Date(data.expire_at);
    data.created_at_date = new Date(data.created_at);
    data.votes_count = formatOptions([data.options[0], data.options[1]]);

    var escapedBody = iParse.htmlEscape(data.petition_body);
    data.petition_body_parsed = $sce.trustAsHtml(iParse.wrapHashTags(iParse.wrapLinks(escapedBody)));
    data.getOptionLabel = function (id) {
      var option = _(this.options).find(function (item) {
        return item.id === id;
      });
      return option ? option.title : '';
    };
  }

  function sortGroupPetitions() {
    _(petitionsByGroup).each(function (item) {
      item.petitions = _(item.petitions).sortBy(function (child) {
        return -child.created_at_date.getTime();
      });
    });
  }

  return {

    getAll: function () {
      return petitions;
    },

    loadAll: function () {
      var deferred = $q.defer();
      PetitionsResource.query(function (data) {
        format(data);
        sortGroupPetitions();
        deferred.resolve(data);
      }, function () {
        deferred.reject();
      });
      return deferred.promise;
    },

    loadByHashTag: function (query) {
      var deferred = $q.defer();
      PetitionsResource.searchByHashTag({
        query: query
      }, function (data) {
        format(data);
        deferred.resolve(data);
      }, function () {
        deferred.reject();
      });
      return deferred.promise;
    },

    getAllByGroup: function () {
      return petitionsByGroup;
    },

    load: function (id) {
      var deferred = $q.defer();
      PetitionsResource.get({id: id}, function (data) {
        setOwner(data);
        formatInfo(data);
        deferred.resolve(data);
      }, function () {
        deferred.reject();
      });
      return deferred.promise;
    },

    loadByParams: function (params) {
      return $http.get(serverConfig.url + '/api/micro-petitions/', {params: params}).then(function (response) {
        return new JsCollection(response.data, {model: PetitionModel});
      });
    },

    getGroupPetitions: function (id) {
      return petitionsByGroup[id];
    },

    getGroups: function () {
      return _(petitionsByGroup).pluck('group');
    },
    answer: function(id, optionId) {
      var option = 'upvote'
      if(optionId == 2)
        option = 'downvote'

      var payload = JSON.stringify({option: option})
      var headers = {headers: {'Content-Type': 'application/json'}}
      return $http.post(serverConfig.url + '/api/v2/micro-petitions/' + id + '/answer', payload, headers).then(function(resp) {
        return resp.data;
      });
    },

    update: function(microPetition) {
      var payload = JSON.stringify({petition_body: microPetition.petition_body})
      var headers = {headers: {'Content-Type': 'application/json'}}
      return $http.put(serverConfig.url + '/api/v2/micro-petitions/' + microPetition.id, payload, headers).then(function(resp) {
        return resp.data;
      });
    },

    delete: function(id){
      return $http.delete(serverConfig.url + '/api/v2/micro-petitions/' + id).then(function(resp) {
        return resp.data;
      });
    }
  };

}).factory('PetitionsResource', function ($resource, serverConfig) {
  return $resource(serverConfig.url + '/api/micro-petitions/:id', {id: '@id'}, {
    searchByHashTag: {
      method: 'GET',
      isArray: true,
      url: serverConfig.url + '/api/search/by-hash-tags'
    },
    unsign: {
      method: 'DELETE',
      params: {id: '@id'},
      url: serverConfig.url + '/api/v2/micro-petitions/:id/answer'
    },
    update: {
      method: 'PUT',
      params: {id: '@id'},
      url: serverConfig.url + '/api/micro-petitions/:id'
    },
    update: {
      method: 'DELETE',
      params: {id: '@id'},
      url: serverConfig.url + '/api/micro-petitions/:id'
    }
  });
});

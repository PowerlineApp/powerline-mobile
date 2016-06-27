angular.module('app.services').factory('activity',
  function ($http, serverConfig, iStorage, JsModel, ActivityRead, ActivityCollection, JsCollection, $q, representatives, groups, session, follows) {

    var ACTIVITIES_CACHE_ID = 'last-activity-items';
    var read = ActivityRead;
    
    var defaultLimit = 20;
    var activities = ActivityCollection

    function load(offset, limit) {
      offset = (offset === null || typeof(offset) === 'undefined') ? activities.size() : offset;
      limit = limit || -1;
      return $http.get(serverConfig.url + '/api/v2/activities').then(function (response) {
        activities = activities.add(response.data.payload);
        return activities;
      });
    };

    return {

      /**
       * loadType
       *    - all (default value, load all activities after clear)
       *    - append
       *    - refresh
       *    - clearAndLoad
       */
      load: function (loadType) {
        loadType = loadType || 'all';

        var originalSize = activities.size();
        if (loadType !== 'append') {
          activities.reset();
        }
        var promises = [];
        
        if(loadType === 'refresh'){
          promises.push(load(0, originalSize));
        } else if(loadType === 'clearAndLoad'){
          promises.push(load(0, defaultLimit));
        } else if(loadType === 'append') {
          promises.push(load(null, defaultLimit));
        } else {
          promises.push(load());
        }
        
        if (!groups.getUserGroups().length) {
          promises.push(groups.loadUserGroups());
        }
        if (!representatives.getRepresentativesGroups().length) {
          promises.push(representatives.load());
        }
        if (!follows.size()) {
          promises.push(follows.load());
        }
        
        var that = this;
        return $q.all(promises).then(function () {
          //return that.setAnswers();
        });
      },
      
      setAnswers: function(){
        return $q.all([
            $http.get(serverConfig.url + '/api/poll/answers/').then(function (response) {
              activities.setAnsweredQuestions(response.data);
            }),
            $http.get(serverConfig.url + '/api/micro-petitions/answers/').then(function (response) {
              activities.setAnsweredMicroPetitions(response.data);
            })
          ]).then(function () {
            var remove = [];
            activities.each(function (activity) {
              activity.prepare();

              if (activity.get('entity').group_id && !groups.hasUserGroup(activity.get('entity').group_id)) {
                remove.push(activity);
              }
            });

            activities.remove(remove);
            activities.sort();
            iStorage.set(ACTIVITIES_CACHE_ID, activities.toArray()); //we may need to store only 20 items to cache
            return activities;
          });
      },

      fetchFollowingActivities: function(id) {
        var followingActivities = new ActivityCollection([], {
          model: ActivityModel,
          comparator: function (activity) {
            return -activity.get('sent_at').getTime() * activity.getSortMultiplier();
          }
        });

        return $http.get(
          serverConfig.url + '/api/activities/',
          {params: {following: id}}
        ).then(function (response) {
          followingActivities.add(response.data);
          return $http.get(serverConfig.url + '/api/micro-petitions/answers/').then(function (response) {
            followingActivities.setAnsweredMicroPetitions(response.data);
            followingActivities.each(function(activity) {
              activity.prepare();
            });
            return followingActivities;
          });
        });
      },

      setEntityRead: function (entity) {
        ActivityCollection.deferredRead.push(entity);
      },

      saveRead: function () {
        if (read.length) {
          var needed = read;
          read = [];
          iStorage.set('read-activities', read);

          var data = [];

          _(needed).each(function (id) {
            data.push({activity_id: id});
          });

          $http.post(serverConfig.url + '/api/activities/read/', data).error(function () {
            _(needed).each(function (id) {
              read.push(id);
              iStorage.set('read-activities', read);
            });
          });
        }
      },

      getActivities: function () {
        return activities;
      },
      
      getDefaultLimit: function(){
        return defaultLimit;
      }
    };
  });

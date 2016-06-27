angular.module('app.services').factory('activity',
  function ($http, serverConfig, iStorage, JsModel, ActivityRead, ActivityCollection, JsCollection, $q, representatives, groups, session, follows) {

    var ACTIVITIES_CACHE_ID = 'last-activity-items';
    var defaultLimit = 20;

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

        var originalSize = ActivityCollection.size();
        if (loadType !== 'append') {
          ActivityCollection.reset();
        }
        var promises = [];
        
        if(loadType === 'refresh'){
          promises.push(ActivityCollection.load(0, originalSize));
        } else if(loadType === 'clearAndLoad'){
          promises.push(ActivityCollection.load(0, defaultLimit));
        } else if(loadType === 'append') {
          promises.push(ActivityCollection.load(null, defaultLimit));
        } else {
          promises.push(ActivityCollection.load());
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
          iStorage.set(ACTIVITIES_CACHE_ID, ActivityCollection.toArray()); //we may need to store only 20 items to cache
          return that.setAnswers();
        });
      },
      
      setAnswers: function(){
        return $q.all([
            $http.get(serverConfig.url + '/api/poll/answers/').then(function (response) {
              ActivityCollection.setAnsweredQuestions(response.data);
            }),
            $http.get(serverConfig.url + '/api/micro-petitions/answers/').then(function (response) {
              ActivityCollection.setAnsweredMicroPetitions(response.data);
            })
          ])
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
        if (ActivityRead.length) {
          var needed = read;
          read = [];
          iStorage.set('read-activities', read);

          var data = [];

          _(needed).each(function (id) {
            data.push({activity_id: id});
          });

          $http.post(serverConfig.url + '/api/activities/read/', data).error(function () {
            _(needed).each(function (id) {
              ActivityRead.push(id);
              iStorage.set('read-activities', read);
            });
          });
        }
      },

      getActivities: function () {
        return ActivityCollection;
      },
      
      getDefaultLimit: function(){
        return defaultLimit;
      }
    };
  });

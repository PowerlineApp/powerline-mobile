angular.module('app.services').factory('UsersActivity',
  function ($http, serverConfig, JsModel, UsersActivityCollection, JsCollection, $q, representatives, groups, session, follows, favorite) {
    
    var defaultLimit = 20;

    return {

      /**
       * loadType
       *    - all (default value, load all activities after clear)
       *    - append
       *    - refresh
       *    - clearAndLoad
       */
      load: function (userid, loadType) {
        this._doRefresh = false
        loadType = loadType || 'all';

        var originalSize = UsersActivityCollection.size();
        if (loadType !== 'append') {
          UsersActivityCollection.reset();
        }
        var promises = [];

        if(loadType === 'refresh'){
          promises.push(UsersActivityCollection.load(userid, 0, originalSize));
        } else if(loadType === 'clearAndLoad'){
          promises.push(UsersActivityCollection.load(userid, 0, defaultLimit));
        } else if(loadType === 'append') {
          promises.push(UsersActivityCollection.load(userid, null, defaultLimit));
        } else {
          promises.push(UsersActivityCollection.load(userid));
        }

        var that = this;
        return $q.all(promises).then(function () {
          console.log(UsersActivityCollection.toArray());
          return that.setAnswers();
        });
      },

      setAnswers: function(){
        return $q.all([
            $http.get(serverConfig.url + '/api/poll/answers/').then(function (response) {
              UsersActivityCollection.setAnsweredQuestions(response.data);
            }),
            $http.get(serverConfig.url + '/api/v2/user/micro-petition-answers').then(function (response) {
              UsersActivityCollection.setAnsweredMicroPetitions(response.data);
            })
          ])
      },

      getActivities: function () {
        return UsersActivityCollection;
      },

      getDefaultLimit: function(){
        return defaultLimit;
      },

      youShouldRefreshActivities: function(){
        this._doRefresh = true
      },

      shouldRefreshActivities: function(){
        return this._doRefresh == true
      }
    };
  });

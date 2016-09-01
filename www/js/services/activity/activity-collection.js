angular.module('app.services').factory('ActivityCollection',
  function (JsCollection, ActivityModel, representatives, iStorage, $http, serverConfig, session, $rootScope) {
    var activityCollectionTemplate = JsCollection.extend({
      setAnsweredMicroPetitions: function (answers) {
        var answerByPetition = {};
        _(answers).each(function (answer) {
          answerByPetition[answer.petition_id] = answer;
        });
        this.each(function (activity) {
          var entity = activity.get('entity');
          if ('micro-petition' === entity.type) {
            if (answerByPetition[entity.id]) {
              activity.set('answered', true);
              activity.set('answer', answerByPetition[entity.id]);
            }
          }
          
        });

        return this;
      }
    });
    var ACTIVITIES_CACHE_ID = 'last-activity-items';
    var initialItems = iStorage.get(ACTIVITIES_CACHE_ID) || [];
    var aCollection = new activityCollectionTemplate(initialItems, {
      model: ActivityModel,
      comparator: function (activity) {
        return -activity.get('sent_at').getTime() * activity.getSortMultiplier();
      }
    });

    aCollection.setAnsweredQuestions = function (answers) {
      var types = _(['petition', 'question', 'payment-request', 'crowdfunding-payment-request', 'leader-event']);
      var answerById = {};
      _(answers).each(function (answer) {
        answerById[answer.question.id] = answer;
      });

      this.each(function (activity) {
        var entity = activity.get('entity');
        if (types.contains(entity.type)) {
          activity.set('answered', !!answerById[entity.id]);
          activity.set('answer', answerById[entity.id]);
        }
      });

      return this;
    };

    aCollection.getFilteredModels = function (filter) {
      if (!filter) {
        return this.models;
      }
      var representativeIds = [];

      function hasGroup(activity) {
        return activity.get('entity').group_id === filter.id ||
          (activity.get('owner').type === 'group' && activity.get('owner').id === filter.id);
      }

      function hasRepresentative(activity) {
        return activity.get('owner').type === 'representative' && _.contains(representativeIds, activity.get('owner').id);
      }

      if (0 === filter.group_type) {
        return this.filter(hasGroup);
      }

      var repMethod = {
        1: 'US',
        2: 'STATE',
        3: 'LOCAL'
      };

      _(representatives.getRepresentativesByGroupType(repMethod[filter.group_type])).each(function (representative) {
        if (representative) {
          representativeIds.push(representative.storage_id);
        }
      });

      return this.filter(function (activity) {
        return hasGroup(activity) || hasRepresentative(activity) ||
          (1 === filter.group_type && 'admin' === activity.get('owner').type);
      });

    };

    aCollection.inPriorityZoneCount = function(activities){
      var count = 0
      activities.forEach(function(a){
        if(a.isInPriorityZone())
          count++
      })
      return count
    }

    aCollection.load = function(offset, limit) {
      var that = this
      offset = (offset === null || typeof(offset) === 'undefined') ? that.size() : offset;
      limit = limit || -1;
      var page = parseInt((offset / 20) + 1)
      var p = new Promise(function(resolve, reject){
        $http.get(serverConfig.url + '/api/v2/activities?page='+page).then(function (response) {
          var activities = that.add(response.data.payload);
          activities.forEach(function(activity){
            activity.prepare()
          })
          resolve(that)
        });
      })

      return p
    };

    aCollection.getUserPetitionActivityByID = function(userPetitionID){
      var activity = aCollection.models.find(function(activity){
        return activity.isUserPetitionType() && activity.get('entity').id == userPetitionID
      })
      return activity
    }

    $rootScope.$on('userPetition.signed', function(event, userPetitionID) {
      var activity = aCollection.getUserPetitionActivityByID(userPetitionID)
      if(activity)
        activity.markAsSigned()
    })
    $rootScope.$on('userPetition.unsigned', function(event, userPetitionID) {
      var activity = aCollection.getUserPetitionActivityByID(userPetitionID)
      if(activity)
        activity.markAsUnsigned()
    });
    
    return aCollection
})
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

    aCollection.getFilteredModels = function (group) {
      if (!group) {
        return this.models;
      }
      var representativeIds = [];

      if (group.groupTypeIsCommon()) 
        return this.filter(hasGroup);

      function hasGroup(activity) {
        return activity.get('entity').group_id === group.id ||
          (activity.get('owner').type === 'group' && activity.get('owner').id === group.id);
      }

      function hasRepresentative(activity) {
        return activity.get('owner').type === 'representative' && _.contains(representativeIds, activity.get('owner').id);
      }

      _(representatives.getRepresentativesByGroupType(group.groupTypeAsInteger())).each(function (representative) {
        if (representative) {
          representativeIds.push(representative.storage_id);
        }
      });

      return this.filter(function (activity) {
        return hasGroup(activity) || hasRepresentative(activity) ||
          (group.groupTypeIsState() && 'admin' === activity.get('owner').type);
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
          that.add(response.data.payload)
          resolve(that)
        }, function(error){
          console.log('failed to fetch or process activities')
          console.log(error)
        });
      })

      return p
    };

    aCollection.getActivityByTypeAndID = function(aType, aID){
      var activity = aCollection.models.filter(function(activity){
        var idMatch = activity.dataID() == aID
        var typeMatch = activity.dataType() == aType
        return typeMatch && idMatch
      })[0]
      return activity
    }

    aCollection.getUserPetitionActivityByID = function(userPetitionID){
      var activity = aCollection.models.filter(function(activity){
        return activity.isUserPetitionType() && activity.get('entity').id == userPetitionID
      })[0]
      return activity
    }

    aCollection.getPetitionActivityByID = function(petitionID){
      var activity = aCollection.models.filter(function(activity){
        return activity.isPollPetitionType() && activity.get('entity').id == petitionID
      })[0]
      return activity
    }

    aCollection.getPostActivityByID = function(postID){
      var activity = aCollection.models.filter(function(activity){
        return activity.isUserPostType() && activity.get('entity').id == postID
      })[0]
      return activity
    }

    aCollection.getPollEventActivityByID = function(pollEventID){
      var activity = aCollection.models.filter(function(activity){
        return activity.isPollEventType() && activity.get('entity').id == pollEventID
      })[0]
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
    $rootScope.$on('petition.signed', function(event, petitionID) {
      var activity = aCollection.getPetitionActivityByID(petitionID)
      if(activity)
        activity.markAsSigned()
    })
    $rootScope.$on('petition.unsigned', function(event, petitionID) {
      var activity = aCollection.getPetitionActivityByID(petitionID)
      if(activity)
        activity.markAsUnsigned()
    });
    $rootScope.$on('post.voted', function(event, postID) {
      var activity = aCollection.getPostActivityByID(postID)
      if(activity)
        activity.markAsVoted()
    });   

    $rootScope.$on('post.unvoted', function(event, postID) {
      var activity = aCollection.getPostActivityByID(postID)
      if(activity)
        activity.markAsNotVoted()
    }); 

    $rootScope.$on('poll-event.answered', function(event, pollEventID) {
      var activity = aCollection.getPollEventActivityByID(pollEventID)
      if(activity)
        activity.markAsAnswered()
    }); 

    $rootScope.$on('activity.mark-as-subscribed', function(event, activityType, activityID) {
      var activity = aCollection.getActivityByTypeAndID(activityType, activityID)
      if(activity)
        activity.markAsSubscribed()
    }); 

    $rootScope.$on('activity.mark-as-unsubscribed', function(event, activityType, activityID) {
      var activity = aCollection.getActivityByTypeAndID(activityType, activityID)
      if(activity)
        activity.markAsUnsubscribed()
    }); 
    return aCollection
})
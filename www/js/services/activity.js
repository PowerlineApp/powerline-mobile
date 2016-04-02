angular.module('app.services').factory('activity',
  function ($http, serverConfig, iStorage, JsModel, JsCollection, $q, representatives, groups, session, follows) {

    var ACTIVITIES_CACHE_ID = 'last-activity-items';
    var read = iStorage.get('read-activities') || [];
    var deferredRead = [];
    var defaultLimit = 20;

    var ActivityModel = JsModel.extend({
      labels: {
        question: 'Question',
        petition: 'Petition',
        'leader-news': 'News',
        'leader-event': 'Event',
        'micro-petition': 'Petition',
        'payment-request': 'Payment',
        'crowdfunding-payment-request': 'Payment'
      },
      icons: {
        question: 'poll',
        petition: 'petition',
        'leader-news': 'discussion',
        'leader-event': 'event',
        'micro-petition': 'post',
        'payment-request': 'fundraiser',
        'crowdfunding-payment-request': 'fundraiser'
      },
      parsers: {
        expire_at: 'date',
        sent_at: 'date',
        owner: function (owner) {
          if (owner && owner.avatar_file_name) {
            owner.avatar_file_path = owner.avatar_file_name;
          }
          return owner;
        }
      },
      isOwn: function () {
        return this.get('owner').type === 'user' && this.get('owner').id === session.user_id;
      },
      isUnanswered: function () {
        return !this.get('answered') && !this.get('closed') && 'leader-news' !== this.get('entity').type;
      },
      isFollowing: function () {
        var owner = this.get('owner');
        return owner.type === 'user' && follows.some(function (following) {
          return following.get('user').id === owner.id && following.isApproved();
        });
      },
      _setRead: function () {
        this.set('read', true);
        if ('leader-news' === this.get('entity').type || 'petition' === this.get('entity').type) {
          this.set('ignore_count', true);
        } else if ('micro-petition' === this.get('entity').type && 'user' === this.get('owner').type && this.isFollowing()) {
          this.set('ignore_count', true);
        }
      },
      prepare: function () {
        if (this.get('read') || _(read).contains(this.get('id'))) {
          this._setRead();
        }
        if (this.get('owner').type === 'user' && this.get('entity').group_id) {
          var userGroup = groups.getUserGroup(this.get('entity').group_id);
          this.set('owner_info_1', userGroup ? userGroup.group.official_title : null);
        }
        if (this.get('expire_at') && Date.now() > this.get('expire_at').getTime()) {
          this.set('closed', true);
        }
      },
      setRead: function () {
        if (!this.get('read')) {
          this._setRead();
          read.unshift(this.get('id'));
          iStorage.set('read-activities', read.slice(0, 1000));
        }
      },
      getResponsesToQuorum: function () {
        return this.get('quorum') ? Math.max(this.get('quorum') - this.get('responses_count'), 1) : 1;
      },
      getQuorumCompletedPercent: function () {
        return this.get('quorum') ?
          Math.min(this.get('responses_count') / this.get('quorum') * 100, 100) : 0;
      },
      getLabel: function () {
        return this.labels[this.get('entity').type];
      },
      getIcon: function () {
        return this.icons[this.get('entity').type];
      },
      isInPriorityZone: function() {
        if (this.get('closed')) {
          return false;
        }
        var entity = this.get('entity');
        var owner = this.get('owner');

        return (!this.get('answered') && entity.type !== 'leader-news' && owner.type !== 'user' && entity.type !== 'petition') ||
          (!this.get('answered') && entity.type === 'petition' && !this.get('read')) ||
          (entity.type === 'leader-news' && !this.get('read'))
        ;
      },
      getSortMultiplier: function () {
        /*if (this.get('closed')) {
          return 0;
        }

        if (this.isInPriorityZone()) {
          return 9;
        }*/

        return 1;
      },

      getPostID: function(){
        return this.attributes.id;
      },

      saveProfileSetting: function(){

       return $http({
          method: 'POST',
          url: serverConfig.url + '/api/profile/settings',
          data: null
        }).then(function(resp) {
          return resp.data;
        });
      },

      changeSubscribe: function(id){
        $http({
          method: 'POST',
          url: serverConfig.url + '/api/users/self/subscriptions',
          data: {"id": id}
        }).then(function(resp) {
          return resp.data;
        });
      }
    });

    var ActivityCollection = JsCollection.extend({
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
            if ('user' === activity.get('owner').type) {
              activity.set('ignore_count', true);
            }
          }
        });

        return this;
      }
    });

    var initialItems = iStorage.get(ACTIVITIES_CACHE_ID) || [];
    
    var activities = new ActivityCollection(initialItems, {
      model: ActivityModel,
      comparator: function (activity) {
        return -activity.get('sent_at').getTime() * activity.getSortMultiplier();
      }
    });
    
    
    activities.setAnsweredQuestions = function (answers) {
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

    activities.getFilteredModels = function (filter) {
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
        if (representative.representative) {
          representativeIds.push(representative.representative.id);
        }
      });

      return this.filter(function (activity) {
        return hasGroup(activity) || hasRepresentative(activity) ||
          (1 === filter.group_type && 'admin' === activity.get('owner').type);
      });
    };

    activities.setDeferredRead = function () {
      this.each(function (activity) {
        if (activity.get('read')) {
          return;
        }
        if (_.find(deferredRead, function (entity) {
          return entity.type === activity.get('entity').type && entity.id === activity.get('entity').id;
        })) {
          activity.setRead();
        }
      });
      return this;
    };

    function load(offset, limit) {
      offset = (offset === null || typeof(offset) === 'undefined') ? activities.size() : offset;
      limit = limit || -1;
      console.log(offset + '===' + limit);
      return $http.get(serverConfig.url + '/api/activities/?offset=' + offset + 
              '&limit=' + limit + '&sort=priority').then(function (response) {
        activities = activities.add(response.data);
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
          return that.setAnswers();
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
        deferredRead.push(entity);
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

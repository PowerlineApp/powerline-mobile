angular.module('app.services').factory('favorite',
  function ($http, serverConfig, iStorage, JsModel, JsCollection, $q, representatives, groups, session, follows, activity) {

    var ACTIVITIES_CACHE_ID = 'last-activity-items';
    var read = iStorage.get('read-activities') || [];
    var deferredRead = [];
    var defaultLimit = 10;
    var activities = activity.getActivities();
    var bLoaded = false;


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
        var closed = this.get('closed');
        if (closed) {
          return false;
        }
        
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
      }
    });

    var ActivityCollection = JsCollection.extend({
      setAnsweredMicroPetitions: function (answers) {
        var answerByPetition = {};
        _(answers).each(function (answer) {
          answerByPetition[answer.petition_id] = answer;
        });
        this.each(function (favorite) {
          var entity = favorite.get('entity');
          if (typeof entity == 'undefined'){
            entity = favorite.attributes.attributes.entity;
          }

          if ('micro-petition' === entity.type) {
            if (answerByPetition[entity.id]) {
              favorite.set('answered', true);
              favorite.set('answer', answerByPetition[entity.id]);
            }
            var owner = favorite.get('owner');
            if (typeof owner == 'undefined'){
              owner = favorite.attributes.attributes.owner;
            }
            if ('user' === owner.type) {
              favorite.set('ignore_count', true);
            }
          }
        });

        return this;
      }
    });

    var initialItems = iStorage.get(ACTIVITIES_CACHE_ID) || [];
    
    var favorites = new ActivityCollection(initialItems, {
      model: ActivityModel,
      comparator: function (favorite) {
        var temp = favorite.attributes.sent_at;
        if (typeof temp == 'undefined'){
          temp = favorite.attributes.attributes.sent_at;
        }
        return -temp.getTime() * favorite.getSortMultiplier();
      }
    });
    
    
    favorites.setAnsweredQuestions = function (answers) {
      var types = _(['petition', 'question', 'payment-request', 'crowdfunding-payment-request', 'leader-event']);
      var answerById = {};
      _(answers).each(function (answer) {
        answerById[answer.question.id] = answer;
      });

      this.each(function (favorite) {
        var entity = favorite.get('entity');
        if (types.contains(entity.type)) {
          favorite.set('answered', !!answerById[entity.id]);
          favorite.set('answer', answerById[entity.id]);
        }
      });

      return this;
    };

    favorites.getFilteredModels = function (filter) {
      if (!filter) {
        return this.models;
      }
      var representativeIds = [];

      function hasGroup(favorite) {
        var entity = favorite.get('entity');
        var owner = favorite.get('owner');
        
        return entity.group_id === filter.id ||
          (owner.type === 'group' && owner.id === filter.id);
      }

      function hasRepresentative(favorite) {
        var owner = favorite.get('owner');
        return owner.type === 'representative' && _.contains(representativeIds, owner.id);
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

      return this.filter(function (favorite) {
        var owner = favorite.get('owner');
        return hasGroup(favorite) || hasRepresentative(favorite) ||
          (1 === filter.group_type && 'admin' === owner.type);
      });
    };

    favorites.setDeferredRead = function () {
      this.each(function (favorite) {
        if (favorite.get('read')) {
          return;
        }
        if (_.find(deferredRead, function (entity) {
          return entity.type === favorite.get('entity').type && entity.id === favorite.get('entity').id;
        })) {
          favorite.setRead();
        }
      });
      return this;
    };

    

    function load(offset, limit) {
      offset = (offset === null || typeof(offset) === 'undefined') ? favorites.size() : offset;
      limit = limit || -1;
      bLoaded = false;

      return $http.get(serverConfig.url + '/api/bookmarks/list/all').then(function (response) {

        var count = response.data.items.length;
        var favoriteArray = [];

        for (var i = 0; i < count; i++) {
          var server_data = response.data.items[i];
          var item_id = server_data.item_id;
          var index = 0;
          var bExist = false;
          for (index = 0; index < activities.models.length; index++){
            var petitionData = activities.models[index];
            var petitionID = petitionData.attributes.id;
            if (petitionID == item_id){
              bExist = true;
              break;
            }
          }

          if (bExist == true){
            favoriteArray.push(activities.models[index].attributes);  
          }
        }

        favorites = favorites.add(favoriteArray);
        if (activities.models.length != 0){
          activity.loadForFavorite = false;
          bLoaded = true;
        }
        return favorites;
      });    

      //api/bookmarks/list/{type}/{page}
/*
      return $http.get(serverConfig.url + '/api/activities/?offset=' + offset + 
              '&limit=' + limit + '&sort=priority').then(function (response) {
        activities = activities.add(response.data);
        return activities;
      });
*/      
    }

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

        var originalSize = favorites.size();
        if (loadType !== 'append') {
          favorites.reset();
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
              favorites.setAnsweredQuestions(response.data);
            }),
            $http.get(serverConfig.url + '/api/micro-petitions/answers/').then(function (response) {
              favorites.setAnsweredMicroPetitions(response.data);
            })
          ]).then(function () {
            var remove = [];
            favorites.each(function (favorite) {
              favorite.prepare();

              if (favorite.get('entity').group_id && !groups.hasUserGroup(favorite.get('entity').group_id)) {
                remove.push(favorite);
              }
            });

            favorites.remove(remove);
            favorites.sort();
            iStorage.set(ACTIVITIES_CACHE_ID, favorites.toArray()); //we may need to store only 20 items to cache
            return favorites;
          });
      },

      fetchFollowingActivities: function(id) {
        var followingActivities = new ActivityCollection([], {
          model: ActivityModel,
          comparator: function (favorite) {
            return -favorite.get('sent_at').getTime() * favorite.getSortMultiplier();
          }
        });

        return $http.get(
          serverConfig.url + '/api/activities/',
          {params: {following: id}}
        ).then(function (response) {
          followingActivities.add(response.data);
          return $http.get(serverConfig.url + '/api/micro-petitions/answers/').then(function (response) {
            followingActivities.setAnsweredMicroPetitions(response.data);
            followingActivities.each(function(favorite) {
              favorite.prepare();
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
        return favorites;
      },
      
      getDefaultLimit: function(){
        return defaultLimit;
      },

      addBookmark: function(activity){
        var aType = activity.get('entity').type
        var aID = activity.get('entity').id
        console.log('todo')
        //$http.post(serverConfig.url + '/api/bookmarks/add/'+aType+'/'+aID)
      }
    };
  });

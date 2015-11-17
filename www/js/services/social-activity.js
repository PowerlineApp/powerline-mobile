angular.module('app.services').factory('socialActivity', function ($http, serverConfig, socialActivityTabManager, JsModel, JsCollection, follows, $q) {

  var typeToIcons = {
    'follow-request': 'sa-icon-request-1',
    'micropetition-created': function (activity) {
      if (activity.get('target').type === 'quorum') {
        return 'sa-icon-post';
      }
      return 'sa-icon-petition';
    },
    'answered': 'sa-icon-community',
    'groupPermissions-changed': 'sa-icon-request-2',
    'joinToGroup-approved': 'sa-icon-request-2'
  };

  var ActivityModel = JsModel.extend({
    parsers: {
      created_at: 'date'
    },
    initialize: function () {
      this.build();
    },
    build: function () {
      var avatar;
      var avatarTitle;
      if (this.get('following')) {
        avatar = this.get('following').avatar_file_name;
        avatarTitle = this.get('following').full_name;
      } else if (this.get('group')) {
        avatar = this.get('group').avatar_file_path;
        avatarTitle = this.get('group').official_title;
      }
      this.set('avatar', avatar);
      this.set('avatar_title', avatarTitle);
      var icon = typeToIcons[this.get('type')];
      this.set('sa-icon', typeof icon === 'function' ? icon(this) : icon);
      if (this.isFollowRequest()) {
        this.set('userFollow', follows.getByFollowerId(this.get('following').id));
      }
    },
    isRequest: function () {
      return this.get('type') === 'follow-request';
    },
    isFollowRequest: function () {
      return this.get('type') === 'follow-request';
    },
    isActiveRequest: function () {
      return this.isFollowRequest() &&
        this.get('userFollow') &&
        this.get('userFollow').get('id') === this.get('target').id &&
        !this.get('ignore');
    },
    getWidgetType: function () {
      return this.isFollowRequest() ? 'follow-request' : 'link';
    },
    getHtmlMessage: function(){
      if(this.getWidgetType() !== 'follow-request'){
        return this.get('html_message');
      }
      //when being shown to owner
      if(this.get('userFollow').get('id') === this.get('target').id){
        if(!this.get('userFollow').isApproved() && !this.get('ignore')){
          return '<p><strong>' + this.get('userFollow').get('follower').full_name + '</strong> requested to follow you.</p>';
        }
        if(this.get('userFollow').isApproved() && !this.get('userFollow').isFollow()){
          return '<p><strong>' + this.get('userFollow').get('follower').full_name + '</strong> is now following you. Follow back?</p>';
        }
        if(this.get('userFollow').isApproved() && this.get('userFollow').isFollow()){
          return '<p><strong>' + this.get('userFollow').get('follower').full_name + '</strong> and you are now following each other.</p>';
        }
      }
      return this.get('html_message');
    },
    ignore: function () {
      this.set('ignore', true);
      $http.put(serverConfig.url + '/api/social-activities/' + this.get('id'), {ignore: 1});
    }
  });

  var activities = new JsCollection([], {
    model: ActivityModel,
    comparator: function (activity) {
      return -activity.get('created_at').getTime();
    }
  });
  activities.prepare = function () {
    socialActivityTabManager.prepare(this);

    return this;
  };
  activities.add = function (models) {
    var self = this;
    models = _.isArray(models) ? models : [models];
    _(models).each(function (data) {
      var model = self.get(data[self.id]);
      if (model) {
        model.clear();
        for (var key in data) {
          model.set(key, data[key]);
        }
        model.build();
      } else {
        model = new self.model(data);
        self.models.push(model);
        self.byId[model.get(self.id)] = model;
      }
    });

    return this.sort();
  };
  activities.serverTimeDiff = 0;

  return {
    getActivities: function () {
      return activities;
    },
    load: function () {
      var data = [];
      return $q.all([
        follows.load(),
        $http.get(serverConfig.url + '/api/social-activities/').then(function (response) {
          data = response.data;
          activities.serverTimeDiff = (new Date(response.headers('Server-Time'))).getTime() - Date.now();
        })
      ]).finally(function () {
        activities.add(data).prepare();
      });
    }
  };
}).factory('socialActivityHandler', function (socialActivity, socialActivityTabManager, serverConfig, $http, follows, navigateTo) {
  return {
    navigateToOwner: function (item) {
      if (item.get('following')) {
        navigateTo('target', 'user', item.get('following').id);
      } else if (item.get('group')) {
        navigateTo('target', 'group', item.get('group').id);
      }
    },
    navigate: function (item) {
      navigateTo('target', item.get('target').type, item.get('target').id);
    }
  };
}).factory('socialActivityTabManager', function (iStorage, JsModel) {

  var diff = 0;
  var Tab = JsModel.extend({
    initialize: function () {
      this.shownAt = iStorage.get('sa_shown_' + this.getLabel()) || Date.now();

      this.reset();
    },
    getLabel: function () {
      return this.options.label;
    },
    reset: function () {
      return this.clear().set('activities', []).set('number_of_new', 0).set('number_of_active_requests', 0);
    },
    setShownAt: function () {
      this.shownAt = Date.now();
      iStorage.set('sa_shown_' + this.getLabel(), this.shownAt);

      return this.evaluate();
    },
    evaluate: function () {
      var cnt = 0;
      var activeRequests = 0;
      var self = this;
      var shownAt = this.shownAt + diff;
      _(this.get('activities')).each(function (activity) {
        if (activity.get('created_at').getTime() > shownAt) {
          activity.isNew = true;
          cnt++;
          if (activity.isActiveRequest()) {
            activeRequests++;
          }
        } else if (activity.isActiveRequest()) {
          cnt++;
          activeRequests++;
        }
      });
      return self.set('number_of_new', cnt).set('number_of_active_requests', activeRequests);
    },
    add: function (activity) {
      this.get('activities').push(activity);

      return this;
    },
    remove: function (activity) {
      var index = _(this.get('activities')).indexOf(activity);
      this.get('activities').splice(index, 1);

      return this;
    }
  });

  var tabs = [new Tab({}, {label: 'You', key: 0}), new Tab({}, {label: 'Following', key: 1})];
  var state = {
    requestCount: iStorage.get('request-count') || 0,
    hasNew: iStorage.get('has-new') || false,
    setup: function () {
      state.hasNew = tabs[0].get('number_of_new') || tabs[1].get('number_of_new');
      state.requestCount = tabs[0].get('number_of_active_requests') + tabs[1].get('number_of_active_requests');
      iStorage.set('has-new', state.hasNew);
      iStorage.set('request-count', state.requestCount);
    }
  };
  var currentTab = tabs[0];

  function reset() {
    //state.requestCount = 0;
    //state.hasNew = false;
    tabs[0].reset();
    tabs[1].reset();
  }

  return {
    prepare: function (activities) {
      reset();
      diff = activities.serverTimeDiff;
      activities.each(function (activity) {
        if ('you' === activity.get('tab')) {
          tabs[0].add(activity);
        } else if ('following' === activity.get('tab')) {
          tabs[1].add(activity);
        }
      });
      tabs[0].evaluate();
      tabs[1].evaluate();
      state.setup();
    },
    getTab: function (key) {
      return tabs[key];
    },
    getState: function () {
      return state;
    },
    getCurrentTab: function () {
      return currentTab;
    },
    setCurrentTab: function (key) {
      currentTab = tabs[key];
    }
  };
});

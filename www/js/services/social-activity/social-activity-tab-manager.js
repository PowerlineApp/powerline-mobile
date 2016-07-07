angular.module('app.services').factory('SocialActivityTabManager', function (iStorage, JsModel) {
  var TAB_YOU_ID = 0
  var TAB_FOLLOWING_ID = 1

  var diff = 0;
  var Tab = JsModel.extend({
    initialize: function () {
      this.shownAt = iStorage.get('sa_shown_' + this.getLabel()) || Date.now();

      this.reset();
      this._wasVisited = false
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
      
      var newItemsCounter = 0;
      var activeRequests = 0;
      var self = this;
      var shownAt = this.shownAt + diff;
      _(this.get('activities')).each(function (activity) {
        if (activity.get('created_at').getTime() > shownAt) {
          activity.isNew = true;
          if(!activity.ignored())
            newItemsCounter++;
          if (activity.isActiveRequest()) {
            activeRequests++;
          }
        } else if (activity.isActiveRequest()) {
          if(!activity.ignored())
            newItemsCounter++;
          activeRequests++;
        }
      });
      return self.set('number_of_new', newItemsCounter).set('number_of_active_requests', activeRequests);
    },
    wasVisited: function(){
      this._wasVisited = true
    },
    counterIsVisible: function(){
      if(this.isFollowingTab()){
        return(!this._wasVisited && this.get('number_of_new'))
      } else {
        return(this.get('number_of_new'))
      }
    },
    isFollowingTab: function(){
      return(this.options.key == TAB_FOLLOWING_ID)
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

  var tabs = [new Tab({}, {label: 'You', key: TAB_YOU_ID}), new Tab({}, {label: 'Following', key: TAB_FOLLOWING_ID})];
  var state = {
    requestCount: iStorage.get('request-count') || 0,
    hasNew: iStorage.get('has-new') || false,
    displayTopNotification: true,
    displayFollowingCounter: true,
    setup: function () {
      state.hasNew = tabs[TAB_YOU_ID].get('number_of_new') || tabs[TAB_FOLLOWING_ID].get('number_of_new');
      state.requestCount = tabs[TAB_YOU_ID].get('number_of_active_requests') + tabs[TAB_FOLLOWING_ID].get('number_of_active_requests');
      iStorage.set('has-new', state.hasNew);
      iStorage.set('request-count', state.requestCount);
    }
  };
  var currentTab = tabs[0];

  function reset() {
    //state.requestCount = 0;
    //state.hasNew = false;
    tabs[TAB_YOU_ID].reset();
    tabs[TAB_FOLLOWING_ID].reset();
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
      state.displayTopNotification = false
      return tabs[key];
    },
    getState: function () {
      return state;
    },
    getCurrentTab: function () {
      return currentTab;
    },
    setCurrentTab: function (tab) {
      currentTab = tab;
      currentTab.wasVisited()
    }
  };
});
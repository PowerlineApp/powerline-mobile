/**
 * Initialize services module
 */

angular.module('app.services', [
  'app.config',
  'ngResource',
  'JsCollection'
]).factory('device', function ($window) {

  var service = {
    init: function () {
      service._isSmartphone = false
      if ($window.device && $window.device.platform) {
        if ($window.device.platform === 'iOS') {
          service.isIOS = true;
          //$window.StatusBar.hide();
          ionic.Platform.fullScreen(true);
          service._isSmartphone = true
        }
        if ($window.device.name) {
          var name = $window.device.name.toUpperCase();
          service.isIPad = name.search('IPAD') !== -1;
          if(service.isIPad)
            service._isSmartphone = true
        }

        if ($window.device.platform === 'Android') {
          service.isAndroid = true;
          service.isAndroid2 = $window.device.version[0] === '2';
          service._isSmartphone = true
        }
      }
    },

    isSmartphone : function(){
      this.init()
      return this._isSmartphone
    }
  };

  return service;
}).factory('navigateTo', function ($location) {

  var activityRoutes = {
    'question': '/questions/',
    'user-petition': '/petition/',
    'post': '/petition/',
    'leader-news': '/question/news/',
    'petition': '/question/leader-petition/',
    'payment-request': '/payment-polls/payment-request/',
    'leader-event': '/leader-event/',
    'crowdfunding-payment-request': '/payment-polls/crowdfunding-payment-request/'
  };

  var targetRoutes = {
    'group_question': '/questions/',
    'representative_question': '/questions/',
    'superuser_question': '/questions/',
    'quorum': '/petition/',
    'open letter': '/petition/',
    'long petition': '/petition/',
    'group_petition': '/question/leader-petition/',
    'group_news': '/question/news/',
    'representative_news': '/question/news/',
    'representative_petition': '/question/leader-petition/',
    'representative_payment_request': '/payment-polls/payment-request/',
    'group_payment_request': '/payment-polls/payment-request/',
    'representative_payment_request_crowdfunding': '/payment-polls/crowdfunding-payment-request/',
    'group_payment_request_crowdfunding': '/payment-polls/crowdfunding-payment-request/',
    'representative_event': '/leader-event/',
    'group_event': '/leader-event/',
    'group': '/group/',
    'user': '/influence/profile/'
  };

  var calls = {
    'path': function () {
      $location.path('/' + _(arguments).compact().join('/'));
    },
    'influence-profile': function (id) {
      if (id) {
        $location.path('/influence/profile/' + id);
      }
    },
    'discussion': function (questionId, commentId) {
      if (commentId) {
        $location.path('/discussion/' + questionId + '/' + commentId);
      } else {
        $location.path('/discussion/' + questionId);
      }
    },
    'owner-profile': function (user) {
      if ('representative' === user.type) {
        $location.path('/representative/' + (user.id ? user.id : 0) + '/' + (user.storage_id ? user.storage_id : 0));
      } else if ('group' === user.type) {
        $location.path('/group/' + user.id);
      } else if ('user' === user.type) {
        $location.path('/influence/profile/' + user.id);
      }
    },
    'group-profile': function (group) {
      $location.path('/group/' + group.id);
    },
    'group-members': function (group) {
      $location.path('/group-members/' + group.id);
    },    
    'group-join': function (group) {
      $location.path('/group/join/' + group.id);
    },
    'activity': function (activity, focus) {
      var activityType = activity.get('entity').type
      // not sure if entity.id is used at all or everything goes via entity.group_id 
      var activityID = activity.get('entity').id 
      if(activityID == null)
        activityID = activity.get('entity').group_id

      var activityRoute = activityRoutes[activityType]
      if(activityRoute == null)
        console.error('undefined route for activity type: '+activityType)
      var path = activityRoute + activityID;
      if (focus) {
        $location.path(path).search('focus', focus);
      } else {
        $location.path(path);
      }
    },
    'target': function (type, id) {
      $location.path(targetRoutes[type] + id);
    }
  };

  return function () {
    if (calls[arguments[0]]) {
      calls[arguments[0]].apply(this, _.rest(arguments));
    }
  };
}).value('homeCtrlParams', {
  activitiesCount: 0,
  filter: {
    groups: [],
    selectedGroup: null
  }
});
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
      if ($window.device && $window.device.platform) {



        if ($window.device.platform === 'iOS') {
          service.isIOS = true;
          $window.StatusBar.hide();
        }
        if ($window.device.name) {
          var name = $window.device.name.toUpperCase();
          service.isIPad = name.search('IPAD') !== -1;
        }

        if ($window.device.platform === 'Android') {
          service.isAndroid = true;
          service.isAndroid2 = $window.device.version[0] === '2';
        }
      }
    }
  };

  return service;
}).factory('navigateTo', function ($location) {

  var activityRoutes = {
    'question': '/questions/',
    'micro-petition': '/petition/',
    'leader-news': '/questions/news/',
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
    'group_news': '/questions/news/',
    'representative_news': '/questions/news/',
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
    'group-join': function (group) {
      $location.path('/group/' + group.id + '/join/' + group.membership_control + '/' + Number(group.fill_fields_required || 0));
    },
    'activity': function (activity, focus) {
      var path = activityRoutes[activity.get('entity').type] + activity.get('entity').id;
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
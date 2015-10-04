angular.module('app.controllers').controller('petitions.add',
function ($scope, topBar, petitions, PetitionsResource, groups, $routeParams, errorFormMessage, getFormData,
            camelcase2underscore, profile, homeCtrlParams, $document, session, flurry) {
  topBar.reset()
    .set('back', true)
    .set('title', $routeParams.type === 'quorum' ? 'New Post' : 'New Petition')
    .set('right', {
      btnClass: 'btn-text btn-send',
      title: 'Send',
      click: create
    })
  ;

  flurry.log('new micro petition form');

  $scope.groups = groups.getGroupsOptions();
  var form_templates = {
    quorum: 'templates/petitions/forms/micro-petition.html',
    'long petition': 'templates/petitions/forms/long-petition.html'
  };

  $scope.expires_intervals = [
    {
      value: 1,
      label: '1 day'
    },
    {
      value: 3,
      label: '3 days'
    },
    {
      value: 7,
      label: '7 days'
    },
    {
      value: 30,
      label: '30 days'
    }
  ];
  $scope.data = {
    is_outsiders_sign: false,
    type: $routeParams.type
  };

  if ($routeParams.group_id) {
    $scope.data.group = _($scope.groups).find(function (item) {
      return item.id === Number($routeParams.group_id);
    });
  } else {
    $scope.data.openChoices = true;
  }

  $scope.user_expire_interval = $scope.expires_intervals[2];
  $scope.petition_types = ['quorum', 'open letter', 'long petition'];
  $scope.profile = profile.get();
  $scope.form_template = form_templates[$scope.data.type];

  $scope.$watch('data.type', function () {
    $scope.form_template = form_templates[$scope.data.type];
  });

  function create() {
    if ($scope.petitionForm.$invalid) {
      $scope.formClass = 'error';
      if ($scope.petitionForm.petition_body.$error.required) {
        $scope.alert('No message entered', null, 'Error', 'OK');
      } else if ($scope.petitionForm.group.$error.required) {
        $scope.alert('No group selected', null, 'Error', 'OK');
      } else {
        $scope.alert(errorFormMessage($scope.petitionForm)[0], null, 'Error', 'OK');
      }
    } else {
      var petition = new PetitionsResource(getFormData($scope.petitionForm, {
        group: ['group_id', function (group) {
          return group.id;
        }],
        user_expire_interval: function (item) {
          return item.value;
        }
      }));
      $scope.loading = true;
      petition.$save(function () {
        homeCtrlParams.loaded = false;
        flurry.log('micro petition created');
        if ($routeParams.group_id) {
          petitions.loadAll().then($scope.back, $scope.back);
        } else {
          $scope.back();
        }
      }, function (response) {
        $scope.loading = false;
        if (response.status === 406) {
          $scope.alert('Your limit of petitions per month is reached for this group', null, 'Error', 'OK');
          return;
        }
        if (response.data && response.data.errors) {
          _(response.data.errors).each(function (error) {
            var property = camelcase2underscore(error.property);
            if ($scope.petitionForm[property]) {
              $scope.petitionForm[property].$setValidity('required', false);
            }
          });
          if (response.data.errors.length) {
            $scope.alert(response.data.errors[0].message, null, 'Error', 'OK');
          }
          $scope.formClass = 'error';
        } else {
          $scope.alert('Error occurred', null, 'Error', 'OK');
        }
      });
    }
  }

  var $body = $document.find('body');
  $scope.$on('resize', function () {
    $scope.$digest();
  });

  $scope.height = function () {
    return $body.height() - 56 - 42;
  };

  var start = new Date();
  var month = start.getMonth();
  start.setDate(0);
  petitions.loadByParams({user: session.user_id, start: start.toUTCString()}).then(function (collection) {
    _($scope.groups).each(function (group) {
      group.available = group.petition_per_month - collection.reduce(function (memo, petition) {
        if (petition.get('group').id === group.id && petition.get('created_at').getMonth() === month) {
          memo++;
        }
        return memo;
      }, 0);
    });
  });

}).controller('petition',function ($scope, topBar, petitions, $routeParams, loaded, $cacheFactory, session, $route,
                                   homeCtrlParams, activity, flurry, layout) {
  topBar
    .reset()
    .set('back', true)
    .set('title', 'Post')
  ;
  var cache = $cacheFactory.get('petitionController');
  $scope.petition = cache.get($routeParams.id);
  activity.setEntityRead({id: Number($routeParams.id), type: 'micro-petition'});

  flurry.log('micro petition', {id: Number($routeParams.id)});

  if (!$scope.petition) {
    $scope.loading = true;
  }

  $scope.select = function (option) {
    $scope.current = option;
  };

  petitions.load($routeParams.id).then(loaded($scope, function (petition) {
    $scope.petition = petition;
    if (petition.answer_id) {
      $scope.answer_message = 'Your response “' + petition.getOptionLabel(petition.answer_id) + '” was sent to “' + petition.group.official_title + '” group';
    }
    cache.put($routeParams.id, petition);
    layout.focus($routeParams.focus);
  }), loaded($scope));

  $scope.$watch('petition', function (petition) {
    if (petition) {
      $scope.shareBody = petition.petition_body;
      $scope.shareTitle = petition.title;
      $scope.shareImage = petition.share_picture;

      if ((petition.answer_id && petition.answer_id !== 3) || petition.expired || session.user_id === petition.user.id) {
        $scope.subview = 'templates/petitions/results.html';
      } else {
        $scope.subview = 'templates/petitions/options.html';
      }

      if (petition.answer_id && petition.answer_id === 3) {
        $scope.current = petition.options[2];
      }
    }
  });

  $scope.unsign = function () {
    $scope.loading = true;
    $scope.petition.$unsign($route.reload, $route.reload);
    homeCtrlParams.loaded = false;
  };

}).controller('petition.answer-form', function ($scope, $route, homeCtrlParams, flurry) {

  $scope.submit = function () {
    $scope.loading = true;
    $scope.$parent.petition.$answer({option_id: $scope.$parent.current.id}, function () {
      flurry.log('answer to micro petition', {id: $scope.$parent.petition.id});
      homeCtrlParams.loaded = false;
      $route.reload();
    }, function () {
      $route.reload();
    });
  };
});

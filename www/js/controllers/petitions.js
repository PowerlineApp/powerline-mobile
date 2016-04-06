angular.module('app.controllers').controller('petitions.add',
function ($scope,  petitions, PetitionsResource, groups, $stateParams, errorFormMessage, getFormData,
            camelcase2underscore, profile, homeCtrlParams, $document, session, flurry, $rootScope) {
  
  flurry.log('new micro petition form');
  
  $scope.type = $stateParams.type;
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
    type: $scope.type
  };

  if ($stateParams.group_id) {
    $scope.data.group = _($scope.groups).find(function (item) {
      return item.id === Number($stateParams.group_id);
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

  $scope.back = function(){
    $scope.hideSpinner();
    $rootScope.showToast('Sent!');
    $rootScope.back();
  };

  $scope.create = function(petitionForm) {
    if (petitionForm.$invalid) {
      $scope.formClass = 'error';
      if (petitionForm.petition_body.$error.required) {
        $scope.alert('No message entered', null, 'Error', 'OK');
      } else if (petitionForm.group.$error.required) {
        $scope.alert('No group selected', null, 'Error', 'OK');
      } else {
        $scope.alert(errorFormMessage(petitionForm)[0], null, 'Error', 'OK');
      }
    } else {
      var petition = new PetitionsResource(getFormData(petitionForm, {
        group: ['group_id', function (group) {
          return group.id;
        }],
        user_expire_interval: function (item) {
          return item.value;
        }
      }));
      $scope.showSpinner();
      petition.$save(function () {
        homeCtrlParams.loaded = false;
        flurry.log('micro petition created');
        if ($stateParams.group_id) {
          petitions.loadAll().then($scope.back, $scope.back);
        } else {
          $scope.back();
        }
      }, function (response) {
        $scope.hideSpinner();
        if (response.status === 406) {
          $scope.alert('Your limit of petitions per month is reached for this group', null, 'Error', 'OK');
          return;
        }
        if (response.data && response.data.errors) {
          _(response.data.errors).each(function (error) {
            var property = camelcase2underscore(error.property);
            if (petitionForm[property]) {
              petitionForm[property].$setValidity('required', false);
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

}).controller('petition',function ($scope, topBar, petitions, $stateParams, loaded, $cacheFactory, session, $state,
                                   homeCtrlParams, activity, flurry, layout, $ionicPopup, $rootScope) {
                                   
  var cache = $cacheFactory.get('petitionController');
  $scope.petition = cache.get($stateParams.id);
  activity.setEntityRead({id: Number($stateParams.id), type: 'micro-petition'});
  flurry.log('micro petition', {id: Number($stateParams.id)});

  if (!$scope.petition) {
    $scope.showSpinner();
  }

  $scope.select = function (option) {
    $scope.current = option;
  };

  
// mute: notification enabled value (true : disable, false : enable)
// hidden: show only to author
  $scope.mute = true;
  $scope.hidden = true;

  
  $scope.onClickToggleMute = function(){
    $scope.mute = !$scope.mute;
  }
/////////////////////////////////////////////////////////////////  

  petitions.load($stateParams.id).then(function (petition) {
    $scope.hideSpinner();
    $scope.petition = petition;

//Check the petitions owner = login user
    if ($scope.petition){
      if ($scope.petition.owner.id == $scope.petition.user.id){
        $scope.hidden = false;
      }
      else {
        $scope.hidden = true;
      }
    }
/////////////////////////////////////////////////////////////////      

//Edit and Delete Button

  $scope.editClicked = false;
  $scope.deleteClicked = false;

  $scope.onEditBtnClicked = function(){
    if ($scope.editClicked == false){
      $scope.editClicked = true;
    }
    else {
      $scope.editClicked = false;
      $scope.petition.petition_body_parsed = $scope.petition.petition_body;
//backend operation.      
      
      petitions.update($scope.petition.id);
      
    }
  };


  $scope.showConfirm = function() {
    var confirmPopup = $ionicPopup.confirm({
      title: 'Delete Post',
      template: 'Are you sure you want to delete this post?'
    });

    confirmPopup.then(function(res) {
      $scope.navigateTo = $rootScope.navigateTo;

      if(res) {

//Backend part...
        petitions.delete($scope.petition.id);
        $scope.back();
      } else {
        
      }
    });
  };

/////////////////////////////////////////////////////////////////      




    if (petition.answer_id) {
      $scope.answer_message = 'Your response “' + petition.getOptionLabel(petition.answer_id) + '” was sent to “' + petition.group.official_title + '” group';
    }
    cache.put($stateParams.id, petition);
    layout.focus($stateParams.focus);
  }, function(){
    $scope.hideSpinner();
  });

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
    $scope.showSpinner();
    $scope.petition.$unsign($state.reload, $state.reload);
    homeCtrlParams.loaded = false;
  };

}).controller('petition.answer-form', function ($scope, $state, homeCtrlParams, flurry, $rootScope) {

  $scope.submit = function () {
    $scope.showSpinner();
    $scope.$parent.petition.$answer({option_id: $scope.$parent.current.id}, function () {
      $scope.hideSpinner();
      flurry.log('answer to micro petition', {id: $scope.$parent.petition.id});
      homeCtrlParams.loaded = false;
      $state.reload();
    }, function () {
      $scope.hideSpinner();
      $state.reload();
    });
  };
});

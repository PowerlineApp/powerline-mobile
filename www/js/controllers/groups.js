angular.module('app.controllers').controller('groups',function ($scope, groups, $state, $rootScope, $http, serverConfig) {
  
  $scope.groupsGrupedByFirstLetter = [];

  function loadGroups(showSpinner){
    if(showSpinner) $scope.showSpinner();
    groups.load().finally(function () {
      if(showSpinner) $scope.hideSpinner();
      $scope.$broadcast('scroll.refreshComplete');
      $scope.groupsGrupedByFirstLetter = groups.getLettersGroups();
    });
  }

  $scope.unjoin = function (item) {
    $scope.confirmAction('Are you sure?').then(function () {
      $scope.showSpinner();
      groups.unjoin(item.id).then(function () {
        $scope.hideSpinner();
        loadGroups(true);
      }, function () {
        $scope.hideSpinner();
      });
    });
  };
  
  $scope.pullToRefresh = function(){
    loadGroups();
  };
  
  $rootScope.$on('groups-updated', function(){
    loadGroups(true);
  });
  
  //if this page is opened from menu or there is not data, we should refresh data
  $scope.$on('$ionicView.enter', function(){
    if($scope.groupsGrupedByFirstLetter.length === 0/* || $rootScope.menuClicked*/){
      loadGroups(true);
      groups.loadSuggested();
    }
  });
  
  
}).controller('groups.search',function ($scope, groups, $rootScope) {

  var DEFAULT_SEARCH_ITEMS = [];

  $scope.searchItems = DEFAULT_SEARCH_ITEMS;


  $scope.data = {};

  $scope.isSearchActive = false;

  $scope.$watch('data.search', function (value) {
    $scope.isSearchActive = Boolean(value);
  });

  $scope.$watch(function () {
    return $scope.isSearchActive ? groups.search($scope.data.search) : DEFAULT_SEARCH_ITEMS;
  }, function (searchItems) {
    $scope.searchItems = searchItems;
  });

  $scope.unjoin = function (item) {
    $scope.confirmAction('Are you sure?').then(function () {
      $scope.showSpinner();
      groups.unjoin(item.id).then(groups.load, groups.load).finally(function () {
        $rootScope.$broadcast('groups-updated');
        $scope.hideSpinner();
      });
    });
  };
  if (!groups.getPopularGroups().length) {
    $scope.showSpinner();
    groups.loadSuggested().finally(function () {
      $scope.hideSpinner();
    });
  }

}).controller('groups.search.join-groups',function ($scope, groups, $rootScope) {
  $scope.popularItems = groups.getPopularGroups();
  $scope.newItems = groups.getNewGroups();

  // $scope.$watch(groups.getPopularGroups, function (newValue) {
  //   $scope.popularItems = newValue;
  // });

  $scope.$watch(groups.getNewGroups, function (newValue) {
    $scope.newItems = newValue;
  });
}).controller('groups.profile',function ($scope, topBar, groups, $stateParams, $state, activity, favorite, invites, influence, homeCtrlParams, $rootScope, $location) {
  
  influence.loadFollowers();
  $scope.favoriteService = favorite

  var id = parseInt($stateParams.id, 10);

  $scope.data = groups.get(id);
  $scope.isChangeAvailable = function () {
    return $scope.data && $scope.data.group_type === 0;
  };

  $scope.goToMembers = function(){
    $scope.navigateTo('group-members', $scope.data)
  }

  $scope.invite = function () {
    $scope.confirmAction('Are you sure you want to invite all of your followers to join this group?').then(function () {
      var followersUsernames = influence.getFollowers().map(function (followerItem) {
        return(followerItem.follower.username);
      });
      $scope.showPostWindow = false;
      $scope.showSpinner();
      invites.invite(id, followersUsernames).finally(function () {
        $scope.hideSpinner();
        $scope.showToast('Invites sent!')
      });
    });
  };

  $scope.join = function () {
    $scope.navigateTo('group-join', $scope.data);
  };

  $scope.unjoin = function () {
    $scope.confirmAction('Are you sure?').then(function () {
      homeCtrlParams.loaded = false;
      $scope.showSpinner();
      groups.unjoin($scope.data.id).then(function () {
        $rootScope.$broadcast('groups-updated');
        $scope.hideSpinner();
         $scope.showToast('Successfully left group ' + $scope.data.official_title);
        $location.path('/groups');
      }, function () {
        $scope.hideSpinner();
        $rootScope.$broadcast('groups-updated');
        $state.reload();
      });
    });
  };

  function loaded() {
    $scope.hideSpinner();
    return checkPermissions();
  }
  
  $scope.togglePostWindow = function(){
    $scope.showPostWindow = !$scope.showPostWindow;
    $scope.execApply();
  };

  function checkPermissions() {
    var group = groups.get(id);
    if (group.joined && group.required_permissions && group.required_permissions.length) {
      return groups.loadPermissions(id).then(function (permissions) {
        if (permissions.hasNew()) {
          var message = 'The group requests new permissions: ';
          _(permissions.getNew()).each(function (key) {
            message += '\n ' + (groups.permissionsLabels[key] || key);
          });
          $scope.confirmAction(message, 'Permissions', ['OK','Cancel']).then(function () {
            permissions.approveNew().save();
          }, function () {
            permissions.save();
          });
        }
      });
    }
  }

  $scope.showSpinner();
  groups.loadAllDetails(id).then(loaded, loaded);

  $scope.$watch('data', function () {
    if ($scope.data) {
      $scope.activities = activity.getActivities().getFilteredModels($scope.data);
    }
  });

  $scope.$watch(function () {
    return groups.get(id);
  }, function (newValue) {
    $scope.data = newValue;
  });
}).controller('groups.join', function ($scope, $stateParams, groups, groupsInvites, homeCtrlParams, $rootScope) {

  $scope.showSpinner();
  $scope.data = {};
  var id = Number($stateParams.id);

  groups.loadAllDetails(id).then(function (group) {
    $scope.hideSpinner();
    $scope.group = group
    
    $scope.showSpinner();
    group.fieldsToFillOnJoin().then(function (fields) {

      if(fields && fields.length > 0){
        $scope.hideSpinner();
        $scope.data.fields = [];
        _(fields).each(function (field) {
          $scope.data.fields.push(
            {
              field: field,
              field_value: ''
            }
          );
        });
      } else if(group.groupMembershipIsPublic() || group.userHasInvitation())
        $scope.join();

    }, function () {
      $scope.hideSpinner();
      $scope.alert('Error occurred');
    });
    

  }, function () {
    $scope.alert('Error occurred');
    $scope.back();
  });

  $scope.join = function (joinForm) {
    if (joinForm && joinForm.$invalid) {
      $scope.formClass = 'error';
    } else {
      var group = groups.get(id);
      if (group.required_permissions && group.required_permissions.length) {
        var message = 'The next information will be shared with the group leader: ';
        _(group.required_permissions).each(function (key) {
          message += '\n ' + groups.permissionsLabels[key];
        });
        $scope.confirmAction(message, 'Permissions',['OK','Cancel']).then(function(){
          join(joinForm);
        });
      } else {
        join(joinForm);
      }
    }
  };

  function join(joinForm) {
    $scope.formClass = '';
    $scope.showSpinner();
    var passcode = null
    var answers = null

    passcode = $scope.data.passcode
    answeredFields = $scope.data.fields
    groups.join(id, passcode, answeredFields).then(function (status) {
      $scope.showApproveMessage = !status;
      success();
    }, function (response) {
      $scope.formClass = 'error';
      $scope.hideSpinner();
      if (403 === response.status) {
        /*if (response.data && response.data.error) {
          $scope.alert(response.data.error);
        } else {*/
          joinForm.passcode.$setValidity('required', false);
          $scope.alert('Incorrect passcode');
        //}
      } else if (400 === response.status) {
        $scope.alert('Invalid data');
      } else {
        $scope.alert('Error occurred');
      }
    });
  }

  function success() {
    homeCtrlParams.loaded = false;
    $rootScope.$broadcast('groups-updated');
    $scope.hideSpinner();
    if (!$scope.showApproveMessage) {
      $scope.showToast('Successfully joined group ' + $scope.group.official_title);
      $scope.path('/groups');
    }
  }

}).controller('groups.create',function ($scope, groups, profile, $location) {

  var user = profile.get();
  $scope.data = {
    manager_first_name: user.first_name,
    manager_last_name: user.last_name,
    manager_email: user.email,
    manager_phone: user.phone
  };

  

  $scope.types = [
    'Educational',
    'Non-Profit (Not Campaign)',
    'Non-Profit (Campaign)',
    'Business',
    'Cooperative/Union',
    'Other'
  ];
  
  $scope.send = function(){
    setTimeout(function(){
      angular.element('form[name=createGroupForm] #submitter').trigger('click');
    });
  };

  $scope.create = function(createGroupForm) {
    createGroupForm.$filled = true;
    if (createGroupForm.$invalid) {
      $scope.formClass = 'error';
    } else {
      $scope.showSpinner();
      groups.create($scope.data).then(function (group) {
        $scope.alert('Way to go! You\'ve created a new Powerline group. Invite your followers from the next screen or login via our website for group management features. Check your e-mail for more information.', function () {
          $scope.path('/groups');
          $scope.execApply();
        });
      }, function (response) {
        $scope.hideSpinner();
        if (response.data && response.data.errors) {
          _(response.data.errors).each(function (error) {
            if (createGroupForm[error.property]) {
              createGroupForm[error.property].$setValidity('required', false);
            }
          });
          if (response.data.errors.length) {
            $scope.alert(response.data.errors[0].message, null, 'Error', 'OK');
          }
          $scope.formClass = 'error';
        } else if (response.data && response.data.error) {
          $scope.alert(response.data.error, null, 'Error', 'OK');
        } else {
          $scope.alert('Error occurred', null, 'Error', 'OK');
        }
      });
    }
  }
});

angular.module('app.controllers').controller('groups',function ($scope, groups, $state, $rootScope, $http, serverConfig, $location) {
  
  $scope.groupsGrupedByFirstLetter = [];

  function loadGroups(showSpinner){
    if(showSpinner) $scope.showSpinner();
    var doNotEmitGroupsUpdatedEvent = true;
    groups.load(doNotEmitGroupsUpdatedEvent).finally(function () {
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
    loadGroups(false);
  });
  
  //if this page is opened from menu or there is not data, we should refresh data
  $scope.$on('$ionicView.enter', function(){
    if($scope.groupsGrupedByFirstLetter.length === 0/* || $rootScope.menuClicked*/){
      loadGroups(true);
      groups.loadSuggested();
    }
  });
  
  
}).controller('groups.search',function ($scope, groups, $rootScope) {

  $scope.searchItems = [];
  $scope.data = {};
  $scope.displaySearchResults = false;

  $scope.$watch('data.search', function (value) {
    var doSearch = Boolean(value);
    if(doSearch){
      groups.search($scope.data.search).then(function(groups){
        $scope.searchItems = groups;
        $scope.displaySearchResults = true
      })
    } else 
      $scope.displaySearchResults = false
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
}).controller('groups.profile',function ($scope, topBar, groups, $stateParams, $state, activity, favorite, follows, homeCtrlParams, $rootScope, $location, profile) {
  
  follows.load();
  $scope.favoriteService = favorite

  var id = parseInt($stateParams.id, 10);

  $scope.data = groups.get(id);
  $scope.isChangeAvailable = function () {
    return $scope.data && $scope.data.groupTypeIsCommon()
  };

  $scope.goToMembers = function(){
    $scope.navigateTo('group-members', $scope.data)
  }

  $scope.goToGroupManagement = function(){
    $location.path('/manage-group/'+id);
  }

  $scope.isGroupManager = function(){
    var group = $scope.data
    return group.currentUserIsManager() || group.currentUserIsOwner()
  }

  $scope.invite = function () {
    var groupID = $scope.data.id
    $scope.confirmAction('Are you sure you want to invite all of your followers to join this group?').then(function () {
      $scope.showPostWindow = false;
      $scope.showSpinner();
      groups.inviteAllFollowers(groupID).then(function(){
        $scope.hideSpinner();
        $scope.showToast('Invites sent!')        
      })
    })
  };

  $scope.join = function () {
    $scope.navigateTo('group-join', $scope.data);
  };

  var doUnjoin = function(){
      homeCtrlParams.loaded = false;
      $scope.showSpinner();
      groups.unjoin($scope.data.id).then(function () {
        $rootScope.$broadcast('groups-updated');
        $scope.hideSpinner();
         $scope.showToast('Successfully left group ' + $scope.data.official_name);
        $location.path('/groups');
      }, function () {
        $scope.hideSpinner();
        $rootScope.$broadcast('groups-updated');
        $state.reload();
      });
  }

  $scope.unjoin = function () {
    $scope.confirmAction('Are you sure?').then(function () {
      doUnjoin()
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
    return groups.loadPermissions(id).then(function (permissionModel) {
      $scope.permissionsForHumans = permissionModel.getPermissionsRequiredByGroupForHumans()

      if (group.joined && permissionModel.getPermissionsToConfirmByUserForHumans().length > 0) {
        var message = 'The group requests new permissions: ';
        message += permissionModel.getPermissionsToConfirmByUserForHumans().join("\n")
        $scope.confirmAction(message, 'Permissions', ['OK','Cancel']).then(function () {
          permissionModel.confirmPermissions()
        }, function () {
          console.log('unjoin')
          doUnjoin()
        });
      }
    });
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
}).controller('groups.join', function ($scope, $stateParams, groups, homeCtrlParams, $rootScope) {

  $scope.showSpinner();
  $scope.data = {};
  var id = Number($stateParams.id);

  groups.loadAllDetails(id).then(function (group) {
    $scope.hideSpinner();
    $scope.group = group
    
    $scope.showSpinner();
    group.loadFieldsToFillOnJoin().then(function (fields) {
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
      } else if(group.groupMembershipIsPublic() || group.userHasInvitation() || group.groupMembershipIsApproval())
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

      groups.loadPermissions(id).then(function (permissionModel) {
        if (permissionModel.hasPermissions()) {
          var message = 'The next information will be shared with the group leader: ';
          message += permissionModel.getPermissionsToConfirmByUserForHumans().join("\n")
          $scope.confirmAction(message, 'Permissions',['OK','Cancel']).then(function(){
            join(joinForm);
          })
        } else {
          join(joinForm);
        }
      });      
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
      success();
    }, function (response) {
      var jsonError = JSON.stringify(response.data)
      $scope.formClass = 'error';
      $scope.hideSpinner();
      if (jsonError.indexOf('Incorrect passcode') >= 0) {
          joinForm.passcode.$setValidity('required', false);
          $scope.alert('Incorrect passcode');
      } else  {
        $scope.alert('Error occured: '+jsonError);
      }
    });
  }

  function success() {
    homeCtrlParams.loaded = false;
    $rootScope.$broadcast('groups-updated');
    $scope.hideSpinner();
    var group = groups.get(id);
    var msg = 'Successfully joined group ' + $scope.group.official_name
    if (group.groupMembershipIsApproval())
      msg = 'You request to join group '+$scope.group.official_name+' was received. Awaiting approval from group administrator.'
    $scope.showToast(msg);
    $scope.path('/groups');
  }

}).controller('groups.create',function ($scope, groups, profile, $location) {

  $scope.data = {}
  profile.load().then(function(user){
    $scope.data = {
      manager_first_name: user.first_name,
      manager_last_name: user.last_name,
      manager_email: user.email,
      manager_phone: user.phone
    };
  })

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
        $scope.hideSpinner();
        $scope.alert('Way to go! You\'ve created a new Powerline group. Invite your followers from the next screen or login via our website for group management features. Check your e-mail for more information.', function () {
          $scope.path('/groups');
          $scope.execApply();
        });
      }, function (response) {
        $scope.hideSpinner();
        console.log(response)

        var errorMsg = 'Failed to create new group. '
        if(response.data && response.data  && response.data.message)
          errorMsg += response.data.message + '. '

        if(response.data && response.data.errors && response.data.errors.children){
          _.each(response.data.errors.children, function(fieldErrors,fieldName){
            if(fieldErrors.errors)
              errorMsg += fieldName + ': ' + fieldErrors.errors.join(', ') + '. '
          })
        }

        $scope.alert(errorMsg, null, 'Error', 'OK');
      });
    }
  }
});

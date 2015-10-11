angular.module('app.controllers').controller('groups',function ($scope, groups, $state, $rootScope, flurry) {
  
  flurry.log('my groups');
  
  $scope.items = [];

  function loadGroups(showSpinner){
    if(showSpinner) $scope.$emit('showSpinner');
    groups.load().finally(function () {
      if(showSpinner) $scope.$emit('hideSpinner');
      $scope.$broadcast('scroll.refreshComplete');
      $scope.items = groups.getLettersGroups();
    });
  }

  $scope.unjoin = function (item) {
    $scope.confirmAction('Are you sure?').then(function () {
      $scope.$emit('showSpinner');
      groups.unjoin(item.id).then(function () {
        $scope.$emit('hideSpinner');
        loadGroups(true);
      }, function () {
        $scope.$emit('hideSpinner');
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
    if($scope.items.length === 0 || $rootScope.menuClicked){
      loadGroups(true);
      groups.loadSuggested();
    }
  });
  
  
}).controller('groups.search',function ($scope, groups, flurry, $rootScope) {

  flurry.log('group search');

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
      $scope.$emit('showSpinner');
      groups.unjoin(item.id).then(groups.load, groups.load).finally(function () {
        $rootScope.$broadcast('groups-updated');
        $scope.$emit('hideSpinner');
      });
    });
  };

  if (!groups.getPopularGroups().length) {
    $scope.$emit('showSpinner');
    groups.loadSuggested().finally(function () {
      $scope.$emit('hideSpinner');
    });
  }

}).controller('groups.search.join-groups',function ($scope, groups, $rootScope) {
  $scope.popularItems = groups.getPopularGroups();
  $scope.newItems = groups.getNewGroups();

  $scope.$watch(groups.getPopularGroups, function (newValue) {
    $scope.popularItems = newValue;
  });

  $scope.$watch(groups.getNewGroups, function (newValue) {
    $scope.newItems = newValue;
  });
}).controller('groups.profile',function ($scope, topBar, groups, $stateParams, $state, activity, invites, influence, homeCtrlParams, flurry, $rootScope) {
  
  influence.loadFollowers();

  var id = parseInt($stateParams.id, 10);

  flurry.log('group profile', {id: id});

  $scope.data = groups.get(id);
  $scope.isChangeAvailable = function () {
    return $scope.data && $scope.data.group_type === 0;
  };

  $scope.invite = function () {
    $scope.confirmAction('Are you sure you want to invite all of your followers to join this group?').then(function () {
      var followers = influence.getFollowers().reduce(function (memo, item) {
        memo.push(item.follower.id);
        return memo;
      }, []);
      $scope.showPostWindow = false;
      $scope.$emit('showSpinner');
      invites.invite(id, followers).finally(function () {
        $scope.$emit('hideSpinner');
        flurry.log('invite to group', {id: id});
      });
    });
  };

  $scope.join = function () {
    groups.resetInfo($scope.data.id);
    $scope.navigateTo('group-join', $scope.data);
  };

  $scope.unjoin = function () {
    $scope.confirmAction('Are you sure?').then(function () {
      homeCtrlParams.loaded = false;
      $scope.$emit('showSpinner');
      groups.unjoin($scope.data.id).then(function () {
        $rootScope.$broadcast('groups-updated');
        groups.resetInfo($scope.data.id);
        $scope.$emit('hideSpinner');
        flurry.log('unjoin', {id: id});
        $state.reload();
      }, function () {
        $scope.$emit('hideSpinner');
        $rootScope.$broadcast('groups-updated');
        $state.reload();
      });
    });
  };

  function loaded() {
    $scope.$emit('hideSpinner');
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
          $scope.confirmAction(message, 'Permissions', 'OK,Cancel').then(function () {
            permissions.approveNew().save();
          }, function () {
            permissions.save();
          });
        }
      });
    }
  }

  $scope.$emit('showSpinner');
  groups.loadInfo(id).then(loaded, loaded);

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
}).controller('groups.join', function ($scope, $stateParams, groups, groupsInvites, homeCtrlParams, $rootScope, flurry) {

  $scope.$emit('showSpinner');
  $scope.data = {};
  $scope.isFieldRequired = Number($stateParams.isFieldRequired);
  var id = Number($stateParams.id);
  $scope.publicStatus = Number($stateParams.publicStatus);
  $scope.isPasscodeRequired = !groupsInvites.hasInvite(id) && 2 === $scope.publicStatus;

  groups.loadInfo(id).then(function () {
    $scope.$emit('hideSpinner');
    if (!$scope.isFieldRequired && ((0 === $scope.publicStatus || 1 === $scope.publicStatus) || groupsInvites.hasInvite(id))) {
      $scope.join();
    }

    if ($scope.isFieldRequired) {
      $scope.$emit('showSpinner');
      groups.loadFields(id).then(function (fields) {
        $scope.$emit('hideSpinner');
        $scope.data.fields = [];
        _(fields).each(function (field) {
          $scope.data.fields.push(
            {
              field: field,
              field_value: ''
            }
          );
        });
      }, function () {
        $scope.$emit('hideSpinner');
        $scope.alert('Error occurred');
      });
    }

  }, function () {
    $scope.alert('Error occurred');
    $scope.back();
  });


  $scope.join = function () {
    if ($scope.joinFrom && $scope.joinFrom.$invalid) {
      $scope.formClass = 'error';
    } else {
      var group = groups.get(id);
      if (group.required_permissions && group.required_permissions.length) {
        var message = 'The next information will be shared with the group leader: ';
        _(group.required_permissions).each(function (key) {
          message += '\n ' + groups.permissionsLabels[key];
        });
        $scope.confirmAction(message, 'Permissions', 'OK,Cancel').then(join);
      } else {
        join();
      }
    }
  };

  function join() {
    $scope.formClass = '';
    $scope.$emit('showSpinner');
    groups.join(id, $scope.data).then(function (status) {
      $scope.showApproveMessage = !status;
      success();
      flurry.log('join to group', {id: id});
    }, function (response) {
      $scope.formClass = 'error';
      $scope.$emit('hideSpinner');
      if (403 === response.status) {
        if (response.data && response.data.error) {
          $scope.alert(response.data.error);
        } else {
          $scope.joinFrom.passcode.$setValidity('required', false);
          $scope.alert('Incorrect passcode');
        }
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
    $scope.$emit('hideSpinner');
    groups.resetInfo(id);
    if (!$scope.showApproveMessage) {
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
      $scope.$emit('showSpinner');
      groups.create($scope.data).then(function (group) {
        $scope.alert('Way to go! You\'ve created a new Powerline group. Invite your followers from the next screen or login via our website for group management features. Check your e-mail for more information.', function () {
          $scope.path('/group/' + group.id);
          $scope.execApply();
        });
      }, function (response) {
        $scope.$emit('hideSpinner');
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

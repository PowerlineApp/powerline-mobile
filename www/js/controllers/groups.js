angular.module('app.controllers').controller('groups',function ($scope, groups, $route, topBar, $location, flurry) {
  $scope.loading = true;
  $scope.items = [];

  topBar.reset();
  topBar.set('title', 'My Groups')
    .set('menu', true)
    .set('right', {
      btnClass: 'btn-plus',
      click: function () {
        $location.path('/groups/search');
      }
    })
  ;

  flurry.log('my groups');

  groups.load().then(function () {
    $scope.loading = false;
    $scope.items = groups.getLettersGroups();
  }, function (error) {
    $scope.loading = false;
    $scope.alert(error, null, 'Error', 'OK');
  });

  groups.loadSuggested();

  $scope.unjoin = function (item) {
    $scope.confirmAction('Are you sure?').then(function () {
      $scope.loading = true;
      groups.unjoin(item.id).then(function () {
        $scope.loading = false;
        $route.reload();
      }, function () {
        $scope.loading = false;
        $route.reload();
      });
    });
  };

}).controller('groups.search',function ($scope, groups, topBar, flurry) {

  topBar.reset();
  topBar.set('title', 'Group Search')
    .set('back', true)
    .set('right', {
      btnClass: 'btn-text',
      title: 'Create',
      click: function () {
        $scope.path('/groups/create');
      }
    })
  ;

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
      $scope.loading = true;
      groups.unjoin(item.id).then(groups.load, groups.load).finally(function () {
        $scope.loading = false;
      });
    });
  };

  if (!groups.getPopularGroups().length) {
    $scope.loading = true;
    groups.loadSuggested().finally(function () {
      $scope.loading = false;
    });
  }

}).controller('groups.search.join-groups',function ($scope, groups) {
  $scope.popularItems = groups.getPopularGroups();
  $scope.newItems = groups.getNewGroups();

  $scope.$watch(groups.getPopularGroups, function (newValue) {
    $scope.popularItems = newValue;
  });

  $scope.$watch(groups.getNewGroups, function (newValue) {
    $scope.newItems = newValue;
  });
}).controller('groups.profile',function ($scope, topBar, groups, $routeParams, $route, activity, invites, influence, homeCtrlParams, flurry) {
  topBar
    .reset()
    .set('back', true)
    .set('title', 'Group Profile')
  ;
  influence.loadFollowers();

  var id = parseInt($routeParams.id, 10);

  flurry.log('group profile', {id: id});

  $scope.loading = false;
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
      $scope.loading = true;
      invites.invite(id, followers).finally(function () {
        $scope.loading = false;
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
      $scope.loading = true;
      groups.unjoin($scope.data.id).then(function () {
        groups.load();
        groups.resetInfo($scope.data.id);
        $scope.loading = false;
        flurry.log('unjoin', {id: id});
        $route.reload();
      }, function () {
        $scope.loading = false;
        $route.reload();
      });
    });
  };

  function loaded() {
    $scope.loading = false;
    var group = groups.get(id);
    if (group && group.group_type === 0 && group.joined) {
      topBar.set('right', {
        btnClass: 'btn-text',
        title: 'Invite',
        click: function () {
          $scope.showPostWindow = !$scope.showPostWindow;
          $scope.execApply();
        }
      });
    }

    return checkPermissions();
  }

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

  $scope.loading = true;
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
}).controller('groups.join', function ($scope, topBar, $routeParams, groups, groupsInvites, homeCtrlParams, flurry) {
  topBar.reset().set('back', true).set('title', 'Join Group');
  $scope.loading = true;
  $scope.data = {};
  $scope.isFieldRequired = Number($routeParams.isFieldRequired);
  var id = Number($routeParams.id);
  $scope.publicStatus = Number($routeParams.publicStatus);
  $scope.isPasscodeRequired = !groupsInvites.hasInvite(id) && 2 === $scope.publicStatus;

  groups.loadInfo(id).then(function () {
    $scope.loading = false;
    if (!$scope.isFieldRequired && ((0 === $scope.publicStatus || 1 === $scope.publicStatus) || groupsInvites.hasInvite(id))) {
      $scope.join();
    }

    if ($scope.isFieldRequired) {
      $scope.loading = true;
      groups.loadFields(id).then(function (fields) {
        $scope.loading = false;
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
        $scope.loading = false;
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
    $scope.loading = true;
    groups.join(id, $scope.data).then(function (status) {
      $scope.showApproveMessage = !status;
      groups.load().then(success, $scope.back);
      flurry.log('join to group', {id: id});
    }, function (response) {
      $scope.formClass = 'error';
      $scope.loading = false;
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
    $scope.loading = false;
    groups.resetInfo(id);
    if (!$scope.showApproveMessage) {
      $scope.path('/groups');
    }
  }

}).controller('groups.create',function ($scope, topBar, groups, profile) {
  topBar.reset()
    .set('back', true)
    .set('title', 'New Group')
    .set('right', {
      btnClass: 'btn-text',
      title: 'Send',
      click: create
    });

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

  function create() {
    $scope.createGroupForm.$filled = true;
    if ($scope.createGroupForm.$invalid) {
      $scope.formClass = 'error';
    } else {
      $scope.loading = true;
      groups.create($scope.data).then(function (group) {
        $scope.alert('Way to go! You\'ve created a new Powerline group. Invite your followers from the next screen or login via our website for group management features. Check your e-mail for more information.', function () {
          $scope.path('/group/' + group.id);
          $scope.execApply();
        });
      }, function (response) {
        $scope.loading = false;
        if (response.data && response.data.errors) {
          _(response.data.errors).each(function (error) {
            if ($scope.createGroupForm[error.property]) {
              $scope.createGroupForm[error.property].$setValidity('required', false);
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

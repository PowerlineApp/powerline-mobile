angular.module('app.controllers').controller('followgroup', function($scope, $state, $stateParams, $rootScope, flurry, followgroup, $http, serverConfig, follows, session, users, $ionicPopup){
  var id = parseInt($stateParams.id, 10);
  
  $scope.loadGroupData = function(showSpinner){

    $scope.data = [];
    

    if(showSpinner){
      $scope.showSpinner();
    }
    $http.get(serverConfig.url + '/api/groups/' + id + '/users').then(
      function (response) {
        $scope.groupData = response.data;
        member_count = $scope.groupData.length;
        
        followingData = follows.getFollowing();
        following_count = followingData.length;
        for (i = 0; i < member_count; i++){
          var member = $scope.groupData[i];
          var item = {id:"0", first_name:"", following:false, image_name:""};
          item.id = member.id;
          item.first_name = member.first_name;
          item.username = member.username;
          item.following = false;

          for (j = 0; j < following_count; j++){
            var following = followingData[j];
            if (member.id == following.attributes.user.id){
              item.following = true;
              break;
            }
          }
          $scope.data.push(item);
        }

        $scope.hideSpinner();
      }
    );
  }

  $scope.follow = function(item){

    var following = follows.getByUserId(item.id);
    if (item.following == true){
      following.unfollow();
    }
    else{
      following.follow();
    }
    item.following = !(item.following);
  };

  $scope.followAll = function(){
    var confirmPopup = $ionicPopup.confirm({
     title: 'Follow Every Member',
     template: 'Send follow request to every group member? (Not recommended!)'
    });

    $scope.showToast = $rootScope.showToast;
    confirmPopup.then(function(res) {
     if(res) {
      var member_count = $scope.data.length;
      for (var i = 0; i < member_count; i++){
        var item = $scope.data[i];
        if (item.following == false){
          item.following = true;
          following = follows.getByUserId(item.id);
          following.follow();
        }
      }

      $scope.showToast('Follow requests sent. Review in Menu>My Influences.');

     } else {
       
     }
    });
  }

  $scope.$on('$ionicView.enter', function(){
      $scope.loadGroupData(true);
  });

  $scope.isEmpty = function () {
    return $scope.groupData.size();
  };

  $scope.pullToRefresh = function(){
    loadGroupData();
  };

/*
  $scope.data = follows.getFollowing();

  $scope.$watch(follows.size, function () {
    $scope.data = follows.getFollowing();
  });
  $scope.$on('follows-loaded', function () {
    $scope.data = follows.getFollowing();
  });

  $scope.unfollow = function (item) {
    $scope.confirmAction('Are you sure?').then(function () {
      item.unfollow();
      follows.remove(item);
      $scope.data = follows.getFollowing();
      flurry.log('unfollow user', {id: item.get('id')});
    });
  };

*/

}).controller('followgroup.profile',
  function ($scope, users, follows, $stateParams, $state, profile, flurry, activity, $rootScope) {

  var id = parseInt($stateParams.id, 10);

  flurry.log('user profile', {id: id});

  $scope.showSpinner();
  users.load(id).then(function (data) {
    $scope.data = data;
    $scope.hideSpinner();
  }, function () {
    $scope.hideSpinner();
  });

  if (profile.get() && profile.get().id !== id) {
    $scope.follow = follows.getByUserId(id);
  }

  $scope.changeStatus = function (status) {
    if ('unfollow' === status) {
      $scope.confirmAction('Are you sure?').then(function () {
        $scope.follow[status]().then(function(){
        $rootScope.$broadcast('influences-updated');
        $state.reload();
      }, $state.reload);
        flurry.log('unfollow user', {id: id});
        $rootScope.$broadcast('influences-updated');
      });
    } else {
      $scope.follow[status]().then(function(){
        $rootScope.$broadcast('influences-updated');
        $state.reload();
      }, $state.reload);
      flurry.log('follow user', {id: id});
    }
  };

  if ($scope.follow && $scope.follow.get('status')) {
    activity.fetchFollowingActivities($scope.follow.get('user').id).then(function(activities) {
      $scope.activities = activities.models;
    });
  }

});
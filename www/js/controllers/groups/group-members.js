angular.module('app.controllers').controller('group.members',function ($scope, groups, $stateParams, follows, session, $ionicPopup) {
  var groupID = parseInt($stateParams.id)
  $scope.groupMembers = []
  $scope.followingAll = true

  groups.loadAllDetails(groupID).then(function(){
    $scope.group = groups.get(groupID);
    $scope.group.loadGroupMembers().then(function(members){
      follows.load().then(function(){

        var alreadyFollowingIDs = follows.getUsersFollowedByCurrentUser().map(function(f){
          return f.user_id
        })

        members.forEach(function(m){
          var isFollowed = (0 <= alreadyFollowingIDs.indexOf(m.id))
          if(isFollowed)
            m.isFollowed = true
          else
            $scope.followingAll = false
        })
      })
    })
  })

  $scope.followAll = function(){
    var confirmPopup = $ionicPopup.confirm({
      title: 'Follow All',
      cssClass: 'popup-by-ionic',
      template: 'Do you want to want to follow all users in this group?'
    });

    confirmPopup.then(function(res) {
      if(res) {
        $scope.group.followAllMembers().then(function(){
          $scope.showToast('Follow all request sent!');
          $scope.followingAll = true
          follows.load()
          $scope.groupMembers.forEach(function(m){
            m.isFollowed = true
          })
        })
      }
    });
  }

  $scope.isFollowable = function(member){
    var a = !member.isFollowed
    var b = !$scope.followingAll
    var c = member.id != session.user_id
    return(a && b && c)
  }

  $scope.isUnfollowable = function(member){
    var a = member.isFollowed
    var b = member.id != session.user_id

    return a && b
  }

  $scope.follow = function(groupMember) {
    var confirmPopup = $ionicPopup.confirm({
      title: 'Follow All',
      cssClass: 'popup-by-ionic',
      template: 'Do you want to follow '+groupMember.username+' ?'
    });

    confirmPopup.then(function(res) {
      if(res) {
        var memberAsFollowable = follows.getOrCreateUser(groupMember.id);
        memberAsFollowable.followByCurrentUser().then(function () {
          follows.load()
          groupMember.isFollowed = true
        }); 
      }
    });


  };

  $scope.unfollow = function(groupMember) {
    var confirmPopup = $ionicPopup.confirm({
      title: 'Follow All',
      cssClass: 'popup-by-ionic',
      template: 'Do you want to stop following '+groupMember.username+' ?'
    });

    confirmPopup.then(function(res) {
      if(res) {
        var memberAsFollowable = follows.getOrCreateUser(groupMember.id);
        memberAsFollowable.unFollowByCurrentUser().then(function () {
          follows.load()
          $scope.showToast('Successfully unfollowed user.');
          groupMember.isFollowed = false
        }); 
      }
    });
  };
  
  $scope.pendingApproval = function(groupMember){
    var notMe = groupMember.id != session.user_id
    var memberAsFollowable = follows.getOrCreateUser(groupMember.id)
    return notMe && memberAsFollowable.isFollowedByCurrentUser() && !memberAsFollowable.hasApprovedCurrentUser()
  }

  
})
angular.module('app.controllers').controller('group.members',function ($scope, groups, $stateParams, follows, session) {
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
    $scope.group.followAllMembers().then(function(){
      $scope.showToast('Follow all request sent!');
      $scope.followingAll = true
      follows.load()
      $scope.groupMembers.forEach(function(m){
        m.isFollowed = true
      })
    })
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
    var memberAsFollowable = follows.getOrCreateUser(groupMember.id);
    memberAsFollowable.followByCurrentUser().then(function () {
      follows.load()
      $scope.showToast('Follow request sent!');
      groupMember.isFollowed = true
    }); 
  };

  $scope.unfollow = function(groupMember) {
    var memberAsFollowable = follows.getOrCreateUser(groupMember.id);
    memberAsFollowable.unFollowByCurrentUser().then(function () {
      follows.load()
      $scope.showToast('Successfully unfollowed user.');
      groupMember.isFollowed = false
    }); 
  };
  
  $scope.pendingApproval = function(groupMember){
    var notMe = groupMember.id != session.user_id
    var memberAsFollowable = follows.getOrCreateUser(groupMember.id)
    return notMe && memberAsFollowable.isFollowedByCurrentUser() && !memberAsFollowable.hasApprovedCurrentUser()
  }

  
})
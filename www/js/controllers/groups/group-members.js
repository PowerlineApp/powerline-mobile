angular.module('app.controllers').controller('group.members',function ($scope, groups, $stateParams, follows, session) {
  var groupID = parseInt($stateParams.id)
  $scope.groupMembers = []
  $scope.followingAll = true

  groups.loadAllDetails(groupID).then(function(){
    $scope.group = groups.get(groupID);
    $scope.group.members().then(function(members){
      $scope.groupMembers = members
      follows.loadAndGetFollowing().then(function(thoseFollowedByCurrentUser){
        var alreadyFollowingIDs = thoseFollowedByCurrentUser.map(function(f){
          return f.get('user').id
        })

        $scope.groupMembers.forEach(function(m){
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
    var memberAsFollowable = follows.getByUserId(groupMember.id);
    memberAsFollowable.follow().then(function () {
      follows.load()
      $scope.showToast('Follow request sent!');
      groupMember.isFollowed = true
    }); 
  };

  $scope.unfollow = function(groupMember) {
    var memberAsFollowable = follows.getByUserId(groupMember.id);
    memberAsFollowable.unfollow().then(function () {
      follows.load()
      $scope.showToast('Successfully unfollowed user.');
      groupMember.isFollowed = false
    }); 
  };
  
  $scope.pendingApproval = function(groupMember){
    var memberAsFollowable = follows.getByUserId(groupMember.id)
    return groupMember.isFollowed && !memberAsFollowable.isApproved()
  }

  
})
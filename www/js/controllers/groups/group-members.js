angular.module('app.controllers').controller('group.members',function ($scope, groups, $stateParams, follows) {
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
    })
  }

  $scope.follow = function(groupMember) {
    var memberAsFollowable = follows.getByUserId(groupMember.id);
    memberAsFollowable.follow().then(function () {
      follows.load()
      $scope.showToast('Follow request sent!');
      groupMember.isFollowed = true
    }); 
  };
  
  
})
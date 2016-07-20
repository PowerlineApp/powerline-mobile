angular.module('app.controllers').controller('group.members',function ($scope, groups, $stateParams, follows) {
  var groupID = parseInt($stateParams.id)
  $scope.groupMembers = []
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
        })
      })
    })
  })

  $scope.follow = function(groupMember) {
    var memberAsFollowable = follows.getByUserId(groupMember.id);
    memberAsFollowable.follow().then(function () {
      follows.load()
      $scope.showToast('Follow request sent!');
      groupMember.isFollowed = true
    }); 
  };
  
  
})
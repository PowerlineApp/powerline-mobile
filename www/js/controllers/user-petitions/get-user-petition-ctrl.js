angular.module('app.controllers').controller('getUserPetitionCtrl',function ($scope,  $stateParams,
                                   layout, $ionicPopup, $rootScope, userPetitions, activity, groups) {
                                   
  $scope.placeholders = ['It\'s all about different perspectives. Be kind.',
                          'Don\'t attack people. Understand them.',
                          'Listen first. Then ask questions'];
  $scope.placeholder = '';

  $scope.$on('$ionicView.beforeEnter', function(){
    var indexPlaceholder = JSON.parse( window.localStorage.getItem('indexPlaceholder'));
    if (typeof indexPlaceholder === "undefined" || indexPlaceholder == null){
      indexPlaceholder = 0;
    }else{
      indexPlaceholder = parseInt(indexPlaceholder);
    }
    $scope.placeholder = $scope.placeholders[indexPlaceholder%3];
    indexPlaceholder++;
    window.localStorage.setItem( 'indexPlaceholder', JSON.stringify(indexPlaceholder));
  })
  
  if (!$scope.userPetition) {
    $scope.showSpinner();
  }

  $scope.sign = function(){
    $scope.userPetition.sign().then(function(){
      $scope.showToast('User petition signed!');
    })
  }

  $scope.unsign = function(){
    $scope.userPetition.unsign().then(function(){
      $scope.showToast('User petition unsigned!');
    })
  }

  $scope.inEditMode = false;
  $scope.onEditBtnClicked = function(){
    $scope.inEditMode = !$scope.inEditMode;
    if(!$scope.inEditMode)
      $scope.userPetition.updateBodyText().then(function(){
          activity.youShouldRefreshActivities()
          $scope.showToast('User petition description updated.');        
      })
  }

  $scope.deleteClicked = false;
  $scope.showDeleteConfirm = function() {
    var confirmPopup = $ionicPopup.confirm({
      cssClass: 'deleteConfirmTitle',
      title: 'Delete User Petition',
      template: 'Are you sure you want to delete this user petition?'
    });

    confirmPopup.then(function(res) {
      $scope.navigateTo = $rootScope.navigateTo;
      if(res){
        $scope.userPetition.delete().then(function(){
          activity.youShouldRefreshActivities()
          $scope.showToast('User petition deleted.');
          $scope.back();
        })
      }
    });
  };

  $scope.signedResultInPercents = 0
  userPetitions.get($stateParams.id).then(function (userPetition) {
    $scope.hideSpinner();
    $scope.userPetition = userPetition;
    $scope.group = groups.get(userPetition.groupID)
    layout.focus($stateParams.focus);
  }, function(){
    $scope.hideSpinner();
  });

  $scope.searchByTag = function(e){
    if (e && e.target.tagName.toLowerCase() === 'hash-tag') {
      $rootScope.openTag(angular.element(e.target).text());
    }
  }


  $scope.isBoostable = function(){
    var notBoostedYet = $scope.userPetition && !$scope.userPetition.isBoosted()
    var currentUserCanBoost = $scope.group && ($scope.group.currentUserIsManager() || $scope.group.currentUserIsOwner())
    return notBoostedYet && currentUserCanBoost
  }

  $scope.onBoostButtonClicked = function(){
    var confirmPopup = $ionicPopup.confirm({
      title: 'Boost Petition',
      template: 'Manually boost this item? All group members will be notified immediately. Consider adding a comment to help guide the conversation.',
      cssClass: 'popup-by-ionic',
    });

    confirmPopup.then(function(res) {
      if(res) {
        $scope.showSpinner()
        $scope.userPetition.boost().then(function(){
          $scope.hideSpinner()
          $scope.showToast('Petition boosted successfully.')
        }, function(error){
          $scope.hideSpinner()
          $ionicPopup.alert({
            cssClass: 'popup-by-ionic',
            title: 'Failed to create content',
            template: JSON.stringify(error)
          });
        })
      }
    })
  }

  $scope.canInviteSupporters = function(){
    if(!$scope.userPetition)
      return false
    var isBoosted = $scope.userPetition.isBoosted()
    var isOwner = $scope.userPetition.ownedByCurrentUser()
    var hasAtLeastOneOtherGroup = groups.groupsWhereUserCanInviteSupporters($scope.userPetition.groupID).length > 0
    return isOwner && isBoosted && hasAtLeastOneOtherGroup
  }

  $scope.invite = {}
  $scope.inviteSupporters = function(){

    var msg = "<div style='padding-bottom:11px'>Invite this petition's supporters to join a group. This can only be done once.</div>"
    msg += '<ion-list>'
    groups.groupsWhereUserCanInviteSupporters($scope.userPetition.groupID).forEach(function(g){
      msg += '<ion-radio ng-model="invite.groupID" ng-value="\''+g.id+'\'">'+g.official_name+'</ion-radio>'
    })
    
    msg += '</ion-list>'
    var invitePopup = $ionicPopup.confirm({
      title: 'Invite Supporters to Group',
      cssClass: 'popup-by-ionic publish-content',
      content: msg,
      scope: $scope,
      buttons: [
        { text: 'Cancel' },
        {
          text: '<b>Invite</b>',
          type: 'button-positive',
          onTap: function(e) {
            if ($scope.invite.groupID){
              var g = groups.get($scope.invite.groupID)
              $scope.showSpinner()
              g.inviteSupportersToThisGroup({userPetitionID : $scope.userPetition.id}).then(function(){
                $scope.hideSpinner()
                $scope.showToast('Invitations to join group "'+g.official_name+'" were sent to supporters.')
              })
            } else
              e.preventDefault();
            return(true)
          }
        }
      ]
    });
  }
})
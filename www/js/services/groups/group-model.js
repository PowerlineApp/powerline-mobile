angular.module('app.services').factory('GroupModel', function(groupsInvites, $http, serverConfig) {
  var model = function(){
    this.fillWith = function(data){
      $.extend(this, data)
      this.upper_title = this.official_title.toUpperCase();
    },

    this.canBeJoinedInstantly = function(){
      return((this.groupMembershipIsPublic() && !this.requiredToFillFieldsOnJoin()) || this.userHasInvitation())
    }

    this.requiredToFillFieldsOnJoin = function(){
      return this.fill_fields_required
    }

    this.userHasInvitation = function(){
      return groupsInvites.hasInvite(this.id)
    }

    this.groupTypeIsCommon = function(){
      return this.group_type == 0
    },

    this.groupMembershipIsPublic = function(){
      return this.membership_control == 'public' // 0
    },

    this.groupMembershipIsApproval = function(){
      return this.membership_control == 'approval' // 1
    },

    this.groupMembershipIsPasscode = function(){
      return this.membership_control == 'passcode' // 2
    },

    this.isPasscodeRequiredOnJoin = function(){
      return !this.userHasInvitation() && this.groupMembershipIsPasscode()
    },

    this.getTitle = function () {
      return this.acronym || this.official_title;
    },

    this.getIconWhite = function () {
      return this.groupTypeIsCommon() ? this.avatar_file_path : 'images/v2/icons/location-group-white.png';
    },

    this.getIcon = function () {
      return this.groupTypeIsCommon() ? this.avatar_file_path : 'images/v2/icons/location-group.png';
    },

    this.joinedByCurrentUser = function(){
      return(this.joined == 1)
    }

    this.unjoin = function(){
      var that = this
      return $http.delete(serverConfig.url + '/api/v2/user/groups/' + this.id).then(function(){
        that.joined = 0
      })
    }
  }

  return model
})


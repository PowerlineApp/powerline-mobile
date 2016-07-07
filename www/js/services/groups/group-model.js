angular.module('app.services').factory('GroupModel', function(groupsInvites) {
  var model = function(){
    this.fillWith = function(data){
      $.extend(this, data)
      this.upper_title = this.official_title.toUpperCase();
    },

    this.canBeJoinedInstantly = function(){
      var isPublic = this.membership_control == 'public'
      var noFieldsRequired = !this.fill_fields_required
      var hasInvitation =  groupsInvites.hasInvite(this.id)

      return((isPublic && noFieldsRequired) || hasInvitation)
    }

    this.requiredToFillFieldsOnJoin = function(){
      return this.fill_fields_required
    }

    this.isPasscodeRequiredOnJoin = function(){
      // todo fix when we determine membership_control values
      // !groupsInvites.hasInvite(id) && 2 === $scope.publicStatus;
      return false 
    },

    this.getTitle = function () {
      return this.acronym || this.official_title;
    },

    this.getIconWhite = function () {
      return 0 === this.group_type ? this.avatar_file_path : 'images/v2/icons/location-group-white.png';
    },

    this.getIcon = function () {
      return 0 === this.group_type ? this.avatar_file_path : 'images/v2/icons/location-group.png';
    },

    this.joinedByCurrentUser = function(){
      return(this.joined == 1)
    }
  }

  return model
})


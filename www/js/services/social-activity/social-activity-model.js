angular.module('app.services').factory('SocialActivityModel', function (iStorage, JsModel, follows, $http, serverConfig) {
  var typeToIcons = {
    'follow-request': 'sa-icon-request-1',
    'micropetition-created': function (activity) {
      if (activity.get('target').type === 'quorum') {
        return 'sa-icon-post';
      }
      return 'sa-icon-petition';
    },
    'answered': 'sa-icon-community',
    'groupPermissions-changed': 'sa-icon-request-2',
    'joinToGroup-approved': 'sa-icon-request-2'
  };

  return JsModel.extend({
      parsers: {
        created_at: 'date'
      },
      initialize: function () {
        this.build();
      },
      build: function () {
        var avatar;
        var avatarTitle;
        if (this.get('following')) {
          avatar = this.get('following').avatar_file_name;
          avatarTitle = this.get('following').full_name;
        } else if (this.get('group')) {
          avatar = this.get('group').avatar_file_path;
          avatarTitle = this.get('group').official_title;
        }
        this.set('avatar', avatar);
        this.set('avatar_title', avatarTitle);
        var icon = typeToIcons[this.get('type')];
        this.set('sa-icon', typeof icon === 'function' ? icon(this) : icon);
        if (this.isFollowRequest()) {
          this.set('userFollow', follows.getByFollowerId(this.get('following').id));
        }
      },
      isRequest: function () {
        return this.get('type') === 'follow-request';
      },
      isFollowRequest: function () {
        return this.get('type') === 'follow-request';
      },
      isActiveRequest: function () {
        return this.isFollowRequest() &&
          this.get('userFollow') &&
          this.get('userFollow').get('id') === this.get('target').id &&
          !this.get('ignore');
      },
      currentUserIsBeingFollowed: function(){
        return(this.get('userFollow').get('id') === this.get('target').id)
      },
      isApproved: function(){
        return(this.get('userFollow').isApproved())
      },
      isFollowedByMe: function(){
        return(this.get('userFollow').isFollow() )
      },
      unfollow: function(){
        return(this.get('userFollow').unfollow())
      },
      follow: function(){
        return(this.get('userFollow').follow())
      },
      unapprove: function(){
        return(this.get('userFollow').unapprove())
      },
      approve: function(){
        if(this.ignored())
          this.unignore()
        return(this.get('userFollow').approve())
      },
      ignored: function(){
        return(this.get('ignore'))
      },
      getWidgetType: function () {
        return this.isFollowRequest() ? 'follow-request' : 'link';
      },
      getHtmlMessage: function(){
        if(this.getWidgetType() !== 'follow-request'){
          return this.get('html_message');
        }
        //when being shown to owner
        if(this.get('userFollow').get('id') === this.get('target').id){
          if(!this.get('userFollow').isApproved() && !this.get('ignore')){
            return '<p><strong>' + this.get('userFollow').get('follower').full_name + '</strong> requested to follow you.</p>';
          }
          if(this.get('userFollow').isApproved() && !this.get('userFollow').isFollow()){
            return '<p><strong>' + this.get('userFollow').get('follower').full_name + '</strong> is now following you. Follow back?</p>';
          }
          if(this.get('userFollow').isApproved() && this.get('userFollow').isFollow()){
            return '<p><strong>' + this.get('userFollow').get('follower').full_name + '</strong> and you are now following each other.</p>';
          }
        }
        return this.get('html_message');
      },
      ignore: function () {
        this.set('ignore', true);
        var payload = JSON.stringify({ignore: true})
        var headers = {headers: {'Content-Type': 'application/json'}}
        $http.put(serverConfig.url + '/api/v2/social-activities/' + this.get('id'), payload, headers);
      },
      unignore: function () {
        this.set('ignore', false);
        var payload = JSON.stringify({ignore: false})
        var headers = {headers: {'Content-Type': 'application/json'}}
        $http.put(serverConfig.url + '/api/v2/social-activities/' + this.get('id'), payload, headers);
      },      
    });
})
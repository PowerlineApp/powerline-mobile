angular.module('app.services').factory('SocialActivityModel', function (iStorage, JsModel, follows, $http, serverConfig, session) {
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
          avatarTitle = this.get('group').official_name;
        }
        this.set('avatar', avatar);
        this.set('avatar_title', avatarTitle);
        var icon = typeToIcons[this.get('type')];
        this.set('sa-icon', typeof icon === 'function' ? icon(this) : icon);
        if (this.isFollowRequest()) {
          var userWhoWantsToFollowMeDetails = this.get('following')
          if(userWhoWantsToFollowMeDetails == null)
            var userWhoWantsToFollowMeDetails = this.get('target')
          this.set('userFollow', follows.getOrCreateUser(userWhoWantsToFollowMeDetails.id));
        }
      },
      isRequest: function () {
        return this.get('type') === 'follow-request';
      },
      isFollowRequest: function(){
        return this.get('type') === 'follow-request';
      },
      isActiveRequest: function () {
        return this.isFollowRequest() &&
          this.get('userFollow') &&
          this.get('userFollow').user_id === this.get('target').id &&
          !this.ignored();
      },
      ignored: function(){
        return(this.get('ignore'))
      },
      getWidgetType: function () {
        return this.isFollowRequest() ? 'follow-request' : 'link';
      },
      getHtmlMessage: function(){
        var follow = this.get('userFollow')
        if(!follow.isFollowingCurrentUser())
          return this.get('html_message'); 

        if(follow && !follow.isApprovedByCurrentUser()){
        return '<p><strong>' + follow.full_name + '</strong> requested to follow you.</p>'; 
        }
        if(follow && follow.isApprovedByCurrentUser()  && follow.hasApprovedCurrentUser()){
          return '<p><strong>' + follow.full_name + '</strong> and you are now following each other.</p>';
        }
        if(follow && follow.isApprovedByCurrentUser()){
          return '<p><strong>' + follow.full_name + '</strong> is now following you. Follow back?</p>';
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
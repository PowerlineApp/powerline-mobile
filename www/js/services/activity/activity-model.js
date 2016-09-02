angular.module('app.services').factory('ActivityModel',
  function (JsModel, groups, $http, follows, iStorage, serverConfig, session, userPetitions, petitions, posts) {

   return JsModel.extend({
      icons: {
        question: 'poll',
        petition: 'petition',
        'leader-news': 'discussion',
        'leader-event': 'event',
        'post': 'post',
        'payment-request': 'fundraiser',
        'crowdfunding-payment-request': 'fundraiser'
      },
      parsers: {
        expire_at: 'date',
        sent_at: 'date',
        owner: function (owner) {
          if (owner && owner.avatar_file_name) {
            owner.avatar_file_path = owner.avatar_file_name;
          }
          return owner;
        }
      },
      isOwn: function () {
        return this.get('owner').type === 'user' && this.get('owner').id === session.user_id;
      },
      isAnswered: function(){
        return this.get('answers') && this.get('answers').length > 0
      },
      isUnanswered: function () {
        return !this.isAnswered()
      },      
      setAnswer: function(answer){
        this.set('answers', [answer])
      },
      isFollowing: function () {
        var owner = this.get('owner');
        return owner.type === 'user' && follows.some(function (following) {
          return following.get('user').id === owner.id && following.isApproved();
        });
      },

      dataType: function(){
        return this.get('entity').type
      },

      prepare: function () {
        if(this.dataType() == 'user-petition')
          $.extend(this, new UserPetitionMixin())
        else if(this.dataType() == 'petition')
          $.extend(this, new PollPetitionMixin())
        else if(this.dataType() == 'post')
          $.extend(this, new PostMixin())

        if (this.get('entity').group_id) {
          var userGroup = groups.get(this.get('entity').group_id);
          this.set('owner_info_1', userGroup ? userGroup.official_title : null);
        }
      },
      setRead: function () {
        if (this.isUnread()) {
          var that = this
          var aID = this.get('id') // https://github.com/PowerlineApp/powerline-mobile/issues/84#issuecomment-230568369
          var payload = JSON.stringify({activities: [{id: aID, read: true}]})
          var headers = {headers: {'Content-Type': 'application/json'}}
          $http.patch(serverConfig.url + '/api/v2/activities', payload, headers).then(function(){
            that.set('read', true);
          })
        }
      },
      getQuorumCompletedPercent: function () {
        return this.get('quorum') ?
          Math.min(this.get('responses_count') / this.get('quorum') * 100, 100) : 0;
      },
      getIcon: function () {
        return this.icons[this.get('entity').type];
      },
      isPollPetitionType: function(){
        var aType = this.get('entity').type
        return aType == 'petition'
      },
      isUserPetitionType: function(){
        var aType = this.get('entity').type
        return aType == 'user-petition'
      },
      isUserPostType: function(){
        var aType = this.get('entity').type
        return aType == 'post'
      },
      isUnread: function(){
        return(!this.get('read'))
      },
      isBoosted: function(){
        return(this.get('publish_status') == 1)
      },
      isExpired: function(){
        return this.get('expire_at') && Date.now() > this.get('expire_at').getTime()
      },
      isInPriorityZone: function() {
        return (this.get('zone') == 'prioritized')
      },
      getSortMultiplier: function () {
        if (this.isExpired()) {
          return 0;
        }

        if (this.isInPriorityZone()) {
          return 9;
        }

        return 1;
      },
      
      hasLinkPreviewMetadata: function(){
        return !!this.get('metadata');
      }
    });
  })

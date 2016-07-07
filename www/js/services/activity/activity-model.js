angular.module('app.services').factory('ActivityModel',
  function (JsModel, groups, $http, follows, iStorage, serverConfig) {
   return JsModel.extend({
      labels: {
        question: 'Question',
        petition: 'Petition',
        'leader-news': 'News',
        'leader-event': 'Event',
        'micro-petition': 'Petition',
        'payment-request': 'Payment',
        'crowdfunding-payment-request': 'Payment'
      },
      icons: {
        question: 'poll',
        petition: 'petition',
        'leader-news': 'discussion',
        'leader-event': 'event',
        'micro-petition': 'post',
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
      isUnanswered: function () {
        return !this.get('answered') && !this.isExpired() && 'leader-news' !== this.get('entity').type;
      },
      isFollowing: function () {
        var owner = this.get('owner');
        return owner.type === 'user' && follows.some(function (following) {
          return following.get('user').id === owner.id && following.isApproved();
        });
      },
      prepare: function () {
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
      getResponsesToQuorum: function () {
        return this.get('quorum') ? Math.max(this.get('quorum') - this.get('responses_count'), 1) : 1;
      },
      getQuorumCompletedPercent: function () {
        return this.get('quorum') ?
          Math.min(this.get('responses_count') / this.get('quorum') * 100, 100) : 0;
      },
      getLabel: function () {
        return this.labels[this.get('entity').type];
      },
      getIcon: function () {
        return this.icons[this.get('entity').type];
      },

      // temporary hack: https://github.com/PowerlineApp/powerline-mobile/issues/125#issuecomment-230410395
      isUserPetitionType: function(){
        var aType = this.get('entity').type
        if(aType == 'micro-petition'){
          var hasTitle = this.get('title') && this.get('title').length > 0
          return(hasTitle)
        } else
        return false
      },
      isUserPostType: function(){
        var aType = this.get('entity').type
        if(aType == 'micro-petition'){
          var hasTitle = this.get('title') && this.get('title').length > 0
          return(!hasTitle)
        } else
        return false
      },
      isUnread: function(){
        return(!this.get('read'))
      },
      isBoosted: function(){
        return(this.get('publish_status') == 1)
      },
      isExpired: function(){
        this.get('expire_at') && Date.now() > this.get('expire_at').getTime()
      },
      isInPriorityZone: function() {
        if(this.isUserPetitionType()){
          return(this.isUnread())
        } else if(this.isUserPostType()){
          return(this.isBoosted() && !this.isExpired())
        } else
        	return(false)
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

      getPostID: function(){
        return this.attributes.id;
      },

      saveProfileSetting: function(){

       return $http({
          method: 'POST',
          url: serverConfig.url + '/api/profile/settings',
          data: null
        }).then(function(resp) {
          return resp.data;
        });
      },

      changeSubscribe: function(id){
        $http({
          method: 'POST',
          url: serverConfig.url + '/api/users/self/subscriptions',
          data: {"id": id}
        }).then(function(resp) {
          return resp.data;
        });
      }
    });
  })

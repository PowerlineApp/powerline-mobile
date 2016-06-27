angular.module('app.services').factory('ActivityModel',
  function (JsModel, groups, $http, follows, ActivityRead) {
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
        return !this.get('answered') && !this.get('closed') && 'leader-news' !== this.get('entity').type;
      },
      isFollowing: function () {
        var owner = this.get('owner');
        return owner.type === 'user' && follows.some(function (following) {
          return following.get('user').id === owner.id && following.isApproved();
        });
      },
      _setRead: function () {
        this.set('read', true);
        if ('leader-news' === this.get('entity').type || 'petition' === this.get('entity').type) {
          this.set('ignore_count', true);
        } else if ('micro-petition' === this.get('entity').type && 'user' === this.get('owner').type && this.isFollowing()) {
          this.set('ignore_count', true);
        }
      },
      prepare: function () {
        if (this.get('read') || _(ActivityRead).contains(this.get('id'))) {
          this._setRead();
        }
        if (this.get('owner').type === 'user' && this.get('entity').group_id) {
          var userGroup = groups.getUserGroup(this.get('entity').group_id);
          this.set('owner_info_1', userGroup ? userGroup.group.official_title : null);
        }
        if (this.get('expire_at') && Date.now() > this.get('expire_at').getTime()) {
          this.set('closed', true);
        }
      },
      setRead: function () {
        if (!this.get('read')) {
          this._setRead();
          ActivityRead.unshift(this.get('id'));
          iStorage.set('read-activities', read.slice(0, 1000));
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
      isInPriorityZone: function() {
        if (this.get('closed')) {
          return false;
        }
        var entity = this.get('entity');
        var owner = this.get('owner');

        return (!this.get('answered') && entity.type !== 'leader-news' && owner.type !== 'user' && entity.type !== 'petition') ||
          (!this.get('answered') && entity.type === 'petition' && !this.get('read')) ||
          (entity.type === 'leader-news' && !this.get('read'))
        ;
      },
      getSortMultiplier: function () {
        /*if (this.get('closed')) {
          return 0;
        }

        if (this.isInPriorityZone()) {
          return 9;
        }*/

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

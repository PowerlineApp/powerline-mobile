angular.module('app.services').factory('GroupModel', function(groupsInvites, $http, $q, serverConfig, stripe) {
  var model = function(){
    this.fillWith = function(data){
      $.extend(this, data)
      this.upper_title = this.official_name.toUpperCase();
    },

    this.loadGroupMembers = function(){
      var that = this
      return $http.get(serverConfig.url + '/api/v2/groups/'+this.id+'/users').then(function(response){
        that.groupMembers = response.data.payload
        return(response.data.payload)
      })  
    }

    this.removeMember = function(userID){
      return $http.delete(serverConfig.url + '/api/v2/groups/'+this.id+'/users/'+userID)
    }

    this.loadFieldsToFillOnJoin = function(){
      var deferred = $q.defer();
      var that = this
      $http.get(serverConfig.url + '/api/v2/groups/'+this.id+'/fields').then(function(response){
        that.fieldsToFillOnJoin = response.data || []
        deferred.resolve(that.fieldsToFillOnJoin);
      })  
      
      return deferred.promise;   
    }


    this.addFieldRequiredOnJoin = function(questionText){
        var data = {field_name: questionText}
        var payload = JSON.stringify(data)
        var headers = {headers: {'Content-Type': 'application/json'}}
        return $http.post(serverConfig.url + '/api/v2/groups/'+this.id+'/fields', payload, headers).then(function(response){
          return(response)
        })
    },
    
    this.removeFieldRequiredOnJoin = function(fieldID){
        return $http.delete(serverConfig.url + '/api/v2/group-fields/'+fieldID)
    },

    this.userHasInvitation = function(){
      return groupsInvites.hasInvite(this.id)
    }

    var GROUP_TYPE_LABEL_TO_INT = {
      'common': 0,
      'country' :1,
      'state': 2,
      'local': 3,
      'special': 4
    }

    this.groupTypeAsInteger = function(){
      return GROUP_TYPE_LABEL_TO_INT[this.group_type_label]
    },

    this.groupTypeIsCommon = function(){
      return this.group_type_label == 'common'
    },

    this.groupTypeIsState = function(){
      return this.group_type_label == 'state'
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
      return this.acronym || this.official_name;
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

    this.followAllMembers = function(){
      return $http.put(serverConfig.url + '/api/v2/user/group-followers/' + this.id)    
    }

    this.loadSubscriptionLevelInfo = function(){
      var group = this
      return $http.get(serverConfig.url + '/api/v2/groups/'+this.id+'/subscription').then(function(response){
        var isEnabled = response.data.enabled
        if(isEnabled){
          group.subscriptionLevel = response.data.package_type
          group.subscriptionLevelExpireAt = response.data.expired_at
          group.nextPaymentAt = response.data.next_payment_at
        } else {
          group.subscriptionLevel = 'free'
          group.subscriptionLevelExpireAt = null      
          group.nextPaymentAt = null  
        }
      })
    },

    this.changeSubscriptionLevel = function(levelName){
      var that = this
      if(levelName == 'free'){
        return $http.delete(serverConfig.url + '/api/v2/groups/'+this.id+'/subscription').then(function(response){
          that.subscriptionLevel = 'free'
          that.subscriptionLevelExpireAt = null
          that.nextPaymentAt = null  
          return(response)
        })        
      } else {
        var data = {package_type: levelName}
        var payload = JSON.stringify(data)
        var headers = {headers: {'Content-Type': 'application/json'}}
        return $http.put(serverConfig.url + '/api/v2/groups/'+this.id+'/subscription', payload, headers).then(function(response){
          that.subscriptionLevel = response.data.package_type
          that.subscriptionLevelExpireAt = response.data.expired_at
          that.nextPaymentAt = response.data.next_payment_at
          return(response)
        })
      }
    }

    this.subscriptionLevelIsFree = function(){
      return this.subscriptionLevel == 'free'
    }

    this.changeMembershipControl = function(membershipType, passcode){
        var data = { membership_control: membershipType}
       if(membershipType == 'passcode')
         data.membership_passcode = passcode
       
        var payload = JSON.stringify(data)
        var headers = {headers: {'Content-Type': 'application/json'}}
        return $http.put(serverConfig.url + '/api/v2/groups/'+this.id+'/membership', payload, headers).then(function(response){
          return(response)
        })
    }

    this.changeGroupPermissions = function(permissions){ //['permissions_name', 'permissions_country']
        var data = {required_permissions: permissions}
        var payload = JSON.stringify(data)
        var headers = {headers: {'Content-Type': 'application/json'}}
        return $http.put(serverConfig.url + '/api/v2/groups/'+this.id+'/permission-settings', payload, headers).then(function(response){
          return(response)
        })     
    }

    this.inviteUsers = function(userIDs){
      var payload = JSON.stringify({users: userIDs})
      var headers = {headers: {'Content-Type': 'application/json'}}
      return $http.put(serverConfig.url + '/api/v2/groups/'+this.id+'/users', payload, headers)
    }

    this.updateBasicSettings = function(data){
      var payload = JSON.stringify(data)
      var headers = {headers: {'Content-Type': 'application/json'}}
      return $http.put(serverConfig.url + '/api/v2/groups/'+this.id, payload, headers)
    }

    this.currentUserIsManager = function(){
      return this.user_role == 'manager'
    }

    this.currentUserIsOwner = function(){
      return this.user_role == 'owner'
    }  

    this.makeManager = function(userID){
      return $http.put(serverConfig.url + '/api/v2/groups/'+this.id+'/managers/'+userID)
    }

    this.makeNormalMember = function(userID){
      return $http.delete(serverConfig.url + '/api/v2/groups/'+this.id+'/managers/'+userID)
    }

    this.approveMembership = function(userID){
      return $http.patch(serverConfig.url + '/api/v2/groups/'+this.id+'/users/'+userID)
    }

    this.loadBankAccount = function(){
      var that = this
      return $http.get(serverConfig.url + '/api/v2/groups/'+this.id+'/bank-accounts').then(function(response){
        that.bankAccount = response.data[0]
        return that.bankAccount
      })
    }

    this.addBankAccount = function(formPayload){
      var that = this
      var deferred = $q.defer();
      var payload = {} 
      angular.copy(formPayload, payload)
      payload.stripe.country = payload.stripe.country.value
      stripe().bankAccount.createToken(payload.stripe, function(status, response){
       if(status == 200){
         var stripeToken = response.id
          var powerlinePayloadToSubmit = {}
          angular.copy(payload.powerline, powerlinePayloadToSubmit)
          powerlinePayloadToSubmit.currency = payload.stripe.currency
          powerlinePayloadToSubmit.type = payload.stripe.type
          powerlinePayloadToSubmit.business_name = payload.stripe.account_holder_name
          powerlinePayloadToSubmit.type = payload.stripe.account_holder_type
          powerlinePayloadToSubmit.source = stripeToken
          powerlinePayloadToSubmit.country = payload.stripe.country
          if(powerlinePayloadToSubmit.country == 'US')
            powerlinePayloadToSubmit.ssn_last_4

          var json_payload = JSON.stringify(powerlinePayloadToSubmit)
          var headers = {headers: {'Content-Type': 'application/json'}}
          $http.post(serverConfig.url + '/api/v2/groups/'+that.id+'/bank-accounts', json_payload, headers).then(function(response){
            deferred.resolve(response)
          }, function(error){
            console.log('failed to add bank account to powerline')
            console.log(error)
            deferred.reject(error)
          })
        } else {
          console.log('failed to add bank account to stripe. status code: '+status)
          console.log(response)
          deferred.reject(response)
        }
      })

     return deferred.promise
    } 

    this.removeStripeAccount = function(){
      var that = this
      return $http.delete(serverConfig.url + '/api/v2/groups/'+this.id+'/stripe-account').then(function(){
        that.loadBankAccount()
      })
    }

    this.loadPaymentCard = function(){
      var that = this
      return $http.get(serverConfig.url + '/api/v2/groups/'+this.id+'/cards').then(function(response){
        that.paymentCard = response.data[0]
        return that.paymentCard
      })
    }

    this.addPaymentCard = function(data){
      var deferred = $q.defer();
      var that = this
      
      stripe().card.createToken({
        name: data.name,
        number: data.number,
        cvc: data.cvc,
        exp_month: data.expired_month,
        exp_year: data.expired_year
      }, function(status, response) {
        if (response.error) {
          deferred.reject(response.error.message);
        } else {
          var payload = JSON.stringify({source: response.id})
          var headers = {headers: {'Content-Type': 'application/json'}}
          $http.post(serverConfig.url + '/api/v2/groups/'+that.id+'/cards', payload, headers)
            .then(function (response) {
              deferred.resolve();
            })
            .catch(function (error) {
              console.log('error while adding credit card:')
              console.log(error)
              deferred.reject('Server error while adding a card: '+JSON.stringify(error));
            })
          ;
        }
        });

      return deferred.promise;
    }

    this.removePaymentCard = function(){
      return $http.delete(serverConfig.url + '/api/v2/groups/'+this.id+'/cards/'+this.paymentCard.id)
    }

    this.loadSections = function(){
      var deferred = $q.defer();
      var that = this
      $http.get(serverConfig.url + '/api/v2/groups/'+this.id+'/sections').then(function(response){
        that.sections = response.data.payload
        var sectionMemberRequests = []
        that.sections.forEach(function(section){
          var r = that.loadSectionMembers(section)
          sectionMemberRequests.push(r)
        })

        $q.all(sectionMemberRequests).then(function(){
          deferred.resolve()
        })
      })

      return deferred.promise;
    }

    this.addSection = function(title){
      var that = this
      var payload = JSON.stringify({title: title})
      var headers = {headers: {'Content-Type': 'application/json'}}
      return $http.post(serverConfig.url + '/api/v2/groups/'+this.id+'/sections', payload, headers).then(function(){
        that.loadSections()
      })
    }

    this.deleteSection = function(sectionID){
      var that = this
      return $http.delete(serverConfig.url + '/api/v2/group-sections/'+sectionID).then(function(){
        that.loadSections()
      })      
    }

    this.loadSectionMembers = function(section){
      var deferred = $q.defer();
      $http.get(serverConfig.url + '/api/v2/group-sections/'+section.id+'/users').then(function(response){
        section.members = response.data.payload
        deferred.resolve()
      })       
      return deferred.promise;
    }

    this.changeSectionMembers = function(sectionID, userIDsToAdd, userIDsToRemove){
      var requests = []
      userIDsToAdd.forEach(function(userID){
        var r = $http.put(serverConfig.url + '/api/v2/group-sections/'+sectionID+'/users/'+userID) 
        requests.push(r)
      })
      userIDsToRemove.forEach(function(userID){
        var r = $http.delete(serverConfig.url + '/api/v2/group-sections/'+sectionID+'/users/'+userID) 
        requests.push(r)
      })      

      var that = this
      return $q.all(requests).then(function(){
        that.loadSections()
      })
    }

    this.loadUserContentSettings = function(){
      var that = this
      return $http.get(serverConfig.url + '/api/v2/groups/'+this.id+'/micro-petitions-config').then(function(response){
        that.petition_percent = response.data.petition_percent || 10
        that.petition_per_month = response.data.petition_per_month || 30
        that.petition_duration = response.data.petition_duration || 7
      })           
    }

    this.updateUserContentSettings = function(){
      var that = this
      var payload = JSON.stringify({petition_percent: this.petition_percent, 
        petition_per_month: this.petition_per_month, 
        petition_duration: this.petition_duration})
      var headers = {headers: {'Content-Type': 'application/json'}}
      return $http.put(serverConfig.url + '/api/v2/groups/'+this.id+'/micro-petitions-config', payload, headers).then(function(response){
        that.petition_percent = response.data.petition_percent || 10
        that.petition_per_month = response.data.petition_per_month || 30
        that.petition_duration = response.data.petition_duration || 7
      })    
    }
  }

  return model
})


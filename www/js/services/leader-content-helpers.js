angular.module('app.services').factory('leaderContentHelper', function($http, serverConfig){
  var service = {}

  // usage in console:
  // var h = angular.element(document.body).injector().get('leaderContentHelper')
  // h.createAndPublishPollPetition('title', 'bodytext', 'a1', 'a2', 285)

  service.createAndPublishPollPetition = function(subject, title, answer1, answer2, groupID){
    service.createPollPetition(subject, title, groupID).then(function(response){
      var pollID = response.data.id
      service.addPollAnswer(pollID, answer1).then(function(){
        service.addPollAnswer(pollID, answer2).then(function(){
          service.publishPoll(pollID).then(function(){
            console.log('poll:petition published, ID: '+pollID)
          })
        })        
      })
    })
  }

  service.createAndPublishPollEvent = function(subject, title, answer1, answer2, started_at, finished_at, groupID){
    service.createPollEvent(subject, title, started_at, finished_at, groupID).then(function(response){
      var pollID = response.data.id
      service.addPollAnswer(pollID, answer1).then(function(){
        service.addPollAnswer(pollID, answer2).then(function(){
          service.publishPoll(pollID).then(function(){
            console.log('poll:event published, ID: '+pollID)
          })
        })        
      })
    })
  }

  service.createPollEvent = function(subject, title, started_at, finished_at, groupID){
    var data = {subject: subject,
      title: title,
      started_at: started_at, //"2016-09-07 09:52:33", // t.strftime("%Y-%m-%d'%z'%H:%M:%S")
      finished_at: finished_at, //"2016-09-20 09:52:33",
      //petition_title: 'Petition title',
      //petition_body: 'Petition body',
      type: 'event'} 
      
    var payload = JSON.stringify(data)
    var headers = {headers: {'Content-Type': 'application/json'}}

    //var groupID = 285

    return $http.post(serverConfig.url + '/api/v2/groups/'+groupID+'/polls', payload, headers)   
  }

  service.createPollPetition = function(title, body, groupID){
    var data = {subject: 'I have no idea what is the difference between subject and petition body',
      petition_title: title,
      petition_body: body,
      type: 'petition'} 
      
    var payload = JSON.stringify(data)
    var headers = {headers: {'Content-Type': 'application/json'}}

    return $http.post(serverConfig.url + '/api/v2/groups/'+groupID+'/polls', payload, headers)
  }

  // created poll with ID = 194 in group 285 as user Peter10

  service.addPollAnswer = function(pollID, value){
    var data = {value : value}
    var payload = JSON.stringify(data)
    var headers = {headers: {'Content-Type': 'application/json'}}

    return $http.post(serverConfig.url + '/api/v2/polls/'+pollID+'/options', payload, headers)
  }
  // addPollAnswer('answer YES') -> ID: 305
  // addPollAnswer('answer NO') -> ID: 306

  service.publishPoll = function(pollID){
    // var data = {options: [
    //   {id: 1, value: 'optionA', payment_amount: 10, is_user_amount: true}, 
    //   {id: 2, value: 'optionB', payment_amount: 10, is_user_amount: true}]} 
    var data = {}
      
    var payload = JSON.stringify(data)
    var headers = {headers: {'Content-Type': 'application/json'}}
    return $http.patch(serverConfig.url + '/api/v2/polls/'+pollID, payload, headers) 
  }

  service.createAndPublishPollPoll = function(subject, answer1, answer2, groupID){
    service.createPollPoll(subject, groupID).then(function(response){
      var pollID = response.data.id
      service.addPollAnswer(pollID, answer1).then(function(){
        service.addPollAnswer(pollID, answer2).then(function(){
          service.publishPoll(pollID).then(function(){
            console.log('poll:poll published, ID: '+pollID)
          })
        })        
      })
    })
  }

  service.createPollPoll = function(subject, groupID){
    var data = {subject: subject,
      type: 'group'} 
      
    var payload = JSON.stringify(data)
    var headers = {headers: {'Content-Type': 'application/json'}}

    return $http.post(serverConfig.url + '/api/v2/groups/'+groupID+'/polls', payload, headers)
  }

  service.createAndPublishPollNews = function(subject, answer1, answer2, groupID){
    service.createPollNews(subject, groupID).then(function(response){
      var pollID = response.data.id
      service.addPollAnswer(pollID, answer1).then(function(){
        service.addPollAnswer(pollID, answer2).then(function(){
          service.publishPoll(pollID).then(function(){
            console.log('poll:news published, ID: '+pollID)
          })
        })        
      })
    })
  }

  service.createPollNews = function(subject, groupID){
    var data = {subject: subject,
      type: 'news'} 
      
    var payload = JSON.stringify(data)
    var headers = {headers: {'Content-Type': 'application/json'}}

    return $http.post(serverConfig.url + '/api/v2/groups/'+groupID+'/polls', payload, headers)
  }

  service.createAndPublishPollPayment = function(title, subject, answer1, answer2, groupID){
    service.createPollPayment(subject, title, groupID).then(function(response){
      var pollID = response.data.id
      service.addPollAnswer(pollID, answer1).then(function(){
        service.addPollAnswer(pollID, answer2).then(function(){
          service.publishPoll(pollID).then(function(){
            console.log('poll:payment published, ID: '+pollID)
          })
        })        
      })
    })
  }

  service.createPollPayment = function(subject, title, groupID){
    var data = {subject: subject,
      title: title,
      type: 'payment_request'} 
      
    var payload = JSON.stringify(data)
    var headers = {headers: {'Content-Type': 'application/json'}}

    return $http.post(serverConfig.url + '/api/v2/groups/'+groupID+'/polls', payload, headers)
  }

  service.createAndPublishPollCrowfudingPayment = function(title, subject, answer1, answer2, crowdfunding_goal_amount, crowdfunding_deadline, groupID){
    service.createPollCrowfudingPayment(subject, title, crowdfunding_goal_amount, crowdfunding_deadline, groupID).then(function(response){
      var pollID = response.data.id
      service.addPollAnswer(pollID, answer1).then(function(){
        service.addPollAnswer(pollID, answer2).then(function(){
          service.publishPoll(pollID).then(function(){
            console.log('poll:payment published, ID: '+pollID)
          })
        })        
      })
    })
  }

  service.createPollCrowfudingPayment = function(subject, title, crowdfunding_goal_amount, crowdfunding_deadline, groupID){
    var data = {subject: subject,
      title: title,
      is_crowdfunding: true,
      crowdfunding_goal_amount: crowdfunding_goal_amount,
      crowdfunding_deadline: crowdfunding_deadline,
      type: 'payment_request'} 
      
    var payload = JSON.stringify(data)
    var headers = {headers: {'Content-Type': 'application/json'}}

    return $http.post(serverConfig.url + '/api/v2/groups/'+groupID+'/polls', payload, headers)
  }

  service.createAndPublishAnnouncement = function(){

  }

  service.createAnnouncement = function(content, groupID){
    var data = {content: content} 
      
    var payload = JSON.stringify(data)
    var headers = {headers: {'Content-Type': 'application/json'}}

    return $http.post(serverConfig.url + '/api/v2/groups/'+groupID+'/announcements', payload, headers)
  }

  service.publishAnnouncement = function(aID){
    return $http.patch(serverConfig.url + '/api/v2/announcements/'+aID)
  }  

  service.createAndPublishAnnouncement = function(content, groupID){
    service.createAnnouncement(content, groupID).then(function(response){
      var aid = response.data.id
      service.publishAnnouncement(aid).then(function(){
        console.log('announcement published, ID: '+aid)
      })
    })
  }

  service.inviteUserToGroup = function(userLogin, groupID){
    var data = {users: [userLogin]} 
    var payload = JSON.stringify(data)
    var headers = {headers: {'Content-Type': 'application/json'}}
    $http.put(serverConfig.url + '/api/v2/groups/'+groupID+'/users', payload, headers).then(function(resp){
      console.log('user '+userLogin +' invited to group '+groupID)
    })
  }

  service.setGroupPermissions = function(permissions, groupID){ //['permissions_name', 'permissions_country']
    var data = {required_permissions: permissions}
    var payload = JSON.stringify(data)
    var headers = {headers: {'Content-Type': 'application/json'}}
    return $http.put(serverConfig.url + '/api/v2/groups/'+groupID+'/permission-settings', payload, headers).then(function(response){
      console.log('permissions changed successfully')
      return(response)
    })     
  }
  return service
})
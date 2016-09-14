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

  return service
})
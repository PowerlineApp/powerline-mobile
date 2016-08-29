angular.module('app.services').factory('leaderContentHelper', function($http, serverConfig){
  var service = {}

  // usage in console:
  // var h = angular.element(document.body).injector().get('leaderContentHelper')
  // h.createPoll()

  service.createPollEvent = function(){
    var data = {subject: 'test Poll no2 subject',
      title: 'test Poll no2 title',
      started_at: "2016-08-26 09:52:33", // t.strftime("%Y-%m-%d'%z'%H:%M:%S")
      finished_at: "2016-09-10 09:52:33",
      //petition_title: 'Petition title',
      //petition_body: 'Petition body',
      type: 'event'} 
      
    var payload = JSON.stringify(data)
    var headers = {headers: {'Content-Type': 'application/json'}}

    var groupID = 285

    $http.post(serverConfig.url + '/api/v2/groups/'+groupID+'/polls', payload, headers).then(function(response){
      console.log(response)
    })    
  }

  service.createPollPetition = function(){
    var data = {subject: 'I have no idea what is the difference between subject and petition body',
      petition_title: 'this is Poll of subtype Petition',
      petition_body: 'Petition body',
      type: 'petition'} 
      
    var payload = JSON.stringify(data)
    var headers = {headers: {'Content-Type': 'application/json'}}

    var groupID = 285

    $http.post(serverConfig.url + '/api/v2/groups/'+groupID+'/polls', payload, headers).then(function(response){
      console.log(response)
    })    
  }

  // created poll with ID = 194 in group 285 as user Peter10

  service.addPollAnswer = function(pollID, value){
    var data = {value : value}
    var payload = JSON.stringify(data)
    var headers = {headers: {'Content-Type': 'application/json'}}

    $http.post(serverConfig.url + '/api/v2/polls/'+pollID+'/options', payload, headers).then(function(response){
      console.log(response)
    })  
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
    $http.patch(serverConfig.url + '/api/v2/polls/'+pollID, payload, headers).then(function(response){
      console.log(response)
    })  
  }



  return service
})
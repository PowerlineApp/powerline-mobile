angular.module('app.services').factory('leaderContentHelper', function($http, serverConfig){
  var service = {}

  // usage in console:
  // var h = angular.element(document.body).injector().get('leaderContentHelper')
  // h.createPoll()

  service.createPoll = function(){
    var data = {subject: 'test Poll no1 subject',
      title: 'test Poll no1 title',
      started_at: "2016-08-21 09:52:33", // t.strftime("%Y-%m-%d'%z'%H:%M:%S")
      finished_at: "2016-08-29 09:52:33",
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

  service.publishPoll = function(pollID){
    var data = {options: [{id: 1, value: 'optionA', payment_amount: 10, is_user_amount: true}, {id: 1, value: 'optionB', payment_amount: 10, is_user_amount: true}]} 
      
    var payload = JSON.stringify(data)
    var headers = {headers: {'Content-Type': 'application/json'}}
    $http.patch(serverConfig.url + '/api/v2/polls/'+pollID, payload, headers).then(function(response){
      console.log(response)
    })  
  }

  return service
})
// this is not the best place to put this logic, once we'll have 
// a model for leader content item, it should go there
angular.module('app.services').service('attachments', function ($http, serverConfig, youtube) {
  var service = {}

  service.addVideo = function(leaderContentItemID, videoURL){
    var payload = JSON.stringify({type: 'video', content: videoURL})
    var headers = {headers: {'Content-Type': 'application/json'}}
    return $http.post(serverConfig.url + '/api/v2/polls/'+leaderContentItemID+'/educational-contexts', payload, headers)  }

  service.addPhoto = function(leaderContentItemID, photoURL){
    var payload = JSON.stringify({type: 'photo', content: photoURL})
    var headers = {headers: {'Content-Type': 'application/json'}}
    return $http.post(serverConfig.url + '/api/v2/polls/'+leaderContentItemID+'/educational-contexts', payload, headers)
  }

  service.addText = function(leaderContentItemID, text){
    var payload = JSON.stringify({type: 'text', content: text})
    var headers = {headers: {'Content-Type': 'application/json'}}
    return $http.post(serverConfig.url + '/api/v2/polls/'+leaderContentItemID+'/educational-contexts', payload, headers)
  }

  service.load = function(leaderContentItem){
   $http.get(serverConfig.url + '/api/v2/polls/'+leaderContentItem.id+'/educational-contexts').then(function(response){
      leaderContentItem.attachments = {};
      _(response.data).each(function (eduItem) {
        if (!leaderContentItem.attachments[eduItem.type]) {
          leaderContentItem.attachments[eduItem.type] = [];
        }
        if (eduItem.type === 'video') {
          eduItem.preview = youtube.generatePreviewLink(youtube.parseId(eduItem.text));
        }
        leaderContentItem.attachments[eduItem.type].push(eduItem);
      });
   })
  }

  return service
})

angular.module('app.directives').directive('showAttachments', function (attachments) {
    return {
      restrict: 'E',
      scope: {
        contentItem: '='
      },
      templateUrl: 'templates/attachments/show_attachments.html',
      controller: function ($scope) {
        $scope.noAttachments = function(){
          var li = $scope.contentItem
          return li && (li.attachments == null || _.isEmpty(li.attachments))
        }

        $scope.$watch('contentItem', function (val) {
          if($scope.contentItem)
            attachments.load( $scope.contentItem)
        });
      }
    };
})
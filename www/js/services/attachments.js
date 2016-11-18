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

angular.module('app.directives').directive('addAttachments', function (attachments, $ionicPopup) {
    return {
      restrict: 'E',
      scope: {},
      templateUrl: 'templates/attachments/add_attachments.html',
      controller: function ($scope) {
        $scope.attachments = {text: [], images: [], videos: []}
        $scope.displayAttachmentsForm = true
        var MAX_ATTACHMENT_ITEMS = 3

        var canAddMoreContent = function(){
          var a = $scope.attachments
          return (a.text.length + a.images.length + a.videos.length) < MAX_ATTACHMENT_ITEMS
        } 

        $scope.addText = function(){
          $scope.attachments.text = ['']
        }

        $scope.removeText = function(){
          var confirmPopup = $ionicPopup.confirm({
            title: 'Remove text?',
            cssClass: 'popup-by-ionic',
            buttons: [{
              text: 'No'
            }, {
              text: 'Yes',
              type: 'button-assertive',
              onTap: function(e) {
                return (true)
              }
            }]
          });
          confirmPopup.then(function(res) {
            if (res) 
              $scope.attachments.text = []
          });
          
        }

        $scope.addTextButtonVisible = function(){
          return canAddMoreContent() && $scope.attachments.text.length == 0
        }

        $scope.textAttachmentVisible = function(){
          return $scope.attachments.text.length > 0
        }

        $scope.addImageButtonVisible = function(){
          return canAddMoreContent()
        }

        $scope.addImage = function(){
          if(!ionic.Platform.isAndroid() && !ionic.Platform.isIOS()){
            $scope.attachments.images.push('images/v2/logo.png')
          } else {
            navigator.camera.getPicture(function(img) {
              var imageB64URI = 'data:image/jpeg;base64,' + img
              $scope.attachments.images.push(imageB64URI)
              $scope.$apply();
            }, function(e) {
              //  image selection in album canceled by user
            }, {
              correctOrientation: true,
              targetWidth: 1280,
              targetHeight: 1280,
              destinationType: navigator.camera.DestinationType.DATA_URL,
              sourceType: navigator.camera.PictureSourceType.PHOTOLIBRARY
            });
          }

        }

        $scope.removeImage = function(imagePos){
          var confirmPopup = $ionicPopup.confirm({
            title: 'Remove image?',
            cssClass: 'popup-by-ionic',
            buttons: [{
              text: 'No'
            }, {
              text: 'Yes',
              type: 'button-assertive',
              onTap: function(e) {
                return (true)
              }
            }]
          });
          confirmPopup.then(function(res) {
            if (res) 
              $scope.attachments.images.splice(parseInt(imagePos), 1)
          });
        }

      }
    }
})
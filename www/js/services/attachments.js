// this is not the best place to put this logic, once we'll have 
// a model for leader content item, it should go there
angular.module('app.services').service('attachmentsService', function ($http, serverConfig, youtube, $q) {
  var service = {}

  service.add = function(contentItemID, attachments){
    var d = $q.defer();

    var r = []
    if(attachments && attachments.text && attachments.text.length > 0)
      r.push(service.addText(contentItemID, attachments.text[0]))

    if(attachments && attachments.images && attachments.images.length > 0)
      attachments.images.forEach(function(image){
        r.push(service.addImage(contentItemID, image))
      })

    if(attachments && attachments.videos && attachments.videos.length > 0)
      attachments.videos.forEach(function(video){
        r.push(service.addVideo(contentItemID, video))
      })      

    $q.all(r).then(function(){
      d.resolve()
    })  
    
    return d.promise; 
  }

  service.addVideo = function(contentItemID, videoURL){
    var payload = JSON.stringify({type: 'video', content: videoURL})
    var headers = {headers: {'Content-Type': 'application/json'}}
    return $http.post(serverConfig.url + '/api/v2/polls/'+contentItemID+'/educational-contexts', payload, headers)  }

  service.addImage = function(contentItemID, image){
    var payload = JSON.stringify({type: 'image', content: image})
    var headers = {headers: {'Content-Type': 'application/json'}}
    return $http.post(serverConfig.url + '/api/v2/polls/'+contentItemID+'/educational-contexts', payload, headers)
  }

  service.addText = function(contentItemID, text){
    var payload = JSON.stringify({type: 'text', content: text})
    var headers = {headers: {'Content-Type': 'application/json'}}
    return $http.post(serverConfig.url + '/api/v2/polls/'+contentItemID+'/educational-contexts', payload, headers)
  }

  service.load = function(contentItem){
   $http.get(serverConfig.url + '/api/v2/polls/'+contentItem.id+'/educational-contexts').then(function(response){
      contentItem.attachments = {};
      _(response.data).each(function (eduItem) {
        if (!contentItem.attachments[eduItem.type]) {
          contentItem.attachments[eduItem.type] = [];
        }
        if (eduItem.type === 'video') {
          eduItem.preview = youtube.generatePreviewLink(youtube.parseId(eduItem.text));
        }
        contentItem.attachments[eduItem.type].push(eduItem);
      });
   })
  }

  service.prepareActivityItemAttachments = function(aItem){
    aItem.attachment_image = null;
    aItem.attachment_video = null;

    if(!(aItem.get('poll') && aItem.get('poll').educational_context))
      return false

    _(aItem.get('poll').educational_context).each(function (eduItem) {
      // if there are multiple photos or videos, take first one
      if(eduItem.type  == 'image' && aItem.attachment_image == null)
        aItem.attachment_image = eduItem
      
      if(eduItem.type  == 'video' && aItem.attachment_video == null){
        eduItem.preview = youtube.generatePreviewLink(youtube.parseId(eduItem.text));
        aItem.attachment_video = eduItem
      }
    })
  }

  return service
})

angular.module('app.directives').directive('showAttachments', function (attachmentsService) {
    return {
      restrict: 'E',
      scope: {
        contentItem: '='
      },
      templateUrl: 'templates/attachments/show_attachments.html',
      controller: function ($scope) {
        $scope.noAttachments = function(){
          var ci = $scope.contentItem
          return ci && (ci.attachments == null || _.isEmpty(ci.attachments))
        }

        $scope.$watch('contentItem', function (val) {
          if($scope.contentItem)
            attachmentsService.load( $scope.contentItem)
        });
      }
    };
})

angular.module('app.directives').directive('addAttachments', function (device, $ionicPopup) {
    return {
      restrict: 'E',
      scope: {contentItem: '='},
      templateUrl: 'templates/attachments/add_attachments.html',
      controller: function ($scope) {
        $scope.$watch('contentItem', function (val) {
          if($scope.contentItem)
            $scope.contentItem.attachments = {text: [], images: [], videos: []}
        });
        
        $scope.displayAttachmentsForm = false
        var MAX_ATTACHMENT_ITEMS = 3

        var canAddMoreContent = function(){
          var a = $scope.contentItem.attachments
          return (a.text.length + a.images.length + a.videos.length) < MAX_ATTACHMENT_ITEMS
        } 

        $scope.addText = function(){
          $scope.contentItem.attachments.text = ['']
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
              $scope.contentItem.attachments.text = []
          });
          
        }

        $scope.addTextButtonVisible = function(){
          return canAddMoreContent() && $scope.contentItem.attachments.text.length == 0
        }

        $scope.textAttachmentVisible = function(){
          return $scope.contentItem.attachments.text.length > 0
        }

        $scope.addImageButtonVisible = function(){
          return canAddMoreContent()
        }

        $scope.addImage = function(){
          if(!device.isSmartphone()){
            alert('This feature is not supported in browser, works only in smartphone app. If you see this message in Powerline smartphone app, please report us a bug.')
          } else {
            navigator.camera.getPicture(function(img) {
              var imageB64URI = img
              $scope.contentItem.attachments.images.push(imageB64URI)
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
              $scope.contentItem.attachments.images.splice(parseInt(imagePos), 1)
          });
        }

        $scope.addVideoButtonVisible = function(){
          return canAddMoreContent()
        }

        $scope.addVideo = function(){
          $scope.contentItem.attachments.videos.push('')
        }

        $scope.removeVideo = function(videoPos){
          var confirmPopup = $ionicPopup.confirm({
            title: 'Remove video?',
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
              $scope.contentItem.attachments.videos.splice(parseInt(videoPos), 1)
          });
        }
      }
    }
})
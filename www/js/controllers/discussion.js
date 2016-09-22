angular.module('app.controllers').controller('discussion',function ($scope, topBar, discussion, $stateParams, $cacheFactory, $ionicPopup, $sce, $rootScope) {

  var isWidget = !/^\/discussion/.test($scope.path());
  
  $scope.view = {};
  $scope.id = $scope.id || $stateParams.id;
  $scope.entity = $scope.entity || $stateParams.entity;

  var cache = $cacheFactory.get('discussionController');

  $scope.toTrustedHTML = function(html) {
    return $sce.trustAsHtml(html);
  }

  var commentId = $stateParams.comment ? $stateParams.comment : 0;
  $scope.showForm = Boolean(commentId);

  $scope.comment = getComment();

  if (!$stateParams.comment || !$scope.comment) {
    loadComments();
  }

  $scope.$watch(getComment, function (newValue) {
    $scope.comment = newValue;
  });

  $scope.$watch('view.commentToShare', function (comment) {
    if (comment) {
      $scope.shareTitle = comment.comment_body;
      $scope.shareBody = '';
      $scope.shareLink = comment.link;
    }
  });

  $scope.$on('discussion.comment-added', function () {
    //if (!isWidget) {
      loadComments();
      $scope.showToast('Comment successfully added.');
    //}
  });

  $scope.$on('discussion.comments-refresh', function () {
    loadComments();
  });

  $scope.getRateClass = function (val) {
    return val ? (val > 0 ? 'green' : 'red') : '';
  };

  function getComment() {
    var data = cache.get($scope.id);
    if (data) {
      return commentId ? data.byId[commentId] : data.root;
    }
  }

  $scope.isAvailable = function (comment) {
    return !comment.user || !comment.is_owner;
  };

  $scope.isAvailableToDelete = function(comment){
    return comment.is_owner;
  }


  $scope.up = function (comment) {
    if (comment.rate_status === 1) {
      discussion.rate(comment, 'delete', $scope.entity);
    } else {
      discussion.rate(comment, 'up', $scope.entity);
    }
  };

  $scope.down = function (comment) {
    if (comment.rate_status === -1) {
      discussion.rate(comment, 'delete', $scope.entity);
    } else {
      discussion.rate(comment, 'down', $scope.entity);
    }
  };

  function loadComments(scrollToBottom) {
    discussion.loadTree($scope.entity, $scope.id).then(function (data) {
      cache.put($scope.id, data);
    })
  }

  $scope.editClicked = [];

  for (var i = 0; i < 10; i++){
    $scope.editClicked[i] = false;
  }

  $scope.editComment = function(comment, $index){
    if ($scope.editClicked[$index] == false){
      $scope.editClicked[$index] = true;
    }
    else{
      $scope.editClicked[$index] = false;
      comment.comment_body_html = comment.comment_body;
//Backend Connect
            
      discussion.update($scope.entity, $scope.id, comment).then(function (res){
        return res.data;
      });
    }
  };

  $scope.deleteComment = function(comment, $index){
    $scope.showConfirm(comment, $index);
  };


  $scope.showConfirm = function(comment, $index) {
    var confirmPopup = $ionicPopup.confirm({
      title: 'Delete Comment',
      template: 'Are you sure you want to Delete?'
    });

    confirmPopup.then(function(res) {
      if(res) {
        $scope.editClicked[$index] = false;
        comment.comment_body_html = "This comment was deleted by its author.";

        discussion.delete($scope.entity, $scope.id, comment.id).then(function (res){
          return res.data;
        });

//Backend part...
      } else {
        
      }
    });
  };

}).controller('discussion.comment-form',function ($scope, discussion, $state, homeCtrlParams, $rootScope) {

  $scope.data = {
    comment: '',
    privacy: 0
  };
  $scope.reply = function () {
    if (!$scope.data.comment) {
      return;
    }
    var data = {
      parent_comment: $scope.comment.id,
      comment_body: $scope.data.comment,
      privacy: $scope.data.privacy
    };
    $rootScope.showSpinner();
    homeCtrlParams.loaded = false;
    discussion.createComment($scope.entity, $scope.id, data).then(function () {
      $scope.$emit('discussion.comment-added');
      $scope.data.comment = '';
    }, function(){
      $rootScope.hideSpinner();
    });
  };


});
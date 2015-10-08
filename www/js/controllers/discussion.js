angular.module('app.controllers').controller('discussion',function ($scope, topBar, discussion, $stateParams, $cacheFactory, flurry) {

  var isWidget = !/^\/discussion/.test($scope.path());
  
  $scope.view = {};
  $scope.id = $scope.id || $stateParams.id;
  $scope.entity = $scope.entity || $stateParams.entity;

  var cache = $cacheFactory.get('discussionController');

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
    //}
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

  $scope.up = function (comment) {
    if (comment.rate_status === 1) {
      discussion.rate(comment, 'delete');
      flurry.log('comment vote deleted', {id: comment.id});
    } else {
      discussion.rate(comment, 'up');
      flurry.log('comment upvoted', {id: comment.id});
    }
  };

  $scope.down = function (comment) {
    if (comment.rate_status === -1) {
      discussion.rate(comment, 'delete');
      flurry.log('comment vote deleted', {id: comment.id});
    } else {
      discussion.rate(comment, 'down');
      flurry.log('comment downvoted', {id: comment.id});
    }
  };

  function loadComments(scrollToBottom) {
    $scope.$emit('showSpinner');
    discussion.loadTree($scope.entity, $scope.id).then(function (data) {
      $scope.$emit('hideSpinner');
      cache.put($scope.id, data);
    }, function(){
      $scope.$emit('hideSpinner');
    });
  }

}).controller('discussion.comment-form',function ($scope, discussion, $state, homeCtrlParams, flurry) {

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
    $scope.$emit('showSpinner');
    homeCtrlParams.loaded = false;
    discussion.createComment($scope.entity, $scope.id, data).then(function () {
      flurry.log('comment added', {id: $scope.id});
      $scope.$emit('discussion.comment-added');
      $scope.data.comment = '';
    }, function(){
      $scope.$emit('hideSpinner');
    });
  };

});
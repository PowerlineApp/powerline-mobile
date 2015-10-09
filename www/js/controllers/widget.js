angular.module('app.controllers').controller('widget.share', function ($scope, serverConfig, $window, facebook) {
  var title, body;

  var links = {
    twitter: function () {
      var message = title + body;
      if (message.length > 140) {
        message = message.substr(0, 137) + '...';
      }
      if ($scope.shareLink) {
        return 'https://twitter.com/share?url=' + encodeURIComponent($scope.shareLink) +
          '&text=' + encodeURIComponent(message);
      } else {
        return 'https://twitter.com/share?text=' + encodeURIComponent(message);
      }
    },
    ln: function () {
      return 'http://www.linkedin.com/shareArticle?mini=true&url=' + encodeURIComponent($scope.shareLink || serverConfig.shareLink) +
        '&title=' + encodeURIComponent(title) +
        '&summary=' + encodeURIComponent(body);
    }
  };

  $scope.share = function (key) {
    prepare();
    $window.open(links[key](), '_system', 'location=yes');
  };

  $scope.FBShare = function () {
    prepare();
    facebook.share({
      name: title,
      link: $scope.shareLink || serverConfig.shareLink,
      picture: $scope.shareImage || serverConfig.shareImage,
      description: body
    });
  };

  function prepare() {
    title = $scope.shareTitle ? $scope.shareTitle + ' ' : '';
    body = $scope.shareBody || '';
  }
});

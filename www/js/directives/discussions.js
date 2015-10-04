angular.module('app.directives').directive('discussions', function () {
  return {
    restrict: 'E',
    scope: true,
    templateUrl: 'templates/question/discussion-widget.html',
    controller: function ($scope, $controller, $attrs) {
      $scope.id = $scope.$eval($attrs.id);
      $scope.entity = $scope.$eval($attrs.entity);
      $controller('discussion', {
        $scope: $scope
      });
    }
  };
});
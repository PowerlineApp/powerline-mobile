angular.module('app.controllers').controller('createPollEventCtrl',function ($scope, $stateParams,questions, $http, serverConfig, $rootScope, $controller) {
  $controller('abstractCreatePollCtrl', {$scope: $scope});

})
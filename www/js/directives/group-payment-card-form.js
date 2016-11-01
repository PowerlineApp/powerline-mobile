angular.module('app.directives').directive('groupPaymentCardForm', function () {
    return {
      restrict: 'E',
      scope: {
        cancel: '&',
        completed: '&',
        group: '='
      },
      templateUrl: 'templates/groups/manage-group/add-group-payment-card.html',
      controller: function ($scope, $rootScope, cards) {
        $scope.group = $scope.group || {}

        $scope.data = {
        }
        $scope.submit = function () {
          $rootScope.showSpinner();
          $scope.group.addPaymentCard($scope.data)
            .then(function (response) {
              $scope.completed(response);
            })
            .catch(function (error) {
              $rootScope.alert(JSON.stringify(error));
            })
            .finally(function () {
              $rootScope.hideSpinner();
            })
          ;
        };
      }
    };
  })
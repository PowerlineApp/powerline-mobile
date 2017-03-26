angular.module('app.controllers').directive('saItem', function () {
  return {
    restrict: 'E',
    template: '<ng-include src="template"></ng-include>',
    link: function (scope) {
      scope.template = 'templates/influence/sa-items/' + scope.item.getWidgetType() + '.html';
    }
  };
}).value('influencesCD', {
  view: 'followers'
});

angular.module('app.directives').directive('tree', ['$compile', function ($compile) {
  return {
    restrict: 'A',
    compile: function (tElement, tAttrs) {

      var repeatExpr,
        childExpr,
        childrenExpr;

      repeatExpr = (tAttrs.tree || tAttrs.ngRepeat).match(/^(.*) in (?:.*\.)?(.*)$/);
      childExpr = repeatExpr[1];
      childrenExpr = repeatExpr[2];
      tElement.attr('ng-repeat', childExpr + ' in ' + childExpr + '.' + childrenExpr);

      return function link(scope, element) {

        scope.$depth = scope.$depth || 0;
        scope.$watch(childExpr, function (child) {
          if (child) {
            var childScope = scope.$new();

            childScope[childrenExpr] = child[childrenExpr];
            childScope.$depth = scope.$depth + 1;

            element.find('branch').html($compile(tElement.clone())(childScope));
          }
        });
      };
    }
  };
}]);
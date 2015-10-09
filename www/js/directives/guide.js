angular.module('app.directives').directive('guide', function (guide) {

  return function (scope, element, attrs) {
    var click = function () {
      if (!guide.wasShown(attrs.guide)) {
        scope.alert(guide.getGuide(attrs.guide).message);
        guide.setShown(attrs.guide);
      }
      element.unbind('click', click);
    };

    if (!guide.wasShown(attrs.guide)) {
      element.bind('click', click);
    }
  };
});
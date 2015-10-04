angular.module('app.directives').directive('iPullDown', function ($document, $parse) {
  return function (scope, element, attrs) {
    var size = attrs.iPullDownSize,
      pull = $parse(attrs.iPullDown),
      startY,
      currentY,
      diff,
      pulling = false,
      waiting = false,
      pullElement = element.find('.pull-down')

      ;

    scope.$on('pull-down-updated', reset);

    reset();

    element.bind('touchstart', function (e) {
      startY = e.originalEvent.touches[0].pageY;
    });

    element.bind('touchmove', function (e) {
      if ($document.scrollTop()) {
        return;
      }
      if (!pulling) {
        currentY = e.originalEvent.touches[0].pageY;
        diff = currentY - startY;
        if (diff < 0) {
          return;
        }
        e.preventDefault();
        pullElement.css('height', diff + 'px');
        if (diff >= size) {
          pulling = true;
          pullElement.css('height', size + 'px');
          scope.pullMessage = 'Loading...';
          element.addClass('pulling');
          scope.$apply();
        }

      }
    });

    element.bind('touchend', function (e) {
      if (waiting) {
        return;
      }
      if (pulling) {
        waiting = true;
        scope.$apply(function () {
          pull(scope);
        });
        e.preventDefault();
      } else {
        pullElement.css('height', '0px');
      }
    });

    function reset() {
      pulling = false;
      waiting = false;
      pullElement.css('height', '0px');
      scope.pullMessage = 'Pull down to refresh';
      element.removeClass('pulling');
    }

  };
});

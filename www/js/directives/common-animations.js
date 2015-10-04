angular.module('app.directives').directive('iScroll',function ($window, $timeout) {
  return function (scope, element) {
    var scroll = new $window.IScroll(element[0], {bounce: false, click: true});
    scope.$on('$destroy', function () {
      scroll.destroy();
      scroll = null;
    });

    scope.$on('scroll-content-changed', refresh);
    scope.$on('resize', refresh);

    function refresh() {
      $timeout(function () {
        if (scroll) {
          scroll.refresh();
        }
      }, 50, false);
    }
  };
}).directive('iSwipe',function ($parse) {

  return function (scope, element, attrs) {

    var startTouchX, startTouchY, startTime, currentTouchX, currentTouchY;

    var swipeLeft = $parse(attrs.iSwipeLeft);
    var swipeRight = $parse(attrs.iSwipeRight);

    element.bind('touchstart', function (e) {
      startTouchX = e.originalEvent.touches[0].pageX;
      startTouchY = e.originalEvent.touches[0].pageY;
      startTime = e.timeStamp;
    });

    element.bind('touchmove', function (e) {
      currentTouchX = e.originalEvent.touches[0].pageX;
      currentTouchY = e.originalEvent.touches[0].pageY;
    });

    element.bind('touchend', function (e) {
      if ((e.timeStamp - startTime) < 1000) {
        var diffY = Math.abs(startTouchY) - Math.abs(currentTouchY);
        var diffX = Math.abs(startTouchX) - Math.abs(currentTouchX);
        if (Math.abs(diffX) > Math.abs(diffY)) {
          if (diffX > 30) {
            swipeLeft(scope, {$event: e});
          } else if (diffX < 30) {
            swipeRight(scope, {$event: e});
          }
        }
      }
    });
  };
}).directive('iSwipeAnimated',function ($parse, $window) {

  return function (scope, element, attrs) {

    var startTouchX, startTouchY, currentTouchX, currentTouchY, startMatrix, animate, scroll;

    var swipeLeft = $parse(attrs.iSwipeLeft);
    var swipeRight = $parse(attrs.iSwipeRight);

    element.bind('touchstart', function (e) {
      startTouchX = e.originalEvent.touches[0].pageX;
      startTouchY = e.originalEvent.touches[0].pageY;
      animate = false;
      scroll = false;
      startMatrix = new $window.WebKitCSSMatrix(element.css('transform'));
    });

    element.bind('touchmove', function (e) {
      currentTouchX = e.originalEvent.touches[0].pageX;
      currentTouchY = e.originalEvent.touches[0].pageY;
      var diffY = Math.abs(startTouchY) - Math.abs(currentTouchY);
      var diffX = Math.abs(startTouchX) - Math.abs(currentTouchX);

      if (scroll) {
        return;
      }

      if (!animate && Math.abs(diffX) < Math.abs(diffY)) {
        scroll = true;
        return;
      }

      if (!animate) {
        element.css('transition', 'all linear 0s');
        animate = true;
      }

      e.preventDefault();
      element.css('transform', 'translateX(' + (startMatrix.m41 - diffX) + 'px)');
    });

    element.bind('touchend', function (e) {
      if (!animate) {
        return;
      }

      element.css('transition', 'all linear 0.2s');
      element.css('transform', 'translateX(' + startMatrix.m41 + 'px)');

      var diffX = Math.abs(startTouchX) - Math.abs(currentTouchX);

      if (diffX < -30) {
        swipeLeft(scope, {$event: e});
      } else if (diffX > 30) {
        swipeRight(scope, {$event: e});
      }

      scope.execApply();
    });
  };
}).directive('iSwipeSlider',function ($parse, $document) {


  return function (scope, element, attrs) {
    var $body = $document.find('body');
    var complete = $parse(attrs.iSwipeSlider);
    var isWindowHeight = $parse(attrs.iWindowHeightIf);

    var swipes = {
      1: element.find('.swipe1'),
      2: element.find('.swipe2'),
      3: element.find('.swipe3')
    };

    var swipeElements = angular.element([swipes[1][0], swipes[2][0], swipes[3][0]]);

    var minHeight = ($body.height() - 50) + 'px';
    element.css('min-height', minHeight);
    swipeElements.css('min-height', minHeight);

    var margins = {
      1: function () {
        return swipes[1].width();
      },

      2: function () {
        return 0;
      },

      3: function () {
        return -swipes[3].width();
      }
    };

    var active = 2;
    scope.active = active;
    var startTouch = {x: 0, y: 0}, currentTouch = {x: 0, y: 0}, marginStart, stopSwipe, swipeActive;

    var setHeight = function () {
      if (isWindowHeight(scope)) {
        element.height($body.height() - 50);
      } else {
        element.height(swipes[active].height());
      }
    };

    var resize = function (animate) {
      marginStart = margins[active]();
      if (animate) {
        swipeElements.css('-webkit-transition', '-webkit-transform 300ms');
      } else {
        swipeElements.css('-webkit-transition', '-webkit-transform 0ms');
      }
      swipeElements.css('-webkit-transform', 'translateX(' + marginStart + 'px)');
      setHeight();
    };


    var next = function (i) {
      scope.active = active = i;
      resize(true);
      complete(scope);
    };

    resize();

    scope.swipe = function (i) {
      if (swipes[i] && active !== i) {
        next(i);
      }
    };

    scope.isActive = function (i) {
      return i === active;
    };

    scope.$on('resize', function () {
      resize();
      var minHeight = ($body.height() - 50) + 'px';
      element.css('min-height', minHeight);
      swipeElements.css('min-height', minHeight);
    });

    scope.$watch(function () {
      return isWindowHeight(scope);
    }, function (newValue, oldValue) {
      if (newValue !== oldValue) {
        setHeight();
      }
    });

    element.bind('touchstart', function (e) {
      startTouch.x = e.originalEvent.touches[0].pageX;
      startTouch.y = e.originalEvent.touches[0].pageY;
      stopSwipe = false;
      swipeActive = false;
      resize(false);
    });

    element.bind('touchmove', function (e) {
      if (stopSwipe) {
        return;
      }
      currentTouch.x = e.originalEvent.touches[0].pageX;
      currentTouch.y = e.originalEvent.touches[0].pageY;

      var diffX = Math.abs(startTouch.x) - Math.abs(currentTouch.x);
      if (swipeActive) {
        swipeElements.css('-webkit-transform', 'translateX(' + (marginStart - diffX) + 'px)');
        e.preventDefault();
        return false;
      }

      var diffY = Math.abs(startTouch.y) - Math.abs(currentTouch.y);

      if (Math.abs(diffX) < Math.abs(diffY)) {
        swipeElements.css('-webkit-transform', 'translateX(' + marginStart + 'px)');
        stopSwipe = true;
      } else {
        swipeElements.css('-webkit-transition', '-webkit-transform 0ms');
        swipeActive = true;
        e.preventDefault();
        return false;
      }
    });

    element.bind('touchend', function (e) {
      if (stopSwipe) {
        swipeElements.css('-webkit-transform', 'translateX(' + marginStart + 'px)');
        return;
      }

      if (swipeActive) {
        e.preventDefault();
        e.stopPropagation();
        var diffX = Math.abs(startTouch.x) - Math.abs(currentTouch.x);

        if (diffX < -30 && swipes[active - 1]) {
          next(active - 1);
          scope.$apply();
        } else if (diffX > 30 && swipes[active + 1]) {
          next(active + 1);
          scope.$apply();
        } else {
          swipeElements.css('-webkit-transform', 'translateX(' + marginStart + 'px)');
        }

      } else {
        swipeElements.css('-webkit-transform', 'translateX(' + marginStart + 'px)');
      }
    });

  };
}).directive('iGroups', function ($parse) {

  return  {
    scope: true,
    link: function (scope, element, attrs) {

      var opened = $parse(attrs.iGroups)(scope);
      var contentEl = element.find('[i-toggle-elem]');

      if (opened) {
        contentEl.show();
        element.addClass('opened');
      }
      scope.toggle = function () {
        if (opened) {
          contentEl.hide(300);
          element.removeClass('opened');
        } else {
          contentEl.show(300);
          element.addClass('opened');
        }

        opened = !opened;
      };
      scope.$on('i-group.openBySelector', function (e, selector) {
        if (element.find(selector).length && !opened) {
          opened = true;
          contentEl.show();
          element.addClass('opened');
        }
      });
    }
  };
}).directive('spinner', function () {
  return {
    restrict: 'E',
    templateUrl: 'templates/spinner.html'
  };
});

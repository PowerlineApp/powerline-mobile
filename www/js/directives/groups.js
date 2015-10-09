angular.module('app.directives').directive('iRadioListClass',function ($parse) {
  return function (scope, element, attrs) {

    var getClass = $parse(attrs.iRadioListClass);
    var delegateSelector = '[i-radio-list-item]';

    element.on('click', delegateSelector, function () {
      var activeClass = getClass(scope);
      var add = !angular.element(this).hasClass(activeClass);
      element.find(delegateSelector).removeClass(activeClass);

      if (add) {
        angular.element(this).addClass(activeClass);
      }
    });
  };
}).directive('iPagination',function ($parse) {

  var DEFAULT_PAGE_COUNT = 10;

  function updatePagination(scope, items, page, count) {
    var start = (page - 1) * count;
    scope.pagination = items.slice(start, start + count);
  }

  return {
    scope: true,
    controller: function ($scope, $element, $attrs) {
      var page = 1,
        count = DEFAULT_PAGE_COUNT,
        emptyItems = [],
        items = []
        ;

      $scope.pagination = [];
      var getItems = $parse($attrs.iPagination);
      items = getItems($scope) || emptyItems;

      updatePagination($scope, getItems($scope), page, count);

      $scope.hasNext = function () {
        return items.length > page * count;
      };

      $scope.hasPrev = function () {
        return page > 1;
      };

      $scope.next = function () {
        if ($scope.hasNext()) {
          page++;
        }
      };

      $scope.prev = function () {
        if ($scope.hasPrev()) {
          page--;
        }
      };

      $scope.$watch(function () {
        return getItems($scope) || emptyItems;
      }, function (newValue) {
        items = newValue;
        updatePagination($scope, items, page, count);
      });

      $scope.$watch(function () {
        return page;
      }, function () {
        updatePagination($scope, items, page, count);
      });
    }
  };
}).directive('iChildClass', function () {
  return function (scope, element, attrs) {
    var selector = attrs.iChildClass;

    scope.$watch(function () {
      return element.find(selector).not(':hidden').length;
    }, function () {
      var elements = element.find(selector).not(':hidden');
      elements.removeClass('last-child first-child');
      elements.last().addClass('last-child');
      elements.first().addClass('first-child');
    });
  };
}).directive('tabPanel', function ($parse, $ionicScrollDelegate) {
  return {
    restrict: 'E',
    scope: true,
    link:function (scope, element, attrs) {
      var $titles = element.find('.header li');
      var $tabs = element.find('tabs tab');
      var open = function (el) {
        _($titles).find(function (li, id) {
          if (li === el) {
            angular.element(li).addClass('active');
            angular.element($tabs[id]).css('display', 'block');
            $ionicScrollDelegate.resize();
            return true;
          }
        });
      };

      open($titles[$parse(attrs.open)(scope) || 0]);

      scope.open = function (event) {
        $tabs.hide();
        $titles.removeClass('active');
        open(event.currentTarget);
      };
    }
  };
});

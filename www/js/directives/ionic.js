angular.module('app.directives').directive('ionToggleCustom', [
  '$window',
  function($window) {

    return {
      restrict: 'E',
      replace: true,
      require: '?ngModel',
      transclude: true,
      template:
      '<div class="item item-toggle">' +
      '<div ng-transclude></div>' +
      '<label class="toggle">' +
      '<input type="checkbox">' +
      '<div class="track">' +
      '<div class="handle"></div>' +
      '</div>' +
      '</label>' +
      '</div>',

      compile: function(element, attr) {
        var input = element.find('input');
        angular.forEach({
          'name': attr.name,
          'ng-value': attr.ngValue,
          'ng-model': attr.ngModel,
          'ng-checked': attr.ngChecked,
          'ng-disabled': attr.ngDisabled,
          'ng-true-value': attr.ngTrueValue,
          'ng-false-value': attr.ngFalseValue,
          'ng-change': attr.ngChange
        }, function(value, name) {
          if (angular.isDefined(value)) {
            input.attr(name, value);
          }
        });

        if(attr.toggleClass) {
          element[0].getElementsByTagName('label')[0].classList.add(attr.toggleClass);
        }

        return function($scope, $element, $attr) {
          var el, checkbox, track, handle;

          el = $element[0].getElementsByTagName('label')[0];
          checkbox = el.children[0];
          track = el.children[1];
          handle = track.children[0];

          var ngModelController = angular.element(checkbox).controller('ngModel');

          $scope.toggle = new $window.ionic.views.Toggle({
            el: el,
            track: track,
            checkbox: checkbox,
            handle: handle,
            onChange: function() {
              if(checkbox.checked) {
                ngModelController.$setViewValue(true);
              } else {
                ngModelController.$setViewValue(false);
              }
              $scope.$apply();
            }
          });

          $scope.$on('$destroy', function() {
            $scope.toggle.destroy();
          });
        };
      }

    };
  }
]).directive('itemFloatingLabel', function() {
  return {
    restrict: 'C',
    link: function(scope, element) {
      var el = element[0];
      var input = el.querySelector('input, textarea, select');
      var inputLabel = el.querySelector('.input-label');

      if ( !input || !inputLabel ) {
        return;
      }

      var onInput = function() {
        if ( input.value ) {
          inputLabel.classList.add('has-input');
        } else {
          inputLabel.classList.remove('has-input');
        }
      };

      if (input.tagName === 'SELECT') {
        input.addEventListener('change', onInput);
      } else {
        input.addEventListener('input', onInput);
      }

      var ngModelCtrl = angular.element(input).controller('ngModel');
      var render = ngModelCtrl.$render;

      if ( ngModelCtrl ) {
        ngModelCtrl.$render = function() {
          render.call(ngModelCtrl);
          onInput();
        };
      }

      scope.$on('$destroy', function() {
        input.removeEventListener('input', onInput);
        input.removeEventListener('change', onInput);
      });
    }
  };
});

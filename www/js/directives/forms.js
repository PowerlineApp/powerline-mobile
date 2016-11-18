angular.module('app.directives').directive('iPlaceholder',function () {
  var watch = angular.noop;
  return {
    require: 'ngModel',
    link: function (scope, element, attrs, ctrl) {
      if ('SELECT' === element.get(0).tagName) {
        watch = function () {
          return !ctrl.$modelValue;
        };
      }

      scope.$watch(watch, function (isPlaceholder) {
        if (isPlaceholder) {
          element.addClass('i-placeholder-active');
        } else {
          element.removeClass('i-placeholder-active');
        }
      });
    }
  };
}).directive('iRequired',function ($parse) {

  var isValid = function (scope, value, name) {
    return value && value !== scope.placeholders[name];
  };

  return {
    require: 'ngModel',
    link: function (scope, element, attrs, ctrl) {

      var requiredValidator = function (value) {
        ctrl.$setValidity('required', isValid(scope, value, ctrl.$name));
        return value;
      };

      requiredValidator($parse(attrs.ngModel)(scope));
      ctrl.$parsers.push(requiredValidator);
    }
  };
}).directive('iRepeat',function () {

  var isValid = function (scope, first, second) {
    return scope.data[first] === scope.data[second];
  };

  return {
    require: 'ngModel',
    link: function (scope, element, attrs, ctrl) {

      scope.$watch(function () {
        return scope.data[attrs.iRepeat];
      }, function () {
        ctrl.$setValidity('repeat', isValid(scope, ctrl.$name, attrs.iRepeat));
      });

      ctrl.$setValidity('repeat', isValid(scope, ctrl.$name, attrs.iRepeat));

      element.bind('input', function () {
        scope.$apply(function () {
          ctrl.$setValidity('repeat', isValid(scope, ctrl.$name, attrs.iRepeat));
        });
      });
    }
  };
}).directive('iEmail',function ($parse) {

  var EMAIL_REGEXP = /^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,4}$/;

  return {
    require: 'ngModel',
    link: function (scope, element, attrs, ctrl) {

      var emailValidator = function (value) {
        if (value && EMAIL_REGEXP.test(value)) {
          ctrl.$setValidity('email', true);
        } else {
          ctrl.$setValidity('email', false);
        }
        return value;
      };

      emailValidator($parse(attrs.ngModel)(scope));
      ctrl.$parsers.push(emailValidator);
    }
  };
}).directive('iDate',function ($filter, $window, device) {

  function dateField(scope, element, attrs, ctrl) {

    element.attr('type', 'date');

    ctrl.$render = function () {
      var newDate = new Date(ctrl.$viewValue);
      if (newDate.valueOf()) {
        element.val($filter('date')(newDate, 'y-MM-dd'));
      } else {
        element.val('');
      }
    };

    var validator = function (value) {
      var newDate = new Date(value);
      if (newDate.valueOf()) {
        ctrl.$setValidity('date', true);
        return $filter('date')(newDate, 'MM/dd/y');
      } else {
        ctrl.$setValidity('date', false);
        return;
      }
    };

    ctrl.$formatters.push(validator);
    ctrl.$parsers.unshift(validator);
  }

  function datePickerField(scope, element, attrs, ctrl) {
    var datePickerOpened = false;

    element.bind('focus', function () {

      element.blur();

      if($window.plugins && $window.plugins.datePicker){
        if (datePickerOpened) {
          return false;
        }
        datePickerOpened = true;
        $window.plugins.datePicker.show({
          date: ctrl.$modelValue ? new Date(ctrl.$modelValue) : new Date(),
          mode: 'date',
          allowOldDates: true
        }, function (returnDate) {
          var newDate = new Date(returnDate);
          ctrl.$setViewValue($filter('date')(newDate, 'MM/dd/y'));

          scope.$apply(function () {
            element.val(ctrl.$modelValue);
            datePickerOpened = false;
          });
        }, function () {
          datePickerOpened = false;
        });
      } else {
        var d = '01/01/1977'
        ctrl.$setViewValue(d)
        scope.$apply(function () {
          element.val(d);
        });
      }

    });

    scope.$watch(function () {
      return ctrl.$modelValue;
    }, function (newValue, oldValue) {
      if (newValue !== oldValue) {
        ctrl.$setViewValue(ctrl.$modelValue);
      }
    });

    var listener = function () {
      var value = element.val();
      if (ctrl.$viewValue !== value) {
        scope.$apply(function () {
          ctrl.$setViewValue(value);
        });
      }
    };

    element.bind('change', listener);

    ctrl.$render = function () {
      element.val(!ctrl.$viewValue ? '' : ctrl.$viewValue);
    };


    var validator = function (value) {
      var newDate = new Date(value);
      if (newDate.valueOf()) {
        ctrl.$setValidity('date', true);
        return $filter('date')(newDate, 'MM/dd/y');
      } else {
        ctrl.$setValidity('date', false);
        return;
      }
    };

    ctrl.$formatters.push(validator);
    ctrl.$parsers.unshift(validator);
  }

  return {
    require: 'ngModel',
    link: device.isIPad ? dateField : datePickerField
  };
}).directive('slider',function () {

  return {
    require: '?ngModel',
    restrict: 'EA',
    link: function (scope, element, attrs, ngModel) {
      ngModel.$render = function () {
        if (ngModel.$viewValue) {
          element.addClass('slider-on');
        } else {
          element.removeClass('slider-on');
        }
      };
    }
  };
}).directive('timePicker',function ($window, iParse) {
  return {
    require: '?ngModel',
    restrict: 'EA',
    scope: true,
    link: function (scope, element, attrs, ctrl) {
      scope.pick = function () {
        $window.plugins.datePicker.show({
          date: new Date(ctrl.$modelValue || null),
          mode: 'time',
          allowOldDates: true
        }, function (returnDate) {
          ctrl.$setViewValue(new Date($window.moment(iParse.getTimeString(returnDate), 'H:m').toDate()));
          scope.$apply();
        });
      };
    }
  };
}).directive('iCapitalize', function () {
  return {
    require: '?ngModel',
    restrict: 'A',
    link: function (scope, element, attrs, ctrl) {
      ctrl.$parsers.unshift(function (value) {
        if (value && 1 === value.length) {
          var capitalized = value.charAt(0).toUpperCase() + value.substring(1);
          if (capitalized !== value) {
            value = capitalized;
            ctrl.$setViewValue(value);
            ctrl.$render();
          }
        }
        return value;
      });
    }
  };
}).directive('iAddress', ['uiGmapGoogleMapApi', '$timeout', function (GoogleMapApi, $timeout) {
  var components = {
    street_number: 'short_name',
    route: 'long_name',
    locality: 'long_name',
    administrative_area_level_1: 'short_name',
    country: 'short_name',
    postal_code: 'short_name'
  };

  angular.element(document).delegate('.pac-container', 'click', function () {
    angular.element(':focus').blur();
  });

  return {
    require: '?ngModel',
    restrict: 'A',
    link: function (scope, element, attrs, ctrl) {
      $timeout(function () {
        angular.element('.pac-container').attr('data-tap-disabled', 'true');
      }, 500, false);

      element.on('focus', function () {
        angular.element('.pac-container').attr('data-tap-disabled', 'true');
      });

      var content = angular.element(angular.element.find('.content'));
      GoogleMapApi.then(function(maps) {
        var autocomplete = new maps.places.Autocomplete(element[0], {types: [attrs.iAddress]});

        maps.event.addListener(autocomplete, 'place_changed', function() {
          var place = autocomplete.getPlace();
          var data = {};
          _(components).each(function (item, key) {
            data[key] = null;
          });

          for (var i = 0; i < place.address_components.length; i++) {
            var componentType = place.address_components[i].types[0];
            if (components[componentType]) {
              data[componentType] =  place.address_components[i][components[componentType]];
            }
          }

          element.blur();
          element.val('');

          scope.$apply(function () {
            $timeout(function() {
              scope.data.address1 = data.route ?
                ((data.street_number ? data.street_number + ' ' : '' ) + data.route) : scope.data.address1
              ;
              scope.data.city = data.locality || scope.data.city;
              scope.data.state = data.administrative_area_level_1 || scope.data.state;
              scope.data.country = data.country || scope.data.country;
              scope.data.zip = data.postal_code || scope.data.zip;
              ctrl.$render();
            }, 100);
          });
        });

      });
      element.on('focus', function () {
        content.scrollTop(content.scrollTop() + element.offset().top - 70);
      });
    }
  };
}]).directive('iPasswordValidator', function () {
  var pattern = /\d+/;
  return {
    require: 'ngModel',
    link: function (scope, elm, attrs, ctrl) {
      ctrl.$parsers.unshift(function (viewValue) {
        if (viewValue && viewValue.length > 5) {
          ctrl.$setValidity('password', pattern.test(viewValue));
        } else {
          ctrl.$setValidity('password', false);
        }
        return viewValue;
      });
    }
  };
}).directive('iErrors', function () {

  return {
    restrict: 'E',
    scope: {
      field: '=',
      messages: '='
    },
    templateUrl: 'templates/directives/i-errors.html'
  };
}).directive('widthFix', function () {

  return function (scope, elm, attrs) {
    elm.width(elm.parent().width());
  };
}).directive('iFlexibleField', function() {
  return function(scope, element, attrs) {
    var minHeight = attrs.iFlexibleField;

    element.css('min-height', minHeight + 'px');
    element.css('height', minHeight + 'px');

    element.on('input', function() {
      if (element[0].scrollHeight !== element.height()) {
        element.height(element[0].scrollHeight + 'px');
      }
    });
  };
}).directive('focusMe', function($timeout) {
  return {
    link: function(scope, element, attrs) {
      scope.$watch(attrs.focusMe, function(value) {
        if(value === true) { 
          console.log('value=',value);
          $timeout(function() {
            element[0].focus();
            scope[attrs.focusMe] = false;
          });
        }
      });
    }
  };
}).directive('ngEnter', function () {
    return function (scope, element, attrs) {
      element.bind("keydown keypress", function (event) {
          if(event.which === 13) {
              scope.$apply(function (){
                  scope.$eval(attrs.ngEnter);
              });

              event.preventDefault();
          }
      });
    };
}).directive("tabindex", function () {
  return {
    restrict: "A",
    link: function ($scope, elem, attrs) {

        elem.bind('keydown', function(e) {
          var code = e.keyCode || e.which;
          if (code === 13) {
            e.preventDefault();
            var tabindex = parseInt(attrs.tabindex) + 1;
            $('input[tabindex='+tabindex+']').focus();
          }
        });
    }
  }
});


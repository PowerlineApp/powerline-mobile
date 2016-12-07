angular.module('app.directives')
  .directive('iAutocomplete', function($document, $rootScope, $compile, $window, search, $timeout) {

    var autocompleteScope = $rootScope.$new();
    var autoCompleteEl = $compile(
      '<div class="autocomplete-popup"><ul>' +
      '<li ng-repeat="item in items | limitTo:6" ng-click="select(item)">' +
      '<strong>{{ item.label }}</strong> {{ item.comment }}' +
      '</li></ul></div>'
    )(autocompleteScope);

    $document.find('body').append(autoCompleteEl);

    var users = [];
    var usersById = {};
    var minQueryLength = 2;
    autocompleteScope.items = [];

    autocompleteScope.select = function(item) {
      replace('@' + item.username);
    };

    function autocomplete() {
      if (!autocompleteScope.items.length) {
        return autoCompleteEl.hide();
      }

      var coordinates = $window.getCaretCoordinates(
        autocompleteScope.element[0],
        autocompleteScope.element[0].selectionEnd
      );
      var offset = autocompleteScope.element.offset();
      autoCompleteEl.show()
        .css('top', (coordinates.top + offset.top - Math.min(6, autocompleteScope.items.length) * 30))
        .css('left', offset.left + coordinates.left)
      ;
    }

    function setQuery() {
      autocompleteScope.query = '';
      autocompleteScope.position = autocompleteScope.element[0].selectionStart;
      if (autocompleteScope.position) {
        var pre = autocompleteScope.element.val().substring(0, autocompleteScope.position);
        var parts = pre.split(/\s/);
        autocompleteScope.query = parts[parts.length - 1];
      }
    }

    function replace(text) {
      autocompleteScope.element[0].selectionStart = autocompleteScope.position - autocompleteScope.query.length;
      autocompleteScope.element[0].selectionEnd = autocompleteScope.position;
      autocompleteScope.element[0].setRangeText(text);
      var newPosition = autocompleteScope.element.val().length;
      autocompleteScope.element[0].selectionStart = newPosition;
      autocompleteScope.element[0].selectionEnd = newPosition;

      // see #433. 
      // this code is inside $apply/$digest and despite that the ng-model is not updated
      // that is why I used this ugly solution

      // get the latest content of the text field
      var autocompletedTextFieldValue = angular.element(autocompleteScope.element[0]).val()
      // find out the name of the ng-model data structure which should be updated with the content
      var ngModelSetter = autocompleteScope.element[0].attributes['ng-model'].value
      // and update it manually
      eval('autocompleteScope.invokerScope.'+ngModelSetter+' = autocompletedTextFieldValue')

      $timeout(function() {
        autocompleteScope.element.focus();
      }, 100, false);
    }


    function filter() {
      if (autocompleteScope.query.length > minQueryLength && autocompleteScope.query[0] === '@') {
        var start = autocompleteScope.query.slice(1, autocompleteScope.query.length).toLowerCase();
        autocompleteScope.items = _(users).filter(function(user) {
          return 0 === user.username.toLowerCase().search(start) ||
            0 === user.first_name.toLowerCase().search(start) ||
            0 === user.last_name.toLowerCase().search(start)
          ;
        });
      } else {
        autocompleteScope.items = [];
      }
    }

    function fetch() {
      if (autocompleteScope.query.length > minQueryLength && autocompleteScope.query[0] === '@') {
        search.searchUsers(autocompleteScope.query.slice(1, autocompleteScope.query.length))
          .then(function(data) {
            var dataAdded = false;
            _(data).each(function(user) {
              if (!usersById[user.id]) {
                usersById[user.id] = user;
                dataAdded = true;
                users.push(user);
                user.label = '@' + user.username;
                user.comment = user.first_name + ' ' + user.last_name;
              }
            });
            if(dataAdded){
              filter();
              autocomplete();
            }
          });
      }
    }

    var textTimer = null;
    return function(scope, element) {
      autocompleteScope.invokerScope = scope
      element.on('input', function(){
        $timeout.cancel(textTimer);
        textTimer = $timeout(function(){
          autocompleteScope.element = element;
          setQuery();
          filter();
          fetch();
          autocomplete();
        }, 100);
      });
      element.on('blur', function() {
        $timeout(function() {
          autoCompleteEl.hide();
        }, 500, false);
      });
    };
  });

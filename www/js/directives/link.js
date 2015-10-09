angular.module('app.directives').directive('iOpenSystem',function ($parse, $window) {
  return function (scope, element, attrs) {
    var getLink = $parse(attrs.iOpenSystem);

    element.on('click', function (e) {
      var link = getLink(scope);
      if (link && link.search(/^(http:\/\/|https:\/\/)/) !== 0) {
        link = 'http://' + link;
      }
      $window.open(link, '_system');
      e.preventDefault();
      return false;
    });
  };
}).directive('iOpenSystemLinks', function() {
  return function (scope, element) {
    element.delegate('a', 'click', function (e) {
      e.preventDefault();
      cordova.exec(null, null, 'InAppBrowser', 'open', [angular.element(e.currentTarget).attr('href'), '_system']);
      return false;
    });
  };
}).directive('iBindTaggable', function ($parse, $compile) {
  function escapeRegExp(value) {
    return (value + '').replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
  }

  return function (scope, element, attr) {
    element.addClass('ng-binding').data('$binding', attr.iBindTaggable);
    var getTags = $parse(attr.iTags);

    scope.$watch(attr.iBindTaggable, function (value) {
      value = String(value);
      element.text(value);
      var tags = _(getTags(scope) || []).sortBy(function (tag) {
        return -tag.length;
      });
      var html = element.html() || '';
      _(tags).each(function (tag, key) {
        html = html.replace(new RegExp('(' + escapeRegExp(tag) + ')', 'g'), '#?' + key);
      });
      _(tags).each(function (tag, key) {
        html = html.split('#?' + key).join('<hash-tag ng-click="openTag(\'' + tag + '\')">' + tag + '</hash-tag>');
      });
      element.html('');
      $compile('<span>' + html + '</span>')(scope).appendTo(element);
    });
  };
}).directive('iTags', function() {
  return function(scope, element) {
    element.delegate('hash-tag', 'click', function(e) {
      scope.openTag(angular.element(e.currentTarget).text());
      scope.execApply();
    });
  };
}).directive('iContentLink', function($location, $cacheFactory) {
  var searchCache = $cacheFactory.get('searchController');
  return function(scope, element) {
    element.delegate('a', 'click', function (e) {
      e.preventDefault();

      var $link = angular.element(e.currentTarget);
      if ($link.attr('href')) {
        cordova.exec(null, null, 'InAppBrowser', 'open', [$link.attr('href'), '_system']);
      } else if ($link.data('user-id')) {
        $location.path('/influence/profile/' + $link.data('user-id'));
      } else if ($link.data('hashtag')) {
        searchCache.put('query', $link.data('hashtag'));
        $location.path('/search');
      }

      scope.execApply();
      return false;
    });
  };
});

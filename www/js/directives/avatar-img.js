angular.module('app.directives').directive('avatarImg', function ($rootScope, $filter) {

  return {
    scope: {
      img: '=',
      text: '='
    },
    template: '<img ng-src="{{img}}" ng-if="!isDefaultAvatar">' +
          '<ng-letter-avatar data="{{text}}" ng-if="isDefaultAvatar"></ng-letter-avatar>',
    link: function (scope, element, attrs, ctrl) {
      
      scope.$watch('img', function(){
        scope.isDefaultAvatar = $rootScope.isDefaultAvatar(scope.img);
      });
      scope.$watch('text', function(){
        scope.text = $filter('trim')(scope.text);
      });
    }
  };
});

angular.module('app.directives').directive('avatarImg', function ($rootScope, $filter) {

  return {
    scope: {
      img: '=',
      text: '='
    },
    template: '<img ng-src="{{imgUrl}}" ng-if="!isDefaultAvatar">' +
          '<ng-letter-avatar data="{{text}}" ng-if="isDefaultAvatar"></ng-letter-avatar>',
    link: function (scope, element, attrs, ctrl) {
      scope.$watch('img', function(nVal, oVal){
        scope.isDefaultAvatar = $rootScope.isDefaultAvatar(scope.img);
        if(!scope.isDefaultAvatar){
          scope.imgUrl = $filter('imgix')(scope.img, {w: element.width()||null});
        }
      });
      scope.$watch('text', function(){
        scope.text = $filter('trim')(scope.text);
      });
    }
  };
});

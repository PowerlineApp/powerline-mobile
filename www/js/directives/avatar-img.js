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
          if(scope.imgUrl) {
            scope.imgUrl = scope.imgUrl +'&w=50&h=50&auto=compress,format';
          }
        }
      });
      scope.$watch('text', function(){
        scope.text = $filter('trim')(scope.text);
      });
    }
  };
});

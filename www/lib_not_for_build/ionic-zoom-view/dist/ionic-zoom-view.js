"use strict";

(function () {

  "use strict";

  var zoomView = function ($compile, $ionicModal, $ionicPlatform) {
    return {

      restrict: "A",

      link: function link(scope, elem, attr) {

        $ionicPlatform.ready(function () {

          elem.attr("ng-click", "showZoomView()");
          elem.removeAttr("zoom-view");
          $compile(elem)(scope);

          var zoomViewTemplate = "\n          <style>\n          .zoom-view .scroll { height:100%; }\n          </style>\n          <ion-modal-view class=\"zoom-view\">\n          <ion-header-bar>\n          <h1 class=\"title\"></h1>\n          <button ng-click=\"closeZoomView()\" class=\"button button-clear button-dark\">Done</button>\n          </ion-header-bar>\n          <ion-content>\n          <ion-scroll zooming=\"true\" direction=\"xy\" style=\"width: 100%; height: 100%; position: absolute; top: 0; bottom: 0; left: 0; right: 0; \">\n          <img ng-src=\"{{ngSrc}}\" style=\"width: 100%!important; display:block;   width: 100%; height: auto; max-width: 400px; max-height: 700px; margin: auto; padding: 10px; \"></img>\n          </ion-scroll>\n          </ion-content>\n          </ion-modal-view>\n          ";

          scope.zoomViewModal = $ionicModal.fromTemplate(zoomViewTemplate, {
            scope: scope,
            animation: "slide-in-up" });

          scope.showZoomView = function () {
            scope.zoomViewModal.show();
            scope.ngSrc = attr.zoomSrc;
          };

          scope.closeZoomView = function () {
            scope.zoomViewModal.hide();
          };
        });
      } };
  };

  angular.module("ionic-zoom-view", []).directive("zoomView", zoomView);
})();
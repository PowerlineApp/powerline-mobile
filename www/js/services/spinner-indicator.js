angular.module('app.services') .factory('spinnerIndicator', function ($ionicLoading) {
  var _service = {
    indicators: [],
    show: function (indicator) {
      if (indicator)
        this.indicators.push(indicator);

      $ionicLoading.show({
        template: '<ion-spinner></ion-spinner>'
      });
    },
    hide: function (indicator) {
      if (!indicator) {
        this.indicators = [];
      }
      else {
        var index = this.indicators.indexOf(indicator);
        this.indicators.splice(index, 1);
      }

      if (this.indicators.length == 0)
        $ionicLoading.hide();
    }
  };
  window.indicator = _service;

  return _service;
});
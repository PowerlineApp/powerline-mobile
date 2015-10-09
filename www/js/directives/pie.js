angular.module('app.directives').directive('iPie', function () {
  return function (scope, element, attrs) {

    attrs.$observe('iPie', function (percent) {
      if (percent) {
        fillPercent(percent);
      }
    });

    var canvas = element[0];
    var ctx = canvas.getContext('2d');
    var x = canvas.width / 2;
    var y = canvas.height / 2;
    fillPercent(0);

    function fillPercent(percent) {
      percent = 0.02 * percent;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 22;
      ctx.beginPath();
      ctx.arc(x, y, 100, 0, 2 * Math.PI, false);
      ctx.stroke();
      ctx.strokeStyle = '#7eae33';
      ctx.beginPath();
      ctx.arc(x, y, 100, 1.25 * Math.PI, 1.25 * Math.PI - percent * Math.PI, true);
      ctx.stroke();
    }
  };
});

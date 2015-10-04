
angular.module('app.services').factory('guide', function (iStorage) {

  var items = {
    'privacy-option': {
      message:'Your name will be hidden from fellow community members, including followers for this post.',
      type: 'alert'
    }
  };

  var PREFIX = 'help-guide-viewed:';

  return {
    wasShown: function (id) {
      return !!iStorage.get(PREFIX + id);
    },
    getGuide: function (id) {
      return items[id];
    },
    setShown: function (id) {
      iStorage.set(PREFIX + id, 1);
    }
  };
});
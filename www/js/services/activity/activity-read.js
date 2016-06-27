angular.module('app.services').factory('ActivityRead',
  function (iStorage) {
    return iStorage.get('read-activities') || []
  })
angular.module('app.services').factory('socialActivityHandler', function (socialActivity, SocialActivityTabManager, serverConfig, $http, follows, navigateTo) {
  return {
    navigateToOwner: function (item) {
      if (item.get('following')) {
        navigateTo('target', 'user', item.get('following').id);
      } else if (item.get('group')) {
        navigateTo('target', 'group', item.get('group').id);
      }
    },
    navigate: function (item) {
      navigateTo('target', item.get('target').type, item.get('target').id);
    }
  };
})

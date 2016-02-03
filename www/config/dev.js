angular.module('app.config', [])
  .value(
  'serverConfig',
  {
    env: 'dev',
    url: 'http://api.civix-dev.intellectsoft.org',
    senderID: '354736666363',
    stripePK: 'pk_test_QUgSE3ZhORW9yoDuCkMjnaA2',
    shareImage: 'http://civix-dev.intellectsoft.org/images/civix-app.png',
    shareLink: 'http://civix-dev.intellectsoft.org'
  }
);

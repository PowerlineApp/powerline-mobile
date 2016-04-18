angular.module('app.config', [])
  .value(
  'serverConfig',
  {
    env: 'dev',
    url: 'http://52.5.45.80',
    senderID: '354736666363',
    stripePK: 'pk_test_QUgSE3ZhORW9yoDuCkMjnaA2',
    shareImage: 'http://52.5.45.80/images/civix-app.png',
    shareLink: 'http://52.5.45.80'
  }
);

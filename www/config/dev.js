angular.module('app.config', [])
  .value(
  'serverConfig',
  {
    env: 'dev',
    url: 'https://api-dev.powerli.ne',
    senderID: '354736666363',
    stripePK: 'pk_test_QUgSE3ZhORW9yoDuCkMjnaA2',
    shareImage: 'https://api-dev.powerli.ne/images/civix-app.png',
    shareLink: 'https://api-dev.powerli.ne'
  }
);

angular.module('app.config', [])
  .value(
  'serverConfig',
  {
    env: 'staging',
    url: 'https://api-staging.powerli.ne',
    senderID: '354736666363',
    stripePK: 'pk_live_hRBIgf1WvZ1qyhDpP3KQHEyE',
    shareImage: 'https://staging.powerli.ne/images/civix-app.png',
    shareLink: 'https://staging.powerli.ne'
  }
);

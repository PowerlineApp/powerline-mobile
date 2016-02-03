angular.module('app.config', [])
  .value(
  'serverConfig',
  {
    env: 'prod',
    url: 'https://api.powerli.ne',
    senderID: '354736666363',
    stripePK: 'pk_live_hRBIgf1WvZ1qyhDpP3KQHEyE',
    shareImage: 'https://powerli.ne/images/civix-app.png',
    shareLink: 'https://powerli.ne'
  }
);

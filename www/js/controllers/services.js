angular.module('app.controllers').controller('services',function ($scope, topBar, flurry) {
  topBar.reset()
    .set('menu', true)
    .set('title', 'Services')
  ;

  flurry.log('services');

  $scope.items = [
    {
      link: 'http://powerli.ne',
      logo: 'images/services/logo.png',
      title: 'Powerline Reports',
      description: 'Free public accountability reports coming Soon!'
    },
    {
      link: 'https://turbovote.org/register',
      logo: 'images/services/TurboVote.png',
      title: 'TurboVote',
      description: 'Free and easy way to register to vote and vote by mail!'
    },
    {
      link: 'http://voterhub.us/',
      logo: 'images/services/voterhub.png',
      title: 'VoterHub',
      description: 'Vital voter information including candidate information'
    },
    {
      link: 'http://www.votesmart.org/',
      logo: 'images/services/projectvotesmart.jpg',
      title: 'Project Vote Smart',
      description: 'More great information about officials and candidates'
    },
    {
      link: 'http://www.politifact.com/settleit/',
      logo: 'images/services/settleit_logo.png',
      title: 'Settle It',
      description: 'Accurate stances on the candidates and the issues backed by Politifact and its sources'
    },
    {
      link: 'http://www.usa.gov/Citizen/Topics/Voting.shtml',
      logo: 'images/services/UsaGov.gif',
      title: 'USA.gov',
      description: 'Election facts, history, and much more'
    },
    {
      link: 'http://sunlightfoundation.com/tools/',
      logo: 'images/services/sunlightfoundation.gif',
      title: 'Sunlight Foundation',
      description: 'Lots of tools and open data'
    }
  ];
});
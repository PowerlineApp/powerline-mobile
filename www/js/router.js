angular.module('app')
        .config(function ($stateProvider, $urlRouterProvider/*, $routeProvider*/) {
          var provider = $stateProvider
                  .state('app', {
                    url: '',
                    abstract: true,
                    templateUrl: 'templates/menu.html',
                    controller: 'AppCtrl'
                  });

          var states = [{
              name: 'preload',
              url: '/preload',
              templateUrl: 'templates/home/preload.html',
              controller: 'preload'
            }, {
              name: 'main',
              url: '/main',
              cache: true,
              templateUrl: 'templates/home/home.html',
              controller: 'home'
            }, {
              name: 'newActivities',
              url: '/new-activities',
              cache: true,
              templateUrl: 'templates/home/home.html',
              controller: 'home'
            }, {
              name: 'login',
              url: '/login',
              templateUrl: 'templates/session/login.html',
              controller: 'session.login'
            }, {
              name: 'logout',
              url: '/logout',
              templateUrl: 'templates/session/logout.html',
              controller: 'session.logout'
            }, {
              name: 'commingSoon',
              url: '/comming-soon',
              cache: true,
              templateUrl: 'templates/coming-soon.html'
            }, {
              name: 'terms',
              url: '/terms',
              cache: true,
              templateUrl: 'templates/terms.html',
              controller: 'session.terms'
            }, {
              name: 'registration',
              url: '/registration',
              templateUrl: 'templates/session/registration.html',
              controller: 'session.registration'
            }, {
              name: 'registrationStep2',
              url: '/registration-step2',
              templateUrl: 'templates/session/registration-step2.html',
              controller: 'session.registration-step2'
            }, {
              name: 'registrationStep3',
              url: '/registration-step3',
              templateUrl: 'templates/session/registration-step3.html',
              controller: 'session.registration-step3'
            }, {
              name: 'forgotPassword',
              url: '/forgot-password',
              templateUrl: 'templates/session/forgot-password.html',
              controller: 'session.forgot-password'
            }, {
              name: 'guide',
              url: '/guide',
              templateUrl: 'templates/guide/index.html',
              controller: 'guide'
            }, {
              name: 'guideConfirm',
              url: '/guide-confirm',
              templateUrl: 'templates/guide/confirm.html',
              controller: 'guide.confirm'
            }, {
              name: 'search',
              url: '/search',
              templateUrl: 'templates/search/index.html',
              controller: 'search'
            }, {
              name: 'paymentPolls-paymentRequest',
              url: '/payment-polls/payment-request/:id',
              templateUrl: 'templates/payment-polls/payment-request.html',
              controller: 'question.payment-request'
            }, {
              name: 'paymentPolls-crowdfundingPaymentRequest',
              url: '/payment-polls/crowdfunding-payment-request/:id',
              templateUrl: 'templates/payment-polls/crowdfunding-payment-request.html',
              controller: 'question.payment-request'
            }, {
              name: 'petition',
              url: '/petition/:id',
              templateUrl: 'templates/petitions/petition.html',
              controller: 'petition'
            }, {
              name: 'discussion',
              url: '/discussion/:entity/:id/:comment',
              templateUrl: 'templates/question/discussion.html',
              controller: 'discussion'
            }, {
              name: 'question',
              url: '/questions/:id',
              templateUrl: 'templates/question/layout.html',
              controller: 'question'
            }, {
              name: 'questionNews',
              url: '/questions/news/:id',
              templateUrl: 'templates/question/news.html',
              controller: 'question.news'
            }, {
              name: 'questionLeaderPetition',
              url: '/question/leader-petition/:id',
              templateUrl: 'templates/question/petition.html',
              controller: 'question.leader-petition'
            }, {
              name: 'questionLeaderEvent',
              url: '/leader-event/:id',
              templateUrl: 'templates/leader-event/leader-event.html',
              controller: 'question.leader-event'
            }, {
            }];

          states.forEach(function (state) {
            if (!state.name) {
              return;
            }
            var options = {cache: !!state.cache, url: state.url};
            options.views = {
              'menuContent': {
                templateUrl: state.templateUrl
              }
            };
            if (state.controller) {
              options.views.menuContent.controller = state.controller;
            }
            $stateProvider.state('app.' + state.name, options);
          });

          //$urlRouterProvider.otherwise('/preload');

          /*$routeProvider
           .when('/', {
           templateUrl: 'templates/home/preload.html',
           controller: 'preload'
           })
           .when('/main', {
           templateUrl: 'templates/home/home.html',
           controller: 'home'
           })
           .when('/new-activities', {
           templateUrl: 'templates/home/home.html',
           controller: 'home'
           })
           .when('/login', {
           templateUrl: 'templates/session/login.html',
           controller: 'session.login'
           })
           .when('/logout', {
           templateUrl: 'templates/session/logout.html',
           controller: 'session.logout'
           })
           .when('/coming-soon', {
           templateUrl: 'templates/coming-soon.html'
           })
           .when('/terms', {
           templateUrl: 'templates/terms.html',
           controller: 'session.terms'
           })
           .when('/registration', {
           templateUrl: 'templates/session/registration.html',
           controller: 'session.registration'
           })
           .when('/registration-step2', {
           templateUrl: 'templates/session/registration-step2.html',
           controller: 'session.registration-step2'
           })
           .when('/registration-step3', {
           templateUrl: 'templates/session/registration-step3.html',
           controller: 'session.registration-step3'
           })
           .when('/questions/:id', {
           templateUrl: 'templates/question/layout.html',
           controller: 'question'
           })
           .when('/questions/news/:id', {
           templateUrl: 'templates/question/news.html',
           controller: 'question.news'
           })
           .when('/question/leader-petition/:id', {
           templateUrl: 'templates/question/petition.html',
           controller: 'question.leader-petition'
           })
           .when('/questions/educational/:id', {
           templateUrl: 'templates/question/educational-context.html',
           controller: 'question.educational-context'
           })
           .when('/questions/influences/:id', {
           templateUrl: 'templates/question/influences.html',
           controller: 'question.influences'
           })
           .when('/forgot-password', {
           templateUrl: 'templates/session/forgot-password.html',
           controller: 'session.forgot-password'
           })
           .when('/town', {
           templateUrl: 'templates/coming-soon.html'
           })
           .when('/groups', {
           controller: 'groups',
           templateUrl: 'templates/groups/my-groups.html'
           })
           .when('/groups/search', {
           controller: 'groups.search',
           templateUrl: 'templates/groups/search.html'
           })
           .when('/groups/create', {
           controller: 'groups.create',
           templateUrl: 'templates/groups/create.html'
           })
           .when('/group/:id', {
           controller: 'groups.profile',
           templateUrl: 'templates/groups/profile.html'
           })
           .when('/group/:id/join/:publicStatus/:isFieldRequired', {
           controller: 'groups.join',
           templateUrl: 'templates/groups/join.html'
           })
           .when('/messages', {
           controller: 'messages',
           templateUrl: 'templates/messages/list.html'
           })
           .when('/influences', {
           controller: 'influences',
           templateUrl: 'templates/influence/influences.html'
           })
           .when('/influences/add', {
           controller: 'influences.search',
           templateUrl: 'templates/influence/search.html'
           })
           .when('/influences/notifications', {
           controller: 'influences.notifications',
           templateUrl: 'templates/influence/notifications.html'
           })
           .when('/representatives', {
           controller: 'representatives',
           templateUrl: 'templates/representatives/list.html'
           })
           .when('/representative/:id/:storageId', {
           controller: 'representatives.profile',
           templateUrl: 'templates/representatives/profile.html'
           })
           .when('/group-petitions', {
           controller: 'home',
           templateUrl: 'templates/home/home.html'
           })
           .when('/micro-petitions/add/:type/', {
           controller: 'petitions.add',
           templateUrl: 'templates/petitions/add.html'
           })
           .when('/micro-petitions/add/:type/:group_id', {
           controller: 'petitions.add',
           templateUrl: 'templates/petitions/add.html'
           })
           .when('/group-petitions/:id', {
           controller: 'petitions.group',
           templateUrl: 'templates/petitions/group.html'
           })
           .when('/petition/:id', {
           controller: 'petition',
           templateUrl: 'templates/petitions/petition.html'
           })
           .when('/payment-polls/payment-request/:id', {
           controller: 'question.payment-request',
           templateUrl: 'templates/payment-polls/payment-request.html'
           })
           .when('/payment-polls/crowdfunding-payment-request/:id', {
           controller: 'question.payment-request',
           templateUrl: 'templates/payment-polls/crowdfunding-payment-request.html'
           })
           .when('/leader-event/:id', {
           controller: 'question.leader-event',
           templateUrl: 'templates/leader-event/leader-event.html'
           })
           .when('/poling', {
           templateUrl: 'templates/coming-soon.html'
           })
           .when('/other-services', {
           controller: 'services',
           templateUrl: 'templates/services/index.html'
           })
           .when('/profile', {
           templateUrl: 'templates/profile/profile.html',
           controller: 'profile'
           })
           .when('/profile-2', {
           templateUrl: 'templates/profile/profile-2.html',
           controller: 'profile-step2'
           })
           .when('/profile-3', {
           templateUrl: 'templates/profile/profile-3.html',
           controller: 'profile-step3'
           })
           .when('/settings', {
           templateUrl: 'templates/profile/settings.html',
           controller: 'settings'
           })
           .when('/influence/profile/:id', {
           templateUrl: 'templates/influence/profile.html',
           controller: 'influence.profile'
           })
           .when('/discussion/:entity/:id', {
           templateUrl: 'templates/question/discussion.html',
           controller: 'discussion'
           })
           .when('/discussion/:entity/:id/:comment', {
           templateUrl: 'templates/question/discussion.html',
           controller: 'discussion'
           })
           .when('/search', {
           templateUrl: 'templates/search/index.html',
           controller: 'search'
           })
           .when('/guide', {
           templateUrl: 'templates/guide/index.html',
           controller: 'guide'
           })
           .when('/guide-confirm', {
           templateUrl: 'templates/guide/confirm.html',
           controller: 'guide.confirm'
           });*/

        });

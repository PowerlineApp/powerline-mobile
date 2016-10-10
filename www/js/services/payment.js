angular.module('app.services')
  .factory('cards', function ($http, serverConfig, JsCollection, JsModel, $q, stripe) {
    return {
      load: function () {
        return $http.get(serverConfig.url + '/api/cards/').then(function (reponse) {
          return new JsCollection(reponse.data);
        });
      },
      create: function (data) {
        var deferred = $q.defer();

        stripe().card.createToken({
          name: data.name,
          number: data.number,
          cvc: data.cvc,
          exp_month: data.expired_month,
          exp_year: data.expired_year
        }, function(status, response) {
          if (response.error) {
            deferred.reject(response.error.message);
          } else {
            $http.post(serverConfig.url + '/api/cards/', {source: response.id})
              .then(function (response) {
                deferred.resolve(new JsModel(response.data));
              })
              .catch(function (error) {
                console.log('error while adding credit card:')
                console.log(error)
                deferred.reject('Server error while adding a card: '+JSON.stringify(error));
              })
            ;
          }
        });

        return deferred.promise;
      },
      remove: function (card) {
        return $http['delete'](serverConfig.url + '/api/cards/' + card.get('id'));
      }
    };
  })
  .factory('stripe', function($window, serverConfig) {
    var src = 'https://js.stripe.com/v2/';
    if (!$window.Stripe) {
      load();
    }

    function load() {
      var s = document.createElement('script');
      s.src = src;
      document.body.appendChild(s);
      s.onload = function() {
        $window.Stripe.setPublishableKey(serverConfig.stripePK);
      };
    }

    return function() {
      if (!$window.Stripe) {
        load();
      }

      return $window.Stripe;
    };
  })
;
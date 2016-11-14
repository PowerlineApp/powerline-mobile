angular.module('app.directives').directive('groupBankAccountForm', function () {
    return {
      restrict: 'E',
      scope: {
        cancel: '&',
        completed: '&',
        group: '='
      },
      templateUrl: 'templates/groups/manage-group/add-group-bank-account.html',
      controller: function ($scope, $rootScope, cards) {
        $scope.data = {stripe: {}, powerline: {}}

        $scope.countries = [
          {name: 'Austria', value: 'AT', currencies: ['EUR', 'GBP', 'USD', 'DKK', 'NOK', 'SEK']},
          {name: 'Australia', value: 'AU', currencies: ['AUD']},
          {name: 'Belgium', value: 'BE', currencies: ['EUR', 'GBP', 'USD', 'DKK', 'NOK', 'SEK']}, 
          {name: 'Canada', value: 'CA', currencies: ['CAD', 'USD']},
          {name: 'Germany', value: 'DE', currencies: ['EUR', 'GBP', 'USD', 'DKK', 'NOK', 'SEK']},
          {name: 'Denmark', value: 'DK', currencies: ['EUR', 'GBP', 'USD', 'DKK', 'NOK', 'SEK']},
          {name: 'Spain', value: 'ES', currencies: ['EUR', 'GBP', 'USD', 'DKK', 'NOK', 'SEK']},
          {name: 'Finland', value: 'FI', currencies: ['EUR', 'GBP', 'USD', 'DKK', 'NOK', 'SEK']}, 
          {name: 'France', value: 'FR', currencies: ['EUR', 'GBP', 'USD', 'DKK', 'NOK', 'SEK']},
          {name: 'United Kingdom', value: 'UK', currencies: ['EUR', 'GBP', 'USD', 'DKK', 'NOK', 'SEK']},
          {name: 'Hong Kong', value: 'HK', currencies: ['HKD']},
          {name: 'Ireland', value: 'IE', currencies: ['EUR', 'GBP', 'USD', 'DKK', 'NOK', 'SEK']},
          {name: 'Italy', value: 'IT', currencies: ['EUR', 'GBP', 'USD', 'DKK', 'NOK', 'SEK']},
          {name: 'Japan', value: 'JP', currencies: ['JPY']},
          {name: 'Luxembourg', value: 'LU', currencies: ['EUR', 'GBP', 'USD', 'DKK', 'NOK', 'SEK']},
          {name: 'Netherlands', value: 'NL', currencies: ['EUR', 'GBP', 'USD', 'DKK', 'NOK', 'SEK']},
          {name: 'Norway', value: 'NO', currencies: ['EUR', 'GBP', 'USD', 'DKK', 'NOK', 'SEK']},
          {name: 'Portugal', value: 'PT', currencies: ['EUR', 'GBP', 'USD', 'DKK', 'NOK', 'SEK']},
          {name: 'Sweden', value: 'SE', currencies: ['EUR', 'GBP', 'USD', 'DKK', 'NOK', 'SEK']},
          {name: 'Singapore', value: 'SG', currencies: ['SGD']},
          {name: 'United States', value: 'US', currencies: ['USD']}
        ]

        var presetCountry = $scope.countries[$scope.countries.length - 1]
        $scope.data.stripe = {
          account_number: '',
          routing_number: '',
          country: presetCountry,
          currency: presetCountry.currencies[0],
          account_holder_name: '',
          account_holder_type: 'company',
        }

        $scope.requireSSN = function(){
          return $scope.data.stripe.country.value == 'US'
        }

        $scope.onCountryChange = function(){
          $scope.data.stripe.currency = $scope.data.stripe.country.currencies[0]
        }

        var prefillForm = function(){
          $scope.data.powerline = {
            first_name: '',
            last_name: '',
            ssn_last_4: '',
            address_line1: $scope.group.official_address,
            address_line2: '',
            city: $scope.group.official_city,
            state: $scope.group.official_state,
            postal_code: ''
          }
        }

        $scope.$watch('group', function (val) {
            prefillForm()
        });

        $scope.submit = function () {
          $rootScope.showSpinner();
          $scope.group.addBankAccount($scope.data)
            .then(function (response) {
              $scope.completed(response);
            })
            .catch(function (error) {
              $rootScope.alert(JSON.stringify(error));
            })
            .finally(function () {
              $rootScope.hideSpinner();
            })
          ;
        };
      }
    };
  })
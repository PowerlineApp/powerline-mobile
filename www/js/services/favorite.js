angular.module('app.services').factory('favorite',
  function ($http, serverConfig) {
    return {
      load: function(){
        return $http.get(serverConfig.url + '/api/bookmarks/list/all/1').then(function(response){
          return(response.data.items)
        })
      },
      
      addBookmark: function(activity){
        var aType = activity.get('entity').type
        var aID = activity.get('entity').id
        console.log('todo')
        //$http.post(serverConfig.url + '/api/bookmarks/add/'+aType+'/'+aID)
      }
    }
  });

angular.module('app.services').factory('favorite',
  function ($http, serverConfig) {
    var _bookmarks = []
    return {
      load: function(){
        return $http.get(serverConfig.url + '/api/bookmarks/list/all/1').then(function(response){
          _bookmarks = response.data.items
          return(response.data.items)
        })
      },

      isBookmarked: function(activity){
        var bookmarkedIDs = _bookmarks.map(function(b){
          return(b.item_id)
        })
        var aID = activity.get('entity').id
        return bookmarkedIDs.includes(aID)
      },
      addBookmark: function(activity){
        var aID = activity.get('entity').id
        var aType = activity.get('entity').type
        if(aType == 'micro-petition'){
          var hasTitle = activity.get('title') && activity.get('title').length > 0
          if(hasTitle)
            aType = 'petition'
          else
            aType = 'post'
        }
        var that = this
        
        $http.post(serverConfig.url + '/api/bookmarks/add/'+aType+'/'+aID).then(function(){
          that.load()
        })
      },

      removeBookmark: function(activity){
        var that = this
        var aID = activity.get('entity').id
        var bookmark =  _bookmarks.find(function(b){
          return(b.item_id = aID)
        })
        var bID = bookmark.id

        $http.delete(serverConfig.url + '/api/bookmarks/remove/'+bID).then(function(){
          that.load()
        })        
      }
    }
  });

function PushNotificationCallbacks($location, $timeout) {
  // we must use global app.* variable to store callbacks
  // becuase push notification plugin is from phonegap, which uses 'app'

  app = {
    view: function(data){
    console.log('app.view callback fired')
    console.log(JSON.stringify(data))
    console.log(data)

      if(data.additionalData && data.additionalData.entity){

        if(data.additionalData.entity.target.type == 'post'){
          $location.path('/main') // tweak to have back button in detail
          $timeout(function(){
            $location.path('/post/' + data.additionalData.entity.target.id);
          }, 0);
        }

      }
    },

    mute: function(data){
      console.log('app.mute callback fired')
      console.log(JSON.stringify(data))
      console.log(data)      
    }
  }
}
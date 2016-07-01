angular.module('app.services').factory('socialActivity', function ($http, serverConfig, SocialActivityTabManager, SocialActivityModel, JsModel, JsCollection, follows, $q) {

  var activities = new JsCollection([], {
    model: SocialActivityModel,
    comparator: function (activity) {
      return -activity.get('created_at').getTime();
    }
  });
  activities.prepare = function () {
    SocialActivityTabManager.prepare(this);

    return this;
  };
  activities.add = function (models) {
    var self = this;
    models = _.isArray(models) ? models : [models];
    _(models).each(function (data) {
      var model = self.get(data[self.id]);
      if (model) {
        model.clear();
        for (var key in data) {
          model.set(key, data[key]);
        }
        model.build();
      } else {
        model = new self.model(data);
        self.models.push(model);
        self.byId[model.get(self.id)] = model;
      }
    });

    return this.sort();
  };
  activities.serverTimeDiff = 0;

  return {
    getActivities: function () {
      return activities;
    },
    load: function () {
      var data = [];
      return $q.all([
        follows.load(),
        $http.get(serverConfig.url + '/api/v2/user/social-activities').then(function (response) {
          data = response.data;
          activities.serverTimeDiff = (new Date(response.headers('Server-Time'))).getTime() - Date.now();
        })
      ]).finally(function () {
        try{
          activities.add(data.payload).prepare();
        } catch(e){
          console.log('failed to prepare social activities')
          console.log(e)
          console.log(e.stack)
        }
      });
    }
  };
})
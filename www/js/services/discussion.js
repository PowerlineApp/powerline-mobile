angular.module('app.services').factory('discussion',function (serverConfig, Comment, $http, posts, userPetitions) {

  var statusByAction = {
    'up': 1,
    'down': -1,
    'delete': 0
  };

  var expLink = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
  var regexLink = new RegExp(expLink);

  function getChildrenCount(item) {
    return _(item.children).reduce(function (memo, item) {
      memo += getChildrenCount(item);
      return memo;
    }, item.children.length);
  }

  function buildTree(data) {
    var root,
      byId = {}
    ;
    _(data).each(function (item) {
      item.children = [];
      item.children_count = 0;
      byId[item.id] = item;
      if (!item.parent_comment) {
        root = item;
      }
      var links = item.comment_body.match(regexLink);
      if (links) {
        item.link = links[0];
      }
    });

    _(data).each(function (item) {
      if (byId[item.parent_comment]) {
        byId[item.parent_comment].children.push(item);
        item.parent = byId[item.parent_comment];
      }
    });

    _(byId).each(function (item) {
      item.children = _(item.children).sortBy(function (child) {
        return -child.created_at_date.getTime();
      });
      item.children_count = getChildrenCount(item);
    });

    return {root: root, byId: byId};
  }

  function getUrl(entity, id) {
      return serverConfig.url + '/api/' + entity + '/' + id + '/comments/';
  }

  return {
    loadTree: function (entity, id) {
      var getCommentsRequest;
      if(entity == 'posts')
        getCommentsRequest = posts.getComments(id)
      else if(entity == 'user-petitions')
        getCommentsRequest = userPetitions.getComments(id)
      else
        getCommentsRequest = $http.get(getUrl(entity, id)).then(function(response){
          return response.data
        })

      return getCommentsRequest.then(function (comments) {
        return buildTree(_(comments).map(function (item) {
          return new Comment(item);
        }));
      });
    },

    createComment: function (entity, id, data) {
      if(entity == 'posts')
        return posts.addComment(id, data.parent_comment, data.comment_body)
      else if(entity == 'user-petitions')
        return userPetitions.addComment(id, data.parent_comment, data.comment_body)
      else
        return $http.post(getUrl(entity, id), data).then(function (response) {
          return response.data;
        });
    },

    rate: function (comment, action) {
      comment.rate_status = statusByAction[action];

      return $http.post(serverConfig.url + '/api/poll/comments/rate/' + comment.id + '/' + action).then(function (response) {
        for (var prop in response.data) {
          comment[prop] = response.data[prop];
        }
        return comment.setup();
      });
    },

    update: function(entity, id, comment){
      if(entity == 'posts')
        return posts.updateComment(comment.id, comment.comment_body)
      else if(entity == 'user-petitions')
        return userPetitions.updateComment(comment.id, comment.comment_body)
      else
        return $http.put(serverConfig.url + '/api/' + entity + '/' + id + '/comments/' + comment.id, {comment_body: comment.comment_body});
    },

    delete: function(entity, id, comment_id){
      if(entity == 'posts')
        return posts.deleteComment(comment_id)
      else if(entity == 'user-petitions')
        return userPetitions.deleteComment(comment_id)
      else
        return $http.delete(serverConfig.url + '/api/' + entity + '/' + id + '/comments/' + comment_id);
    }
  };
}).factory('Comment', function () {
  var Comment = function (data) {
    _.extend(this, data);

    if (this.privacy === 1) {
      this.user = {
        username: 'Someone',
        full_name: 'Someone'
      };
    }
    this.setup();
  };

  Comment.prototype.setup = function () {
    this.rate_up = (this.rates_count || 0)/2 + this.rate_sum/2;
    this.rate_down = (this.rates_count || 0)/2 - this.rate_sum/2;
    this.created_at_date = new Date(this.created_at);
    return this;
  };

  return Comment;
});

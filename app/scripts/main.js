(function(){
'use strict';

$.fn.serializeObject = function(){
  return this.serializeArray().reduce(function(acum, i){
    acum[i.name] = i.value;
    return acum;
  }, {});
};

var Post = Parse.Object.extend({
  className: 'Post'
});

var Comment = Parse.Object.extend({
  className: 'Comment'
});

var PostCreateView = Parse.View.extend({
  template: _.template( $('[data-template-name="posts/create"]').text() ),

  initialize: function(){
    this.model = new Post();
    window.post = this.model;
    this.render();
    _.bindAll(this, 'render');
    this.model.on('change', this.render);
  },

  remove: function(){
    this.$el.remove();
    this.model.off('change', this.render);
    return this;
  },

  events: {
    'submit': 'createPost',
    'change input[type=file]': 'uploadFile',
  },

  uploadFile: function(e){
    var file = $(e.target)[0].files[0];

    var parseFile = new Parse.File(file.name, file);
    var self = this;
    parseFile.save().then(function(){
      self.model.set('image', parseFile.url());
    });
  },

  createPost: function(e){
    e.preventDefault();
    this.model.set({
      title: this.$('.title').val(),
      url: this.$('.url').val(),
      author: Parse.User.current()
    });

    post.save().then(function(){
      App.navigate('posts', {trigger: true});
    });
  },

  render: function(){
    this.$el.html( this.template({model: this.model.toJSON()}) );
  }
});

var PostsIndexView = Parse.View.extend({
  template: _.template( $('[data-template-name="posts/index"]').text() ),

  initialize: function(){
    this.render();
  },

  render: function(){
    this.$el.html( this.template({posts: this.collection.toJSON()}) );
  }
});

var AppRouter = Parse.Router.extend({
  routes: {
    '': 'index',
    'login': 'login',
    'posts/create': 'postsCreate',
    'posts': 'postsIndex'
  },

  postsCreate: function(){
    new PostCreateView({el: 'body'});
  },

  postsIndex: function(){
    var query = new Parse.Query(Post);
    query.equalTo('author', Parse.User.current());
    var collection = query.collection();
    collection.fetch().then(function(){
      new PostsIndexView({
        collection: collection,
        el: 'body'
      });
    });
  }
});

$(document).ready(function() {

  Parse.initialize("qwWMKwuKnWtem5dXUWeOWNuPiMRUmgafHvDFD0kY", "PxA56CBpMhzxdMd9CkkSMdHDMNW5IWQdkw1PkiI9");

  window.App = new AppRouter();
  Parse.history.start();
});

})();

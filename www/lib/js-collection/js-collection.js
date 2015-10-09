(function (window) {'use strict';

var extend = function (properties) {
  properties = properties || {};

  var parent = this;
  var child;

  if (_.has(properties, 'constructor')) {
    child = properties.constructor;
  } else {
    child = function () {
      return parent.apply(this, arguments);
    };
  }

  _.extend(child, parent);

  var Surrogate = function () {
    this.constructor = child;
  };
  Surrogate.prototype = parent.prototype;
  child.prototype = new Surrogate;

  _.extend(child.prototype, properties);

  child.__super__ = parent.prototype;

  return child;
};


var standardParsers = {
  'date': function (val) {
    return val ? new Date(val) : null;
  }
};

var Model = function (attributes, options) {
  this.attributes = {};
  this.options = options || {};

  if (this.options.parsers) {
    for (key in this.options.parsers) {
      this.parsers[key] = this.options.parsers[key];
    }
  }

  for (key in this.parsers) {
    if (typeof this.parsers[key] === 'string') {
      this.parsers[key] = standardParsers[this.parsers[key]];
    }
  }

  attributes || (attributes = {});
  for (var key in attributes) {
    this.set(key, attributes[key]);
  }

  this.initialize.apply(this, arguments);
};

_.extend(Model.prototype, {

  initialize: function () {
  },

  parsers: {},

  getAttributes: function (options) {
    return _.clone(this.attributes);
  },

  get: function (attr) {
    return this.attributes[attr];
  },

  has: function (attr) {
    return this.get(attr) != null;
  },

  set: function (key, val) {
    this.attributes[key] = this.parse(key, val);

    return this;
  },

  parse: function (key, val) {
    if (this.parsers[key]) {
      return this.parsers[key](val);
    }

    return val;
  },

  unset: function (key) {
    this.attributes[key] = null;

    return this;
  },

  clear: function () {
    this.attributes = {};

    return this;
  },

  clone: function () {
    return new this.constructor(this.attributes, this.options);
  },

  toJSON: function () {
    return _.clone(this.attributes);
  }
});

Model.extend = extend;

var Collection = function (models, options) {
  this.reset();
  this.options = options || {};
  if (this.options.model) {
    this.model = this.options.model;
  }
  if (this.options.id) {
    this.id = this.options.id;
  }
  models || (models = []);

  this.add(models);
  this.initialize.apply(this, arguments);
};

_.extend(Collection.prototype, {

  initialize: function () {
  },

  id: 'id',

  model: Model,

  toJSON: function (options) {
    return this.map(function (model) {
      return model.toJSON(options);
    });
  },

  get: function (id) {
    return this.byId[id];
  },

  set: function (models) {
    return this.reset().add(models);
  },

  add: function (models) {
    var self = this;
    models = _.isArray(models) ? models : [models];
    _(models).each(function (data) {
      if (model = self.get(data[self.id])) {
        model.clear();
        for (var key in data) {
          model.set(key, data[key]);
        }
      } else {
        var model = new self.model(data);
        self.models.push(model);
        self.byId[model.get(self.id)] = model;
      }
    });

    return this.sort();
  },

  remove: function (model) {
    if (_.isArray(model)) {
      for (var i = 0, length = model.length; i < length; i++) {
        this.resetModel(model[i]);
      }
    } else {
      this.resetModel(model);
    }
    return this;
  },

  sort: function (comparator) {
    if (!comparator) {
      comparator = this.options.comparator || this.comparator;
    }

    if (!comparator) {
      return this;
    }

    this.models = this.sortBy(comparator);

    return this;
  },

  reset: function () {
    this.models = [];
    this.byId = {};
    return this;
  },
  resetModel: function (model) {
    this.byId[model.get(this.id)] = null;
    var index = this.indexOf(model);
    this.models.splice(index, 1);
  }
});

var methods = ['forEach', 'each', 'map', 'collect', 'reduce', 'foldl',
  'inject', 'reduceRight', 'foldr', 'find', 'detect', 'filter', 'select',
  'reject', 'every', 'all', 'some', 'any', 'include', 'contains', 'invoke',
  'max', 'min', 'toArray', 'size', 'first', 'head', 'take', 'initial', 'rest',
  'tail', 'drop', 'last', 'without', 'difference', 'indexOf', 'shuffle',
  'lastIndexOf', 'isEmpty', 'chain', 'sample', 'partition', 'findIndex',
  'groupBy', 'countBy', 'sortBy', 'indexBy'];

_.each(methods, function (method) {
  if (!_[method]) return;
  Collection.prototype[method] = function () {
    var args = _.toArray(arguments);
    args.unshift(this.models);
    return _[method].apply(_, args);
  };
});

Collection.extend = extend;

window.JsModel = Model;window.JsCollection = Collection;
})(window);
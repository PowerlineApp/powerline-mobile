angular.module('app.services').factory('youtube',function () {

  var youtubeImage = 'http://img.youtube.com/vi/';

  return {
    parseId: function (url) {
      //noinspection JSUnresolvedFunction
      return (/(&|\?)v=(.+?)(&|$)/.exec((url || '').trimRight()) || [undefined, undefined, null])[2];
    },

    generatePreviewLink: function (id, previewId) {
      return !id ? null : youtubeImage + id + '/' + (previewId || 0) + '.jpg';
    }
  };

}).factory('formUtils', function () {
  return {
    getErrorFields: function (form) {
      var props = [];
      _(form.$error).each(function (fields) {
        if (fields) {
          _(fields).each(function (field) {
            if (!_.contains(props, field)) {
              props.push(field);
            }
          });
        }
      });
      return props;
    }
  };
}).factory('errorFormMessage',function (defaultsFormErrors) {

  return function (form, errors) {
    var result = [], unknownError = false;
    errors = _.defaults(errors || {}, defaultsFormErrors);

    _(form.$error).each(function (fields, errorKey) {
      if (fields) {
        if (errors[errorKey]) {
          result.push(errors[errorKey]);
        } else {
          unknownError = true;
        }
      }
    });

    if (!result.length || unknownError) {
      result.push(errors.defaultError);
    }

    return result;
  };

}).factory('getFormData',function () {

  function defaultTransform(value) {
    return _.isObject(value) ? _.clone(value) : value;
  }

  function getDataKey(transformer, originalKey) {
    if (_.isString(transformer)) {
      return transformer;
    } else if (_.isArray(transformer)) {
      return transformer[0];
    }
    return originalKey;
  }

  function getDataTransformer(transformer) {
    if (_.isFunction(transformer)) {
      return transformer;
    } else if (_.isArray(transformer)) {
      return transformer[1];
    }
    return defaultTransform;
  }

  return function (form, transformers) {
    transformers = transformers || {};
    var data = {};
    _(form).each(function (value, key) {
      if (_.isObject(value) && value.$name === key) {
        var dataKey = getDataKey(transformers[key], key);
        var dataTransformer = getDataTransformer(transformers[key]);
        data[dataKey] = dataTransformer(value.$modelValue);
      }
    });
    return data;
  };

}).factory('camelcase2underscore',function () {
  return function (string) {
    return string.replace(/([A-Z])/g, function ($1) {
      return '_' + $1.toLowerCase();
    });
  };
}).factory('formatOptions',function () {

  var colors = ['#54c5ff', '#ba3830', '#4fb0f3', '#dbfa08', '#08fac4'];

  return function (options) {
    var code = 65;
    var maxOption = _(options).max(function (option) {
      return option.votes_count;
    });

    var votes = _(options).reduce(function (memo, option) {
      return memo + option.votes_count;
    }, 0);

    var colorId = 0;
    _(options).each(function (option) {
      option.title = String.fromCharCode(code++);
      option.color = colors[colorId++];

      if (!colors[colorId]) {
        colorId = 0;
      }

      if (maxOption.votes_count) {
        option.width = option.votes_count * 100 / maxOption.votes_count;
        option.percent = option.votes_count * 100 / votes;
      } else {
        option.percent = 0;
      }
      if (!option.width) {
        option.width = 1;
      }
    });

    return votes;
  };
}).factory('iParse',function () {

  var hashTagsRegExp = /(\s|^)(#[\w-]+)/g;

  return {
    getTimeString: function (value) {
      return String(value).match(/\s(\d{1,2}:\d{1,2})/)[1];
    },
    wrapHashTags: function(value) {
      return String(value).replace(hashTagsRegExp, '$1<hash-tag>$2</hash-tag>');
    },
    wrapLinks: function(value) {
      return Autolinker.link(value);
    },
    htmlEscape: function(value) {
      return _.escape(value);
    }
  };
}).value('defaultsFormErrors', {
  required: 'Fill all required fields.',
  defaultError: 'Invalid data.',
  date: 'Invalid date.',
  email: 'Invalid email.',
  url: 'Invalid URL.'
}).value('stateAbbreviations', {
  US: {
    'Alabama': 'AL',
    'Alaska': 'AK',
    'Arizona': 'AZ',
    'Arkansas': 'AR',
    'California': 'CA',
    'Colorado': 'CO',
    'Connecticut': 'CT',
    'Delaware': 'DE',
    'Florida': 'FL',
    'Georgia': 'GA',
    'Hawaii': 'HI',
    'Idaho': 'ID',
    'Illinois': 'IL',
    'Indiana': 'IN',
    'Iowa': 'IA',
    'Kansas': 'KS',
    'Kentucky': 'KY',
    'Louisiana': 'LA',
    'Maine': 'ME',
    'Maryland': 'MD',
    'Massachusetts': 'MA',
    'Michigan': 'MI',
    'Minnesota': 'MN',
    'Mississippi': 'MS',
    'Missouri': 'MO',
    'Montana': 'MT',
    'Nebraska': 'NE',
    'Nevada': 'NV',
    'New Hampshire': 'NH',
    'New Jersey': 'NJ',
    'New Mexico': 'NM',
    'New York': 'NY',
    'North Carolina': 'NC',
    'North Dakota': 'ND',
    'Ohio': 'OH',
    'Oklahoma': 'OK',
    'Oregon': 'OR',
    'Pennsylvania': 'PA',
    'Rhode Island': 'RI',
    'South Carolina': 'SC',
    'South Dakota': 'SD',
    'Tennessee': 'TN',
    'Texas': 'TX',
    'Utah': 'UT',
    'Vermont': 'VT',
    'Virginia': 'VA',
    'Washington': 'WA',
    'West Virginia': 'WV',
    'Wisconsin': 'WI',
    'Wyoming': 'WY',
    'District of Columbia': 'DC'
  }
});

angular.module('app.services').factory('youtube',function () {

  var youtubeImage = 'http://img.youtube.com/vi/';

  return {
    parseId: function (url) {
      var yid = null
      //noinspection JSUnresolvedFunction
      if(url && url.indexOf('youtu.be') >= 0){ // https://youtu.be/iOmgD_aCSPM
        yid =  _.last(url.split('/'))
      } else // https://www.youtube.com/watch?v=iOmgD_aCSPM
        yid =  (/(&|\?)v=(.+?)(&|$)/.exec((url || '').trimRight()) || [undefined, undefined, null])[2];
      return yid
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
}).factory('Sha1',function () {
    /* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
  /*  SHA-1 implementation in JavaScript                  (c) Chris Veness 2002-2014 / MIT Licence  */
  /*                                                                                                */
  /*  - see http://csrc.nist.gov/groups/ST/toolkit/secure_hashing.html                              */
  /*        http://csrc.nist.gov/groups/ST/toolkit/examples.html                                    */
  /* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

  /* jshint node:true *//* global define, escape, unescape */
  'use strict';


  /**
   * SHA-1 hash function reference implementation.
   *
   * @namespace
   */
  var Sha1 = {};


  /**
   * Generates SHA-1 hash of string.
   *
   * @param   {string} msg - (Unicode) string to be hashed.
   * @returns {string} Hash of msg as hex character string.
   */
  Sha1.hash = function(msg) {
      // convert string to UTF-8, as SHA only deals with byte-streams
      msg = msg.utf8Encode();

      // constants [§4.2.1]
      var K = [ 0x5a827999, 0x6ed9eba1, 0x8f1bbcdc, 0xca62c1d6 ];

      // PREPROCESSING

      msg += String.fromCharCode(0x80);  // add trailing '1' bit (+ 0's padding) to string [§5.1.1]

      // convert string msg into 512-bit/16-integer blocks arrays of ints [§5.2.1]
      var l = msg.length/4 + 2; // length (in 32-bit integers) of msg + ‘1’ + appended length
      var N = Math.ceil(l/16);  // number of 16-integer-blocks required to hold 'l' ints
      var M = new Array(N);

      for (var i=0; i<N; i++) {
          M[i] = new Array(16);
          for (var j=0; j<16; j++) {  // encode 4 chars per integer, big-endian encoding
              M[i][j] = (msg.charCodeAt(i*64+j*4)<<24) | (msg.charCodeAt(i*64+j*4+1)<<16) |
                  (msg.charCodeAt(i*64+j*4+2)<<8) | (msg.charCodeAt(i*64+j*4+3));
          } // note running off the end of msg is ok 'cos bitwise ops on NaN return 0
      }
      // add length (in bits) into final pair of 32-bit integers (big-endian) [§5.1.1]
      // note: most significant word would be (len-1)*8 >>> 32, but since JS converts
      // bitwise-op args to 32 bits, we need to simulate this by arithmetic operators
      M[N-1][14] = ((msg.length-1)*8) / Math.pow(2, 32); M[N-1][14] = Math.floor(M[N-1][14]);
      M[N-1][15] = ((msg.length-1)*8) & 0xffffffff;

      // set initial hash value [§5.3.1]
      var H0 = 0x67452301;
      var H1 = 0xefcdab89;
      var H2 = 0x98badcfe;
      var H3 = 0x10325476;
      var H4 = 0xc3d2e1f0;

      // HASH COMPUTATION [§6.1.2]

      var W = new Array(80); var a, b, c, d, e;
      for (var i=0; i<N; i++) {

          // 1 - prepare message schedule 'W'
          for (var t=0;  t<16; t++) W[t] = M[i][t];
          for (var t=16; t<80; t++) W[t] = Sha1.ROTL(W[t-3] ^ W[t-8] ^ W[t-14] ^ W[t-16], 1);

          // 2 - initialise five working variables a, b, c, d, e with previous hash value
          a = H0; b = H1; c = H2; d = H3; e = H4;

          // 3 - main loop
          for (var t=0; t<80; t++) {
              var s = Math.floor(t/20); // seq for blocks of 'f' functions and 'K' constants
              var T = (Sha1.ROTL(a,5) + Sha1.f(s,b,c,d) + e + K[s] + W[t]) & 0xffffffff;
              e = d;
              d = c;
              c = Sha1.ROTL(b, 30);
              b = a;
              a = T;
          }

          // 4 - compute the new intermediate hash value (note 'addition modulo 2^32')
          H0 = (H0+a) & 0xffffffff;
          H1 = (H1+b) & 0xffffffff;
          H2 = (H2+c) & 0xffffffff;
          H3 = (H3+d) & 0xffffffff;
          H4 = (H4+e) & 0xffffffff;
      }

      return Sha1.toHexStr(H0) + Sha1.toHexStr(H1) + Sha1.toHexStr(H2) +
            Sha1.toHexStr(H3) + Sha1.toHexStr(H4);
  };


  /**
   * Function 'f' [§4.1.1].
   * @private
   */
  Sha1.f = function(s, x, y, z)  {
      switch (s) {
          case 0: return (x & y) ^ (~x & z);           // Ch()
          case 1: return  x ^ y  ^  z;                 // Parity()
          case 2: return (x & y) ^ (x & z) ^ (y & z);  // Maj()
          case 3: return  x ^ y  ^  z;                 // Parity()
      }
  };

  /**
   * Rotates left (circular left shift) value x by n positions [§3.2.5].
   * @private
   */
  Sha1.ROTL = function(x, n) {
      return (x<<n) | (x>>>(32-n));
  };


  /**
   * Hexadecimal representation of a number.
   * @private
   */
  Sha1.toHexStr = function(n) {
      // note can't use toString(16) as it is implementation-dependant,
      // and in IE returns signed numbers when used on full words
      var s="", v;
      for (var i=7; i>=0; i--) { v = (n>>>(i*4)) & 0xf; s += v.toString(16); }
      return s;
  };


  /* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */


  /** Extend String object with method to encode multi-byte string to utf8
   *  - monsur.hossa.in/2012/07/20/utf-8-in-javascript.html */
  if (typeof String.prototype.utf8Encode == 'undefined') {
      String.prototype.utf8Encode = function() {
          return unescape( encodeURIComponent( this ) );
      };
  }

  /** Extend String object with method to decode utf8 string to multi-byte */
  if (typeof String.prototype.utf8Decode == 'undefined') {
      String.prototype.utf8Decode = function() {
          try {
              return decodeURIComponent( escape( this ) );
          } catch (e) {
              return this; // invalid UTF-8? return as-is
          }
      };
  }


  /* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
  if (typeof module != 'undefined' && module.exports) module.exports = Sha1; // CommonJs export
  if (typeof define == 'function' && define.amd) define([], function() { return Sha1; }); // AMD

  return Sha1
})

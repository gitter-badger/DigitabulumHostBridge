// Generated by CoffeeScript 1.7.1

/*!
@license
underscore.object.plus 1.0.0
https://github.com/lamgavin/underscore.object.plus

Copyright 2014 Gavin Lam and other contributors
Released under the MIT license
 */

(function() {
  var $_, jQuery, root, _,
    __slice = [].slice;

  root = typeof exports !== "undefined" && exports !== null ? exports : this;

  _ = root._ || require('underscore');

  jQuery = root.jQuery;

  $_ = {};


  /*
  Below are some functions ported from jQuery,
  aims at porting the extend function from it

  url: http://code.jquery.com/jquery-2.1.0.js
  version: 2.1.0
  date fetched: 01 April 2014
   */

  $_.isWindow = jQuery != null ? jQuery.isWindow : function(object) {
    return (object != null) && object === object.window;
  };

  $_.isPlainObject = jQuery != null ? jQuery.isPlainObject : function(object) {
    var constructor, e;
    if (!_.isObject(object) || object.nodeType || _.isWindow(object)) {
      return false;
    }
    try {
      constructor = object.constructor;
      if (constructor && !Object.hasOwnProperty.call(constructor.prototype, 'isPrototypeOf')) {
        return false;
      }
    } catch (_error) {
      e = _error;
      return false;
    }
    return true;
  };

  $_._extend = _._extend || _.extend;

  $_.extend = jQuery != null ? jQuery.extend : function() {
    var argv, clone, copy, copyIsArray, deep, i, length, name, options, src, target;
    argv = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    target = argv[0] || {};
    i = 1;
    length = argv.length;
    deep = false;
    if (typeof target === 'boolean') {
      deep = target;
      target = argv[i] || {};
      i++;
    }
    if (typeof target !== 'object' && !_.isFunction(target)) {
      target = {};
    }
    if (length === i) {
      target = this;
      i--;
    }
    while (i < length) {
      if ((options = arguments[i]) !== null) {
        for (name in options) {
          src = target[name];
          copy = options[name];
          if (target === copy) {
            continue;
          }
          if (deep && copy && (_.isPlainObject(copy) || (copyIsArray = _.isArray(copy)))) {
            if (copyIsArray) {
              copyIsArray = false;
              clone = src && _.isArray(src) ? src : [];
            } else {
              clone = src && _.isPlainObject(src) ? src : {};
            }
            target[name] = _.extend(deep, clone, copy);
          } else if (copy !== void 0) {
            target[name] = copy;
          }
        }
      }
      i++;
    }
    return target;
  };


  /*
  Above are some functions ported from jQuery,
  aims at porting the extend function from it
   */

  $_._isObject = _._isObject || _.isObject;

  $_.isObject = function(object, strict) {
    var isObject;
    if (strict == null) {
      strict = false;
    }
    if (!strict) {
      return _._isObject(object);
    }
    isObject = _.isObject(object);
    isObject &= !_.isArray(object);
    isObject &= !_.isFunction(object);
    return isObject;
  };

  $_.isTypes = function() {
    var isTypes, object, type, types, _i, _len;
    object = arguments[0], types = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    types = _.flatten(types);
    isTypes = false;
    for (_i = 0, _len = types.length; _i < _len; _i++) {
      type = types[_i];
      if (isTypes) {
        break;
      }
      isTypes = Object.prototype.toString.call(object) === ("[object " + type + "]");
    }
    return isTypes;
  };

  $_.objects = function(object, strict) {
    var key, names, value;
    if (strict == null) {
      strict = false;
    }
    names = (function() {
      var _results;
      _results = [];
      for (key in object) {
        value = object[key];
        if (_.isObject(value, strict)) {
          _results.push(key);
        }
      }
      return _results;
    })();
    return names.sort();
  };

  $_.arrays = function(object) {
    var key, names, value;
    names = (function() {
      var _results;
      _results = [];
      for (key in object) {
        value = object[key];
        if (_.isArray(value)) {
          _results.push(key);
        }
      }
      return _results;
    })();
    return names.sort();
  };

  $_.types = function() {
    var key, names, object, types, value;
    object = arguments[0], types = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    names = (function() {
      var _results;
      _results = [];
      for (key in object) {
        value = object[key];
        if (_.isTypes(value, types)) {
          _results.push(key);
        }
      }
      return _results;
    })();
    return names.sort();
  };

  $_._pick = _._pick || _.pick;

  $_.pick = $_.pickNested = $_.pickRecursive = function() {
    var argv, copy, key, keys, object, result, value;
    argv = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    object = argv[0], keys = argv[1];
    if (!_.isObject(keys, true)) {
      return _._pick.apply(this, argv);
    }
    copy = {};
    for (key in keys) {
      value = keys[key];
      if (!_.isObject(value)) {
        if (object[key] != null) {
          copy[key] = object[key];
        }
      } else {
        result = _.pick(object[key], value);
        if (!_.isEmpty(result)) {
          copy[key] = result;
        }
      }
    }
    return copy;
  };

  $_._omit = _._omit || _.omit;

  $_.omit = $_.omitNested = $_.omitRecursive = function() {
    var argv, copy, key, keys, object, result, value;
    argv = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    object = argv[0], keys = argv[1];
    if (!_.isObject(keys, true)) {
      return _._omit.apply(this, argv);
    }
    copy = {};
    for (key in object) {
      value = object[key];
      if (keys[key] == null) {
        copy[key] = value;
      } else if (_.isObject(keys[key])) {
        result = _.omit(value, keys[key]);
        if (!_.isEmpty(result)) {
          copy[key] = result;
        }
      }
    }
    return copy;
  };

  _.mixin($_);

  if (typeof module !== "undefined" && module !== null) {
    module.exports = _;
  }

}).call(this);

//# sourceMappingURL=underscore.object.plus.map

(() => {
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };

  // ../window-shim.js
  var require_window_shim = __commonJS({
    "../window-shim.js"(exports, module) {
      module.exports = typeof window !== "undefined" ? window : {};
    }
  });

  // node_modules/object-assign/index.js
  var require_object_assign = __commonJS({
    "node_modules/object-assign/index.js"(exports, module) {
      "use strict";
      var getOwnPropertySymbols = Object.getOwnPropertySymbols;
      var hasOwnProperty = Object.prototype.hasOwnProperty;
      var propIsEnumerable = Object.prototype.propertyIsEnumerable;
      function toObject(val) {
        if (val === null || val === void 0) {
          throw new TypeError("Object.assign cannot be called with null or undefined");
        }
        return Object(val);
      }
      function shouldUseNative() {
        try {
          if (!Object.assign) {
            return false;
          }
          var test1 = new String("abc");
          test1[5] = "de";
          if (Object.getOwnPropertyNames(test1)[0] === "5") {
            return false;
          }
          var test2 = {};
          for (var i = 0; i < 10; i++) {
            test2["_" + String.fromCharCode(i)] = i;
          }
          var order2 = Object.getOwnPropertyNames(test2).map(function(n) {
            return test2[n];
          });
          if (order2.join("") !== "0123456789") {
            return false;
          }
          var test3 = {};
          "abcdefghijklmnopqrst".split("").forEach(function(letter) {
            test3[letter] = letter;
          });
          if (Object.keys(Object.assign({}, test3)).join("") !== "abcdefghijklmnopqrst") {
            return false;
          }
          return true;
        } catch (err) {
          return false;
        }
      }
      module.exports = shouldUseNative() ? Object.assign : function(target, source) {
        var from;
        var to = toObject(target);
        var symbols;
        for (var s = 1; s < arguments.length; s++) {
          from = Object(arguments[s]);
          for (var key in from) {
            if (hasOwnProperty.call(from, key)) {
              to[key] = from[key];
            }
          }
          if (getOwnPropertySymbols) {
            symbols = getOwnPropertySymbols(from);
            for (var i = 0; i < symbols.length; i++) {
              if (propIsEnumerable.call(from, symbols[i])) {
                to[symbols[i]] = from[symbols[i]];
              }
            }
          }
        }
        return to;
      };
    }
  });

  // node_modules/inherits/inherits_browser.js
  var require_inherits_browser = __commonJS({
    "node_modules/inherits/inherits_browser.js"(exports, module) {
      if (typeof Object.create === "function") {
        module.exports = function inherits(ctor, superCtor) {
          ctor.super_ = superCtor;
          ctor.prototype = Object.create(superCtor.prototype, {
            constructor: {
              value: ctor,
              enumerable: false,
              writable: true,
              configurable: true
            }
          });
        };
      } else {
        module.exports = function inherits(ctor, superCtor) {
          ctor.super_ = superCtor;
          var TempCtor = function() {
          };
          TempCtor.prototype = superCtor.prototype;
          ctor.prototype = new TempCtor();
          ctor.prototype.constructor = ctor;
        };
      }
    }
  });

  // ../path-shim.js
  var require_path_shim = __commonJS({
    "../path-shim.js"(exports) {
      exports.join = function() {
        return Array.prototype.slice.call(arguments).filter(Boolean).join("/").replace(/\/{2,}/g, "/");
      };
      exports.default = exports;
    }
  });

  // node_modules/url-join/lib/url-join.js
  var require_url_join = __commonJS({
    "node_modules/url-join/lib/url-join.js"(exports, module) {
      (function(name, context, definition) {
        if (typeof module !== "undefined" && module.exports) module.exports = definition();
        else if (typeof define === "function" && define.amd) define(definition);
        else context[name] = definition();
      })("urljoin", exports, function() {
        function normalize(strArray) {
          var resultArray = [];
          if (strArray[0].match(/^[^/:]+:\/*$/) && strArray.length > 1) {
            var first = strArray.shift();
            strArray[0] = first + strArray[0];
          }
          if (strArray[0].match(/^file:\/\/\//)) {
            strArray[0] = strArray[0].replace(/^([^/:]+):\/*/, "$1:///");
          } else {
            strArray[0] = strArray[0].replace(/^([^/:]+):\/*/, "$1://");
          }
          for (var i = 0; i < strArray.length; i++) {
            var component = strArray[i];
            if (typeof component !== "string") {
              throw new TypeError("Url must be a string. Received " + component);
            }
            if (component === "") {
              continue;
            }
            if (i > 0) {
              component = component.replace(/^[\/]+/, "");
            }
            if (i < strArray.length - 1) {
              component = component.replace(/[\/]+$/, "");
            } else {
              component = component.replace(/[\/]+$/, "/");
            }
            resultArray.push(component);
          }
          var str = resultArray.join("/");
          str = str.replace(/\/(\?|&|#[^!])/g, "$1");
          var parts = str.split("?");
          str = parts.shift() + (parts.length > 0 ? "?" : "") + parts.join("&");
          return str;
        }
        return function() {
          var input;
          if (typeof arguments[0] === "object") {
            input = arguments[0];
          } else {
            input = [].slice.call(arguments);
          }
          return normalize(input);
        };
      });
    }
  });

  // node_modules/events/events.js
  var require_events = __commonJS({
    "node_modules/events/events.js"(exports, module) {
      function EventEmitter() {
        this._events = this._events || {};
        this._maxListeners = this._maxListeners || void 0;
      }
      module.exports = EventEmitter;
      EventEmitter.EventEmitter = EventEmitter;
      EventEmitter.prototype._events = void 0;
      EventEmitter.prototype._maxListeners = void 0;
      EventEmitter.defaultMaxListeners = 10;
      EventEmitter.prototype.setMaxListeners = function(n) {
        if (!isNumber(n) || n < 0 || isNaN(n))
          throw TypeError("n must be a positive number");
        this._maxListeners = n;
        return this;
      };
      EventEmitter.prototype.emit = function(type) {
        var er, handler, len, args, i, listeners;
        if (!this._events)
          this._events = {};
        if (type === "error") {
          if (!this._events.error || isObject(this._events.error) && !this._events.error.length) {
            er = arguments[1];
            if (er instanceof Error) {
              throw er;
            } else {
              var err = new Error('Uncaught, unspecified "error" event. (' + er + ")");
              err.context = er;
              throw err;
            }
          }
        }
        handler = this._events[type];
        if (isUndefined(handler))
          return false;
        if (isFunction(handler)) {
          switch (arguments.length) {
            case 1:
              handler.call(this);
              break;
            case 2:
              handler.call(this, arguments[1]);
              break;
            case 3:
              handler.call(this, arguments[1], arguments[2]);
              break;
            default:
              args = Array.prototype.slice.call(arguments, 1);
              handler.apply(this, args);
          }
        } else if (isObject(handler)) {
          args = Array.prototype.slice.call(arguments, 1);
          listeners = handler.slice();
          len = listeners.length;
          for (i = 0; i < len; i++)
            listeners[i].apply(this, args);
        }
        return true;
      };
      EventEmitter.prototype.addListener = function(type, listener) {
        var m;
        if (!isFunction(listener))
          throw TypeError("listener must be a function");
        if (!this._events)
          this._events = {};
        if (this._events.newListener)
          this.emit(
            "newListener",
            type,
            isFunction(listener.listener) ? listener.listener : listener
          );
        if (!this._events[type])
          this._events[type] = listener;
        else if (isObject(this._events[type]))
          this._events[type].push(listener);
        else
          this._events[type] = [this._events[type], listener];
        if (isObject(this._events[type]) && !this._events[type].warned) {
          if (!isUndefined(this._maxListeners)) {
            m = this._maxListeners;
          } else {
            m = EventEmitter.defaultMaxListeners;
          }
          if (m && m > 0 && this._events[type].length > m) {
            this._events[type].warned = true;
            console.error(
              "(node) warning: possible EventEmitter memory leak detected. %d listeners added. Use emitter.setMaxListeners() to increase limit.",
              this._events[type].length
            );
            if (typeof console.trace === "function") {
              console.trace();
            }
          }
        }
        return this;
      };
      EventEmitter.prototype.on = EventEmitter.prototype.addListener;
      EventEmitter.prototype.once = function(type, listener) {
        if (!isFunction(listener))
          throw TypeError("listener must be a function");
        var fired = false;
        function g() {
          this.removeListener(type, g);
          if (!fired) {
            fired = true;
            listener.apply(this, arguments);
          }
        }
        g.listener = listener;
        this.on(type, g);
        return this;
      };
      EventEmitter.prototype.removeListener = function(type, listener) {
        var list, position, length, i;
        if (!isFunction(listener))
          throw TypeError("listener must be a function");
        if (!this._events || !this._events[type])
          return this;
        list = this._events[type];
        length = list.length;
        position = -1;
        if (list === listener || isFunction(list.listener) && list.listener === listener) {
          delete this._events[type];
          if (this._events.removeListener)
            this.emit("removeListener", type, listener);
        } else if (isObject(list)) {
          for (i = length; i-- > 0; ) {
            if (list[i] === listener || list[i].listener && list[i].listener === listener) {
              position = i;
              break;
            }
          }
          if (position < 0)
            return this;
          if (list.length === 1) {
            list.length = 0;
            delete this._events[type];
          } else {
            list.splice(position, 1);
          }
          if (this._events.removeListener)
            this.emit("removeListener", type, listener);
        }
        return this;
      };
      EventEmitter.prototype.removeAllListeners = function(type) {
        var key, listeners;
        if (!this._events)
          return this;
        if (!this._events.removeListener) {
          if (arguments.length === 0)
            this._events = {};
          else if (this._events[type])
            delete this._events[type];
          return this;
        }
        if (arguments.length === 0) {
          for (key in this._events) {
            if (key === "removeListener") continue;
            this.removeAllListeners(key);
          }
          this.removeAllListeners("removeListener");
          this._events = {};
          return this;
        }
        listeners = this._events[type];
        if (isFunction(listeners)) {
          this.removeListener(type, listeners);
        } else if (listeners) {
          while (listeners.length)
            this.removeListener(type, listeners[listeners.length - 1]);
        }
        delete this._events[type];
        return this;
      };
      EventEmitter.prototype.listeners = function(type) {
        var ret;
        if (!this._events || !this._events[type])
          ret = [];
        else if (isFunction(this._events[type]))
          ret = [this._events[type]];
        else
          ret = this._events[type].slice();
        return ret;
      };
      EventEmitter.prototype.listenerCount = function(type) {
        if (this._events) {
          var evlistener = this._events[type];
          if (isFunction(evlistener))
            return 1;
          else if (evlistener)
            return evlistener.length;
        }
        return 0;
      };
      EventEmitter.listenerCount = function(emitter, type) {
        return emitter.listenerCount(type);
      };
      function isFunction(arg) {
        return typeof arg === "function";
      }
      function isNumber(arg) {
        return typeof arg === "number";
      }
      function isObject(arg) {
        return typeof arg === "object" && arg !== null;
      }
      function isUndefined(arg) {
        return arg === void 0;
      }
    }
  });

  // src/config.js
  var require_config = __commonJS({
    "src/config.js"(exports) {
      exports.translatorUrl = "https://traducao2-dth.vlibras.gov.br/dl/translate";
      exports.dictionaryUrl = "https://dicionario2-dth.vlibras.gov.br/2018.3.1/WEBGL/";
      exports.dictionaryStaticUrl = "https://dicionario2-dth.vlibras.gov.br/static/BUNDLES/2018.3.1/WEBGL/";
    }
  });

  // src/PlayerManagerAdapter.js
  var require_PlayerManagerAdapter = __commonJS({
    "src/PlayerManagerAdapter.js"(exports, module) {
      var window2 = require_window_shim();
      var inherits = require_inherits_browser();
      var EventEmitter = require_events().EventEmitter;
      var GAME_OBJECT = "PlayerManager";
      var EMOTION_OBJECT = "EmotionBridge";
      var CUSTOMIZATION_OBJECT = "CustomizationBridge";
      function PlayerManagerAdapter() {
        if (PlayerManagerAdapter.instance) return PlayerManagerAdapter.instance;
        this.subtitle = true;
        this.currentBaseUrl = "";
        this.on(
          "load",
          function() {
            this._send("initRandomAnimationsProcess");
          }.bind(this)
        );
        PlayerManagerAdapter.instance = this;
      }
      inherits(PlayerManagerAdapter, EventEmitter);
      PlayerManagerAdapter.prototype.setPlayerReference = function(player) {
        this.player = player;
      };
      PlayerManagerAdapter.prototype._send = function(method, params) {
        this.player.SendMessage(GAME_OBJECT, method, params);
      };
      PlayerManagerAdapter.prototype.applyEmotion = function(action, intensity) {
        this.player.SendMessage(EMOTION_OBJECT, action, intensity);
      };
      PlayerManagerAdapter.prototype.play = function(glosa) {
        if (glosa) this._send("playNow", glosa);
        else this._send("setPauseState", 0);
      };
      PlayerManagerAdapter.prototype.setPersonalization = function(personalization) {
        this.player.SendMessage(CUSTOMIZATION_OBJECT, "setURL", personalization);
      };
      PlayerManagerAdapter.prototype.pause = function() {
        this._send("setPauseState", 1);
      };
      PlayerManagerAdapter.prototype.stop = function() {
        this._send("stopAll");
      };
      PlayerManagerAdapter.prototype.setSpeed = function(speed) {
        this._send("setSlider", speed);
      };
      PlayerManagerAdapter.prototype.toggleSubtitle = function() {
        this.subtitle = !this.subtitle;
        this._send("setSubtitlesState", toInt(this.subtitle));
      };
      PlayerManagerAdapter.prototype.playWellcome = function() {
        this._send("playWellcome");
      };
      PlayerManagerAdapter.prototype.changeAvatar = function(avatarName) {
        this._send("Change", avatarName);
      };
      PlayerManagerAdapter.prototype.setBaseUrl = function(url) {
        this._send("setBaseUrl", url);
        this.currentBaseUrl = url;
      };
      window2.onLoadPlayer = function() {
        PlayerManagerAdapter.instance.emit("load");
      };
      window2.updateProgress = function(progress) {
        PlayerManagerAdapter.instance.emit("progress", progress);
      };
      window2.onPlayingStateChange = function(isPlaying, isPaused, isPlayingIntervalAnimation, isLoading, isRepeatable) {
        PlayerManagerAdapter.instance.emit(
          "stateChange",
          toBoolean(isPlaying),
          toBoolean(isPaused),
          toBoolean(isLoading)
        );
      };
      window2.CounterGloss = function(counter, glosaLenght) {
        PlayerManagerAdapter.instance.emit("CounterGloss", counter, glosaLenght);
      };
      window2.GetAvatar = function(avatar) {
        PlayerManagerAdapter.instance.emit("GetAvatar", avatar);
      };
      window2.FinishWelcome = function(bool) {
        PlayerManagerAdapter.instance.emit("FinishWelcome", bool);
      };
      function toInt(boolean) {
        return !boolean ? 0 : 1;
      }
      function toBoolean(bool) {
        return bool != "False";
      }
      module.exports = PlayerManagerAdapter;
    }
  });

  // node_modules/component-emitter/index.js
  var require_component_emitter = __commonJS({
    "node_modules/component-emitter/index.js"(exports, module) {
      if (typeof module !== "undefined") {
        module.exports = Emitter;
      }
      function Emitter(obj) {
        if (obj) return mixin(obj);
      }
      function mixin(obj) {
        for (var key in Emitter.prototype) {
          obj[key] = Emitter.prototype[key];
        }
        return obj;
      }
      Emitter.prototype.on = Emitter.prototype.addEventListener = function(event, fn) {
        this._callbacks = this._callbacks || {};
        (this._callbacks["$" + event] = this._callbacks["$" + event] || []).push(fn);
        return this;
      };
      Emitter.prototype.once = function(event, fn) {
        function on() {
          this.off(event, on);
          fn.apply(this, arguments);
        }
        on.fn = fn;
        this.on(event, on);
        return this;
      };
      Emitter.prototype.off = Emitter.prototype.removeListener = Emitter.prototype.removeAllListeners = Emitter.prototype.removeEventListener = function(event, fn) {
        this._callbacks = this._callbacks || {};
        if (0 == arguments.length) {
          this._callbacks = {};
          return this;
        }
        var callbacks = this._callbacks["$" + event];
        if (!callbacks) return this;
        if (1 == arguments.length) {
          delete this._callbacks["$" + event];
          return this;
        }
        var cb;
        for (var i = 0; i < callbacks.length; i++) {
          cb = callbacks[i];
          if (cb === fn || cb.fn === fn) {
            callbacks.splice(i, 1);
            break;
          }
        }
        return this;
      };
      Emitter.prototype.emit = function(event) {
        this._callbacks = this._callbacks || {};
        var args = [].slice.call(arguments, 1), callbacks = this._callbacks["$" + event];
        if (callbacks) {
          callbacks = callbacks.slice(0);
          for (var i = 0, len = callbacks.length; i < len; ++i) {
            callbacks[i].apply(this, args);
          }
        }
        return this;
      };
      Emitter.prototype.listeners = function(event) {
        this._callbacks = this._callbacks || {};
        return this._callbacks["$" + event] || [];
      };
      Emitter.prototype.hasListeners = function(event) {
        return !!this.listeners(event).length;
      };
    }
  });

  // node_modules/reduce-component/index.js
  var require_reduce_component = __commonJS({
    "node_modules/reduce-component/index.js"(exports, module) {
      module.exports = function(arr, fn, initial) {
        var idx = 0;
        var len = arr.length;
        var curr = arguments.length == 3 ? initial : arr[idx++];
        while (idx < len) {
          curr = fn.call(null, curr, arr[idx], ++idx, arr);
        }
        return curr;
      };
    }
  });

  // node_modules/superagent/lib/is-object.js
  var require_is_object = __commonJS({
    "node_modules/superagent/lib/is-object.js"(exports, module) {
      function isObject(obj) {
        return null != obj && "object" == typeof obj;
      }
      module.exports = isObject;
    }
  });

  // node_modules/superagent/lib/request-base.js
  var require_request_base = __commonJS({
    "node_modules/superagent/lib/request-base.js"(exports) {
      var isObject = require_is_object();
      exports.clearTimeout = function _clearTimeout() {
        this._timeout = 0;
        clearTimeout(this._timer);
        return this;
      };
      exports.parse = function parse(fn) {
        this._parser = fn;
        return this;
      };
      exports.timeout = function timeout(ms) {
        this._timeout = ms;
        return this;
      };
      exports.then = function then(fulfill, reject) {
        return this.end(function(err, res) {
          err ? reject(err) : fulfill(res);
        });
      };
      exports.use = function use(fn) {
        fn(this);
        return this;
      };
      exports.get = function(field) {
        return this._header[field.toLowerCase()];
      };
      exports.getHeader = exports.get;
      exports.set = function(field, val) {
        if (isObject(field)) {
          for (var key in field) {
            this.set(key, field[key]);
          }
          return this;
        }
        this._header[field.toLowerCase()] = val;
        this.header[field] = val;
        return this;
      };
      exports.unset = function(field) {
        delete this._header[field.toLowerCase()];
        delete this.header[field];
        return this;
      };
      exports.field = function(name, val) {
        this._getFormData().append(name, val);
        return this;
      };
    }
  });

  // node_modules/superagent/lib/request.js
  var require_request = __commonJS({
    "node_modules/superagent/lib/request.js"(exports, module) {
      function request(RequestConstructor, method, url) {
        if ("function" == typeof url) {
          return new RequestConstructor("GET", method).end(url);
        }
        if (2 == arguments.length) {
          return new RequestConstructor("GET", method);
        }
        return new RequestConstructor(method, url);
      }
      module.exports = request;
    }
  });

  // node_modules/superagent/lib/client.js
  var require_client = __commonJS({
    "node_modules/superagent/lib/client.js"(exports, module) {
      var Emitter = require_component_emitter();
      var reduce = require_reduce_component();
      var requestBase = require_request_base();
      var isObject = require_is_object();
      var root;
      if (typeof window !== "undefined") {
        root = window;
      } else if (typeof self !== "undefined") {
        root = self;
      } else {
        root = exports;
      }
      function noop() {
      }
      function isHost(obj) {
        var str = {}.toString.call(obj);
        switch (str) {
          case "[object File]":
          case "[object Blob]":
          case "[object FormData]":
            return true;
          default:
            return false;
        }
      }
      var request = module.exports = require_request().bind(null, Request);
      request.getXHR = function() {
        if (root.XMLHttpRequest && (!root.location || "file:" != root.location.protocol || !root.ActiveXObject)) {
          return new XMLHttpRequest();
        } else {
          try {
            return new ActiveXObject("Microsoft.XMLHTTP");
          } catch (e) {
          }
          try {
            return new ActiveXObject("Msxml2.XMLHTTP.6.0");
          } catch (e) {
          }
          try {
            return new ActiveXObject("Msxml2.XMLHTTP.3.0");
          } catch (e) {
          }
          try {
            return new ActiveXObject("Msxml2.XMLHTTP");
          } catch (e) {
          }
        }
        return false;
      };
      var trim = "".trim ? function(s) {
        return s.trim();
      } : function(s) {
        return s.replace(/(^\s*|\s*$)/g, "");
      };
      function serialize(obj) {
        if (!isObject(obj)) return obj;
        var pairs = [];
        for (var key2 in obj) {
          if (null != obj[key2]) {
            pushEncodedKeyValuePair(pairs, key2, obj[key2]);
          }
        }
        return pairs.join("&");
      }
      function pushEncodedKeyValuePair(pairs, key2, val) {
        if (Array.isArray(val)) {
          return val.forEach(function(v) {
            pushEncodedKeyValuePair(pairs, key2, v);
          });
        }
        pairs.push(encodeURIComponent(key2) + "=" + encodeURIComponent(val));
      }
      request.serializeObject = serialize;
      function parseString(str) {
        var obj = {};
        var pairs = str.split("&");
        var parts;
        var pair;
        for (var i = 0, len = pairs.length; i < len; ++i) {
          pair = pairs[i];
          parts = pair.split("=");
          obj[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1]);
        }
        return obj;
      }
      request.parseString = parseString;
      request.types = {
        html: "text/html",
        json: "application/json",
        xml: "application/xml",
        urlencoded: "application/x-www-form-urlencoded",
        "form": "application/x-www-form-urlencoded",
        "form-data": "application/x-www-form-urlencoded"
      };
      request.serialize = {
        "application/x-www-form-urlencoded": serialize,
        "application/json": JSON.stringify
      };
      request.parse = {
        "application/x-www-form-urlencoded": parseString,
        "application/json": JSON.parse
      };
      function parseHeader(str) {
        var lines = str.split(/\r?\n/);
        var fields = {};
        var index;
        var line;
        var field;
        var val;
        lines.pop();
        for (var i = 0, len = lines.length; i < len; ++i) {
          line = lines[i];
          index = line.indexOf(":");
          field = line.slice(0, index).toLowerCase();
          val = trim(line.slice(index + 1));
          fields[field] = val;
        }
        return fields;
      }
      function isJSON(mime) {
        return /[\/+]json\b/.test(mime);
      }
      function type(str) {
        return str.split(/ *; */).shift();
      }
      function params(str) {
        return reduce(str.split(/ *; */), function(obj, str2) {
          var parts = str2.split(/ *= */), key2 = parts.shift(), val = parts.shift();
          if (key2 && val) obj[key2] = val;
          return obj;
        }, {});
      }
      function Response(req, options) {
        options = options || {};
        this.req = req;
        this.xhr = this.req.xhr;
        this.text = this.req.method != "HEAD" && (this.xhr.responseType === "" || this.xhr.responseType === "text") || typeof this.xhr.responseType === "undefined" ? this.xhr.responseText : null;
        this.statusText = this.req.xhr.statusText;
        this.setStatusProperties(this.xhr.status);
        this.header = this.headers = parseHeader(this.xhr.getAllResponseHeaders());
        this.header["content-type"] = this.xhr.getResponseHeader("content-type");
        this.setHeaderProperties(this.header);
        this.body = this.req.method != "HEAD" ? this.parseBody(this.text ? this.text : this.xhr.response) : null;
      }
      Response.prototype.get = function(field) {
        return this.header[field.toLowerCase()];
      };
      Response.prototype.setHeaderProperties = function(header) {
        var ct = this.header["content-type"] || "";
        this.type = type(ct);
        var obj = params(ct);
        for (var key2 in obj) this[key2] = obj[key2];
      };
      Response.prototype.parseBody = function(str) {
        var parse = request.parse[this.type];
        if (!parse && isJSON(this.type)) {
          parse = request.parse["application/json"];
        }
        return parse && str && (str.length || str instanceof Object) ? parse(str) : null;
      };
      Response.prototype.setStatusProperties = function(status) {
        if (status === 1223) {
          status = 204;
        }
        var type2 = status / 100 | 0;
        this.status = this.statusCode = status;
        this.statusType = type2;
        this.info = 1 == type2;
        this.ok = 2 == type2;
        this.clientError = 4 == type2;
        this.serverError = 5 == type2;
        this.error = 4 == type2 || 5 == type2 ? this.toError() : false;
        this.accepted = 202 == status;
        this.noContent = 204 == status;
        this.badRequest = 400 == status;
        this.unauthorized = 401 == status;
        this.notAcceptable = 406 == status;
        this.notFound = 404 == status;
        this.forbidden = 403 == status;
      };
      Response.prototype.toError = function() {
        var req = this.req;
        var method = req.method;
        var url = req.url;
        var msg = "cannot " + method + " " + url + " (" + this.status + ")";
        var err = new Error(msg);
        err.status = this.status;
        err.method = method;
        err.url = url;
        return err;
      };
      request.Response = Response;
      function Request(method, url) {
        var self2 = this;
        this._query = this._query || [];
        this.method = method;
        this.url = url;
        this.header = {};
        this._header = {};
        this.on("end", function() {
          var err = null;
          var res = null;
          try {
            res = new Response(self2);
          } catch (e) {
            err = new Error("Parser is unable to parse the response");
            err.parse = true;
            err.original = e;
            err.rawResponse = self2.xhr && self2.xhr.responseText ? self2.xhr.responseText : null;
            err.statusCode = self2.xhr && self2.xhr.status ? self2.xhr.status : null;
            return self2.callback(err);
          }
          self2.emit("response", res);
          if (err) {
            return self2.callback(err, res);
          }
          if (res.status >= 200 && res.status < 300) {
            return self2.callback(err, res);
          }
          var new_err = new Error(res.statusText || "Unsuccessful HTTP response");
          new_err.original = err;
          new_err.response = res;
          new_err.status = res.status;
          self2.callback(new_err, res);
        });
      }
      Emitter(Request.prototype);
      for (key in requestBase) {
        Request.prototype[key] = requestBase[key];
      }
      var key;
      Request.prototype.abort = function() {
        if (this.aborted) return;
        this.aborted = true;
        this.xhr && this.xhr.abort();
        this.clearTimeout();
        this.emit("abort");
        return this;
      };
      Request.prototype.type = function(type2) {
        this.set("Content-Type", request.types[type2] || type2);
        return this;
      };
      Request.prototype.responseType = function(val) {
        this._responseType = val;
        return this;
      };
      Request.prototype.accept = function(type2) {
        this.set("Accept", request.types[type2] || type2);
        return this;
      };
      Request.prototype.auth = function(user, pass, options) {
        if (!options) {
          options = {
            type: "basic"
          };
        }
        switch (options.type) {
          case "basic":
            var str = btoa(user + ":" + pass);
            this.set("Authorization", "Basic " + str);
            break;
          case "auto":
            this.username = user;
            this.password = pass;
            break;
        }
        return this;
      };
      Request.prototype.query = function(val) {
        if ("string" != typeof val) val = serialize(val);
        if (val) this._query.push(val);
        return this;
      };
      Request.prototype.attach = function(field, file, filename) {
        this._getFormData().append(field, file, filename || file.name);
        return this;
      };
      Request.prototype._getFormData = function() {
        if (!this._formData) {
          this._formData = new root.FormData();
        }
        return this._formData;
      };
      Request.prototype.send = function(data) {
        var obj = isObject(data);
        var type2 = this._header["content-type"];
        if (obj && isObject(this._data)) {
          for (var key2 in data) {
            this._data[key2] = data[key2];
          }
        } else if ("string" == typeof data) {
          if (!type2) this.type("form");
          type2 = this._header["content-type"];
          if ("application/x-www-form-urlencoded" == type2) {
            this._data = this._data ? this._data + "&" + data : data;
          } else {
            this._data = (this._data || "") + data;
          }
        } else {
          this._data = data;
        }
        if (!obj || isHost(data)) return this;
        if (!type2) this.type("json");
        return this;
      };
      Response.prototype.parse = function serialize2(fn) {
        if (root.console) {
          console.warn("Client-side parse() method has been renamed to serialize(). This method is not compatible with superagent v2.0");
        }
        this.serialize(fn);
        return this;
      };
      Response.prototype.serialize = function serialize2(fn) {
        this._parser = fn;
        return this;
      };
      Request.prototype.callback = function(err, res) {
        var fn = this._callback;
        this.clearTimeout();
        fn(err, res);
      };
      Request.prototype.crossDomainError = function() {
        var err = new Error("Request has been terminated\nPossible causes: the network is offline, Origin is not allowed by Access-Control-Allow-Origin, the page is being unloaded, etc.");
        err.crossDomain = true;
        err.status = this.status;
        err.method = this.method;
        err.url = this.url;
        this.callback(err);
      };
      Request.prototype.timeoutError = function() {
        var timeout = this._timeout;
        var err = new Error("timeout of " + timeout + "ms exceeded");
        err.timeout = timeout;
        this.callback(err);
      };
      Request.prototype.withCredentials = function() {
        this._withCredentials = true;
        return this;
      };
      Request.prototype.end = function(fn) {
        var self2 = this;
        var xhr = this.xhr = request.getXHR();
        var query = this._query.join("&");
        var timeout = this._timeout;
        var data = this._formData || this._data;
        this._callback = fn || noop;
        xhr.onreadystatechange = function() {
          if (4 != xhr.readyState) return;
          var status;
          try {
            status = xhr.status;
          } catch (e) {
            status = 0;
          }
          if (0 == status) {
            if (self2.timedout) return self2.timeoutError();
            if (self2.aborted) return;
            return self2.crossDomainError();
          }
          self2.emit("end");
        };
        var handleProgress = function(e) {
          if (e.total > 0) {
            e.percent = e.loaded / e.total * 100;
          }
          e.direction = "download";
          self2.emit("progress", e);
        };
        if (this.hasListeners("progress")) {
          xhr.onprogress = handleProgress;
        }
        try {
          if (xhr.upload && this.hasListeners("progress")) {
            xhr.upload.onprogress = handleProgress;
          }
        } catch (e) {
        }
        if (timeout && !this._timer) {
          this._timer = setTimeout(function() {
            self2.timedout = true;
            self2.abort();
          }, timeout);
        }
        if (query) {
          query = request.serializeObject(query);
          this.url += ~this.url.indexOf("?") ? "&" + query : "?" + query;
        }
        if (this.username && this.password) {
          xhr.open(this.method, this.url, true, this.username, this.password);
        } else {
          xhr.open(this.method, this.url, true);
        }
        if (this._withCredentials) xhr.withCredentials = true;
        if ("GET" != this.method && "HEAD" != this.method && "string" != typeof data && !isHost(data)) {
          var contentType = this._header["content-type"];
          var serialize2 = this._parser || request.serialize[contentType ? contentType.split(";")[0] : ""];
          if (!serialize2 && isJSON(contentType)) serialize2 = request.serialize["application/json"];
          if (serialize2) data = serialize2(data);
        }
        for (var field in this.header) {
          if (null == this.header[field]) continue;
          xhr.setRequestHeader(field, this.header[field]);
        }
        if (this._responseType) {
          xhr.responseType = this._responseType;
        }
        this.emit("request", this);
        xhr.send(typeof data !== "undefined" ? data : null);
        return this;
      };
      request.Request = Request;
      request.get = function(url, data, fn) {
        var req = request("GET", url);
        if ("function" == typeof data) fn = data, data = null;
        if (data) req.query(data);
        if (fn) req.end(fn);
        return req;
      };
      request.head = function(url, data, fn) {
        var req = request("HEAD", url);
        if ("function" == typeof data) fn = data, data = null;
        if (data) req.send(data);
        if (fn) req.end(fn);
        return req;
      };
      function del(url, fn) {
        var req = request("DELETE", url);
        if (fn) req.end(fn);
        return req;
      }
      request["del"] = del;
      request["delete"] = del;
      request.patch = function(url, data, fn) {
        var req = request("PATCH", url);
        if ("function" == typeof data) fn = data, data = null;
        if (data) req.send(data);
        if (fn) req.end(fn);
        return req;
      };
      request.post = function(url, data, fn) {
        var req = request("POST", url);
        if ("function" == typeof data) fn = data, data = null;
        if (data) req.send(data);
        if (fn) req.end(fn);
        return req;
      };
      request.put = function(url, data, fn) {
        var req = request("PUT", url);
        if ("function" == typeof data) fn = data, data = null;
        if (data) req.send(data);
        if (fn) req.end(fn);
        return req;
      };
    }
  });

  // src/GlosaTranslator.js
  var require_GlosaTranslator = __commonJS({
    "src/GlosaTranslator.js"(exports, module) {
      var request = require_client();
      function GlosaTranslator(endpoint) {
        this.endpoint = endpoint;
      }
      GlosaTranslator.prototype.translate = function(text, domain, callback) {
        const time = 3e4;
        let hasTimeout = false;
        const timeout = setTimeout(() => {
          hasTimeout = true;
          callback(void 0, "timeout_error");
        }, time);
        request.post(this.endpoint, { text, domain }).end(
          function(err, response) {
            if (hasTimeout) return;
            clearTimeout(timeout);
            if (err) callback(void 0, err);
            else callback(response.text);
          }
        );
      };
      module.exports = GlosaTranslator;
    }
  });

  // src/Player.js
  var require_Player = __commonJS({
    "src/Player.js"(exports, module) {
      var window2 = require_window_shim();
      var assign = require_object_assign();
      var inherits = require_inherits_browser();
      var path = require_path_shim();
      var url = require_url_join();
      var EventEmitter = require_events().EventEmitter;
      var config = require_config();
      var PlayerManagerAdapter = require_PlayerManagerAdapter();
      var GlosaTranslator = require_GlosaTranslator();
      var globalGlosaLenght = "";
      var document = window2.document;
      var location = window2.location;
      var STATUSES = {
        idle: "idle",
        preparing: "preparing",
        playing: "playing"
      };
      function Player(options) {
        this.options = assign(
          {
            translator: config.translatorUrl,
            targetPath: "target"
          },
          options
        );
        this.playerManager = new PlayerManagerAdapter();
        this.translator = new GlosaTranslator(this.options.translator);
        this.translated = false;
        this.text = void 0;
        this.gloss = void 0;
        this.loaded = false;
        this.progress = null;
        this.gameContainer = null;
        this.player = null;
        this.status = STATUSES.idle;
        this.region = "BR";
        this.playerManager.on("load", () => {
          this.loaded = true;
          this.emit("load");
          this.playerManager.setBaseUrl(config.dictionaryUrl);
          if (this.options.onLoad) {
            this.options.onLoad();
          } else {
            this.play(null, { fromTranslation: true });
          }
        });
        this.playerManager.on("progress", (progress) => {
          this.emit("animation:progress", progress);
        });
        this.playerManager.on("stateChange", (isPlaying, isPaused, isLoading) => {
          if (isPaused) {
            this.emit("animation:pause");
          } else if (isPlaying && !isPaused) {
            this.emit("animation:play");
            this.changeStatus(STATUSES.playing);
          } else if (!isPlaying && !isLoading) {
            this.emit("animation:end");
            this.changeStatus(STATUSES.idle);
          }
        });
        this.playerManager.on("CounterGloss", (counter, glosaLenght) => {
          this.emit("response:glosa", counter, glosaLenght);
          globalGlosaLenght = glosaLenght;
        });
        this.playerManager.on("GetAvatar", (avatar) => {
          this.emit("GetAvatar", avatar);
        });
        this.playerManager.on("FinishWelcome", (bool) => {
          this.emit("stop:welcome", bool);
        });
      }
      inherits(Player, EventEmitter);
      Player.prototype.translate = function(text, { isEnabledStats = true } = {}) {
        this.emit("translate:start");
        if (this.loaded) {
          this.stop();
        }
        this.text = text;
        this.translator.translate(text, location.host, (gloss, error) => {
          if (error) {
            this.play(text.toUpperCase());
            if (error === "timeout_error") this.emit("error", "timeout_error");
            else return this.emit("translate:end");
          }
          this.play(gloss, { fromTranslation: true, isEnabledStats });
          this.emit("translate:end");
        });
      };
      Player.prototype.play = function(glosa, { fromTranslation = false, isEnabledStats = true } = {}) {
        if (!isEnabledStats && isDefaultUrl.bind(this)()) {
          this.playerManager.setBaseUrl(
            config.dictionaryStaticUrl + this.region + "/"
          );
        } else if (isEnabledStats && !isDefaultUrl.bind(this)()) {
          this.playerManager.setBaseUrl(config.dictionaryUrl + this.region + "/");
        }
        function isDefaultUrl() {
          return this.playerManager.currentBaseUrl === config.dictionaryUrl + this.region + "/";
        }
        this.translated = fromTranslation;
        this.gloss = glosa || this.gloss;
        if (this.gloss !== void 0 && this.loaded) {
          this.changeStatus(STATUSES.preparing);
          this.playerManager.play(this.gloss);
        }
      };
      Player.prototype.playWellcome = function() {
        this.playerManager.playWellcome();
        this.emit("start:welcome");
      };
      Player.prototype.continue = function() {
        this.playerManager.play();
      };
      Player.prototype.repeat = function() {
        this.play();
      };
      Player.prototype.pause = function() {
        this.playerManager.pause();
      };
      Player.prototype.stop = function() {
        this.playerManager.stop();
      };
      Player.prototype.setSpeed = function(speed) {
        this.playerManager.setSpeed(speed);
      };
      Player.prototype.setPersonalization = function(personalization) {
        this.playerManager.setPersonalization(personalization);
      };
      Player.prototype.applyEmotion = function(action, intensity) {
        this.playerManager.applyEmotion(action, intensity);
      };
      Player.prototype.changeAvatar = function(avatarName) {
        this.playerManager.changeAvatar(avatarName);
      };
      Player.prototype.toggleSubtitle = function() {
        this.playerManager.toggleSubtitle();
      };
      Player.prototype.setRegion = function(region) {
        this.region = region;
        this.playerManager.setBaseUrl(config.dictionaryUrl + region + "/");
      };
      Player.prototype.load = function(wrapper) {
        this.gameContainer = document.createElement("div");
        this.gameContainer.setAttribute("id", "gameContainer");
        this.gameContainer.classList.add("emscripten");
        if ("function" == typeof this.options.progress) {
          this.progress = new this.options.progress(wrapper);
        }
        wrapper.appendChild(this.gameContainer);
        this._initializeTarget();
      };
      Player.prototype._getTargetScript = function() {
        return url(this.options.targetPath, "UnityLoader.js");
      };
      Player.prototype._initializeTarget = function() {
        const targetSetup = url(this.options.targetPath, "playerweb.json");
        const targetScript = document.createElement("script");
        targetScript.src = this._getTargetScript();
        targetScript.onload = () => {
          this.player = UnityLoader.instantiate("gameContainer", targetSetup, {
            compatibilityCheck: (_, accept, deny) => {
              if (UnityLoader.SystemInfo.hasWebGL) {
                return accept();
              }
              this.onError("unsupported");
              alert("Seu navegador n\xE3o suporta WEBGL");
              console.error("Seu navegador n\xE3o suporta WEBGL");
              deny();
            }
          });
          this.playerManager.setPlayerReference(this.player);
        };
        document.body.appendChild(targetScript);
      };
      Player.prototype.changeStatus = function(status) {
        switch (status) {
          case STATUSES.idle:
            if (this.status === STATUSES.playing) {
              this.status = status;
              this.emit("gloss:end", globalGlosaLenght);
            }
            break;
          case STATUSES.preparing:
            this.status = status;
            break;
          case STATUSES.playing:
            if (this.status === STATUSES.preparing) {
              this.status = status;
              this.emit("gloss:start");
            }
            break;
        }
      };
      module.exports = Player;
    }
  });

  // src/index.js
  var require_src = __commonJS({
    "src/index.js"(exports, module) {
      var window2 = require_window_shim();
      var Player = require_Player();
      var VLibras = {
        Player
      };
      window2.VLibras = VLibras;
      module.exports = VLibras;
    }
  });
  require_src();
})();
/*! Bundled license information:

object-assign/index.js:
  (*
  object-assign
  (c) Sindre Sorhus
  @license MIT
  *)
*/

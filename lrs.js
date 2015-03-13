(function() {
  var LRSGeneratedListItemView, LRSListItemView, LRSListView, LRSObject, LRSView,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __slice = [].slice;

  LRSObject = (function() {
    LRSObject.isObject = true;

    function LRSObject(options) {
      if (options == null) {
        options = {};
      }
      if (!this.options) {
        this.options = {};
      }
      _.extend(this.options, options);
      this.events = {};
      this;
    }

    LRSObject.prototype.initialize = function() {
      return this;
    };

    LRSObject.prototype.on = function(event, handler) {
      if (!event) {
        throw new Error("Event name missing.");
      }
      if (!handler) {
        throw new Error("Event handler missing.");
      }
      if (!this.events[event]) {
        this.events[event] = [];
      }
      if (__indexOf.call(this.events[event], handler) < 0) {
        this.events[event].push(handler);
      }
      return this;
    };

    LRSObject.prototype.once = function(event, handler) {
      var intermediateHandler;
      intermediateHandler = (function(_this) {
        return function() {
          _this.off(event, intermediateHandler);
          return handler.apply(_this, arguments);
        };
      })(this);
      return this.on(event, intermediateHandler);
    };

    LRSObject.prototype.off = function(event, handler) {
      var index;
      if (!this.events[event]) {
        return;
      }
      index = this.events[event].indexOf(handler);
      this.events[event].splice(index, 1);
      return this;
    };

    LRSObject.prototype.trigger = function(event, attributes) {
      var handler, _i, _len, _ref, _results;
      if (!this.events[event]) {
        return;
      }
      _ref = this.events[event].slice();
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        handler = _ref[_i];
        _results.push(handler.apply(this, attributes));
      }
      return _results;
    };

    LRSObject.prototype.get = function(name) {
      return this[name];
    };

    LRSObject.prototype.set = function(name, value) {
      return this[name] = value;
    };

    return LRSObject;

  })();

  if (typeof module !== "undefined" && module !== null) {
    exports.LRSObject = LRSObject;
  } else {
    if (!window.lrs) {
      window.lrs = {};
    }
    window.lrs.LRSObject = LRSObject;
  }

  LRSView = (function(_super) {
    __extends(LRSView, _super);

    LRSView.defineOutlets = function() {
      this.outletTypes = {
        custom: {
          get: function(outlet, view) {
            return outlet.get(view.el);
          },
          set: function(outlet, view, value) {
            return outlet.set(view.el, value);
          }
        },
        input: {
          get: function(outlet, view) {
            if (outlet.el.type === 'checkbox') {
              return outlet.el.checked;
            } else {
              return outlet.el.value;
            }
          },
          set: function(outlet, view, value) {
            if (outlet.el.type === 'checkbox') {
              return outlet.el.checked = value ? true : false;
            } else {
              return outlet.el.value = value != null ? value : '';
            }
          }
        },
        img: {
          get: function(outlet, view) {
            return outlet.el.src;
          },
          set: function(outlet, view, value) {
            return outlet.el.src = value != null ? value || '' : void 0;
          }
        },
        html: {
          get: function(outlet, view) {
            return outlet.el.innerHTML;
          },
          set: function(outlet, view, value) {
            return outlet.el.innerHTML = value != null ? value : '';
          }
        }
      };
      this.outletTypes["default"] = this.outletTypes.html;
      return this.outletTypes.textarea = this.outletTypes.input;
    };

    LRSView.defineOutlets();

    LRSView.isTouch = document.ontouchstart === null;

    LRSView.prototype.isView = true;

    LRSView.views = {};

    LRSView.actionPattern = /^(.*?):(.*?)\((.*?)\)/;

    LRSView.parseTemplates = function() {
      var name, template, templateContainer, templateContainerHTML, templateContainers, _i, _len, _results;
      if (this.templates) {
        return;
      }
      this.templates = {};
      templateContainers = document.querySelectorAll('.templates');
      _results = [];
      for (_i = 0, _len = templateContainers.length; _i < _len; _i++) {
        templateContainer = templateContainers[_i];
        templateContainer.parentNode.removeChild(templateContainer);
        templateContainerHTML = document.createElement('div');
        templateContainerHTML.innerHTML = templateContainer.innerHTML;
        _results.push((function() {
          var _j, _len1, _ref, _results1;
          _ref = templateContainerHTML.children;
          _results1 = [];
          for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
            template = _ref[_j];
            if (!template.hasAttribute('data-template')) {
              continue;
            }
            name = template.getAttribute('data-template');
            template.removeAttribute('data-template');
            _results1.push(this.templates[name] = template.outerHTML);
          }
          return _results1;
        }).call(this));
      }
      return _results;
    };

    function LRSView(el, options, owner) {
      if (el == null) {
        el = null;
      }
      this.options = options != null ? options : null;
      this.owner = owner;
      this.delegateAction = __bind(this.delegateAction, this);
      if (this.template && (!el || el.children.length === 0)) {
        this._loadTemplate();
        if (el) {
          el.parentNode.replaceChild(this.el, el);
        }
      } else {
        this.el = el;
      }
      if (this.customOutlets == null) {
        this.customOutlets = {};
      }
      this._createViews();
      this._createOutlets();
      this._createActions();
      LRSView.__super__.constructor.call(this, this.options);
    }

    LRSView.prototype.initialize = function() {
      this.hidden = this.el.classList.contains('hidden');
      this.enabled = !this.el.classList.contains('disabled');
      this.initializeViews();
      return LRSView.__super__.initialize.apply(this, arguments);
    };

    LRSView.prototype.initializeViews = function() {
      return this.eachView(function(view) {
        return view.initialize();
      });
    };

    LRSView.prototype._loadTemplate = function() {
      var _el;
      _el = document.createElement('div');
      _el.innerHTML = LRSView.templates[this.template];
      return this.el = _el.firstChild;
    };

    LRSView.prototype._createViews = function() {
      var info, name, view, viewEl, viewEls, _i, _len, _results;
      viewEls = this.el.querySelectorAll('[data-view]');
      this.views = {};
      _results = [];
      for (_i = 0, _len = viewEls.length; _i < _len; _i++) {
        viewEl = viewEls[_i];
        if (!viewEl.hasAttribute('data-view')) {
          continue;
        }
        info = viewEl.getAttribute('data-view').split(':');
        viewEl.removeAttribute('data-view');
        if (info.length === 1) {
          name = info[0];
          view = new lrs.LRSView(viewEl, null, this);
        } else {
          name = info[1];
          view = new lrs.LRSView.views[info[0] + 'View'](viewEl, {
            subTemplate: info[2]
          }, this);
        }
        if (name === 'view') {
          this.view = view;
        }
        if (this.views[name]) {
          if (!Array.isArray(this.views[name])) {
            this.views[name] = [this.views[name]];
          }
          _results.push(this.views[name].push(view));
        } else {
          _results.push(this.views[name] = view);
        }
      }
      return _results;
    };

    LRSView.prototype._createOutlets = function() {
      var name, outlet, outletEl, outletEls, _i, _len, _ref;
      this.outlets = {};
      outletEls = this.el.querySelectorAll('[data-outlet]');
      if (this.el.hasAttribute('data-outlet')) {
        this._createOutlet(this.el);
      }
      for (_i = 0, _len = outletEls.length; _i < _len; _i++) {
        outletEl = outletEls[_i];
        this._createOutlet(outletEl);
      }
      if (this.customOutlets) {
        _ref = this.customOutlets;
        for (name in _ref) {
          outlet = _ref[name];
          outlet.type = 'custom';
        }
        _.extend(this.outlets, this.customOutlets);
      }
      return this.outlets;
    };

    LRSView.prototype._createOutlet = function(outletEl) {
      var name, self, type;
      self = this;
      name = outletEl.getAttribute('data-outlet');
      outletEl.removeAttribute('data-outlet');
      type = (outletEl.tagName || '').toLowerCase();
      if (type === 'input' || type === 'textarea') {
        outletEl.addEventListener('change', (function(_this) {
          return function() {
            return self.updateOutletFromDom(name);
          };
        })(this));
      }
      this.outlets[name] = {
        type: type,
        el: outletEl
      };
      return this.updateOutletFromDom(name);
    };

    LRSView.prototype._createActions = function() {
      var actionEl, actionEls, _i, _len;
      this.actions = {};
      actionEls = this.el.querySelectorAll('[data-action]');
      if (this.el.hasAttribute('data-action')) {
        this._createAction(this.el);
      }
      for (_i = 0, _len = actionEls.length; _i < _len; _i++) {
        actionEl = actionEls[_i];
        this._createAction(actionEl);
      }
      return this.actions;
    };

    LRSView.prototype._createAction = function(actionEl) {
      var action, actionStrings, self, string, _i, _len, _results;
      self = this;
      actionStrings = actionEl.getAttribute('data-action').split(';');
      actionEl.removeAttribute('data-action');
      _results = [];
      for (_i = 0, _len = actionStrings.length; _i < _len; _i++) {
        string = actionStrings[_i];
        action = string.match(LRSView.actionPattern);
        action.shift();
        action[2] = action[2].split(',');
        if (action[2][0] === '') {
          action[2] = [];
        }
        if (!lrs.LRSView.isTouch && (action[0] === 'tap' || action[0] === 'singleTap')) {
          action[0] = 'click';
        }
        if (!this.actions[action[0]]) {
          this.actions[action[0]] = [];
        }
        actionEl.addEventListener(action[0], function(e) {
          return self.delegateAction(e, this);
        });
        _results.push(this.actions[action[0]].push({
          el: actionEl,
          "function": action[1],
          parameters: action[2]
        }));
      }
      return _results;
    };

    LRSView.prototype.delegateAction = function(e, el) {
      var action, actions, parameter, parameters, _i, _j, _len, _len1, _ref, _results;
      if (el == null) {
        el = false;
      }
      if (!this.enabled) {
        return;
      }
      actions = this.actions[e.type];
      if (!actions) {
        return;
      }
      _results = [];
      for (_i = 0, _len = actions.length; _i < _len; _i++) {
        action = actions[_i];
        if (el !== false && action.el !== el) {
          continue;
        }
        parameters = [];
        _ref = action.parameters;
        for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
          parameter = _ref[_j];
          if (parameter === 'null') {
            parameters.push(null);
          } else if (parameter.charAt(0).match(/['"]/g) && parameter.charAt(0) === parameter.charAt(parameter.length - 1)) {
            parameters.push(parameter.substring(1, parameter.length - 1));
          } else {
            parameters.push(this[parameter]);
          }
        }
        parameters.push(this, el, e);
        _results.push(this.dispatch(action["function"] + 'Action', parameters));
      }
      return _results;
    };

    LRSView.prototype.dispatch = function(func, parameters) {
      var propagate, _ref;
      if (parameters == null) {
        parameters = null;
      }
      propagate = true;
      if (this[func] && _.isFunction(this[func])) {
        propagate = this[func].apply(this, parameters);
      }
      if (propagate === true && ((_ref = this.owner) != null ? _ref.dispatch : void 0)) {
        return this.owner.dispatch(func, parameters);
      }
    };

    LRSView.prototype.setOwner = function(owner) {
      this.owner = owner;
      return this.owner;
    };

    LRSView.prototype.updateOutletFromDom = function(name) {
      var outlet;
      outlet = this.outlets[name];
      if (!outlet) {
        return this;
      }
      if (this.constructor.outletTypes[outlet.type]) {
        this[name] = this.constructor.outletTypes[outlet.type].get(outlet, this);
      } else {
        this[name] = this.constructor.outletTypes["default"].get(outlet, this);
      }
      return this;
    };

    LRSView.prototype.updateDomFromOutlet = function(name) {
      var outlet;
      outlet = this.outlets[name];
      if (!outlet) {
        return this;
      }
      if (this.constructor.outletTypes[outlet.type]) {
        this.constructor.outletTypes[outlet.type].set(outlet, this, this[name]);
      } else {
        this.constructor.outletTypes["default"].set(outlet, this, this[name]);
      }
      return this;
    };

    LRSView.prototype.set = function(name, value) {
      this[name] = value;
      this.updateDomFromOutlet(name);
      return this;
    };

    LRSView.prototype.appendTo = function(view) {
      (view.el || view).appendChild(this.el);
      return this;
    };

    LRSView.prototype.insertBefore = function(view) {
      var el;
      el = view.el || view;
      el.parentNode.insertBefore(this.el, el);
      return this;
    };

    LRSView.prototype.insertAfter = function(view) {
      this.insertBefore((view.el || view).nextSibling);
      return this;
    };

    LRSView.prototype.withdraw = function() {
      var nextSibling, parentNode, scrollTop;
      scrollTop = this.el.scrollTop;
      parentNode = this.el.parentNode;
      nextSibling = this.el.nextSibling;
      this.el.parentNode.removeChild(this.el);
      return (function(_this) {
        return function() {
          if (nextSibling) {
            parentNode.insertBefore(_this.el, nextSibling);
          } else {
            parentNode.appendChild(_this.el);
          }
          return _this.el.scrollTop = scrollTop;
        };
      })(this);
    };

    LRSView.prototype.remove = function() {
      this.el.parentNode.removeChild(this.el);
      return this;
    };

    LRSView.prototype.addClass = function() {
      var names;
      names = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      this.el.classList.add.apply(this.el.classList, names);
      return this;
    };

    LRSView.prototype.removeClass = function() {
      var names;
      names = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      this.el.classList.remove.apply(this.el.classList, names);
      return this;
    };

    LRSView.prototype.toggleClass = function(name, addOrRemove) {
      return this.el.classList.toggle(name, addOrRemove);
    };

    LRSView.prototype.hasClass = function(name) {
      return this.el.classList.contains(name);
    };

    LRSView.prototype.enable = function(recursive, updateClass) {
      if (recursive == null) {
        recursive = true;
      }
      if (updateClass == null) {
        updateClass = true;
      }
      this.enabled = true;
      if (updateClass) {
        this.removeClass('disabled');
      }
      if (recursive === true) {
        this.eachView(function(view) {
          return view.enable(recursive, updateClass);
        });
      }
      return this;
    };

    LRSView.prototype.disable = function(recursive, updateClass) {
      if (recursive == null) {
        recursive = true;
      }
      if (updateClass == null) {
        updateClass = true;
      }
      this.enabled = false;
      if (updateClass) {
        this.addClass('disabled');
      }
      if (recursive === true) {
        this.eachView(function(view) {
          return view.disable(recursive, updateClass);
        });
      }
      return this;
    };

    LRSView.prototype.show = function() {
      this.hidden = false;
      this.enable(true, false);
      this.removeClass('hidden');
      return this;
    };

    LRSView.prototype.hide = function() {
      this.hidden = true;
      this.disable(true, false);
      this.addClass('hidden');
      return this;
    };

    LRSView.prototype.hideAction = function() {
      return this.hide();
    };

    LRSView.prototype.listenTo = function(object, event, callback) {
      object.on(event, callback);
      this.listeningTo || (this.listeningTo = []);
      this.listeningTo.push({
        object: object,
        event: event,
        callback: callback
      });
      return this;
    };

    LRSView.prototype.stopListeningTo = function(object, event, callback) {
      var registeredEvent, _i, _len, _ref;
      if (!this.listeningTo) {
        return this;
      }
      _ref = this.listeningTo;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        registeredEvent = _ref[_i];
        if (registeredEvent.object === object && registeredEvent.event === event && registeredEvent.callback === callback) {
          break;
        }
      }
      if (registeredEvent) {
        registeredEvent.object.off(registeredEvent.event, registeredEvent.callback);
      }
      return this;
    };

    LRSView.prototype.deinitialize = function() {
      var registeredEvent, _i, _len, _ref;
      if (this.listeningTo) {
        _ref = this.listeningTo;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          registeredEvent = _ref[_i];
          registeredEvent.object.off(registeredEvent.event, registeredEvent.callback);
        }
      }
      return this.eachView(function(view) {
        return view.deinitialize();
      });
    };

    LRSView.prototype.eachView = function(func) {
      var v, view, viewName, _ref, _results;
      _ref = this.views;
      _results = [];
      for (viewName in _ref) {
        view = _ref[viewName];
        if (Array.isArray(view)) {
          _results.push((function() {
            var _i, _len, _results1;
            _results1 = [];
            for (_i = 0, _len = view.length; _i < _len; _i++) {
              v = view[_i];
              _results1.push(func(v));
            }
            return _results1;
          })());
        } else {
          _results.push(func(view));
        }
      }
      return _results;
    };

    return LRSView;

  })(lrs.LRSObject);

  LRSListView = (function(_super) {
    __extends(LRSListView, _super);

    function LRSListView() {
      return LRSListView.__super__.constructor.apply(this, arguments);
    }

    LRSListView.prototype.initialize = function(content) {
      if (content == null) {
        content = null;
      }
      LRSListView.__super__.initialize.call(this);
      if (content && this.views.content) {
        if (!Array.isArray(this.views.content)) {
          this.views.content = [this.views.content];
        }
        this.setPreloadedContent(content);
      } else {
        this.reset(content);
      }
      return this;
    };

    LRSListView.prototype.setPreloadedContent = function(content) {
      var i, object, previousView, v, view, _i, _j, _len, _len1, _ref, _results;
      this.content = [];
      previousView = null;
      _results = [];
      for (i = _i = 0, _len = content.length; _i < _len; i = ++_i) {
        object = content[i];
        view = null;
        _ref = this.views.content;
        for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
          v = _ref[_j];
          if (v.el.getAttribute('data-id') === object.id) {
            view = v;
            break;
          }
        }
        if (view) {
          view.initialize(object);
        } else {
          view = new this.options.itemClass(null, null, this).initialize(object);
          if (previousView) {
            view.insertAfter(previousView.el);
            this.views.content.splice(i, 0, view);
          } else {
            view.appendTo(this.el);
          }
        }
        _results.push(this.content.push({
          object: object,
          view: view
        }));
      }
      return _results;
    };

    LRSListView.prototype.reset = function(content) {
      var i, object, view, _base, _i, _j, _len, _len1, _ref;
      if (content === null && (!this.content || this.content.length === 0)) {
        return;
      }
      (_base = this.views).content || (_base.content = []);
      if (this.views.content.length) {
        _ref = this.views.content;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          view = _ref[_i];
          view.remove().deinitialize();
        }
        this.views.content = [];
      }
      this.content = [];
      if (content !== null) {
        for (i = _j = 0, _len1 = content.length; _j < _len1; i = ++_j) {
          object = content[i];
          this._processObject(object, i);
        }
      }
      return this;
    };

    LRSListView.prototype.setContent = function() {
      return this.reset();
    };

    LRSListView.prototype.sort = function(content) {
      var c, newContent, newContentViews, object, reinsert, view, _i, _j, _len, _len1, _ref;
      if (!content.length > 0 || !this.content) {
        return;
      }
      newContent = [];
      newContentViews = [];
      for (_i = 0, _len = content.length; _i < _len; _i++) {
        object = content[_i];
        c = this.content[this.indexForObject(object)];
        newContent.push(c);
        newContentViews.push(c.view);
      }
      this.content = newContent;
      this.views.content = newContentViews;
      reinsert = this.withdraw();
      _ref = this.views.content;
      for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
        view = _ref[_j];
        view.appendTo(this);
      }
      return reinsert();
    };

    LRSListView.prototype.add = function(object, before) {
      var i;
      if (before == null) {
        before = false;
      }
      if (before === true) {
        i = 0;
      } else if (before === false) {
        i = this.content.length;
      } else {
        i = this.indexForObject(before);
        if (i === -1) {
          i = this.content.length;
        }
      }
      return this._processObject(object, i);
    };

    LRSListView.prototype.addItem = function() {
      return this.add();
    };

    LRSListView.prototype.remove = function(object) {
      var i, removed;
      i = this.indexForObject(object);
      if (i === -1) {
        return false;
      }
      removed = this.content.splice(i, 1);
      this.views.content[i].remove().deinitialize();
      return this.views.content.splice(i, 1);
    };

    LRSListView.prototype.removeItem = function() {
      return this.remove();
    };

    LRSListView.prototype.indexForObject = function(object) {
      var c, i, _i, _len, _ref;
      _ref = this.content;
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        c = _ref[i];
        if (c.object === object) {
          return i;
        }
      }
      return -1;
    };

    LRSListView.prototype.indexForView = function(view) {
      var c, i, _i, _len, _ref;
      _ref = this.content;
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        c = _ref[i];
        if (c.view === view) {
          return i;
        }
      }
      return -1;
    };

    LRSListView.prototype.viewForObject = function(object) {
      var i;
      i = this.indexForObject(object);
      if (i === -1) {
        return void 0;
      }
      return this.content[i].view;
    };

    LRSListView.prototype._processObject = function(object, i) {
      var view;
      if (!object.isView) {
        if (this.options.itemClass) {
          view = new this.options.itemClass(null, null, this).initialize(object);
        } else {
          view = new lrs.LRSView.views.LRSGeneratedListItemView(this.options.subTemplate, null, this).initialize(object);
        }
      } else {
        view = object;
      }
      if (i === this.views.content.length) {
        view.appendTo(this.el);
      } else {
        this.el.insertBefore(view.el, this.views.content[i].el);
      }
      this.content.splice(i, 0, {
        object: object,
        view: view
      });
      this.views.content.splice(i, 0, view);
      return view;
    };

    return LRSListView;

  })(LRSView);

  LRSListItemView = (function(_super) {
    __extends(LRSListItemView, _super);

    function LRSListItemView() {
      return LRSListItemView.__super__.constructor.apply(this, arguments);
    }

    return LRSListItemView;

  })(LRSView);

  LRSGeneratedListItemView = (function(_super) {
    __extends(LRSGeneratedListItemView, _super);

    function LRSGeneratedListItemView(template, options, owner) {
      this.options = options;
      this.owner = owner;
      if (template) {
        this.template = template;
      }
      LRSGeneratedListItemView.__super__.constructor.call(this, null, options, this.owner);
    }

    LRSGeneratedListItemView.prototype.initialize = function(object) {
      var name, outlet, value, _ref;
      this.object = object;
      _ref = this.outlets;
      for (name in _ref) {
        outlet = _ref[name];
        value = this.object.get(name);
        if (value) {
          this.set(name, value);
        }
      }
      return LRSGeneratedListItemView.__super__.initialize.call(this, this.object);
    };

    return LRSGeneratedListItemView;

  })(LRSListItemView);

  LRSView.views.LRSListView = LRSListView;

  LRSView.views.LRSListItemView = LRSListItemView;

  LRSView.views.LRSGeneratedListItemView = LRSGeneratedListItemView;

  lrs.LRSView = LRSView;

}).call(this);

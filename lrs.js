"use strict";

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

;(function () {
	"use strict";

	// Setup lrs variable.

	var lrs = window.lrs = {};

	// ## Base
	// Base class to extend from. Currently adds no functionality, except allowing classes that don't extend another class to use mixins.

	var Base = function Base() {
		_classCallCheck(this, Base);
	};

	// ## MixinBuilder
	// Class to extend a superclass with mixins.


	var MixinBuilder = function () {
		function MixinBuilder(superclass) {
			_classCallCheck(this, MixinBuilder);

			this.superclass = superclass || Base;
		}

		// ### with
		// # Return superclass extended with mixins.


		_createClass(MixinBuilder, [{
			key: "with",
			value: function _with() {
				for (var _len = arguments.length, mixins = Array(_len), _key = 0; _key < _len; _key++) {
					mixins[_key] = arguments[_key];
				}

				// Extend each mixin with the next, starting from the superclass.
				return mixins.reduce(function (c, mixin) {
					return mixin(c);
				}, this.superclass);
			}
		}]);

		return MixinBuilder;
	}();

	// Make MixinBuilder available as function mix, allowing `mix(superclass).with(mixin1, mixin2, ...)` syntax.


	var mix = function mix(superclass) {
		return new MixinBuilder(superclass);
	};

	// ## Events
	// Mixin to support class/object events.
	var Events = function Events(superclass) {
		return function (_superclass) {
			_inherits(_class, _superclass);

			function _class() {
				_classCallCheck(this, _class);

				var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(_class).apply(this, arguments));

				Object.defineProperty(_this, '_events', {
					value: {},
					configurable: false,
					enumerable: false,
					writable: false
				});

				return _this;
			}

			// ### on
			// Add an event listener.


			_createClass(_class, [{
				key: "on",
				value: function on(eventName, handler) {

					if (!eventName) throw new Error("Event name missing."); // TODO: Check type?
					if (!handler) throw new Error("Event handler missing."); // TODO: Check type?

					this._events[eventName] = this._events[eventName] || [];

					if (this._events[eventName].indexOf(handler) === -1) {

						this._events[eventName].push(handler);
					}

					return this;
				}

				// ### once
				// Add an event listener that only fires once.

			}, {
				key: "once",
				value: function once(eventName, handler) {

					var _intermediateHandler = function intermediateHandler() {
						this.off(eventName, _intermediateHandler);
						handler.apply(this, arguments);
					};

					_intermediateHandler = _intermediateHandler.bind(this);
					_intermediateHandler.handler = handler;

					return this.on(event, _intermediateHandler);
				}

				// ### off
				// Remove an event listener.

			}, {
				key: "off",
				value: function off(eventName, handler) {

					if (!eventName) throw new Error("Event name missing."); // TODO: Check type?
					if (!handler) throw new Error("Event handler missing."); // TODO: Check type?

					if (!this._events[eventName]) return this;

					var index = -1;

					for (var i in this._events[eventName]) {

						if (this._events[eventName][i] === handler || this._events[eventName][i].handler === handler) {

							index = i;
							break;
						}
					}

					this._events[eventName].splice(index, 1);

					return this;
				}

				// ### trigger
				// Trigger an event.

			}, {
				key: "trigger",
				value: function trigger(eventName, args) {

					if (!this._events[eventName]) return this;

					var _iteratorNormalCompletion = true;
					var _didIteratorError = false;
					var _iteratorError = undefined;

					try {
						for (var _iterator = this._events[eventName].slice()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
							var handler = _step.value;


							handler.apply(this, args);
						}
					} catch (err) {
						_didIteratorError = true;
						_iteratorError = err;
					} finally {
						try {
							if (!_iteratorNormalCompletion && _iterator.return) {
								_iterator.return();
							}
						} finally {
							if (_didIteratorError) {
								throw _iteratorError;
							}
						}
					}

					return this;
				}
			}]);

			return _class;
		}(superclass);
	};
	// ## Object
	// Basic object class with get/set methods and events.

	var LRSObject = function (_mix$with) {
		_inherits(LRSObject, _mix$with);

		function LRSObject() {
			_classCallCheck(this, LRSObject);

			return _possibleConstructorReturn(this, Object.getPrototypeOf(LRSObject).apply(this, arguments));
		}

		return LRSObject;
	}(mix().with(Events));

	lrs.Object = LRSObject;
	lrs.LRSObject = LRSObject;
	// ## View
	// View class. Provides outlets, actions, templates, nesting etc.

	var View = function (_mix$with2) {
		_inherits(View, _mix$with2);

		_createClass(View, null, [{
			key: "parseTemplates",


			// ### `static` parseTemplates
			// Collect all templates from the document. Must be called once, before view initialisation.
			value: function parseTemplates() {

				if (this.templates) return;

				this.templates = {};

				// Go over all elements containing templates.
				var _iteratorNormalCompletion2 = true;
				var _didIteratorError2 = false;
				var _iteratorError2 = undefined;

				try {
					for (var _iterator2 = Array.from(document.querySelectorAll('.templates'))[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
						var templateContainerEl = _step2.value;


						// Remove it from the DOM first.
						templateContainerEl.parentNode.removeChild(templateContainerEl);

						// Create a new element and copy the container's HTML into it to create a DOM structure (in case it was passed as a string, e.g. in script tag).
						var templateContainerHTMLEl = document.createElement('div');
						templateContainerHTMLEl.innerHTML = templateContainerEl.innerHTML;

						// Iterate all the children (templates)
						var _iteratorNormalCompletion3 = true;
						var _didIteratorError3 = false;
						var _iteratorError3 = undefined;

						try {
							for (var _iterator3 = Array.from(templateContainerHTMLEl.children)[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
								var templateEl = _step3.value;


								// If no data-template attribute exists skip this element.
								if (!templateEl.hasAttribute('data-template')) continue;

								// Get the name.
								var name = templateEl.getAttribute('data-template');
								// Remove the data-template attribute.
								templateEl.removeAttribute('data-template');
								// Save the HTML in @templates.
								this.templates[name] = templateEl.outerHTML;
							}
						} catch (err) {
							_didIteratorError3 = true;
							_iteratorError3 = err;
						} finally {
							try {
								if (!_iteratorNormalCompletion3 && _iterator3.return) {
									_iterator3.return();
								}
							} finally {
								if (_didIteratorError3) {
									throw _iteratorError3;
								}
							}
						}
					}
				} catch (err) {
					_didIteratorError2 = true;
					_iteratorError2 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion2 && _iterator2.return) {
							_iterator2.return();
						}
					} finally {
						if (_didIteratorError2) {
							throw _iteratorError2;
						}
					}
				}
			}

			// ### `static` register
			// Register a view.

		}, {
			key: "register",
			value: function register(view) {

				View.views[view.name.replace(/View$/g, '')] = view;
			}
		}]);

		function View() {
			var _ret;

			var _ref = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			var el = _ref.el;
			var template = _ref.template;
			var options = _ref.options;

			_classCallCheck(this, View);

			var _this3 = _possibleConstructorReturn(this, Object.getPrototypeOf(View).call(this));

			_this3.options = options;
			_this3._listeners = [];

			_this3.delegateAction = _this3.delegateAction.bind(_this3);

			// Check to see if we need to load a template and whether we can.
			if ((template || _this3.template) && (!el || el.children.length === 0)) {

				// Yes; load it.
				_this3._loadTemplate(template || _this3.template, el);

				// Put it in the DOM if we are there already.
				if (el && el.parentNode) {
					el.parentNode.replaceChild(_this3.el, el);
				}
			} else {

				// No; just set our el.
				_this3.el = el;
			}

			_this3.hidden = _this3.el.classList.contains('hidden');
			_this3.enabled = !_this3.el.classList.contains('disabled');

			if (!options || options.delayDomConnectionCreation !== true) _this3.createDomConnections();

			return _ret = _this3, _possibleConstructorReturn(_this3, _ret);
		}

		// ### createDomConnections
		// Create all connections to the dom, including subviews, outlets and actions. Will normally be run during construction, but may be delayed through an option.


		_createClass(View, [{
			key: "createDomConnections",
			value: function createDomConnections() {

				if (this._domConnectionsCreated) throw new Error('DOM connections may only be create once.');

				this._domConnectionsCreated = true;

				this._createViews();
				this._createOutlets();
				this._createActions();
			}

			// ### `private` loadTemplate
			// Create our el from the template defined in options.

		}, {
			key: "_loadTemplate",
			value: function _loadTemplate(template, definitionEl) {

				var el = document.createElement('div');
				el.innerHTML = this.constructor.templates[template];

				// Copy classes and data attributes.
				if (definitionEl) {
					var _el$firstChild$classL;

					(_el$firstChild$classL = el.firstChild.classList).add.apply(_el$firstChild$classL, _toConsumableArray(Array.from(definitionEl.classList)));
					var _iteratorNormalCompletion4 = true;
					var _didIteratorError4 = false;
					var _iteratorError4 = undefined;

					try {
						for (var _iterator4 = Object.keys(definitionEl.dataset)[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
							var key = _step4.value;

							el.firstChild.dataset[key] = definitionEl.dataset[key];
						}
					} catch (err) {
						_didIteratorError4 = true;
						_iteratorError4 = err;
					} finally {
						try {
							if (!_iteratorNormalCompletion4 && _iterator4.return) {
								_iterator4.return();
							}
						} finally {
							if (_didIteratorError4) {
								throw _iteratorError4;
							}
						}
					}
				}

				this.el = el.firstChild;

				return this;
			}

			// ### `private` createViews
			// Create subviews.

		}, {
			key: "_createViews",
			value: function _createViews() {

				this.views = {};
				this._viewsArray = [];

				// Iterate over all elements that should be views.
				var _iteratorNormalCompletion5 = true;
				var _didIteratorError5 = false;
				var _iteratorError5 = undefined;

				try {
					for (var _iterator5 = Array.from(this.el.querySelectorAll('[data-view]'))[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
						var viewEl = _step5.value;


						// Skip the element if it has already been processed (prevents nested views from being reprocessed at the wrong level).
						if (!viewEl.hasAttribute('data-view')) continue;

						// Get info from element.
						var info = viewEl.getAttribute('data-view').split(':');
						viewEl.removeAttribute('data-view');

						var name = void 0,
						    view = void 0;

						// Check definition type.
						if (info.length === 1) {

							// Just one property, set name and create a generic view.
							name = info[0];
							view = new lrs.View({ el: viewEl });
						} else {

							// Multiple properties, set name and define options.
							name = info[1];
							var options = {};

							// Check if we have a template/subview options. If so, check if we have a corresponding view or template and set the relevant option.
							if (info.length === 3) {

								if (this.constructor.views[info[2]] || this.constructor.views[info[2] + 'View']) {

									options.defaultChildClass = this.constructor.views[info[2]] || this.constructor.views[info[2] + 'View'];
								} else if (this.constructor.templates[info[2]]) {

									options.defaultChildTemplate = info[2];
								} else {

									throw new Error("View class or template " + info[2] + " used as a default does not exist");
								}
							}

							//Create view.
							view = new (this.constructor.views[info[0]] || this.constructor.views[info[0] + 'View'])({ el: viewEl, options: options });
						}

						this.addView(view, name);
					}
				} catch (err) {
					_didIteratorError5 = true;
					_iteratorError5 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion5 && _iterator5.return) {
							_iterator5.return();
						}
					} finally {
						if (_didIteratorError5) {
							throw _iteratorError5;
						}
					}
				}

				return this;
			}

			// ### `private` createOutlets
			// Set up outlets.

		}, {
			key: "_createOutlets",
			value: function _createOutlets() {

				this.outlets = {};

				// Add the view element itself as an outlet if it should be.
				if (this.el.hasAttribute('data-outlet')) this._createOutlet(this.el);

				// Iterate over all elements that should be outlets.
				var _iteratorNormalCompletion6 = true;
				var _didIteratorError6 = false;
				var _iteratorError6 = undefined;

				try {
					for (var _iterator6 = Array.from(this.el.querySelectorAll('[data-outlet]'))[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
						var outletEl = _step6.value;


						// Create an outlet.
						this._createOutlet(outletEl);
					}

					// Are any custom outlets defined?
				} catch (err) {
					_didIteratorError6 = true;
					_iteratorError6 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion6 && _iterator6.return) {
							_iterator6.return();
						}
					} finally {
						if (_didIteratorError6) {
							throw _iteratorError6;
						}
					}
				}

				if (this.customOutlets) {

					// Yes; iterate over them.
					var _iteratorNormalCompletion7 = true;
					var _didIteratorError7 = false;
					var _iteratorError7 = undefined;

					try {
						for (var _iterator7 = Object.keys(this.customOutlets)[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
							var customOutletName = _step7.value;


							// Add them to our outlets and define their type.
							this.outlets[customOutletName] = this.customOutlets[customOutletName];
							this.outlets[customOutletName].type = 'custom';
						}
					} catch (err) {
						_didIteratorError7 = true;
						_iteratorError7 = err;
					} finally {
						try {
							if (!_iteratorNormalCompletion7 && _iterator7.return) {
								_iterator7.return();
							}
						} finally {
							if (_didIteratorError7) {
								throw _iteratorError7;
							}
						}
					}
				}

				return this;
			}

			// ### `private` createOutlet
			// Create an outlet.

		}, {
			key: "_createOutlet",
			value: function _createOutlet(el) {

				var self = this;

				// Get information from element.
				var name = el.getAttribute('data-outlet');
				var type = (el.tagName || '').toLowerCase();

				// Check if we can safely create an outlet.
				if (this.outlets[name]) throw new Error("Duplicate " + name + " outlets");

				// Remove outlet attribute.
				el.removeAttribute('data-outlet');

				// If it's an input-like element, attach a change listener.
				if (type === 'input' || type === 'textarea' || type === 'select') {

					el.addEventListener('change', function () {
						self.updateOutletFromDom(name);
					});
				}

				// Store the outlet.
				this.outlets[name] = { el: el, type: type };

				//Update our internal value.
				this.updateOutletFromDom(name);

				Object.defineProperty(this, name, {
					configurable: true,
					enumerable: true,
					get: function get() {
						return this.outlets[name].value;
					},
					set: function set(value) {
						this.outlets[name].value = value;
						this.updateDomFromOutlet(name);
						return value;
					}
				});

				return this;
			}

			// ### `private` createActions
			// Set up actions.

		}, {
			key: "_createActions",
			value: function _createActions() {

				this.actions = {};

				// Add action for the view element itself if required.
				if (this.el.hasAttribute('data-action')) this._createAction(this.el);

				// Iterate over all elements that should be outlets.
				var _iteratorNormalCompletion8 = true;
				var _didIteratorError8 = false;
				var _iteratorError8 = undefined;

				try {
					for (var _iterator8 = Array.from(this.el.querySelectorAll('[data-action]'))[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
						var actionEl = _step8.value;


						// Create an outlet.
						this._createAction(actionEl);
					}
				} catch (err) {
					_didIteratorError8 = true;
					_iteratorError8 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion8 && _iterator8.return) {
							_iterator8.return();
						}
					} finally {
						if (_didIteratorError8) {
							throw _iteratorError8;
						}
					}
				}

				return this;
			}

			// ### `private` createAction
			// Create an action.

		}, {
			key: "_createAction",
			value: function _createAction(el) {

				var self = this;

				// Get information from element.
				var actionStrings = el.getAttribute('data-action').split(';');

				// Remove action attribute.
				el.removeAttribute('data-action');

				// Iterate over all the seperated action strings.
				var _iteratorNormalCompletion9 = true;
				var _didIteratorError9 = false;
				var _iteratorError9 = undefined;

				try {
					for (var _iterator9 = actionStrings[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
						var actionString = _step9.value;


						// Parse.

						var _actionString$match = actionString.match(this.constructor.actionStringPattern);

						var _actionString$match2 = _slicedToArray(_actionString$match, 5);

						var eventName = _actionString$match2[1];
						var name = _actionString$match2[2];
						var parameterString = _actionString$match2[4];


						var parameters = parameterString.split(',');
						if (parameters.length === 1 && parameters[0] === '') parameters = [];

						// TODO: Preprocess parameters?

						// Store action.
						if (!this.actions[eventName]) this.actions[eventName] = [];
						this.actions[eventName].push({ el: el, name: name, parameters: parameters });

						// Add listener to element.
						el.addEventListener(eventName, function (e) {
							self.delegateAction(e, this);
						});
					}
				} catch (err) {
					_didIteratorError9 = true;
					_iteratorError9 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion9 && _iterator9.return) {
							_iterator9.return();
						}
					} finally {
						if (_didIteratorError9) {
							throw _iteratorError9;
						}
					}
				}

				return this;
			}

			// ### delegateAction
			// Process an event for an action and dispatch the action.

		}, {
			key: "delegateAction",
			value: function delegateAction(e) {
				var el = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];


				// Don't do anything if we are disabled.
				if (!this.enabled) return;

				// Get the appropriate actions.
				var actions = this.actions[e.type];
				if (!actions) return;

				// Iterate over all actions.
				var _iteratorNormalCompletion10 = true;
				var _didIteratorError10 = false;
				var _iteratorError10 = undefined;

				try {
					for (var _iterator10 = actions[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
						var action = _step10.value;


						// Check if the action belongs to the element that we are delegating for.
						if (el != null && action.el != el) continue;

						var parameters = [];

						// Iterate over all parameters. TODO: preprocess this?
						for (var parameter in action.parameters) {

							// Check type.
							if (parameter === 'null') {

								// If null string, return null.
								parameters.push(null);
							} else if (parameter == 'undefined') {

								// If undefined string, return undefined.
								parameters.push(undefined);
							} else if (parameter.charAt(0).match(/['"]/g) && parameter.charAt(0) === parameter.charAt(parameter.length - 1)) {

								// If string with string delimiters, return the delimited string.
								parameters.push(parameter.substring(1, parameter.length - 1));
							} else if (parameter.match(/^\d*$/) /*(let number = parseInt(parameter, 10)).toString() == parameter*/) {

									// If only numbers, return parsed int.
									parameters.push(parseInt(parameter, 10));
								} else {

								// Otherwise, consider it a property name and return property value.
								parameters.push(this[parameter] || this.get(parameter));
							}
						}

						// Add default parameters to parameters.
						parameters.push(this, el, e);

						// Dispatch action.
						this.dispatch(action.name + 'Action', parameters);
					}
				} catch (err) {
					_didIteratorError10 = true;
					_iteratorError10 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion10 && _iterator10.return) {
							_iterator10.return();
						}
					} finally {
						if (_didIteratorError10) {
							throw _iteratorError10;
						}
					}
				}

				return this;
			}

			// ### dispatch
			// Call a method on either this instance or try up the chain of owners.

		}, {
			key: "dispatch",
			value: function dispatch(methodName) {
				var parameters = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];


				// Start out expecting the need to propagate.
				var propagate = true;

				// Check if the requested method exists on this instance.
				if (this[methodName] && typeof this[methodName] === 'function') {

					// Yes; call it and update propagate value with return value.
					propagate = this[methodName].apply(this, parameters);
				}

				// If the method was not found or the method return true and we have a suitable owner, propagate to owner.
				if (propagate === true && this.owner && this.owner.dispatch) {

					this.owner.dispatch(methodName, parameters);
				}

				return this;
			}

			// ### updateOutletFromDom
			// Update internal outlet value from the DOM.

		}, {
			key: "updateOutletFromDom",
			value: function updateOutletFromDom(name) {

				var outlet = this.outlets[name];

				// If the outlet does not exist, don't do anything.
				if (!outlet) return this; //throw new Error(`Outlet ${name} does not exist`)

				// Update value using predefined methods.
				this.outlets[name].value = (this.constructor.outletTypes[outlet.type] || this.constructor.outletTypes.default).get(outlet, this);

				return this;
			}

			// ### updateOutletFromDom
			// Update DOM outlet value with the internal value.

		}, {
			key: "updateDomFromOutlet",
			value: function updateDomFromOutlet(name) {

				var outlet = this.outlets[name];

				// If the outlet does not exist, don't do anything.
				if (!outlet) return this //hrow new Error(`Outlet ${name} does not exist`)

				// Update value using predefined methods.
				;(this.constructor.outletTypes[outlet.type] || this.constructor.outletTypes.default).set(outlet, this, this.outlets[name].value);

				return this;
			}

			// ### addView
			// Add a view within this view.

		}, {
			key: "addView",
			value: function addView(view, name) {

				// Don't add the view if it already the child of another view.
				if (view.owner) return this; // TODO: Check this._viewsArray?

				// Set info.
				view.owner = this;
				view._name = name;

				// If the view is named 'view', set the view property.
				// TODO: Also allow this.view to be an array (or throw an error if we try to overwrite it)? Since it seems a little weird for the 'view' property to be an array.
				if (name === 'view') this.view = view;

				// Check if there is a view by that name already.
				if (this.views[name]) {

					// Yes; make it an array if it isn't yet and add this view to the array.
					if (!Array.isArray(this.views[name])) this.views[name] = [this.views[name]];

					this.views[name].push(view);
				} else {

					// No; just set the view.
					this.views[name] = view;
				}

				this._viewsArray.push(view);
			}

			// ### removeView
			// Remove a view from this view.

		}, {
			key: "removeView",
			value: function removeView(view) {

				// Stop if this view isn't actually the owner. TODO: throw error?
				if (view.owner != this) return this;

				// Stop if the view isn't in the array.
				var index = this._viewsArray.indexOf(view);
				if (index < 0) return this;

				// Remove.
				this._viewsArray.splice(index, 1);

				// Delete if this.view
				if (this.view === view) delete this.view;

				// Check if the view is actually part of an array.
				if (Array.isArray(this.views[view.name])) {

					// Yes; find it and remove.
					var innerIndex = this.views[view.name].indexOf();
					if (innerIndex < 0) throw new Error('View not found');

					this.views[view.name].splice(innerIndex, 1);
				} else {

					// No; remove key.
					delete this.views[view.name];
				}

				view.owner = null;

				return this;
			}

			// ### appendTo
			// Add view element to another element or another view's element in the DOM and add it to the view stack.

		}, {
			key: "appendTo",
			value: function appendTo(viewOrEl, name) {

				// Add element.
				(viewOrEl.el || viewOrEl).appendChild(this.el);

				// If view and name provided, add it to the view stack.
				if (name && viewOrEl instanceof View) return viewOrEl.addView(this, name);

				return this;
			}

			// ### insertBefore
			// Insert view element before another element or another view's element in the DOM and add it to the view stack.

		}, {
			key: "insertBefore",
			value: function insertBefore(viewOrEl, name) {

				// Add element.
				var el = viewOrEl.el || viewOrEl;
				el.parentNode.insertBefore(this.el, el);

				// If view and name provided, add it to the view stack.
				if (name && viewOrEl instanceof View && viewOrEl.owner) return viewOrEl.owner.addView(this, name);

				return this;
			}

			// ### insertAfter
			// Insert view element after another element or another view's element in the DOM and add it to the view stack.

		}, {
			key: "insertAfter",
			value: function insertAfter(viewOrEl, name) {

				// Get target element.
				var el = viewOrEl.el || viewOrEl;

				// Check if it has a nextSibling.
				if (el.nextSibling) {

					// Yes; insert before that.
					this.insertBefore(el.nextSibling);
				} else {

					// No; append it as the last element.
					el.parentNode.appendChild(this.el);
				}

				// If view and name provided, add it to the view stack.
				if (name && viewOrEl instanceof View && viewOrEl.owner) return viewOrEl.owner.addView(this, name);

				return this;
			}

			// ### remove
			// Remove view element from DOM and remove view from view stack.

		}, {
			key: "remove",
			value: function remove(removeFromOwner) {

				if (!this.el.parentNode) throw new Error('View element is not in DOM');

				this.el.parentNode.removeChild(this.el);

				if (removeFromOwner !== false) this.owner.removeView(this);

				return this;
			}

			// ### withdraw
			// Temporarily remove the element from the DOM to perform operations and put back in.

		}, {
			key: "withdraw",
			value: function withdraw() {

				// Throw error if the view is already withdrawn.
				if (this._previousState) throw new Error('View is already withdrawn');

				// Save state.
				this._previousState = {
					scrollTop: this.el.scrollTop(),
					parentNode: this.el.parentNode,
					placeholderEl: document.createElement('div')
				};

				// Put placeholder element in DOM.
				this._previousState.parentNode.replaceChild(this._previousState.placeholderEl, this.el);

				return this;
			}
		}, {
			key: "reinsert",
			value: function reinsert() {

				if (!this._previousState) throw new Error('View is not withdrawn');

				this._previousState.parentNode.replaceChild(this.el, this._previousState.placeholderEl);
				this.el.scrollTop = this._previousState.scrollTop;

				this._previousState = null;

				return this;
			}

			// ### `property` classList

		}, {
			key: "_setEnabled",


			// ### `private` _setEnabled
			// Update enabled state on this and child views.
			value: function _setEnabled(newState) {
				var _ref2 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

				var _ref2$recursive = _ref2.recursive;
				var recursive = _ref2$recursive === undefined ? true : _ref2$recursive;
				var _ref2$updateClass = _ref2.updateClass;
				var updateClass = _ref2$updateClass === undefined ? true : _ref2$updateClass;
				var _ref2$updateClassRecu = _ref2.updateClassRecursive;
				var updateClassRecursive = _ref2$updateClassRecu === undefined ? false : _ref2$updateClassRecu;
				var _ref2$override = _ref2.override;
				var override = _ref2$override === undefined ? false : _ref2$override;


				if (override === true) {

					this.forceDisabled = !newState;
				} else {

					this.enabledInput = newState;
				}

				// Set state.
				this.enabled = this.forceDisabled === true ? false : this.enabledInput;

				// Toggle disabled class if required.
				if (updateClass === true) newState === true ? this.classList.remove('disabled') : this.classList.add('disabled');

				// Check if we aren't specifically disabling recursive change.
				if (recursive === true) {

					// No; go over all subviews.
					var _iteratorNormalCompletion11 = true;
					var _didIteratorError11 = false;
					var _iteratorError11 = undefined;

					try {
						for (var _iterator11 = this._viewsArray[Symbol.iterator](), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
							var view = _step11.value;


							// Update enabled state of subviews (only updateClass if specifically enabled for recursive updates)
							view._setEnabled(newState, {
								recursive: true,
								updateClass: updateClass && updateClassRecursive === true,
								updateClassRecursive: updateClassRecursive,
								override: override
							});
						}
					} catch (err) {
						_didIteratorError11 = true;
						_iteratorError11 = err;
					} finally {
						try {
							if (!_iteratorNormalCompletion11 && _iterator11.return) {
								_iterator11.return();
							}
						} finally {
							if (_didIteratorError11) {
								throw _iteratorError11;
							}
						}
					}
				}

				return this;
			}

			// ### enable
			// Enable interactions.

		}, {
			key: "enable",
			value: function enable(options) {

				return this._setEnabled(true, options);
			}

			// ### disable
			// Disable interactions.

		}, {
			key: "disable",
			value: function disable(options) {

				return this._setEnabled(false, options);
			}

			// ### show
			// Show view.

		}, {
			key: "show",
			value: function show() {

				// Change hidden state and class and enable.
				this.hidden = false;
				this.enable({ updateClass: false, override: true });
				this.classList.remove('hidden');

				return this;
			}

			// ### hide
			// Hide view.

		}, {
			key: "hide",
			value: function hide() {

				// Change hidden state and class and disable.
				this.hidden = true;
				this.disable({ updateClass: false, override: true });
				this.classList.add('hidden');

				return this;
			}

			// ### hideAction
			// Proxy for hide.

		}, {
			key: "hideAction",
			value: function hideAction() {

				return this.hide();
			}

			// ### listenTo
			// Add an event listener to an object that is automatically managed.

		}, {
			key: "listenTo",
			value: function listenTo(object, eventName, callback) {

				// Iterate over all registered listeners.
				for (var i = 0; i < this._listeners; i++) {

					var listener = this._listeners[i];

					// If this listener already exists, return.
					if (listener.object === object && listener.eventName === eventName && listener.callback === callback) {

						return this;
					}
				}

				// Add event listener.
				object.on(eventName, callback);

				// Track it.
				this._listeners.push({ object: object, eventName: eventName, callback: callback });

				return this;
			}

			// ### stopListeningTo
			// Remove a managed event listener.

		}, {
			key: "stopListeningTo",
			value: function stopListeningTo(object, eventName, callback) {

				// Iterate over all registered listeners.
				for (var i = 0; i < this._listeners; i++) {

					var listener = this._listeners[i];

					// If this is the correct listener, remove it.
					if (listener.object === object && listener.eventName === eventName && listener.callback === callback) {

						listener.object.off(listener.eventName, listener.callback);
						this._listeners.splice(i, 1);
						break;
					}
				}

				return this;
			}

			// ### deconstruct
			// Stop listening to registered event listeners and deconstruct children.

		}, {
			key: "deconstruct",
			value: function deconstruct() {

				// Only allow deconstruction if the view is not in use.
				if (this.owner) throw new Error('View may not be in view stack. Call remove() first.');

				// Go over all registered listeners and stop listening.
				var _iteratorNormalCompletion12 = true;
				var _didIteratorError12 = false;
				var _iteratorError12 = undefined;

				try {
					for (var _iterator12 = this._listeners[Symbol.iterator](), _step12; !(_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
						var listener = _step12.value;


						listener.object.off(listener.eventName, listener.callback);
					}

					// Deconstruct all subviews.
				} catch (err) {
					_didIteratorError12 = true;
					_iteratorError12 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion12 && _iterator12.return) {
							_iterator12.return();
						}
					} finally {
						if (_didIteratorError12) {
							throw _iteratorError12;
						}
					}
				}

				var _iteratorNormalCompletion13 = true;
				var _didIteratorError13 = false;
				var _iteratorError13 = undefined;

				try {
					for (var _iterator13 = this._viewsArray[Symbol.iterator](), _step13; !(_iteratorNormalCompletion13 = (_step13 = _iterator13.next()).done); _iteratorNormalCompletion13 = true) {
						var view = _step13.value;


						view.deconstruct();
					}
				} catch (err) {
					_didIteratorError13 = true;
					_iteratorError13 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion13 && _iterator13.return) {
							_iterator13.return();
						}
					} finally {
						if (_didIteratorError13) {
							throw _iteratorError13;
						}
					}
				}
			}
		}, {
			key: "classList",
			get: function get() {

				return this.el.classList;
			}
		}]);

		return View;
	}(mix().with(Events));

	var ListView = function (_View) {
		_inherits(ListView, _View);

		function ListView() {
			_classCallCheck(this, ListView);

			return _possibleConstructorReturn(this, Object.getPrototypeOf(ListView).apply(this, arguments));
		}

		_createClass(ListView, [{
			key: "reset",
			value: function reset(content) {

				if (!content && (!this.content || this.content.length == 0)) return this;

				if (!this.views.content) this.views.content = [];

				if (this.views.content.length) {
					var _iteratorNormalCompletion14 = true;
					var _didIteratorError14 = false;
					var _iteratorError14 = undefined;

					try {

						for (var _iterator14 = this.views.content[Symbol.iterator](), _step14; !(_iteratorNormalCompletion14 = (_step14 = _iterator14.next()).done); _iteratorNormalCompletion14 = true) {
							var view = _step14.value;


							this._removeContentView(view);
						}
					} catch (err) {
						_didIteratorError14 = true;
						_iteratorError14 = err;
					} finally {
						try {
							if (!_iteratorNormalCompletion14 && _iterator14.return) {
								_iterator14.return();
							}
						} finally {
							if (_didIteratorError14) {
								throw _iteratorError14;
							}
						}
					}

					this.views.content = [];
				}

				this.content = [];

				if (content) {

					for (var i = 0; i < content.length; i++) {

						this._processObject(content[i], i);
					}
				}

				return this;
			}
		}, {
			key: "add",
			value: function add(object, before) {

				var i;

				if (before === true) {

					i = 0;
				} else if (before === false) {

					i = this.content.length;
				} else {

					i = this.indexForObject(before);
					if (i < 0) i = this.content.length;
				}

				this._processObject(object, i);

				return this;
			}
		}, {
			key: "remove",
			value: function remove(object) {

				var i = this.indexForObject(object);
				var view = this.views.content[i];

				if (i < 0) return this; //TODO: Throw error?

				this.content.splice(i, 1);
				this.views.content.splice(i, 1);
				this._removeContentView(view);

				return this;
			}
		}, {
			key: "_removeContentView",
			value: function _removeContentView(view) {

				this._viewsArray.splice(this._viewsArray.indexOf(view));

				view.remove(false);
				view.owner = null;
				view.deconstruct();
			}
		}, {
			key: "sort",
			value: function sort(content) {

				if (!content.length || !this.content) return this;

				var newContent = [];
				var newContentViews = [];

				var _iteratorNormalCompletion15 = true;
				var _didIteratorError15 = false;
				var _iteratorError15 = undefined;

				try {
					for (var _iterator15 = content[Symbol.iterator](), _step15; !(_iteratorNormalCompletion15 = (_step15 = _iterator15.next()).done); _iteratorNormalCompletion15 = true) {
						var object = _step15.value;


						var c = this.content[this.indexForObject(object)];
						newContent.push(c);
						newContentViews.push(c.view);
					}
				} catch (err) {
					_didIteratorError15 = true;
					_iteratorError15 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion15 && _iterator15.return) {
							_iterator15.return();
						}
					} finally {
						if (_didIteratorError15) {
							throw _iteratorError15;
						}
					}
				}

				this.content = newContent;
				this.views.content = newContentViews;

				this.withdraw();

				var _iteratorNormalCompletion16 = true;
				var _didIteratorError16 = false;
				var _iteratorError16 = undefined;

				try {
					for (var _iterator16 = this.views.content[Symbol.iterator](), _step16; !(_iteratorNormalCompletion16 = (_step16 = _iterator16.next()).done); _iteratorNormalCompletion16 = true) {
						var view = _step16.value;


						view.appendTo(this);
					}
				} catch (err) {
					_didIteratorError16 = true;
					_iteratorError16 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion16 && _iterator16.return) {
							_iterator16.return();
						}
					} finally {
						if (_didIteratorError16) {
							throw _iteratorError16;
						}
					}
				}

				this.reinsert();

				return this;
			}
		}, {
			key: "indexForObject",
			value: function indexForObject(object) {

				for (var i = 0; i < this.content.length; i++) {

					if (this.content[i].object === object) return i;
				}

				return -1;
			}
		}, {
			key: "indexForView",
			value: function indexForView(view) {

				for (var i = 0; i < this.content.length; i++) {

					if (this.content[i].view === view) return i;
				}

				return -1;
			}
		}, {
			key: "viewForObject",
			value: function viewForObject(object) {

				var i = this.indexForObject(object);
				if (i < 0) return undefined;
				return this.content[i].view;
			}
		}, {
			key: "_processObject",
			value: function _processObject(object, i) {

				var view;

				if (object instanceof View) {

					view = object;
				} else {

					if (this.options.defaultChildClass) {

						view = new this.options.defaultChildClass();
						view.object = object;
					} else {

						view = new GeneratedListItemView({
							template: this.options.defaultChildTemplate
						});
						view.object = object;
					}
				}

				if (view.owner) throw new Error('View is already owned by a view');
				view._name = 'content';
				view.owner = this;
				this._viewsArray.push(view);

				if (i === this.views.content.length) {

					view.appendTo(this);
				} else {

					view.insertBefore(this.views.content[i]);
				}

				this.content.splice(i, 0, { object: object, view: view });
				this.views.content.splice(i, 0, view);

				return view;
			}
		}]);

		return ListView;
	}(View);

	var ListItemView = function (_View2) {
		_inherits(ListItemView, _View2);

		function ListItemView() {
			_classCallCheck(this, ListItemView);

			return _possibleConstructorReturn(this, Object.getPrototypeOf(ListItemView).apply(this, arguments));
		}

		return ListItemView;
	}(View);

	var GeneratedListItemView = function (_ListItemView) {
		_inherits(GeneratedListItemView, _ListItemView);

		function GeneratedListItemView() {
			_classCallCheck(this, GeneratedListItemView);

			return _possibleConstructorReturn(this, Object.getPrototypeOf(GeneratedListItemView).apply(this, arguments));
		}

		_createClass(GeneratedListItemView, [{
			key: "object",


			// ### `property` object
			set: function set(object) {

				this._object = object;

				var _iteratorNormalCompletion17 = true;
				var _didIteratorError17 = false;
				var _iteratorError17 = undefined;

				try {
					for (var _iterator17 = Object.keys(this.outlets)[Symbol.iterator](), _step17; !(_iteratorNormalCompletion17 = (_step17 = _iterator17.next()).done); _iteratorNormalCompletion17 = true) {
						var outletName = _step17.value;


						var value = object[outletName];
						if (value !== undefined) this[outletName] = value;
					}
				} catch (err) {
					_didIteratorError17 = true;
					_iteratorError17 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion17 && _iterator17.return) {
							_iterator17.return();
						}
					} finally {
						if (_didIteratorError17) {
							throw _iteratorError17;
						}
					}
				}
			}

			// ### `property` object
			,
			get: function get() {

				return this._object;
			}
		}]);

		return GeneratedListItemView;
	}(ListItemView);

	View.outletTypes = {
		custom: {
			get: function get(outlet, view) {
				return outlet.get(view.el);
			},
			set: function set(outlet, view, value) {
				return outlet.set(view.el, value);
			}
		},
		input: {
			get: function get(outlet, view) {
				if (outlet.el.type === 'checkbox') {
					return outlet.el.checked;
				} else {
					return outlet.el.value;
				}
			},
			set: function set(outlet, view, value) {
				if (outlet.el.type === 'checkbox') {
					return outlet.el.checked = value ? true : false;
				} else {
					return outlet.el.value = value != null ? value : '';
				}
			}
		},
		img: {
			get: function get(outlet, view) {
				return outlet.el.src;
			},
			set: function set(outlet, view, value) {
				return outlet.el.src = value != null ? value || '' : void 0;
			}
		},
		html: {
			get: function get(outlet, view) {
				return outlet.el.innerHTML;
			},
			set: function set(outlet, view, value) {
				return outlet.el.innerHTML = value != null ? value : '';
			}
		}
	};

	View.outletTypes.default = View.outletTypes.html;
	View.outletTypes.textarea = View.outletTypes.input;

	View.views = {
		LRSListView: ListView,
		LRSListItemView: ListItemView,
		LRSGeneratedListItemView: GeneratedListItemView
	};

	View.register(ListView);
	View.register(ListItemView);
	View.register(GeneratedListItemView);

	View.isTouch = document.ontouchstart == null;
	View.actionStringPattern = /^(.*?):([A-Za-z0-9_-]*)(\((.*?)\))?$/;

	lrs.View = View;
	lrs.views = View.views;
	lrs.LRSView = View;
})();
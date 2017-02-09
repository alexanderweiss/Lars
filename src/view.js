// ## View
// View class. Provides outlets, actions, templates, nesting etc.
class View extends mix().with(Events) {

	// ### `static` parseTemplates
	// Collect all templates from the document. Must be called once, before view initialisation.
	static parseTemplates() {

		if (this.templates) return

		this.templates = {}

		// Go over all elements containing templates.
		for (let templateContainerEl of Array.from(document.querySelectorAll('.templates'))) {

			// Remove it from the DOM first.
			templateContainerEl.parentNode.removeChild(templateContainerEl)

			// Create a new element and copy the container's HTML into it to create a DOM structure (in case it was passed as a string, e.g. in script tag).
			let templateContainerHTMLEl = document.createElement('div')
			templateContainerHTMLEl.innerHTML = templateContainerEl.innerHTML

			// Iterate all the children (templates)
			for (let templateEl of Array.from(templateContainerHTMLEl.children)) {

				// If no data-template attribute exists skip this element.
				if (!templateEl.hasAttribute('data-template')) continue

				// Get the name.
				let name = templateEl.getAttribute('data-template')
				// Remove the data-template attribute.
				templateEl.removeAttribute('data-template')
				// Save the HTML in @templates.
				this.templates[name] = templateEl.outerHTML

			}


		}

	}

	// ### `static` register
	// Register a view.
	static register(view) {

		View.views[view.name.replace(/View$/g, '')] = view

	}

	constructor({el, template, options} = {}) {

		super()

		this.options = options
		this._listeners = []

		this.delegateAction = this.delegateAction.bind(this)

		// Check to see if we need to load a template and whether we can.
		if ((template || this.template) && (!el || el.children.length === 0)) {

			// Yes; load it.
			this._loadTemplate(template || this.template, el)

			// Put it in the DOM if we are there already.
			if (el && el.parentNode) {
				el.parentNode.replaceChild(this.el, el)
			}

		} else {

			// No; just set our el.
			this.el = el

		}

		this.hidden = this.el.classList.contains('hidden')
		this.enabled = this.enabledInput = !this.el.classList.contains('disabled')

		if (!options || options.delayDomConnectionCreation !== true) this.createDomConnections()

		return this

	}

	// ### createDomConnections
	// Create all connections to the dom, including subviews, outlets and actions. Will normally be run during construction, but may be delayed through an option.
	createDomConnections() {

		if (this._domConnectionsCreated) throw new Error('DOM connections may only be create once.')

		this._domConnectionsCreated = true

		this._createViews()
		this._createOutlets()
		this._createActions()

	}

	// ### `private` loadTemplate
	// Create our el from the template defined in options.
	_loadTemplate(template, definitionEl) {

		var el = document.createElement('div')
		el.innerHTML = this.constructor.templates[template]

		// Copy classes and data attributes.
		if (definitionEl) {

			el.firstChild.classList.add(...Array.from(definitionEl.classList))
			for (let key of Object.keys(definitionEl.dataset)) {
				el.firstChild.dataset[key] = definitionEl.dataset[key]
			}

		}


		this.el = el.firstChild

		return this

	}

	// ### `private` createViews
	// Create subviews.
	_createViews() {

		this.views = {}
		this._viewsArray = []

		// Iterate over all elements that should be views.
		for (let viewEl of Array.from(this.el.querySelectorAll('[data-view]'))) {

			// Skip the element if it has already been processed (prevents nested views from being reprocessed at the wrong level).
			if (!viewEl.hasAttribute('data-view')) continue

			// Get info from element.
			let info = viewEl.getAttribute('data-view').split(':')
			viewEl.removeAttribute('data-view')

			let name, view

			// Check definition type.
			if (info.length === 1) {

				// Just one property, set name and create a generic view.
				name = info[0]
				view = new lrs.View({el: viewEl})

			} else {

				// Multiple properties, set name and define options.
				name = info[1]
				let options = {}

				// Check if we have a template/subview options. If so, check if we have a corresponding view or template and set the relevant option.
				if (info.length === 3) {

					if (this.constructor.views[info[2]] || this.constructor.views[info[2] + 'View']) {

						options.defaultChildClass = this.constructor.views[info[2]] || this.constructor.views[info[2] + 'View']

					} else if (this.constructor.templates[info[2]]) {

						options.defaultChildTemplate = info[2]

					} else {

						throw new Error(`View class or template ${info[2]} used as a default does not exist`)

					}

				}

				let viewClass = this.constructor.views[info[0]] || this.constructor.views[info[0] + 'View']
				if (!viewClass) throw new Error(`No view class registered for name ${info[0]}`)

				// Create view.
				view = new viewClass({el: viewEl, options})

			}

			this.addView(view, name)

		}

		return this

	}

	// ### `private` createOutlets
	// Set up outlets.
	_createOutlets() {

		this.outlets = {}

		// Add the view element itself as an outlet if it should be.
		if (this.el.hasAttribute('data-outlet')) this._createOutlet(this.el)

		// Iterate over all elements that should be outlets.
		for (let outletEl of Array.from(this.el.querySelectorAll('[data-outlet]'))) {

			// Create an outlet.
			this._createOutlet(outletEl)

		}

		// Are any custom outlets defined?
		if (this.customOutlets) {

			// Yes; iterate over them.
			for (let customOutletName of Object.keys(this.customOutlets)) {

				// Add them to our outlets and define their type.
				this.outlets[customOutletName] = this.customOutlets[customOutletName]
				this.outlets[customOutletName].type = 'custom'

			}

		}

		return this

	}

	// ### `private` createOutlet
	// Create an outlet.
	_createOutlet(el) {

		var self = this

		// Get information from element.
		var name = el.getAttribute('data-outlet')
		var type = (el.tagName || '').toLowerCase()

		// Check if we can safely create an outlet.
		if (this.outlets[name]) throw new Error(`Duplicate ${name} outlets`)

		// Remove outlet attribute.
		el.removeAttribute('data-outlet')

		// If it's an input-like element, attach a change listener.
		if (type === 'input' || type === 'textarea' || type === 'select') {

			el.addEventListener('change', function () { self.updateOutletFromDom(name) })

		}

		// Store the outlet.
		this.outlets[name] = {el, type}

		//Update our internal value.
		this.updateOutletFromDom(name)

		if (!(name in this)) {

			Object.defineProperty(this, name, {
				configurable: true,
				enumerable: true,
				get: function() {
					return this.outlets[name].value
				},
				set: function(value) {
					this.outlets[name].value = value
					this.updateDomFromOutlet(name)
					return value
				}
			})
		}

		return this

	}

	// ### `private` createActions
	// Set up actions.
	_createActions() {

		this.actions = {}

		// Add action for the view element itself if required.
		if (this.el.hasAttribute('data-action')) this._createAction(this.el)

		// Iterate over all elements that should be outlets.
		for (let actionEl of Array.from(this.el.querySelectorAll('[data-action]'))) {

			// Create an outlet.
			this._createAction(actionEl)

		}


		return this

	}

	// ### `private` createAction
	// Create an action.
	_createAction(el) {

		var self = this

		// Get information from element.
		var actionStrings = el.getAttribute('data-action').split(/;(?=[^'"]*?\()/)

		// Remove action attribute.
		el.removeAttribute('data-action')

		// Iterate over all the seperated action strings.
		for (let actionString of actionStrings) {

			// Parse.
			let [, eventName, name, , parameterString] = actionString.match(this.constructor.actionStringPattern)

			let parameters = parameterString.split(/\s*,\s*/)
			if (parameters.length === 1 && parameters[0] === '') parameters = []

			// TODO: Preprocess parameters?

			// Store action.
			if (!this.actions[eventName]) this.actions[eventName] = []
			this.actions[eventName].push({el, name, parameters})

			// Add listener to element.
			el.addEventListener(eventName, function(e) { self.delegateAction(e, this) })

		}

		return this

	}

	// ### delegateAction
	// Process an event for an action and dispatch the action.
	delegateAction(e, el = null) {

		// Don't do anything if we are disabled.
		if (!this.enabled) return

		// Get the appropriate actions.
		var actions = this.actions[e.type]
		if (!actions) return

		// Iterate over all actions.
		for (let action of actions) {

			// Check if the action belongs to the element that we are delegating for.
			if (el != null && action.el != el) continue

			let parameters = []

			// Iterate over all parameters. TODO: preprocess this?
			for (let parameter of action.parameters) {

				// Check type.
				if (parameter === 'null') {

					// If null string, return null.
					parameters.push(null)

				} else if (parameter == 'undefined') {

					// If undefined string, return undefined.
					parameters.push(undefined)

				} else if (parameter.charAt(0).match(/['"]/g) && parameter.charAt(0) === parameter.charAt(parameter.length - 1)) {

					// If string with string delimiters, return the delimited string.
					parameters.push(parameter.substring(1, parameter.length - 1))

				} else if (parameter.match(/^\d*$/) /*(let number = parseInt(parameter, 10)).toString() == parameter*/) {

					// If only numbers, return parsed int.
					parameters.push(parseInt(parameter, 10))

				} else {

					// Otherwise, consider it a property name and return property value.
					parameters.push(this[parameter])

				}

			}

			// Add default parameters to parameters.
			parameters.push(this, el, e)

			// Dispatch action.
			this.dispatch(action.name + 'Action', parameters)

		}

		return this

	}

	// ### dispatch
	// Call a method on either this instance or try up the chain of owners.
	dispatch(methodName, parameters = null) {

		// Start out expecting the need to propagate.
		var propagate = true

		// Check if the requested method exists on this instance.
		if (this[methodName] && typeof this[methodName] === 'function') {

			// Yes; call it and update propagate value with return value.
			propagate = this[methodName].apply(this, parameters)

		}

		// If the method was not found or the method return true and we have a suitable owner, propagate to owner.
		if (propagate === true && this.owner && this.owner.dispatch) {

			this.owner.dispatch(methodName, parameters)

		}

		return this

	}

	// ### updateOutletFromDom
	// Update internal outlet value from the DOM.
	updateOutletFromDom(name) {

		var outlet = this.outlets[name]

		// If the outlet does not exist, don't do anything.
		if (!outlet) return this //throw new Error(`Outlet ${name} does not exist`)

		// Update value using predefined methods.
		this.outlets[name].value = (this.constructor.outletTypes[outlet.type] || this.constructor.outletTypes.default).get(outlet, this)

		return this

	}

	// ### updateOutletFromDom
	// Update DOM outlet value with the internal value.
	updateDomFromOutlet(name) {

		var outlet = this.outlets[name]

		// If the outlet does not exist, don't do anything.
		if (!outlet) return this //hrow new Error(`Outlet ${name} does not exist`)

		// Update value using predefined methods.
		;(this.constructor.outletTypes[outlet.type] || this.constructor.outletTypes.default).set(outlet, this, this.outlets[name].value)

		return this

	}

	// ### addView
	// Add a view within this view.
	addView(view, name) {

		// Don't add the view if it already the child of another view.
		if (view.owner) return this // TODO: Check this._viewsArray?

		// Set info.
		view.owner = this
		view._name = name

		// If the view is named 'view', set the view property.
		// TODO: Also allow this.view to be an array (or throw an error if we try to overwrite it)? Since it seems a little weird for the 'view' property to be an array.
		if (name === 'view') this.view = view

		// Check if there is a view by that name already.
		if (this.views[name]) {

			// Yes; make it an array if it isn't yet and add this view to the array.
			if (!Array.isArray(this.views[name])) this.views[name] = [this.views[name]]

			this.views[name].push(view)

		} else {

			// No; just set the view.
			this.views[name] = view

		}

		this._viewsArray.push(view)

	}

	// ### removeView
	// Remove a view from this view.
	removeView(view) {

		// Stop if this view isn't actually the owner. TODO: throw error?
		if (view.owner != this) return this

		// Stop if the view isn't in the array.
		var index = this._viewsArray.indexOf(view)
		if (index < 0) return this

		// Remove.
		this._viewsArray.splice(index, 1)

		// Delete if this.view
		if (this.view === view) delete this.view

		// Check if the view is actually part of an array.
		if (Array.isArray(this.views[view._name])) {

			// Yes; find it and remove.
			var innerIndex = this.views[view._name].indexOf()
			if (innerIndex < 0) throw new Error('View not found')

			this.views[view._name].splice(innerIndex, 1)

		} else {

			// No; remove key.
			delete this.views[view._name]

		}

		view.owner = null

		return this

	}

	// ### appendTo
	// Add view element to another element or another view's element in the DOM and add it to the view stack.
	appendTo(viewOrEl, name) {

		// Add element.
		(viewOrEl.el || viewOrEl).appendChild(this.el)

		// If view and name provided, add it to the view stack.
		if (name && viewOrEl instanceof View) return viewOrEl.addView(this, name)

		return this

	}

	// ### insertBefore
	// Insert view element before another element or another view's element in the DOM and add it to the view stack.
	insertBefore(viewOrEl, name) {

		// Add element.
		var el = viewOrEl.el || viewOrEl
		el.parentNode.insertBefore(this.el, el)

		// If view and name provided, add it to the view stack.
		if (name && viewOrEl instanceof View && viewOrEl.owner) return viewOrEl.owner.addView(this, name)

		return this

	}

	// ### insertAfter
	// Insert view element after another element or another view's element in the DOM and add it to the view stack.
	insertAfter(viewOrEl, name) {

		// Get target element.
		var el = (viewOrEl.el || viewOrEl)

		// Check if it has a nextSibling.
		if (el.nextSibling) {

			// Yes; insert before that.
			this.insertBefore(el.nextSibling)

		} else {

			// No; append it as the last element.
			el.parentNode.appendChild(this.el)

		}

		// If view and name provided, add it to the view stack.
		if (name && viewOrEl instanceof View && viewOrEl.owner) return viewOrEl.owner.addView(this, name)

		return this

	}

	// ### remove
	// Remove view element from DOM and remove view from view stack.
	remove(removeFromOwner) {

		if (!this.el.parentNode) throw new Error('View element is not in DOM')

		this.el.parentNode.removeChild(this.el)

		if (removeFromOwner !== false) this.owner.removeView(this)

		return this

	}

	// ### withdraw
	// Temporarily remove the element from the DOM to perform operations and put back in.
	withdraw(restoreScrollTop = true) {

		// Throw error if the view is already withdrawn.
		if (this._previousState) throw new Error('View is already withdrawn')

		// Save state.
		this._previousState = {
			scrollTop: restoreScrollTop ? this.el.scrollTop : null,
			parentNode: this.el.parentNode,
			placeholderEl: document.createElement('div')
		}

		// Put placeholder element in DOM.
		this._previousState.parentNode.replaceChild(this._previousState.placeholderEl, this.el)

		return this


	}

	reinsert() {

		if (!this._previousState) throw new Error('View is not withdrawn')

		this._previousState.parentNode.replaceChild(this.el, this._previousState.placeholderEl)
		if (this._previousState.scrollTop) this.el.scrollTop = this._previousState.scrollTop

		this._previousState = null

		return this

	}

	// ### `property` classList
	get classList() {

		return this.el.classList

	}

	// ### `private` _setEnabled
	// Update enabled state on this and child views.
	_setEnabled(newState, {recursive = true, updateClass = true, updateClassRecursive = false, override = false} = {}) {

		if (override === true) {

			this.forceDisabled = !newState

		} else {

			this.enabledInput = newState

		}

		// Set state.
		this.enabled = this.forceDisabled === true ? false : this.enabledInput

		// Toggle disabled class if required.
		if (updateClass === true) newState === true ? this.classList.remove('disabled') : this.classList.add('disabled')

		// Check if we aren't specifically disabling recursive change.
		if (recursive === true) {

			// No; go over all subviews.
			for (let view of this._viewsArray) {

				// Update enabled state of subviews (only updateClass if specifically enabled for recursive updates)
				view._setEnabled(newState, {
					recursive: true,
					updateClass: updateClass && updateClassRecursive === true,
					updateClassRecursive: updateClassRecursive,
					override: override
				})

			}

		}

		return this

	}

	// ### enable
	// Enable interactions.
	enable(options) {

		return this._setEnabled(true, options)

	}

	// ### disable
	// Disable interactions.
	disable(options) {

		return this._setEnabled(false, options)

	}

	// ### show
	// Show view.
	show() {

		// Change hidden state and class and enable.
		this.hidden = false
		this.enable({updateClass: false, override: true})
		this.classList.remove('hidden')

		return this

	}

	// ### hide
	// Hide view.
	hide() {

		// Change hidden state and class and disable.
		this.hidden = true
		this.disable({updateClass: false, override: true})
		this.classList.add('hidden')

		return this

	}

	// ### hideAction
	// Proxy for hide.
	hideAction() {

		return this.hide()

	}

	// ### listenTo
	// Add an event listener to an object that is automatically managed.
	listenTo(object, eventName, callback) {

		// Iterate over all registered listeners.
		for (let i = 0; i < this._listeners; i++) {

			let listener = this._listeners[i]

			// If this listener already exists, return.
			if (listener.object === object && listener.eventName === eventName && listener.callback === callback) {

				return this

			}

		}

		// Add event listener.
		object.on(eventName, callback)

		// Track it.
		this._listeners.push({object, eventName, callback})

		return this

	}

	// ### stopListeningTo
	// Remove a managed event listener.
	stopListeningTo(object, eventName, callback) {

		// Iterate over all registered listeners.
		for (let i = 0; i < this._listeners; i++) {

			let listener = this._listeners[i]

			// If this is the correct listener, remove it.
			if (listener.object === object && listener.eventName === eventName && listener.callback === callback) {

				listener.object.off(listener.eventName, listener.callback)
				this._listeners.splice(i, 1)
				break

			}

		}

		return this

	}

	// ### deconstruct
	// Stop listening to registered event listeners and deconstruct children.
	deconstruct() {

		// Only allow deconstruction if the view is not in use.
		if (this.owner) throw new Error('View may not be in view stack. Call remove() first.')

		// Go over all registered listeners and stop listening.
		for (let listener of this._listeners) {

			listener.object.off(listener.eventName, listener.callback)

		}

		// Deconstruct all subviews.
		for (let view of this._viewsArray) {

			view.deconstruct()

		}


	}

}

// ## ListView
// View that automatically manages a set of content views based on an array of data (objects).
class ListView extends View {

	constructor() {

		super(...arguments)

		if (this.views.content) throw new Error('ListView currently does not allow setting content from DOM.')

		this.views.content = []

	}

	// ### Reset
	// Replace data with new data.
	reset(content) {

		// If nothing is provided and we have no content, there's nothing to do.
		if (!content && (!this.content || this.content.length == 0)) return this

		// Withdraw while we're updating.
		this.withdraw()

		// If there are content views, remove all of them.
		if (this.views.content.length) {

			for (let view of this.views.content) {

				this._removeContentView(view)

			}

			this.views.content = []

		}

		// Reset content.
		this.content = []

		// If content was provided, process all objects in the data provided.
		if (content) {

			for (let i = 0; i < content.length; i++) {

				this._processObject(content[i], i)

			}

		}

		// Reinsert the view.
		this.reinsert()

		return this

	}

	// ### add
	// Add an object at a specific position the array.
	add(object, before) {

		var i

		// Check before.
		if (before === true) {

			// If before is true, put in front.
			i = 0

		} else if (before === false) {

			// If before is false, put at back.
			i = this.content.length

		} else {

			// Otherwise, find the index of the before value and put it before that.
			i = this.indexForObject(before)
			// If none is found, put it at the back.
			if (i < 0) i = this.content.length

		}

		// Process the object.
		this._processObject(object, i)

		return this

	}

	// ### remove
	// Remove an object from the array.
	remove(object) {

		// Get the index and the view.
		var i = this.indexForObject(object)
		var view = this.views.content[i]

		// If there is no object, don't do anything.
		if (i < 0) return this //TODO: Throw error?

		// Remove from the arrays and remove the view.
		this.content.splice(i, 1)
		this.views.content.splice(i, 1)
		this._removeContentView(view)


		return this

	}

	// ### sort
	// Update the view order after the array has been sorted.
	sort(content) {

		// Don't do anything if there is no data.
		if (!content.length || !this.content) return this

		var newContent = []
		var newContentViews = []

		// Find the content object (including view) for each content item and add that to the different content arrays so these are ordered correctly.
		for (let object of content) {

			let c = this.content[this.indexForObject(object)]
			newContent.push(c)
			newContentViews.push(c.view)

		}

		// Overwrite the old arrays with the newly sorted arrays.
		this.content = newContent
		this.views.content = newContentViews

		// Withdraw.
		this.withdraw()

		// Re-add all views in order.
		for (let view of this.views.content) {

			view.appendTo(this)

		}

		// Reinsert.
		this.reinsert()

		return this

	}

	// ### indexForObject
	// Retrieve the index of an object in the content array.
	indexForObject(object) {

		// Go over the content array and return the index at which the object is found.
		for (let i = 0; i < this.content.length; i++) {

			if (this.content[i].object === object) return i

		}

		// Otherwise return -1.
		return -1

	}

	// ### indexForView
	// Retrieve the index of a view belonging to an object in the content array.
	indexForView(view) {

		// Go over the content array and return the index if the view is found.
		for (let i = 0; i < this.content.length; i++) {

			if (this.content[i].view === view) return i

		}

		// Otherwise return -1.
		return -1

	}

	// ### viewForObject
	// Retrieve the view for an object.
	viewForObject(object) {

		// Get the index.
		var i = this.indexForObject(object)
		// If the object isn't found, return undefined. TODO: Error?
		if (i < 0) return undefined
		// Return the view at that index.
		return this.content[i].view

	}

	// ### `private` _processObject
	// Create and append a view for an object.
	_processObject(object, i) {

		var view

		// Check if the object is a view itself.
		if (object instanceof View) {

			// Yes; just use that as the view.
			view = object

		} else {

			// No; create the view in the way this class defines that should happen.

			if (this.createViewForObject) {

				view = this.createViewForObject(object)

			} else if (this.options.defaultChildClass) {

				// Yes; create an instance of that class and set the object.
				view = new this.options.defaultChildClass()
				view.object = object

			} else {

				// No; create a GeneratedListItemView, with the defaultChildTemplate (if provided) and set the object.
				view = new GeneratedListItemView({
					template: this.options.defaultChildTemplate
				})
				view.object = object

			}

		}

		// Bypass View.addView, but make sure the result is the same.
		if (view.owner) throw new Error('View is already owned by a view')
		view._name = 'content'
		view.owner = this
		this._viewsArray.push(view)

		// Add the view at the end, or before whatever view is at the index provided.
		if (i === this.views.content.length) {

			view.appendTo(this)

		} else {

			view.insertBefore(this.views.content[i])

		}

		// Add to the arrays.
		this.content.splice(i, 0, {object, view})
		this.views.content.splice(i, 0, view)

		return view

	}

	// ### `private` _removeContentView
	// Remove a view from the view stack. ListView alternative to removeView.
	_removeContentView(view) {

		this._viewsArray.splice(this._viewsArray.indexOf(view))

		view.remove(false)
		view.owner = null
		view.deconstruct()

	}

}

class ListItemView extends View {}

class GeneratedListItemView extends ListItemView {

	// ### `property` object
	set object(object) {

		this._object = object

		// For each outlet, if the object has a property corresponding to it, set that outlet.
		for (let outletName of Object.keys(this.outlets)) {

			let value = object[outletName]
			if (value !== undefined) this[outletName] = value

		}

	}

	// ### `property` object
	get object() {

		return this._object

	}

}

View.outletTypes = {
	custom: {
		get: function(outlet, view) {
			return outlet.get(view.el)
		},
		set: function(outlet, view, value) {
			return outlet.set(view.el, value)
		}
	},
	input: {
		get: function(outlet, view) {
			if (outlet.el.type === 'checkbox') {
				return outlet.el.checked
			} else {
				return outlet.el.value
			}
		},
		set: function(outlet, view, value) {
			if (outlet.el.type === 'checkbox') {
				return outlet.el.checked = value ? true : false
			} else {
				return outlet.el.value = value != null ? value : ''
			}
		}
	},
	img: {
		get: function(outlet, view) {
			return outlet.el.src
		},
		set: function(outlet, view, value) {
			return outlet.el.src = value != null ? value || '' : void 0
		}
	},
	html: {
		get: function(outlet, view) {
			return outlet.el.innerHTML
		},
		set: function(outlet, view, value) {
			return outlet.el.innerHTML = value != null ? value : ''
		}
	}
}

View.outletTypes.default = View.outletTypes.html
View.outletTypes.textarea = View.outletTypes.input

View.views = {
	LRSListView: ListView,
	LRSListItemView: ListItemView,
	LRSGeneratedListItemView: GeneratedListItemView
}

View.register(ListView)
View.register(ListItemView)
View.register(GeneratedListItemView)

View.isTouch = document.ontouchstart == null
View.actionStringPattern = /^\s*(\S*?):([A-Za-z0-9_-]*)(\((.*?)\))?\s*$/

lrs.View = View
lrs.views = View.views
lrs.LRSView = View
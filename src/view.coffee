# ## LRSView
# View class. Provides outlets, actions, templates, nesting etc.
class LRSView extends lrs.LRSObject
	
	@defineOutlets: ->
		@outletTypes =
			custom:
				get: (outlet, view) ->
					outlet.get(view.el)
				set: (outlet, view, value) ->
					outlet.set(view.el, value)
			input:
				get: (outlet, view) ->
					if outlet.el.type is 'checkbox'
						outlet.el.checked
					else
						outlet.el.value
				set: (outlet, view, value) ->
					if outlet.el.type is 'checkbox'
						outlet.el.checked = if value then true else false
					else
						outlet.el.value = if value? then value else ''
			img:
				get: (outlet, view) ->
					outlet.el.src
				set: (outlet, view, value) ->
					outlet.el.src = if value? then value or ''
			html:
				get: (outlet, view) ->
					outlet.el.innerHTML
				set: (outlet, view, value) ->
					outlet.el.innerHTML = if value? then value else ''
		
		@outletTypes.default = @outletTypes.html
		@outletTypes.textarea = @outletTypes.input
		
		
	@defineOutlets()
	
	@isTouch = document.ontouchstart == null

	isView: true

	@views = {}

	@actionPattern = ///^(.*?):(.*?)\((.*?)\)///
	
	# ### `class` parseTemplates
	# Collect all templates from the document. Must be called once, before view initialisation.
	@parseTemplates: ->
		return if @templates
		
		# Define templates
		@templates = {}
		
		# Get all template containers.
		templateContainers = document.querySelectorAll('.templates')
		# Go over all of them to handle the templates inside.
		for templateContainer in templateContainers
			# Remove it from the DOM first.
			templateContainer.parentNode.removeChild(templateContainer)
			# Create a new element and copy the container's HTML into it to create a DOM structure if it was passed in a script tag.
			templateContainerHTML = document.createElement('div')
			templateContainerHTML.innerHTML = templateContainer.innerHTML
			
			# Iterate all the children (templates)
			for template in templateContainerHTML.children
				# If no data-template attribute exists skip this element.
				continue unless template.hasAttribute('data-template')
				# Get the name.
				name = template.getAttribute('data-template')
				# Remove the data-template attribute.
				template.removeAttribute('data-template')
				# Save the HTML in @templates.
				@templates[name] = template.outerHTML

	constructor: (el = null, @options = null, @owner) ->
		if @template and (not el or el.children.length is 0)
			@_loadTemplate()
			if (el)
				classes = el.attr('class')
				if classes then @el.classList.add(classes.split(' '))
				el.parentNode.replaceChild(@el, el)
		else
			@el = el

		@customOutlets = {} if not @customOutlets?
		
		@_createViews()
		@_createOutlets()
		@_createActions()

		super(@options)

	initialize: () ->
		@hidden = @el.classList.contains('hidden')
		@enabled = !@el.classList.contains('disabled')
		
		@initializeViews()
		
		super
		
	initializeViews: ->
		@eachView( (view) ->
			view.initialize()
		)

	_loadTemplate: ->
		_el = document.createElement('div')
		_el.innerHTML = LRSView.templates[@template]
		@el = _el.firstChild

	_createViews: ->
		viewEls = @el.querySelectorAll('[data-view]')
		@views = {}
		for viewEl in viewEls
			continue unless viewEl.hasAttribute('data-view')
			info = viewEl.getAttribute('data-view').split(':')
			viewEl.removeAttribute('data-view')
			
			if info.length is 1
				name = info[0]
				view = new lrs.LRSView(viewEl, null,  @)
			else
				name = info[1]
				view = new lrs.LRSView.views[info[0]+'View'](viewEl, {subTemplate: info[2]}, @)
				
			if name is 'view'
				@view = view
				
			if @views[name]
				unless Array.isArray(@views[name])
					@views[name] = [@views[name]]
				@views[name].push(view)
			else
				@views[name] = view

	_createOutlets: ->
		@outlets = {}
		
		outletEls = @el.querySelectorAll('[data-outlet]')
		@_createOutlet(@el) if @el.hasAttribute('data-outlet')

		for outletEl in outletEls
			@_createOutlet(outletEl)

		if (@customOutlets)
			outlet.type = 'custom' for name, outlet of @customOutlets
			_.extend(@outlets, @customOutlets) # TODO: Update

		@outlets
		
	_createOutlet: (outletEl) ->
		self = @
		
		name = outletEl.getAttribute('data-outlet')
		outletEl.removeAttribute('data-outlet')
		type = (outletEl.tagName || '').toLowerCase()
		if type is 'input' or type is 'textarea'
			outletEl.addEventListener('change', => self.updateOutletFromDom(name))
		@outlets[name] =
			type: type
			el: outletEl
		
		@updateOutletFromDom(name)

	_createActions: ->
		@actions = {}
		
		actionEls = @el.querySelectorAll('[data-action]')
		@_createAction(@el) if @el.hasAttribute('data-action')

		for actionEl in actionEls
			@_createAction(actionEl)

		@actions
		
	_createAction: (actionEl) ->
		self = @
		
		actionStrings = actionEl.getAttribute('data-action').split(';')
		actionEl.removeAttribute('data-action')
		for string in actionStrings
			action = string.match(LRSView.actionPattern) # TODO: Improve reliability; probably use regex.
			action.shift()
			action[2] = action[2].split(',')
			action[2] = [] if action[2][0] == ''
		
			if !lrs.LRSView.isTouch && (action[0] == 'tap' or action[0] == 'singleTap')
				action[0] = 'click'
		
			if (!@actions[action[0]])
				@actions[action[0]] = []
		
			actionEl.addEventListener(action[0], (e) -> self.delegateAction(e, @))
		
			@actions[action[0]].push(
				el: actionEl
				function: action[1]
				parameters: action[2]
			)

	delegateAction: (e, el = false) =>
		return unless @enabled
		
		actions = @actions[e.type]

		return unless actions

		for action in actions
			continue if el != false && action.el != el
			parameters = []

			for parameter in action.parameters
				if parameter is 'null'
					parameters.push(null)
				else if parameter.charAt(0).match(/['"]/g) and parameter.charAt(0) is parameter.charAt(parameter.length-1)
					parameters.push(parameter.substring(1, parameter.length - 1))
				else
					parameters.push(@[parameter])

			parameters.push(@, el, e)

			@dispatch(action.function + 'Action', parameters)
			
	dispatch: (func, parameters = null) ->
		
		propagate = true
		
		if @[func] && _.isFunction(@[func])
			propagate = @[func].apply(@, parameters)
			
		if propagate is true and @owner?.dispatch
			@owner.dispatch(func, parameters)
			
	setOwner: (@owner) ->
		@owner

	updateOutletFromDom: (name) ->
		outlet = @outlets[name]
		return @ if not outlet

		if @constructor.outletTypes[outlet.type]
			@[name] = @constructor.outletTypes[outlet.type].get(outlet, @)
		else
			@[name] = @constructor.outletTypes.default.get(outlet, @)
		
		@

	updateDomFromOutlet: (name) ->
		outlet = @outlets[name]
		return @ if not outlet
		
		if @constructor.outletTypes[outlet.type]
			@constructor.outletTypes[outlet.type].set(outlet, @, @[name])
		else
			@constructor.outletTypes.default.set(outlet, @, @[name])
				
		@

	set: (name, value) ->
		@[name] = value
		@updateDomFromOutlet(name)
		@

	appendTo: (view) ->
		(view.el or view).appendChild(@el)
		@

	insertBefore: (view) ->
		el = view.el or view
		el.parentNode.insertBefore(@el, el)
		@
		
	insertAfter: (view) ->
		@insertBefore((view.el or view).nextSibling)
		@
		
	withdraw: ->
		scrollTop = @el.scrollTop
		
		parentNode = @el.parentNode
		nextSibling = @el.nextSibling
		@el.parentNode.removeChild(@el)
		
		return =>
			if nextSibling
				parentNode.insertBefore(@el, nextSibling)
			else
				parentNode.appendChild(@el)
				
			@el.scrollTop = scrollTop
		
	remove: ->
		@el.parentNode.removeChild(@el)
		@

	addClass: (names...) ->
		@el.classList.add.apply(@el.classList, names)
		@

	removeClass: (names...) ->
		@el.classList.remove.apply(@el.classList, names)
		@
	
	toggleClass: (name, addOrRemove) ->
		@el.classList.toggle(name, addOrRemove)
			
	hasClass: (name) ->
		@el.classList.contains(name)

	enable: (recursive = true, updateClass = true)->
		@enabled = true
		@removeClass('disabled') if updateClass
		if recursive is true
			@eachView( (view) ->
				view.enable(recursive, updateClass)
			)
				
		@

	disable: (recursive = true, updateClass = true) ->
		@enabled = false
		@addClass('disabled') if updateClass
		if recursive is true
			@eachView( (view) ->
				view.disable(recursive, updateClass)
			)
					
		@

	show: ->
		@hidden = false
		@enable(true, false)
		@removeClass('hidden')
		@

	hide: ->
		@hidden = true
		@disable(true, false)
		@addClass('hidden')
		@

	hideAction: -> @hide()
	
	listenTo: (object, event, callback) ->
		object.on(event, callback)
		@listeningTo or= []
		@listeningTo.push(object: object, event: event, callback: callback)
		@
		
	stopListeningTo: (object, event, callback) ->
		return @ unless @listeningTo
		for registeredEvent in @listeningTo
			break if registeredEvent.object is object and registeredEvent.event is event and registeredEvent.callback is callback
		
		if registeredEvent
			registeredEvent.object.off(registeredEvent.event, registeredEvent.callback)
		
		@
	
	deinitialize: ->
		if @listeningTo
			for registeredEvent in @listeningTo
				registeredEvent.object.off(registeredEvent.event, registeredEvent.callback)
		
		@eachView( (view) ->
			view.deinitialize()	
		)
			
	eachView: (func) ->
		for viewName, view of @views
			if Array.isArray(view)
				func(v) for v in view
			else
				func(view)

# ## LRSListView
# List view class. Allows easy creation and updating of a list of views.
class LRSListView extends LRSView
	
	# ### initialize
	initialize: (content = null) ->
		super()
		
		# Check if content is provided and if we have views already (it is assumed initialize is not called anymore after proper initialization).
		if content and @views.content
			
			# Normalize content views to array if there is only one.
			@views.content = [@views.content] unless Array.isArray(@views.content)
			
			# Yes; it's preloaded content. Use it.
			@setPreloadedContent(content)
		else
			# No; it's normal content (or nothing). Use it.
			@reset(content)
			
		@
		
	# ### setPreloadedContent
	# Properly initialize the views we already have from the DOM with correct data and get our own references in order.
	setPreloadedContent: (content) ->
		
		# Set content to nothing.
		@content = []
		
		# Prepare for loop.
		previousView = null
		
		# Iterate all objects provided.
		for object, i in content
			
			# Check if we already have a view for them.
			# Set default to null.
			view = null
			
			# Iterate all our content views.
			for v in @views.content
				# If the data-id attribute is the object's id, it belongs to the object; set view and break from loop.
				if v.el.getAttribute('data-id') is object.id
					view = v
					break
			
			# Check if we found a view.
			if view
				# Yes; initialize it.
				view.initialize(object)
			else
			# TODO: Order!
				view = new @options.itemClass(null, null, @).initialize(object)
				if previousView
					view.insertAfter(previousView.el)
					@views.content.splice(i, 0, view)
				else
					view.appendTo(@el)
					
			@content.push(
				object: object
				view: view
			)

	reset: (content) ->
		#return console.log('d') if not _.isNull(content) and not _.isArray(content)	
		return if content is null and (not @content or @content.length is 0)
		
		@views.content or= []
			
		if @views.content.length
			for view in @views.content
				view.remove().deinitialize()
			@views.content = []
			
		@content = []
		
		if content isnt null
			for object, i in content
				@_processObject(object, i)
				
		@
		
	setContent: -> @reset()
	
	sort: (content) ->
		return if not content.length > 0 or not @content
		
		newContent = []
		newContentViews = []
		
		for object in content
			c = @content[@indexForObject(object)]
			newContent.push(c)
			newContentViews.push(c.view)
		
		@content = newContent
		@views.content = newContentViews
		
		reinsert = @withdraw()
		
		for view in @views.content
			view.appendTo(@)
			
		reinsert()
	
	add: (object, before = false) ->
		if before is true
			i = 0
		else if before is false
			i = @content.length# - 1
		else
			i = @indexForObject(before)
			i = @content.length if i is -1
			
		@_processObject(object, i)
		
	addItem: -> @add()
		
	remove: (object) ->
		i = @indexForObject(object)
		return false if i is -1
		removed = @content.splice(i, 1)
		@views.content[i].remove().deinitialize()
		@views.content.splice(i, 1)
		
	removeItem: -> @remove()
	
	# TODO? contentForObject (object) ->
	indexForObject: (object) ->
		for c, i in @content
			if c.object is object
				return i
		return -1
		
	indexForView: (view) ->
		for c, i in @content
			if c.view is view
				return i
		return -1
				
	viewForObject: (object) ->
		i = @indexForObject(object)
		return undefined if i is -1
		return @content[i].view
		
	# TODO? objectForView: (object) ->
	
	_processObject: (object, i) ->
		if not object.isView # TODO: Use a more reliable check.
			if @options.itemClass
				view = new @options.itemClass(null, null, @).initialize(object)
			else
				view = new lrs.LRSView.views.LRSGeneratedListItemView(@options.subTemplate, null, @).initialize(object)
		else
			view = object
		
		if i is @views.content.length
			view.appendTo(@el)
		else
			@el.insertBefore(view.el, @views.content[i].el)
			
		@content.splice(i, 0,
			object: object
			view: view
		)		
		
		@views.content.splice(i, 0, view) # TODO: Should we keep the views in the right order or just push?
		
		view

class LRSListItemView extends LRSView

class LRSGeneratedListItemView extends LRSListItemView 

	constructor: (template, @options, @owner) ->
		@template = template if template

		super(null, options, @owner)

	initialize: (@object) ->

		for name, outlet of @outlets
			value = @object.get(name)
			if (value) then @set(name, value)

		super(@object)

LRSView.views.LRSListView = LRSListView
LRSView.views.LRSListItemView = LRSListItemView
LRSView.views.LRSGeneratedListItemView = LRSGeneratedListItemView

lrs.LRSView = LRSView
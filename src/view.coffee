class lrs.LRSView extends lrs.LRSObject
	
	@defineOutlets: ->
		@outletTypes =
			custom:
				get: (outlet, view) ->
					outlet.get(view.el)
				set: (outlet, view, value) ->
					outlet.set(view.el, value)
			input:
				get: (outlet, view) ->
					if outlet.el.attr('type') is 'checkbox'
						outlet.el.prop('checked')
					else
						outlet.el.val()
				set: (outlet, view, value) ->
					if outlet.el.attr('type') is 'checkbox'
						outlet.el.prop('checked', value)
					else
						outlet.el.val(value)
			img:
				get: (outlet, view) ->
					outlet.el.attr('src')
				set: (outlet, view, value) ->
					outlet.el.attr('src', value)
			html:
				get: (outlet, view) ->
					outlet.el.html()
				set: (outlet, view, value) ->
					outlet.el.html(value)
		
		@outletTypes.default = @outletTypes.html
		@outletTypes.textarea = @outletTypes.input
		
		
	@defineOutlets()
	
	@isTouch = document.ontouchstart == null

	isView: true

	@views = {}

	@actionPattern = ///^(.*?):(.*?)\((.*?)\)///

	@parseTemplates: ->
		templateContainer = $('.templates')
		templateContainer.remove()
		templateEls = $(templateContainer.html()).filter('[data-template]')
		@templates = {}

		for template in templateEls
			$template = $(template)
			name = $template.attr('data-template')
			$template.removeAttr('data-template')
			@templates[name] = template.outerHTML

	constructor: (el = null, @options = null, @owner) ->
		if @template and (not el or el.children().length is 0)
			@_loadTemplate()
			if (el)
				classes = el.attr('class')
				if classes then @el.addClass(classes)
				el.replaceWith(@el)
		else
			@el = el

		@customOutlets = {} if not @customOutlets?
		
		@_createViews()
		@_createOutlets()
		@_createActions()

		super(@options)

	initialize: () ->
		@hidden = @el.hasClass('hidden')
		@enabled = !@el.hasClass('disabled')
		
		@initializeViews()
		
		super
		
	initializeViews: ->
		@eachView( (view) ->
			view.initialize()
		)

	_loadTemplate: ->
		@el = $(LRSView.templates[@template])

	_createViews: ->
		viewEls = @el.find('[data-view] ')
		@views = {}
		#console.log @, viewEls
		for view in viewEls
			$view = $(view)
			continue unless $view.attr('data-view')
			info = $view.attr('data-view').split(':')
			$view.removeAttr('data-view')
			#console.log info[0] || info[1], viewEls, '1'
			
			if (info.length == 1)
				name = info[0]
				view = new lrs.LRSView($view, null,  @)
			else
				name = info[1]
				view = new lrs.LRSView.views[info[0]+'View']($view, {subTemplate: info[2]}, @)
				
			if name is 'view'
				@view = view
			else
				if @views[name]
					unless Array.isArray(@views[name])
						@views[name] = [@views[name]]
					@views[name].push(view)
				else
					@views[name] = view

	_createOutlets: ->
		outletEls = @el.find('[data-outlet]')
		if (@el.attr('data-outlet')) then outletEls.push(@el)

		@outlets = {}

		for outlet in outletEls
			do (outlet) =>
				$outlet = $(outlet)
				#info = $outlet.attr('data-view').split(':')
				#if (info.length == 1)
				#	info.unshift('default')
				#@outlets[info[1]] = {type: info[0], el: $outlet}
				name = $outlet.attr('data-outlet')
				$outlet.removeAttr('data-outlet')
				type = (outlet.tagName || '').toLowerCase()
				if type is 'input' or type is 'textarea'
					$outlet.on 'change', () => @updateOutletFromDom(name)
				@outlets[name] = {type: type, el: $outlet}

				@updateOutletFromDom(name)

		if (@customOutlets)
			outlet.type = 'custom' for name, outlet of @customOutlets
			_.extend(@outlets, @customOutlets)

		@outlets

	_createActions: ->
		els = @el.find('[data-action]')
		if (@el.attr('data-action')) then els.push(@el)

		self = @

		@actions = {}

		for el in els
			$el = $(el)
			actionStrings = $el.attr('data-action').split(';')
			$el.removeAttr('data-action')
			for string in actionStrings
				action = string.match(LRSView.actionPattern)
				action.shift()
				action[2] = action[2].split(',')
				action[2] = [] if action[2][0] == ''

				if !lrs.LRSView.isTouch && (action[0] == 'tap' or action[0] == 'singleTap')
					action[0] = 'click'

				if (!@actions[action[0]])
					@actions[action[0]] = []

				$el.on(action[0], (e) -> self.delegateAction(e, @))

				@actions[action[0]].push({el: $el, function: action[1], parameters: action[2]})

		@actions

	delegateAction: (e, el = false) =>
		return unless @enabled
		
		actions = @actions[e.type]

		return unless actions

		for action in actions
			continue if el != false && action.el[0] != el
			parameters = []

			for parameter in action.parameters
				if parameter is 'null'
					parameters.push(null)
				else if parameter.charAt(0).match(/['"]/g) and parameter.charAt(0) is parameter.charAt(parameter.length)
					parameters.push(parameter.substring(1, parameter.length - 2))
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

	appendTo: (el) ->
		@el.appendTo(el.el or el) # Okay?
		@

	insertBefore: (el) ->
		@el.insertBefore(el.el or el) # Okay?
		@
		
	insertAfter: (el) ->
		@el.insertAfter(el.el or el) # Okay?
		@
		
	remove: ->
		@el.remove()
		@

	addClass: (classes) ->
		@el.addClass(classes)
		@

	removeClass: (classes) ->
		@el.removeClass(classes)
		@

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

	hideAction: @::hide
	
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

class lrs.LRSView.views.LRSListView extends lrs.LRSView

	initialize: (content = null) ->
		unless @permanentContent
			@permanentContent = @el.children()
			@permanentViews = _.clone(@views)
			delete @permanentViews.content
			@permanentViewsArray = (view.el[0] for name, view of @permanentViews)
		
		super()
		
		if content and @views.content
			@setPreloadedContent(content)
		else
			@setContent(content)
		
	setPreloadedContent: (content) ->
		previousView = null
		for object, i in content
			@content.push(object)
			
			view = null
			for v in @views.content
				if v.el.attr('data-id') is object.id
					view = v
					break
					
			if view
				view.initialize(object)
			else
				view = new @options.itemClass(null, null, @).initialize(object)
				if previousView
					view.insertAfter(previousView.el)
					@views.content.splice(i, 0, view)
				else
					view.appendTo(@el)
	
				
			#@views[_.uniqueId('lvi_')] = view

	setContent: (content) ->
		return if not _.isNull(content) and not _.isArray(content)	
		return if content is null and @content = []
			
		@views[name] = view for name, view of @permanentViews
		@views.content = []
		@el.children().not(@permanentViewsArray).remove()
		
		if content is null
			@content = []
		else
			@content = []
			for object, i in content
				@content.push object
				@_processObject(object, i)
	
	addItem: (item, before = false) ->
		#if before
			#beforeIndex = _.indexOf(@content, item)
			#@content.splice(beforeIndex, 0, item)
		if before is true
			@content.unshift item
			i = 0
		else if before is false
			@content.push item
			i = @content.length - 1
		else
			i = _.indexOf(@content, before)
			@content.splice(i, 0, item)
			
		@_processObject(item, i)
	
	_processObject: (object, i) ->
		#i = _.indexOf(@content, object)
		if (!object.isView)
			if (@options.itemClass)
				view = new @options.itemClass(null, null, @).initialize(object)
			else
				view = new lrs.LRSView.views.LRSGeneratedListItemView(@options.subTemplate, null, @).initialize(object)
		else
			view = object
		
		if i is @views.content.length
			view.appendTo(@el)
		else
			view.el.insertBefore(@listViews[i].el)
		@views.content.splice(i, 0, view)
		
		view

class lrs.LRSView.views.LRSListItemView extends lrs.LRSView

class lrs.LRSView.views.LRSGeneratedListItemView extends lrs.LRSView.views.LRSListItemView 

	constructor: (template, @options, @owner) ->
		@template = template if template

		super(null, options, @owner)

	initialize: (@object) ->

		for name, outlet of @outlets
			value = @object.get(name)
			if (value) then @set(name, value)

		super(@object)

# ## LRSObject
# Base object class. Provides get/set methods and events.

class LRSObject

	@isObject: true

	constructor: (options = {}) ->

		if (!@options)
			@options = {}
		_.extend(@options, options)

		@events = {}

		@

	initialize: () ->
		@


	on: (event, handler) ->
		throw new Error("Event type missing.") unless event # TODO: Check type?
		throw new Error("Event handler missing.") unless handler # TODO: Check type?

		@events[event] = [] if not @events[event]

		@events[event].push(handler) unless handler in @events[event]

		@

	off: (event, handler) ->

		return unless @events[event]

		index = @events[event].indexOf(handler)

		@events[event].splice(index, 1)

		@

	trigger: (event, attributes) ->
		return unless @events[event]
		
		@events[event].forEach((func) =>
			func.apply(@, attributes)
		)

	get: (name) ->
		@[name]

	set: (name, value) ->
		@[name] = value

if module?
	exports.LRSObject = LRSObject
else
	window.lrs = {} if not window.lrs
	window.lrs.LRSObject = LRSObject
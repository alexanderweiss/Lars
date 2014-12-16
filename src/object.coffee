# ## LRSObject
# Base object class. Provides get/set methods and events.

class LRSObject

	@isObject: true

	constructor: (options = {}) ->

		if (!@options)
			@options = {}
		_.extend @options, options

		@events = {}

		@

	initialize: () ->
		@


	on: (event, func) ->

		if (!@events[event])
			@events[event] = []

		if (_.indexOf(@events[event], func) == -1)
			@events[event].push func

		@

	off: (event, func) ->

		if (!@events[event])
			return

		index = _.indexOf(@events[event], func)

		@events[event].splice(index, 1)

		@

	trigger: (event, attributes) ->
		if(@events[event])
			_.each @events[event], (func) =>
				func.apply(@, attributes)

	get: (name) ->
		@[name]

	set: (name, value) ->
		@[name] = value

if module?
	exports.LRSObject = LRSObject
else
	window.lrs = {} if not window.lrs
	window.lrs.LRSObject = LRSObject
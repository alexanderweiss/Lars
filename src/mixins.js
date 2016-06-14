// Setup lrs variable.
let lrs = window.lrs = {}

// ## Base
// Base class to extend from. Currently adds no functionality, except allowing classes that don't extend another class to use mixins.
class Base {}

// ## MixinBuilder
// Class to extend a superclass with mixins.
class MixinBuilder {
	
	constructor(superclass) {
		
		this.superclass = superclass || Base
		
	}
	
	// ### with
	// # Return superclass extended with mixins.
	with(...mixins) {
		
		// Extend each mixin with the next, starting from the superclass.
		return mixins.reduce((c, mixin) => mixin(c), this.superclass)
		
	}
}

// Make MixinBuilder available as function mix, allowing `mix(superclass).with(mixin1, mixin2, ...)` syntax.
let mix = (superclass) => new MixinBuilder(superclass)

// ## Events
// Mixin to support class/object events.
let Events = (superclass) => class extends superclass {
	
	constructor() {
		
		super(...arguments)
		
		Object.defineProperty(this, '_events', {
			value: {},
			configurable: false,
			enumerable: false,
			writable: false
		})
		
	}
	
	// ### on
	// Add an event listener.
	on(eventName, handler) {
		
		if (!eventName) throw new Error("Event name missing.") // TODO: Check type?
		if (!handler) throw new Error("Event handler missing.") // TODO: Check type?
		
		this._events[eventName] = this._events[eventName] || []
		
		if (this._events[eventName].indexOf(handler) === -1) {
			
			this._events[eventName].push(handler)
			
		}
		
		return this
		
	}
	
	// ### once
	// Add an event listener that only fires once.
	once(eventName, handler) {
		
		var intermediateHandler = function () {
			this.off(eventName, intermediateHandler)
			handler.apply(this, arguments)
		}
		
		intermediateHandler = intermediateHandler.bind(this)
		intermediateHandler.handler = handler
			
		return this.on(event, intermediateHandler)
		
	}
	
	// ### off
	// Remove an event listener.
	off(eventName, handler) {
		
		if (!eventName) throw new Error("Event name missing.") // TODO: Check type?
		if (!handler) throw new Error("Event handler missing.") // TODO: Check type?
		
		if (!this._events[eventName]) return this
		
		var index = -1
		
		for (let i in this._events[eventName]) {
			
			if (this._events[eventName][i] === handler || this._events[eventName][i].handler === handler) {
				
				index = i
				break
				
			}
			
		}
		
		this._events[eventName].splice(index, 1)
		
		return this
		
	}
	
	// ### trigger
	// Trigger an event.
	trigger(eventName, args) {
		
		if (!this._events[eventName]) return this
		
		for (let handler of this._events[eventName].slice()) {
			
			handler.apply(this, args)
			
		}
		
		return this
		
	}
	
}

lrs.mix = mix
lrs.Events = Events
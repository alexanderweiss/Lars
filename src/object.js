'use strict';

// ## LRSObject
// Basic object class with get/set methods and events.
class LRSObject {
	
	constructor(options = {}) {
		
		if (!options) options = {}
		
		this.options = options
		
		this._events = {}
		
		return this
		
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
		
	}
	
}

window.lrs = window.lrs || {}
window.lrs.LRSObject = LRSObject
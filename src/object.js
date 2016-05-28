// ## Object
// Basic object class with get/set methods and events.
class LRSObject extends mix(Object).with(Events) {
	
	constructor(obj) {
		
		super()
		
		Object.assign(this, obj)
		
		Object.defineProperty(this, '_privateProperties', {
			value: [],
			configurable: false,
			enumerable: false,
			writable: true
		})
		
		return new Proxy(this, this.constructor.proxyHandler)
		
	}
	
}

LRSObject.proxyHandler = {

	set: function(target, property, value, receiver) {
		// TODO: Old value
		
		Reflect.set(...arguments)
		
		if (!(property in target._privateProperties)) target.trigger('change', [property, value, target])

		return true
	},

	deleteProperty: function(target, property) {
		
		target.trigger('remove', [target[property], property, this])
		
		Reflect.delete(...arguments)
		
		return true
	}

}


lrs.Object = LRSObject
lrs.LRSObject = LRSObject
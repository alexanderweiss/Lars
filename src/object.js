// ## Object
// Basic object class with get/set methods and events.
class LRSObject extends mix().with(Events) {
	
	constructor() {
		
		super()
		
		this._events = {}
		
		return this
		
	}	
}

lrs.Object = LRSObject
lrs.LRSObject = LRSObject
class LRSArray extends mix(Array).with(Events) {
	
	constructor() {
		
		super()
		
		return new Proxy(this, this.constructor.proxyHandler)
		
	}
	
}

LRSArray.proxyHandler = {
	
	set: function(target, property, value, receiver) {
		
		if (!this.setAction) {
			
			this.setAction = {
				changes: {},
				oldLength: target.length,
				timeout: setTimeout(() => {
					
					if (this.setAction.changes.length) this.setAction.changes.length.old = this.setAction.oldLength
					if (this.setAction.changes.length.old == this.setAction.changes.length.new) delete this.setAction.changes.length
					
					target.trigger('change', [this.setAction.changes])
					
					this.setAction = null
					
				}, 0)
			}
			
		}
		
		this.setAction.changes[property] = {new: value, old: target[property]}
		
		target[property] = value
		
		return true
	},
	
	deleteProperty: function(target, property) {
		
		if (!this.deleteAction) {
			
			this.deleteAction = {
				changes: {},
				oldLength: target.length,
				timeout: setTimeout(() => {
					
					this.deleteAction.changes.length = { new: target.length, old: this.deleteAction.oldLength }
					
					target.trigger('change', [this.deleteAction.changes])
					
					this.deleteAction = null
					
				}, 0)
			}
			
		}
		
		this.deleteAction.changes[property] = {new: undefined, old: target[property]}
		
		return true
	}
	
}

lrs.Array = LRSArray
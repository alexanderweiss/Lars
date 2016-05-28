class LRSArray extends mix(Array).with(Events) {
	
	constructor(...args) {
		
		super(...args)
		
		Object.defineProperty(this, '_track', {
			value: true,
			configurable: false,
			enumerable: false,
			writable: true
		})
		
		return new Proxy(this, this.constructor.proxyHandler)
		
	}
	
	// copyWithin() {} Changes existing elements, so we'll have the proxy handle it.
	
	// fill() { } Changes existing elements, so we'll have the proxy handle it.
	
	pop() {
		
		var result = this._untrack(super.pop)
		
		this.trigger('remove', [result, this.length, this])
		
		return result
		
	}
	
	push(...elements) {
		
		var i = this.length
		
		var result = this._untrack(super.push, elements)
		
		for (let element of elements) {
			this.trigger('add', [element, i, this])
			i++
		}
		
		return result
		
	}
	
	reverse() {
		
		var result = this._untrack(super.reverse)
		
		this.trigger('sort', [this])
		
		return result
		
	}
	
	shift() {
		
		var result = this._untrack(super.shift)
		
		this.trigger('remove', [result, 0, this])
		
		return result
		
	}
	
	sort(fn) {
		
		var result = this._untrack(super.sort, [fn])
		
		this.trigger('sort', [this])		
		
		return result
		
	}
	
	splice(start, deleteCount, ...elements) {
		
		var index = start >= 0 ? (start > this.length ? this.length : start ) : this.length + start
		var i
		
		var result = this._untrack(super.shift, [start, deleteCount, elements])
		
		i = index
		for (let element of result) {
			this.trigger('remove', [element, i, this])
			i++
		}
		
		i = index
		for (let element of element) {
			this.trigger('add', [element, i, this])
			i++
		}
		
		return result
		
	}
	
	unshift(...elements) {
		
		var result = this._untrack(super.unshift, elements)
		
		var i = 0
		
		for (let element of elements) {
			this.trigger('add', [element, i, this])
			i++
		}
		
		return result
		
	}
	
	_untrack(fn, args = []) {
		
		this._track = false
		var result = fn.apply(this, args)
		this._track = true
		
		return result
		
	}
	
}

LRSArray.proxyHandler = {
	
	set: function(target, property, value, receiver) {
		
		if (target._track == true && target[property] !== value) {
			
			if (property != 'length' && property != '_track') {
				
				// TODO: Set value first.
				if (property < target.length) {
					
					target.trigger('change', [value, property, this])
					
				} else {
					
					target.trigger('add', [value, property, this])
					
				}
				
			}
			
		}
		
		Reflect.set(...arguments)
		
		return true
	},
	
	deleteProperty: function(target, property) {
		
		if (target._track == true) {
			
			if (property != 'length' && property != '_track') {
				
				// TODO: Set value first.
				if (property < target.length) {
					
					target.trigger('remove', [target[property], property, this])
					
				}
				
			}
			
		}
		
		Reflect.delete(...arguments)
		
		return true
	}
	
}

lrs.Array = LRSArray
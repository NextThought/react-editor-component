
export default {

	componentWillMount () {
		var events = [
			'onClick',
			'onMouseDown',
			'onMouseUp',
			'onTouchEnd',
			'onTouchMove',
		];

		var fn = this.__onTouched;
		var map = (x, e)=>{ x[e]=fn; return x;};

		this.registerHandlers(events.reduce(map, {}));
	},

	__onTouched () {
		this.wasInteractedWith();
	}

};


var events = [
	'Click',
	'MouseDown',
	'MouseUp',
	'TouchEnd',
	'TouchMove',
];


export default {

	componentWillMount () {
		var fn = this.__onTouched;
		var map = (x, e)=>{ x[`on${e}`]=fn; return x;};

		this.registerHandlers(events.reduce(map, {}));
	},


	componentDidMount () {
		events.forEach(event=>window.addEventListener(event.toLowerCase(), this.__onGlobalPointerEvent));
	},

	componentWillUnmount () {
		events.forEach(event=>window.removeEventListener(event.toLowerCase(), this.__onGlobalPointerEvent));
	},


	__onTouched () {
		this.wasInteractedWith();
		if (!this.hasSelection()) {
			this.putCursorAtTheEnd();
		}
	},


	__onGlobalPointerEvent (e) {
		var {target} = e;
		if (!this.isMounted()) {return;}

		var isEventWithin = false;
		var editorFrame = this.getDOMNode();

		while(target && !isEventWithin) {
			isEventWithin = editorFrame === target;
			target = target.parentNode;
		}

		if (!isEventWithin && this.hasSelection()) {
			this.wasInteractedWith();
			this.clearSelection();
		}
	}

};

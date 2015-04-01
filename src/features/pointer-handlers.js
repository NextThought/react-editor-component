
const events = [
	'Click',
	'MouseDown',
	'MouseUp',
	'TouchEnd',
	'TouchMove'
];


const onGlobalPointerEvent = 'pointer-handlers:GlobalPointerEvent';
const onTouched = 'pointer-handlers:onTouched';


function isEventInNode(target, node) {
	if (!target) {return false; }
	return target === node || isEventInNode(target.parentNode, node);
}


export default {

	componentWillMount () {
		let fn = this[onTouched];
		let map = (x, e)=>{ x[`on${e}`] = fn; return x; };

		this.registerHandlers(events.reduce(map, {}));
	},


	componentDidMount () {
		events.forEach(event=>window.addEventListener(event.toLowerCase(), this[onGlobalPointerEvent]));
	},

	componentWillUnmount () {
		events.forEach(event=>window.removeEventListener(event.toLowerCase(), this[onGlobalPointerEvent]));
	},


	[onTouched] (e) {
		if (!this.hasSelection() && !isEventInNode(e.target, this.getEditorNode())) {
			this.putCursorAtTheEnd();
		}
	},


	[onGlobalPointerEvent] (e) {
		let {target} = e;
		if (!this.isMounted()) { return; }

		let isEventWithin = false;
		let editorFrame = this.getDOMNode();

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

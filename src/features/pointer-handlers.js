import React from 'react';

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


function getNonEditable (target, editorFrame) {
	const attr = 'contenteditable';
	while(target) {
		if(editorFrame === target) {
			target = null;
			break;
		}

		if (target.hasAttribute && target.hasAttribute(attr)) {
			let val = target.getAttribute(attr);

			if (val === 'false') {
				break;
			}
		}

		target = target.parentNode;
	}

	return target;
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
		e.stopPropagation();
		let editorNode = this.getEditorNode();
		let nonEditableTarget = getNonEditable(e.target, editorNode);

		if (!this.hasSelection() && isEventInNode(e.target, editorNode)) {
			this.putCursorAtTheEnd();
		}
		else if (nonEditableTarget) {
			this.putCursor(nonEditableTarget);
		}

	},


	[onGlobalPointerEvent] (e) {
		let {target} = e;
		if (!this.isMounted()) { return; }

		let isEventWithin = false;
		let editorFrame = React.findDOMNode(this);

		while(target && !isEventWithin) {
			isEventWithin = editorFrame === target;
			target = target.parentNode;
		}

		if (!isEventWithin && this.hasSelection()) {
			this.wasInteractedWith();
		}
	}

};

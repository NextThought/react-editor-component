import {PLACEHOLDER} from './constants';

export default {

	componentWillMount () {
		this.registerHandlers({
			onPaste: this.onProcessPaste
		});
	},


	onProcessPaste () {
		this.wasInteractedWith();
	},


	insertAtSelection (nodeOrMarkup) {
		let {onInsertionHookCallback} = this.props;
		let content = this.getEditorNode();

		let range = this.getSelection() || this.putCursorAtTheEnd();

		if (range) {
			range.deleteContents();
			range.collapse(false);

			let el = document.createElement('div');
			let newline = document.createElement('div');
			newline.appendChild(document.createTextNode(PLACEHOLDER));

			if (typeof nodeOrMarkup === 'string') {

				el.innerHTML = nodeOrMarkup;

			}
			else if (typeof nodeOrMarkup === 'object' && 'nodeType' in nodeOrMarkup) {

				el.appendChild(nodeOrMarkup);

			}
			else { return false; }

			if (!onInsertionHookCallback || !onInsertionHookCallback(content, range, el)) {
				range.insertNode(el);
			}

			let {parentNode} = el;

			for (let i = 0, {length} = el.childNodes; i < length; i++) {
				parentNode.insertBefore(el.firstChild, el);
			}

			parentNode.insertBefore(newline, el);

			parentNode.removeChild(el);

			this.wasInteractedWith();
			return newline;
		}

		return void 0;
	}

};


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

		let sel = this.getSelection();

		if (sel && sel.getRangeAt && sel.rangeCount) {
			let range = sel.getRangeAt(0);

			range.deleteContents();
			range.collapse(false);

			let el = document.createElement('div');

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

			parentNode.removeChild(el);

			this.wasInteractedWith();
			return true;
		}

		return false;
	}

};

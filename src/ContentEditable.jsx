import React from 'react';
import ReactDOM from 'react-dom';

import Mixin from './ToolMixin';

export default React.createClass({
	displayName: 'ContentEditable',
	mixins: [Mixin],


	propTypes: {
		content: React.PropTypes.string
	},


	shouldComponentUpdate (/*nextProps, nextState*/) {
		//If there is a cursor/selection within the
		// editor, we do NOT want to update.
		// TODO: Refactor to where THIS component manages selection
		return !this.getEditor().hasSelection();
	},


	getHeight () {
		return ReactDOM.findDOMNode(this.getEditor()).offsetHeight;
	},


	getY () {
		let d = ReactDOM.findDOMNode(this.getEditor());
		let y = 0;
		do {
			y += d.offsetTop;
			d = d.offsetParent;
		}
		while(d);

		return y;
	},



	scrollIntoView () {
		let top = this.getY() - (this.getHeight() / 2) - (window.innerHeight / 2);
		window.scrollTo(0, top);
	},


	onFocus () {
		let editor = this.getEditor();
		let hasFocus = editor.hasSelection();

		console.debug('Asked to focus. Does it currently have it?', hasFocus);

		if (!hasFocus) {
			editor.putCursorAtTheEnd();
			this.scrollIntoView();
		}
	},


	onBlur () {
		this.getEditor().wasInteractedWith();
	},


	render () {
		return (
			<div {...this.props} contentEditable content={null} onFocus={this.onFocus} onBlur={this.onBlur}
				dangerouslySetInnerHTML={{__html: this.props.content}}/>
		);
	}
});

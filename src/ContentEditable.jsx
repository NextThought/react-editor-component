import React from 'react';

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


	onFocus () {
		let editor = this.getEditor();
		let hasFocus = editor.hasSelection();
		console.debug('Asked to focus. Does it currently have it?', hasFocus);

		if (!hasFocus) {
			editor.putCursorAtTheEnd();
			React.findDOMNode(editor).scrollIntoView();
		}
	},


	render () {
		return (
			<div {...this.props} contentEditable={true} content={null} onFocus={this.onFocus}
				dangerouslySetInnerHTML={{__html: this.props.content}}/>
		);
	}
});

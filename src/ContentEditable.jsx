import React from 'react/addons';



export default React.createClass({
	displayName: 'ContentEditable',


	propTypes: {
		editorFrame: React.PropTypes.element.isRequired,
		content: React.PropTypes.string
	},


	shouldComponentUpdate (/*nextProps, nextState*/) {
		//If there is a cursor/selection within the
		// editor, we do NOT want to update.
		// TODO: Refactor to where THIS component manages selection
		return !this.props.editorFrame.hasSelection();
	},




	render () {
		return (
			<div {...this.props} contentEditable={true} content={null}
				dangerouslySetInnerHTML={{__html: this.props.content}}/>
		);
	}
});

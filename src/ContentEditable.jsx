import React from 'react/addons';



export default React.createClass({
	displayName: 'ContentEditable',


	shouldComponentUpdate (/*nextProps, nextState*/) {
		//If there is a cursor/selection within the
		// editor, we do NOT want to update.
		return !this._owner.hasSelection();
	},




	render () {
		return (
			<div {...this.props} contentEditable={true} content={null}
				dangerouslySetInnerHTML={{__html: this.props.content}}/>
		);
	}
});

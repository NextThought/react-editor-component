import React from 'react';

export default {

	contextTypes: {
		editor: React.PropTypes.any.isRequired
	},

	getEditor () {
		return this.context.editor;
	}
};

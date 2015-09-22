import React from 'react';

const clone = x =>
	typeof x === 'string' ? x : React.cloneElement(x);


export default React.createClass({
	displayName: 'FormatButton',

	contextTypes: {
		setFormat: React.PropTypes.func.isRequired
	},


	propTypes: {
		children: React.PropTypes.any,
		format: React.PropTypes.string.isRequired
	},


	render () {
		let {format = '_'} = this.props;
		let code = format.charAt(0).toUpperCase();

		let props = {
			onClick: this.context.setFormat,
			'data-format': format
		};

		return React.createElement('button', props, this.renderLabel(code));
	},


	renderLabel (code) {
		let {children} = this.props;

		if (React.Children.count(children) > 0) {
			return React.Children.map(children, x=>clone(x));
		}

		return code;
	}
});

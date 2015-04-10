import React from 'react';
import cloneWithProps from 'react/lib/cloneWithProps';

const clone = x =>
	typeof x === 'string' ? x : cloneWithProps(x);


export default React.createClass({
	displayName: 'FormatButton',

	contextTypes: {
		setFormat: React.PropTypes.func.isRequired
	},


	propTypes: {
		format: React.PropTypes.string.isRequired
	},


	render () {
		let {format='_'} = this.props;
		let code = format.charAt(0).toUpperCase();

		let props = {
			onClick: this.context.setFormat,
			'data-format': format
		};

		return React.createElement('button', props, ...this.renderLabel(code));
	},


	renderLabel (code) {
		let {children} = this.props;

		if (children) {
			return Array.isArray(children) ?
				children.map(x=>clone(x)) :
				[clone(children)];
		}

		return [code];
	}
});
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


	onClick (e) {
		const {props: {format = '_'}} = this;
		e.preventDefault();
		e.stopPropagation();

		this.context.setFormat(format);
	},


	render () {
		const {format = '_'} = this.props;
		const code = format.charAt(0).toUpperCase();

		const props = {
			onClick: this.onClick,
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

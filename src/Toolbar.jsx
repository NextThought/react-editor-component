import React from 'react';
import cloneWithProps from 'react/lib/cloneWithProps';
import cx from 'classnames';

import FormatButton from './FormatButton';

export const SIDES = {
	NORTH: 'north',
	SOUTH: 'south',
	EAST: 'east',
	WEST: 'west'
};

export default React.createClass({
	displayName: 'Toolbar',


	propTypes: {
		defaultSet: React.PropTypes.bool,
		region: React.PropTypes.any.isRequired
	},


	isElementForRegion (element) {
		let {region} = this.props;
		let dest = element.props.region;

		return dest === region || (region === SIDES.SOUTH && (!dest || dest == null));
	},


	render () {
		let {defaultSet, children, region} = this.props;
		let props = {
			className: cx('editor-pane', region)
		};

		if (!defaultSet && (!children || children.length === 0)) {
			return null;
		}

		return React.createElement('div', props, ...this.renderChildren());
	},


	renderChildren () {
		let {defaultSet, children} = this.props;

		if (defaultSet) {
			return this.renderDefaultSet();
		}

		if (!children || children.length === 0) {
			return [];
		}

		return children
			.filter(x => this.isElementForRegion(x))
			.map(x => cloneWithProps(x));
	},


	renderDefaultSet () {
		return ['bold', 'italic', 'underline'].map(f=> <FormatButton format={f}/>);
	}
});

import React from 'react';
import cx from 'classnames';

import FormatButton from './FormatButton';

export const REGIONS = {
	NORTH: 'north',
	SOUTH: 'south',
	EAST: 'east',
	WEST: 'west'
};


function isEmpty(c) {
	return Array.isArray(c) ? c.length === 0 : !c;
}


export default React.createClass({
	displayName: 'Toolbar',


	propTypes: {
		defaultSet: React.PropTypes.bool,
		region: React.PropTypes.any.isRequired,
		children: React.PropTypes.array
	},


	isElementForRegion (element) {
		let {region} = this.props;
		let {props} = element || {};
		let dest = props && props.region;

		return dest === region || (region === REGIONS.SOUTH && (!dest || dest == null));
	},


	render () {
		let {defaultSet, children, region} = this.props;
		let props = {
			className: cx('editor-pane', 'toolbar', region)
		};

		if (!defaultSet && (!children || children.length === 0)) {
			return null;
		}

		let result = React.createElement('div', props, ...this.renderChildren());

		return isEmpty(result.props.children) ? null : result;
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
			.filter(x => x && this.isElementForRegion(x))
			.map(x => React.cloneElement(x));
	},


	renderDefaultSet () {
		return ['bold', 'italic', 'underline'].map(f=> <FormatButton format={f}/>);
	}
});

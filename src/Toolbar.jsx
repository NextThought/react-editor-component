import React from 'react';
import cloneWithProps from 'react/lib/cloneWithProps';
import cx from 'classnames';

import FormatButton from './FormatButton';

export const REGIONS = {
	NORTH: 'north',
	SOUTH: 'south',
	EAST: 'east',
	WEST: 'west'
};


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

		return dest === region ||
			(region === REGIONS.SOUTH && (!dest || dest == null)) ||
			null;//make the false return be litterally null
	},


	render () {
		let {defaultSet, children, region} = this.props;
		let props = {
			className: cx('editor-pane', 'toolbar', region)
		};

		if (!defaultSet && (!children || children.length === 0)) {
			return null;
		}

		let result = React.createElement('div', props, this.renderChildren());

		return React.Children.count(result.props.children) === 0 ? null : result;
	},


	renderChildren () {
		let {defaultSet, children} = this.props;

		if (defaultSet) {
			return this.renderDefaultSet();
		}

		if (React.Children.count(children) === 0) {
			return [];
		}

		return React.Children.map(children,
			//I want to stop using the cloneWithProps (since its deprecated) but until React stops warning
			//about parent-vs-owner context I don't want to muddy the console. (This component is using the
			//context correctly, its just the owner is not the parent of the toolbar content. The Owner
			//is the component that renders the editor, the parent is the toolbar)
			//TODO: replace cloneWithProps(x) with React.cloneElement(x) as soon as context warnings stop (or cloneWithProps is removed from react)
			x => x && this.isElementForRegion(x) && cloneWithProps(x));//React.cloneElement(x));
	},


	renderDefaultSet () {
		return ['bold', 'italic', 'underline'].map(f=> <FormatButton format={f} key={f}/>);
	}
});

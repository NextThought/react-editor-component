import React from 'react';
import emptyFunction from 'react/lib/emptyFunction';

import Core from './features/core';
import Formatting from './features/formatting';
import KeyHandlers from './features/key-handlers';
import Parsing from './features/parsing';
import PasteHandlers from './features/paste-handlers';
import PointerHandler from './features/pointer-handlers';
import Selection from './features/selection';

import ContentEditable from './ContentEditable';
import Toolbar, {SIDES} from './Toolbar';

export default React.createClass({
	displayName: 'Editor',

	mixins: [
		Core,
		Formatting,
		KeyHandlers,
		Parsing,
		PasteHandlers,
		PointerHandler,
		Selection
	],


	propTypes: {
		/**
		 * HTML value to put in the editor.
		 * @type {String}
		 */
		value: React.PropTypes.string,


		/**
		 * onChange - call back
		 *
		 * @type {Function}
		 */
		onChange: React.PropTypes.func,


		onBlur: React.PropTypes.func,


		onPrepareValueChunkCallback: React.PropTypes.func,


		onPartValueParseCallback: React.PropTypes.func
	},


	getDefaultProps () {
		return {
			onChange: emptyFunction,
			onBlur: emptyFunction
		};
	},


	render () {
		let {className, children} = this.props;
		let classes = [
			'editor', className,
			...this.getStateClasses()
		].filter(x=>x).join(' ');


		let basicView = !children || children.length===0; // if no custom children, show default toolbars

		return (
			<div className={classes} {...this.getRegisteredHandlers()}>
				<Toolbar region={SIDES.NORTH} children={children}/>
				<Toolbar region={SIDES.EAST} children={children}/>
				<Toolbar region={SIDES.WEST} children={children}/>

				<ContentEditable className="editor-pane center" content={this.state.content} ref="editor" tabIndex="0" editorFrame={this}/>

				<Toolbar region={SIDES.SOUTH} children={children} defaultSet={basicView}/>
			</div>
		);
	}
});

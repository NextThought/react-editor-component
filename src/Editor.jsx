import * as React from 'react/addons';
import emptyFunction from 'react/lib/emptyFunction';

import Core from './features/core';
import Formatting from './features/formatting';
import KeyHandlers from './features/key-handlers';
import Parsing from './features/parsing';
import PasteHandlers from './features/paste-handlers';
import PointerHandler from './features/pointer-handlers';
import Selection from './features/selection';

import ContentEditable from './ContentEditable';

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
		var classes = [
			'editor',
			this.props.className,
			...this.getStateClasses()
		].filter(x=>x).join(' ');

		return (
			<div className={classes} {...this.getRegisteredHandlers()}>

				<ContentEditable content={this.state.content} ref="editor" tabIndex="0"/>

				<div className="toolbar">
					<button onClick={this.onSetFormat} data-format="bold">B</button>
					<button onClick={this.onSetFormat} data-format="italic">I</button>
					<button onClick={this.onSetFormat} data-format="underline">U</button>
				</div>
			</div>
		);
	}
});

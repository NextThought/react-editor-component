import * as React from 'react/addons';
import emptyFunction from 'react/lib/emptyFunction';

import Core from './features/core';
import Formatting from './features/formatting';
import KeyHandlers from './features/key-handlers';
import Parsing from './features/parsing';
import PasteHandlers from './features/paste-handlers';
import PointerHandler from './features/pointer-handlers';
import Selection from './features/selection';

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
		onChange: React.PropTypes.func
	},


	getDefaultProps () {
		return {
			onChange: emptyFunction
		};
	},


	shouldComponentUpdate (/*nextProps, nextState*/) {
		//If there is a cursor/selection within the
		// editor, we do NOT want to update.
		return !this.hasSelection();
	},


	render () {
		var classes = [
			'editor',
			this.props.className,
			...this.getStateClasses()
		].filter(x=>x).join(' ');

		return (
			<div className={classes}>

				<div ref="editor" contentEditable={true} tabIndex="0"
					{...this.getRegisteredHandlers()}
					dangerouslySetInnerHTML={{__html: this.state.content}}/>

				<div className="toolbar">
					<button onClick={this.onSetFormat} data-format="bold">B</button>
					<button onClick={this.onSetFormat} data-format="italic">I</button>
					<button onClick={this.onSetFormat} data-format="underline">U</button>
				</div>
			</div>
		);
	}
});

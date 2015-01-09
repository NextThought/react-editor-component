import * as React from 'react/addons';
import Core from './features/core';
import Formatting from './features/formatting';
import KeyHandlers from './features/key-handlers';
import PasteHandlers from './features/paste-handlers';
import PointerHandler from './features/pointer-handlers';
import Selection from './features/selection';

export default React.createClass({
	displayName: 'Editor',

	mixins: [
		Core,
		Formatting,
		KeyHandlers,
		PasteHandlers,
		PointerHandler,
		Selection
	],


	propTypes: {
		value: React.PropTypes.object
	},


	getInitialState () {
		return {
			content: '<div><div>\u200B</div></div>'
		};
	},


	render () {
		var classes = [
			'editor',
			...this.getStateClasses()
		].join(' ');

		return (
			<div className={classes}>

				<div className="toolbar">
					<button onClick={this.onSetFormat} data-format="bold">B</button>
					<button onClick={this.onSetFormat} data-format="italic">I</button>
					<button onClick={this.onSetFormat} data-format="underline">U</button>
				</div>

				<div ref="editor" contentEditable={true}
					{...this.getRegisteredHandlers()}
					dangerouslySetInnerHTML={{__html: this.state.content}}/>
			</div>
		);
	}
});

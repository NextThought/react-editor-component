import * as React from 'react/addons';
//import Formatting from './features/formatting';

export default React.createClass({
	displayName: 'Editor',

	mixins: [
	],


	propTypes: {
		value: React.PropTypes.object
	},


	getInitialState () {
		return {
			content: '<div><div>\u200B</div></div>'
		};
	},


	onKeyPress (event) {
		if (event.key !== 'Unidentified') {
			this.handleKeyEvent(event);
		}
	},


	onKeyDown (event) {
		if (event.key !== 'Unidentified') {
			this.handleKeyEvent(event);
		}
	},


	handleKeyEvent (event) {

	},

	onPaste () {
		console.log(arguments);
	},

	onSetFormat (e) {
		var style = e.target.getAttribute('data-format');
		this.applyFormat(style);
	},

	applyFormat (style) {
		if (document.queryCommandSupported(style)) {
			document.execCommand(style, false, false);
		}
	},

	render () {
		return (
			<div>
				<div className="toolbar">
					<button onClick={this.onSetFormat} data-format="bold">B</button>
					<button onClick={this.onSetFormat} data-format="italic">I</button>
					<button onClick={this.onSetFormat} data-format="underline">U</button>
				</div>

				<div ref="editor" style={{whiteSpace: "pre", minHeight: "10em", border: '1px solid #ccc'}}
					contentEditable={true}
					onKeyPress={this.onKeyPress}
					onKeyDown={this.onKeyDown}
					onPaste={this.onPaste}
					dangerouslySetInnerHTML={{__html: this.state.content}}/>
			</div>
		);
	}
});

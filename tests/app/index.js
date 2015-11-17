import 'babel/polyfill';
import logger from 'debug';
logger.enable('react-editor-component:*');

import React from 'react';
import ReactDOM from 'react-dom';
import Editor from 'Editor';

import {REGIONS} from 'Toolbar';
import Format from 'FormatButton';

ReactDOM.render(
	React.createElement(Editor, {},
		React.createElement('button', {region: REGIONS.WEST}, 'X'),
		React.createElement('button', {region: REGIONS.EAST}, 'Y'),
		React.createElement('span', {region: REGIONS.NORTH}, 'North Toolbar'),
		React.createElement('button', {region: REGIONS.SOUTH}, 'A'),
		React.createElement(Format, {format: 'bold'}),
		React.createElement(Format, {format: 'italic'}),
		React.createElement(Format, {format: 'underline'}, 'Foo!'),
		React.createElement(Format, {format: 'bold'}, React.createElement('span', {}, 'Hello!'))
	),
	document.getElementById('content')
);

const Frame = React.createClass({
	displayName: 'Frame',

	onChange () {
		const {refs: {editor}} = this;
		let value = editor.getValue();
		//The value will be an array of parts. Parts will be based on what
		//onPartValueParseCallback returns. By default it should be all html
		//fragments. The value will split on Block Elements.
		setTimeout(()=> this.setState({value}), 1);
	},


	onChangeInput () {
		let {refs: {value: {value}}} = this;
		this.setState({value});
	},

	render () {
		let {value} = this.state || {};

		if (Array.isArray(value)) {
			value = value.join('');
		}

		return (
			<div>
				<Editor ref="editor" onChange={this.onChange} value={value} onBlur={this.onChange}>
					<Format format="underline">Foo!</Format>
				</Editor>
				<div>Value Raw:</div>
				<textarea ref="value" style={{width: '100%'}} value={value} onChange={this.onChangeInput}/>
				<div>
					Value (in dom):<hr/>
					<div dangerouslySetInnerHTML={{__html: value}}/>
				</div>
			</div>
		);
	}
});


ReactDOM.render(
	React.createElement(Frame),
	document.getElementById('content2')
);

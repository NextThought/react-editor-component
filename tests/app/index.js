import 'babel/polyfill';
import React from 'react';
import Editor from 'Editor';

import {REGIONS} from 'Toolbar';
import Format from 'FormatButton';

React.render(
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
		this.setState({value});
	},

	render () {
		let {value} = this.state || {};

		return (
			<div>
				<Editor ref="editor" onChange={this.onChange}/>
				<div>Value Raw:</div>
				<textarea style={{width: '100%', height: 100}} value={value}/>
				<div>
					Value (in dom):<hr/>
					<div dangerouslySetInnerHTML={{__html: value}}/>
				</div>
			</div>
		);
	}
});

React.render(
	React.createElement(Frame),
	document.getElementById('content2')
);

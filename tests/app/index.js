import 'babel/polyfill';
import React from 'react';
import Editor from 'Editor';

import {SIDES} from 'Toolbar';
import Format from 'FormatButton';

React.render(
	React.createElement(Editor, {},
		React.createElement('button', {region: SIDES.WEST}, 'X'),
		React.createElement('button', {region: SIDES.EAST}, 'Y'),
		React.createElement('span', {region: SIDES.NORTH}, 'North Toolbar'),
		React.createElement('button', {region: SIDES.SOUTH}, 'A'),
		React.createElement(Format, {format: 'bold'}),
		React.createElement(Format, {format: 'italic'}),
		React.createElement(Format, {format: 'underline'}, 'Foo!'),
		React.createElement(Format, {format: 'bold'}, React.createElement('span', {}, 'Hello!'))
	),
	document.getElementById('content')
);

React.render(
	React.createElement(Editor),
	document.getElementById('content2')
);

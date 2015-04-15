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

React.render(
	React.createElement(Editor),
	document.getElementById('content2')
);

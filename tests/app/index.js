import 'core-js/shim';//ha... dirty but this just the test app :P
import React from 'react/addons';
import Editor from 'Editor';


React.render(
	React.createElement(Editor),
	document.getElementById('content')
);

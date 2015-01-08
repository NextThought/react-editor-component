import * as React from 'react/addons';
import Editor from 'Editor';

var app = React.createFactory(Editor);

React.render(app({data: {}}), document.getElementById('content'));

import 'core-js/shim';//ha... dirty but this just the test app :P
import * as React from 'react/addons';
import Editor from 'Editor';


var testData = {
	tagName: 'div',
	nodeType: 1,
	childNodes: [
	{
		tagName: 'p',
		nodeType: 1,
		childNodes: [{
			nodeType: 3,
			textContent: '0123456789'
		}]
	},
	{
		tagName: 'p',
		nodeType: 1,
		childNodes: [{
			nodeType: 3,
			textContent: 'Two paragrapghs!'
		}]
	},
	{
		tagName: 'p',
		nodeType: 1,
		childNodes: [{
			nodeType: 3,
			textContent: 'And the third for testing'
		}]
	},
	{
		tagName: 'p',
		nodeType: 1,
		childNodes: [
		{
			tagName: 'span',
			nodeType: 1,
			childNodes: [{
				nodeType: 3,
				textContent: 'Here is '
			}]
		},
		{
			tagName: 'b',
			nodeType: 1,
			childNodes: [{
				nodeType: 3,
				textContent: 'the '
			}]
		},
		{
			tagName: 'i',
			nodeType: 1,
			childNodes: [
			{
				tagName: 'b',
				nodeType: 1,
				childNodes: [{
					nodeType: 3,
					textContent: 'test '
				}]
			},
			{
				tagName: 'span',
				nodeType: 1,
				childNodes: [{
					nodeType: 3,
					textContent: 'asdfghjk '
				}]
			},
			{
				tagName: 'u',
				nodeType: 1,
				childNodes: [{
					tagName: 'del',
					nodeType: 1,
					childNodes: [{
						nodeType: 3,
						textContent: 'foobar '
					}]
				}]
			},
			{
				tagName: 'span',
				nodeType: 1,
				childNodes: [{
					nodeType: 3,
					textContent: 'else'
				}]
			}]
		}]
	},
	{
		tagName: 'p',
		nodeType: 1,
		childNodes: [{
			nodeType: 3,
			textContent: 'Last line not formatted text'
		}]
	}]
};


React.render(
	React.createElement(Editor, {data: testData}),
	document.getElementById('content')
);

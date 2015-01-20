
var BR = /<br[^>]*\/?>/ig;
var REGEX_INITIAL_CHAR = /\u200B|\u2060/ig; //used to identify and strip out
var placeholder = '\u200B';


function getSharedDOMParser(name='default') {
	return getSharedDOMParser[name] || (getSharedDOMParser[name] = document.createElement('div'));
}

function getSharedDOMParserWithValue(html, name='default') {
	var dom = getSharedDOMParser(name);
	dom.innerHTML = html;
	return dom;
}

export default {

	componentWillMount () {
		this.applyValue(this.props.value);
	},


	componentWillReceiveProps (props) {
		var value = props.value || null;
		var current = this.props.value || null;
		var state = this.state.current || null;

		if (value !== current) {
			console.debug('New Prop: "%s" "%s"', value, current, state);
			this.applyValue(value);
		}
	},


	getInitialState () {
		return {
			content: `<div>${placeholder}</div>`
		};
	},


	applyValue (value) {
		var dom = getSharedDOMParserWithValue(value || '');
		var content = value = dom.innerHTML;//normalized by the browser :)

		//The value and what we put into the dom don't perfectly line up.
		//We want to try to keep a block element as the child first child
		//of the contenteditable. (for ease of access)

		//TODO: test for non-text entities too...
		if (dom.textContent.replace(/\s+/g,'').length === 0) {
			content = this.getInitialState().content;
		}

		if (!/^<div/.test(content)) {
			content = `<div>${content}</div>`;
		}

		this.setState({
			content: content,//content...

			//this wants value.
			_previousValue: value
		});
	},


	parseValue (domNode) {
		var intermediate = prepareValue(domNode, this.props.onPrepareValueChunkCallback);
		var value = buildValue(intermediate, this.props.onPartValueParseCallback);

		return value;
	}
};


function buildValue (parts, onPartValueParse) {
	if (!parts) {return [];}

	var result = [];

	var stripTrailingBreak = text => text
		.replace(/(<br[^>]*\/?>)+$/i, '')
		.replace(REGEX_INITIAL_CHAR, '');

	var isEmpty = i => i == null || i === '';


	for (let i = 0, len = parts.length; i < len; i++) {
		let part = parts[i];

		if (!onPartValueParse || !onPartValueParse(part)) {
			part = stripTrailingBreak(part);

			// if this is the first part or the thing before us
			// is not an array push this part as an array,
			// otherwise push us onto the previos part which should be an array
			if (result.length === 0 || !Array.isArray(result[result.length - 1])) {
				result.push([part]);
			}
			else {
				result[result.length - 1].push(part);
			}
		}
	}

	//Now make a pass over result joining any multiple text parts by <br>
	for (let i = 0, len = result.length; i < len; i++) {
		if (Array.isArray(result[i])) {
			result[i] = result[i].join('<br/>');
		}
	}


	result = result.filter(i => {
		if (isEmpty(i)) {
			return false;
		}

		if (typeof i !== 'string') {
			return true;
		}

		//if we are just whitespace and html whitespace
		return !isEmpty(i.replace(BR, '').trim());
	});

	return result;
}


function prepareValue (node, onPrepareValueChunk) {
	//Sanitize some new line stuff that various browsers produce.
	//See http://stackoverflow.com/a/12832455
	// and http://jsfiddle.net/sathyamoorthi/BmTNP/5/

	var out = [];
	var elements = Array.from(node.childNodes);

	var buffer = [];


	function parseAndAdd(el) {
		let {nodeType} = el;
		let html = el[nodeType === 3 ? 'textContent' : 'innerHTML' ] || '';
		try {
			if (onPrepareValueChunk) {
				//don't let manipulations here effect the dom
				html = onPrepareValueChunk(html, el.cloneNode(true));
			}

			let parsed = html.replace(REGEX_INITIAL_CHAR, '');

			//if the html was only the no width space don't add it to the parts
			if (!(html.length === 1 && parsed.length === 0)) {
				out.push(html);
			}
		}
		catch (er) {
			console.warn('Oops, ' + er.message);
		}
	}

	var inlineTags = /^(a|b|i|img|em|u|span|strong)$/;

	function isInlineNode(node) {
		var {nodeType, tagName} = node;
		return nodeType === 3 || (nodeType === 1 && inlineTags.test(tagName));
	}

	function maybeFlushBuffer() {
		if (buffer.length) {
			let div = document.createElement('div');
			buffer.forEach(e=>div.appendChild(e.cloneNode(true)));
			buffer = [];

			parseAndAdd(div);
		}
	}


	elements.forEach(el => {
		//Queue up inline elements to push into their own div.
		if (isInlineNode(el)) {
			buffer.push(el);
			return;//short circut or we'd just put every inline element in a div...
		}

		//on this iteration, flush the buffer (because we aren't an inline element,
		// `el` is a block element so we need to move the inline elements in the
		// buffer into a div before we process `el`)
		maybeFlushBuffer();

		// Process el.
		parseAndAdd(el);

	});

	// Don't forget about dangling inline elements...
	maybeFlushBuffer();

	return out;
}

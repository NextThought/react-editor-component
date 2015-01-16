

var REGEX_INITIAL_CHAR = /\u200B|\u2060/ig; //used to identify and strip out
var placeholder = '\u200B';


export default {

	componentWillMount () {
		this.applyValue(this.props.value);
	},


	componentWillReceiveProps (props) {
		if (props.value !== this.state.current) {
			//console.log('New Prop: "%s" "%s"', props.value, this.state.current);
			this.applyValue(props.value);
		}
	},


	getInitialState () {
		return {
			content: `<div>${placeholder}</div>`
		};
	},


	applyValue (value) {
		var div = document.createElement('div');
		div.innerHTML = value;
		console.log('Apply: %s',JSON.stringify(div.textContent));

		if (!value) {
			value = this.getInitialState().content;
		}

		this.setState({
			content: value
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
		.replace(/<br\/?>$/i, '')
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
		return !isEmpty(i.replace(/<br\/?>/ig, '').trim());
	});

	return result;
}


function prepareValue (node, onPrepareValueChunk) {
	//Sanitize some new line stuff that various browsers produce.
	//See http://stackoverflow.com/a/12832455
	// and http://jsfiddle.net/sathyamoorthi/BmTNP/5/
	var out = [];
	var elements = Array.from(node.querySelectorAll('[contenteditable] > *'));

	elements.forEach(div => {
		try {
			//don't let manipulations here effect the dom
			let dom = div.cloneNode(true);
			let html = dom.innerHTML || '';

			if (onPrepareValueChunk) {
				html = onPrepareValueChunk(html, dom);
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
	});

	return out;
}

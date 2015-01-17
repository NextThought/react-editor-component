/*global Range*/

function isStartWithin(rangeA, rangeB) {
	//Comparing the startContainer of rangeB against the startContainer of rangeA:
	var start = rangeA.compareBoundaryPoints(Range.START_TO_START, rangeB);
	//Comparing the startContainer of rangeB against the endContainer of rangeA:
	var end = rangeA.compareBoundaryPoints(Range.START_TO_END, rangeB);

	//We want the rangeB.startContainer to be between the rangeA.(start|end)Containers.
	// So we are looking for:
	// --> a `start` value of -1 or 0. (rangeA's begin is before rangeB's start)
	// --> an `end` value of 1 or 0. (rangeA's end is after rangeB's start)

	return start < 1 && end > -1;
}


function isEndWithin(rangeA, rangeB) {
	//Comparing the endContainer of rangeB against the endContainer of rangeA:
	var end = rangeA.compareBoundaryPoints(Range.END_TO_END, rangeB);
	//Comparing the endContainer of rangeB against the startContainer of rangeA:
	var start = rangeA.compareBoundaryPoints(Range.END_TO_START, rangeB);

	//We want the rangeB.endContainer to be between the rangeA.(start|end)Containers.
	// So we are looking for:
	// --> a `start` value of -1 or 0. (rangeA's begin is before rangeB's end)
	// --> an `end` value of 1 or 0. (rangeA's end is after rangeB's end)

	return start < 1 && end > -1;
}


function isCompletelyWithin(rangeA, rangeB) {
	return isEndWithin(rangeA, rangeB) && isStartWithin(rangeA, rangeB);
}


function isRangeWithinNode (range, node) {
	var containerRange = document.createRange();

	containerRange.selectNodeContents(node);
	//if the selected range is completely within the editor area
	return isCompletelyWithin(containerRange, range);
}

function getTagName(node) {
	var {tagName} = node;
	return (tagName || '#text').toLowerCase();
}


/**
 * This is intended for react updates only... where we need to rebuild a range
 * after the dom has been rerenderd beneath us.  This is not meant to serve as
 * long-term range serialization. The save/restore just have to work across
 * mostly minor dom changes.
 */
function serializeNodePath (node, offset, root) {
	var nodeIndex = n => Array.from((n.parentNode||0).childNodes||0).indexOf(n);
	var path = [];


	//TODO: fix serialized node paths so alterned structure (not content) doesn't break carrot position.
	//[notes]
	//	If end point is textnode, just lets serizize it as #text[nth]{value}|offset When
	//	we deserialize we can just look for it. Our value normalization will convert:
	//
	//		<div>text</div><div>line2</div>
	// to:
	//		text<br/>line2
	//
	// So, for carret and normal text enpoints this will work pretty well, i think.
	//
	// For block selections where endpoints are elements... maybe keep this model,
	// but guess what the dom will look like after update?
	//


	while(node && node.parentNode) {
		if (root === node) {
			break;
		}

		path.push(getTagName(node)+'['+nodeIndex(node)+']');
		node = node.parentNode;
	}

	return path.reverse().join('/') + `|${offset}`;
}


function parseNodePath(path, root) {
	var offset;
	[path, offset] = path.split('|');
	path = path.split('/');

	var node = root;
	while(node && path.length) {
		let index = path.shift();
		let tag = /([#a-z]+)\[(\d+)\]/i.exec(index);
		if (tag) {
			[,tag,index] = tag;
		}
		let nextNode = Array.from(node.childNodes)[index];
		if (!nextNode) {
			console.warn('%o does not have a child at %s', node, index);
		} else if (tag && getTagName(nextNode) !== tag) {
			console.warn('%o is not what we expected. (%s)', nextNode, tag);
		}

		node = nextNode;
	}

	return node && {
		node: node,
		offset: parseInt(offset, 10)
	};
}


function parseRange (rangeish, root) {
	var {start, end} = rangeish;
	var range = document.createRange();
	var cap = s => s.replace(/^./m, x=>x.toUpperCase());


	function _set(side, part) {
		part = parseNodePath(part, root);
		if (part) {
			let {node, offset} = part;

			range['set'+cap(side)](node, offset);
		}
		else {
			throw new Error('Could not reconstitute endpoint.');
		}
	}

	try {
		_set('start', start);
		_set('end', end);
	}
	catch (e) {
		//On some react updates, the content will shift in one div...
		if (root && root.childNodes.length === 1) {
			console.log('Root change?');
			return parseRange(rangeish, root.firstChild);
		}

		console.log('Error: %s', e.message);
		return null;
	}

	return range;
}



export default {

	getSelection(){
		if (!window.getSelection) {
			console.warn('Unsupported (Legacy) Selection Model');
			return null;
		}

		var range = null;
		var sel = window.getSelection();
		if (sel.getRangeAt && sel.rangeCount) {
			range = sel.getRangeAt(0);
		}

		if (range && !isRangeWithinNode(range, this.getEditorNode())) {
			range = null;
		}

		return range;
	},


	saveSelection () {
		var range = this.getSelection();
		var node = this.getEditorNode();
		if (range) {
			range = {
				snap: node.innerHTML,
				start: serializeNodePath(range.startContainer, range.startOffset, node),
				end: serializeNodePath(range.endContainer, range.endOffset, node)
			};
		}

		return range;
	},


	restoreSelection (serializedRange) {
		var node = this.getEditorNode();
		if (serializedRange && window.getSelection) {
			let sel = window.getSelection();
			sel.removeAllRanges();
			try {
				sel.addRange(parseRange(serializedRange, node));
			} catch (e) {
				console.error(e.stack || e.message || e);
				window.alert(e.stack);
			}
		}
	},


	clearSelection () {
		if (!this.hasSelection()) {
			return; //lets not be destructive.
		}

		window.getSelection().removeAllRanges();
	},


	putCursorAtTheEnd () {
		var node = this.getEditorNode();
		if (!node) {
			return;
		}

		var range = document.createRange();
		range.selectNodeContents(node);
		range.collapse(false);

		var selection = window.getSelection();
		selection.removeAllRanges();
		selection.addRange(range);
	},


	/**
	 * @returns true if the cursor or the selected range is completely within the editor.
	 */
	hasSelection () {
		return this.isMounted() && !!this.getSelection();
	},


	componentWillUpdate () {
		this._savedRange = this.saveSelection();
	},


	componentDidUpdate () {
		var a = JSON.stringify(this._savedRange);

		this.restoreSelection(this._savedRange);

		var b = JSON.stringify(this.saveSelection());
		if (a !== b) {
			console.warn(b === a, a, b);
		}
	},
};

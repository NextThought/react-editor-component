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
	return node.nodeName.toLowerCase();
}

/**
 * This returns the nth node "of kind" within a container, ignoring the dom tree.
 * Meaning this is not the same as CSS nth... more like xpath nth:
 *
 * 		(//node-query)[2]
 *
 * The two in the psudo xpath is what this will return.
 *
 * @param {Node} node      The node to count
 * @param {Node} container The root to count from.
 */
function flattenedNthCount(node, container) {
	//converts `n`s childNodes NodeList to an Array
	var nodes = x=> Array.from(x? x.childNodes: 0);
	//Gathers the lineage up to the container (node lists, and the childnode in that list to iterate to)
	var parentsOf = x => !x||x===container?
					[]:
					[{list: nodes(x.parentNode), node:x}]
						.concat(parentsOf(x.parentNode));

	//tag name we're looking for (if its a text node the nodeName will be #text)
	var {nodeName} = node;

	var count = -1;//not found, return -1

	//Get the set of nodes to iterate...
	var parents = parentsOf(node, container);

	//Iterate...
	parents.forEach(x => {
		let {list, node} = x;
		//Count...
		list.every(y=> {
			if (y.nodeName === nodeName) {
				count += 1;
			}
			//Stop iteration when y is node...
			return y !== node;
		});
	});

	return count;
}



function findText(crumb, root) {
	// sofar starts in the 'not found' state of -1. (to match the function flattenedNthCount above)
	var node, sofar = -1;

	let {nth, text, offset} = crumb;
	let isText = n => n.nodeType === 3;

	// every returns true when its callback never returns false...
	// meaning our search was not found) so lets flip the return value.
	let eachNode = (x,fn) => !Array.from(x.childNodes).every(fn);

	//Iterate a node recursively for a text node with the value `text`
	// and is the `nth` text node (so for a senario like this:
	//
	//		test<br>test<br>test
	//
	// would let us find the second and third text nodes that
	// have the same node value.
	let search = container => eachNode(container, x=> {

		if (!isText(x)) {
			return !search(x);//search will return true if it found `it`... so flip to continue the search
		}

		sofar++;//this must be updated first. (x is a text node)

		if (x.textContent === text && nth === sofar) {
			node = x;
		}

		return !node;//node will not be falsy any more if we've found it.
	});


	return search(root) && {
		node: node,
		offset: offset
	};
}


/**
 * This is intended for react updates only... where we need to rebuild a range
 * after the dom has been rerenderd beneath us.  This is not meant to serve as
 * long-term range serialization. The save/restore just have to work across
 * mostly minor dom changes.
 */
function serializeNodePath (node, offset, root) {
	var nodeIndex = n => Array.from((n.parentNode||0).childNodes||0).indexOf(n);
	var textNode = node.nodeType === 3;//Node.TEXT_NODE;
	var path = [];

	//TODO: fix serialized node paths so alterned structure (not content) doesn't break carrot position.
	//[notes]
	//	If end point is textnode, just lets serizize it as a POO: {text:, nth:, offset:}
	//	When we deserialize we can just look for it. Our value normalization will convert:
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

	if (textNode) {
		let nthNode = flattenedNthCount(node, root);
		return {nth: nthNode, text: node.textContent, offset: offset};
	}
	else {
		while(node && node.parentNode) {
			if (root === node) {
				break;
			}

			path.push(getTagName(node)+'['+nodeIndex(node)+']');
			node = node.parentNode;
		}
	}

	return path.reverse().join('/') + `|${offset}`;
}


function parseNodePath(path, root) {
	var offset;
	if (typeof path !== 'string') {
		return findText(path, root);
	}

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

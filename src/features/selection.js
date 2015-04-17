/*global Range*/

function isStartWithin(rangeA, rangeB, inclusive=true) {
	//Comparing the startContainer of rangeB against the startContainer of rangeA:
	let start = rangeA.compareBoundaryPoints(Range.START_TO_START, rangeB);
	//Comparing the startContainer of rangeB against the endContainer of rangeA:
	let end = rangeA.compareBoundaryPoints(Range.START_TO_END, rangeB);

	//We want the rangeB.startContainer to be between the rangeA.(start|end)Containers.
	// So we are looking for:
	// --> a `start` value of -1 or 0. (rangeA's begin is before rangeB's start)
	// --> an `end` value of 1 or 0. (rangeA's end is after rangeB's start)

	if (!inclusive) {
		return start < 0 && end > 0;
	}

	return start < 1 && end > -1;
}


function isEndWithin(rangeA, rangeB, inclusive=true) {
	//Comparing the endContainer of rangeB against the endContainer of rangeA:
	let end = rangeA.compareBoundaryPoints(Range.END_TO_END, rangeB);
	//Comparing the endContainer of rangeB against the startContainer of rangeA:
	let start = rangeA.compareBoundaryPoints(Range.END_TO_START, rangeB);

	//We want the rangeB.endContainer to be between the rangeA.(start|end)Containers.
	// So we are looking for:
	// --> a `start` value of -1 or 0. (rangeA's begin is before rangeB's end)
	// --> an `end` value of 1 or 0. (rangeA's end is after rangeB's end)

	if (!inclusive) {
		return start < 0 && end > 0;
	}

	return start < 1 && end > -1;
}


function isCompletelyWithin(rangeA, rangeB, inclusive=true) {
	return	isEndWithin(rangeA, rangeB, inclusive) &&
			isStartWithin(rangeA, rangeB, inclusive);
}


function isRangeWithinNode (range, node, inclusive=true) {
	if (node.ownerDocument !== range.commonAncestorContainer.ownerDocument) {
		return false;
	}

	let containerRange = node.ownerDocument.createRange();

	containerRange.selectNodeContents(node);
	//if the selected range is completely within the editor area
	return isCompletelyWithin(containerRange, range, inclusive);
}


function isRangeStillValid (range, node) {

	const isCollapsedBeforeNode = n =>
			// If a range has the same end/start points it is collapsed
			range.collapsed &&
			// If the endpoint container is the given n, and the offset is 0
			range.startContainer === n &&
			range.startOffset === 0;


	let within = range &&
		!isCollapsedBeforeNode(node) &&
		isRangeWithinNode(range, node);


	return within;
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
	let nodes = x=> Array.from(x? x.childNodes: 0);
	let count = -1;

	let combiner = (a, n)=> a.concat(n, nodes(n).reduce(combiner, []));

	let flatList = nodes(container).reduce(combiner, []);

	flatList.every(x=> {
		count += x.nodeName === node.nodeName ? 1 : 0;
		return x !== node;
	});

	return count;
}


function findNodeSeach(crumb, root, isKind, testNode=()=>true) {
	// sofar starts in the 'not found' state of -1. (to match the function flattenedNthCount above)
	let node, sofar = -1;

	let {nth, offset} = crumb;

	// every returns true when its callback never returns false...
	// meaning our search was not found) so lets flip the return value.
	let eachNode = (x, fn) => !Array.from(x.childNodes||0).every(fn);

	//Iterate a node recursively for a node that satisfies isKind
	// and is the `nth` node. So for a senario like this:
	//
	//		test<br>test<br>test
	//
	// would let us find the second BR nodes...
	let search = container => eachNode(container, x=> {

		if (!isKind(x)) {
			//This is safe for text nodes.

			//search will return true if it found `it`... so flip to continue the search
			return !search(x);
		}

		sofar++;//this must be updated first. (x is a node we care about)

		if (nth === sofar && testNode(x)) {
			node = x;
		}

		return !node;//node will not be falsy any more if we've found it.
	});


	return search(root) && {
		node: node,
		offset: offset
	};
}


function findNode(crumb, root) {
	let isKindText = x => x.nodeType===3;//Node.TEXT_NODE;
	let isKindNode = x => x.nodeName === crumb.node;

	let testNodeText = x => x.textContent === crumb.text;

	let callbacks = [];

	if (crumb.text) {
		callbacks.push(isKindText, testNodeText);
	}
	else {
		callbacks.push(isKindNode);
	}

	return findNodeSeach(crumb, root, ...callbacks);
}

/**
 * This is intended for react updates only... where we need to rebuild a range
 * after the dom has been rerenderd beneath us.  This is not meant to serve as
 * long-term range serialization. The save/restore just have to work across
 * mostly minor dom changes.
 */
function serializeNodePath (node, offset, root) {
	let nodeIndex = n => Array.from((n.parentNode||0).childNodes||0).indexOf(n);
	let textNode = node.nodeType === 3;//Node.TEXT_NODE;
	let path = [];

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

			path.push(node.nodeName+'['+nodeIndex(node)+']');
			node = node.parentNode;
		}
	}

	return path.reverse().join('/') + `|${offset}`;
}


function parseNodePath(path, root, preupdateSnapshot) {
	let offset;
	if (typeof path !== 'string') {
		return findNode(path, root);
	}

	[path, offset] = path.split('|');

	path = path.split('/');
	offset = parseInt(offset, 10);

	let node = root;

	function fixPath(p, n) {
		return p.replace(/\[(\d+)\]$/m, (_, x) => parseInt(x, 10) + n);
	}

	while(node && path.length) {

		let index = path.shift();
		let tag = /([#a-z]+)\[(\d+)\]/i.exec(index);
		if (tag) {
			[, tag, index] = tag;
		}


		let nextNode = Array.from(node.childNodes)[index];


		//HACK:
		//Maybe the dom shifted...(normalized)
		if (tag==='DIV' && index==='1' && !nextNode && node===root) {
			nextNode = node.firstChild;
			// let offsetPrefix = preupdateSnapshot.firstChild.childNodes.length + 1;
			let offsetPrefix = (preupdateSnapshot || 0) + 1;

			if (!path.length) {
				offset += offsetPrefix;
			}
			else {
				//If we are deeper, still... update the next node's index
				path[0] = fixPath(path[0]);
			}
		}




		if (!nextNode) {
			console.warn('%o does not have a child at %s', node, index);
		} else if (tag && nextNode.nodeName !== tag) {
			console.warn('%o is not what we expected. (%s)', nextNode, tag);
		}

		node = nextNode;
	}

	return node && {
		node: node,
		offset: offset
	};
}


function parseRange (rangeish, root) {
	let {snap, start, end} = rangeish;
	let range = document.createRange();//may need adjusting
	let cap = s => s.replace(/^./m, x=>x.toUpperCase());


	function set(side, part, snapshot) {
		part = parseNodePath(part, root, snapshot);
		if (part) {
			let {node, offset} = part;

			range['set'+cap(side)](node, offset);
		}
		else {
			throw new Error('Could not reconstitute endpoint.');
		}
	}

	try {
		set('start', start, snap);
		set('end', end, snap);
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


	componentWillMount () {
		this.registerHandlers({

			onFocus: ()=> {
				if (!this.hasSelection()) {
					this.putCursorAtTheEnd();
				}
			}

		});
	},


	getSelection(from){
		if (!window.getSelection) {
			console.warn('Unsupported (Legacy) Selection Model');
			return null;
		}

		if (!from) {
			from = this.getEditorNode();
		}

		let getSelection = x=> (x && x.getSelection) ?
								x.getSelection() :
								(x ? getSelection(x.parentNode) : null);

		let range = null;
		let sel = getSelection(from);
		if (sel && sel.rangeCount) {
			// create the range to avoid chrome bug from getRangeAt / window.getSelection()
			// https://code.google.com/p/chromium/issues/detail?id=380690
			range = sel.anchorNode.ownerDocument.createRange();
			range.setStart(sel.anchorNode, sel.anchorOffset);
			range.setEnd(sel.focusNode, sel.focusOffset);
		}

		if (range && !isRangeWithinNode(range, from, true)) {
			range = null;
		}

		return range;
	},


	saveSelection () {
		let range = this.getSelection();
		let node = this.getEditorNode();
		if (range) {
			range = {
				range: range,
				snap: ((node.firstChild || {}).childNodes || []).length,//node.cloneNode(true),
				start: serializeNodePath(range.startContainer, range.startOffset, node),
				end: serializeNodePath(range.endContainer, range.endOffset, node)
			};
		}

		return range;
	},


	restoreSelection (savedRange) {
		let node = this.getEditorNode();
		if (savedRange && window.getSelection) {
			let sel = window.getSelection();
			try {
				let {range} = savedRange;
				if (range && !isRangeStillValid(range, node)) {
					console.log('range wasn`t valid');
					range = null;
				}

				sel.removeAllRanges();
				sel.addRange(range || parseRange(savedRange, node));
			} catch (e) {
				console.error(e.stack || e.message || e);
			}
		}
	},


	clearSelection () {
		if (!this.hasSelection()) {
			return; //lets not be destructive.
		}

		console.debug('Clearing');
		window.getSelection().removeAllRanges();
	},


	putCursorAtTheEnd () {
		let node = this.getEditorNode();
		if (!node) {
			return;
		}

		let range = document.createRange();
		range.selectNodeContents(node);
		range.collapse(false);

		let selection = window.getSelection();
		selection.removeAllRanges();
		selection.addRange(range);
	},


	focus () { this.putCursorAtTheEnd(); },


	componentDidMount () {
		this.componentNode = this.getDOMNode();
	},


	componentWillUnmount () {
		this.componentNode = null;
	},


	/**
	 * @returns true if the cursor or the selected range is completely within the editor.
	 */
	hasSelection () {
		return this.componentNode && !!this.getSelection(this.componentNode);
	}
};

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


// function serializeNodePath (node, root) {
// 	var nodeIndex = n => n;
//
// }


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

		// if (range) {
		// 	console.log(serializeNodePath(range.startContainer), this.getEditorNode());
		// }


		return range;
	},


	restoreSelection (range) {
		if (range && window.getSelection) {
			let sel = window.getSelection();
			sel.removeAllRanges();
			sel.addRange(range);
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
		var selectionRange = this.getSelection();
		if (!this.isMounted() || !selectionRange) {
			return false;
		}

		var node = this.getEditorNode();
		var containerRange = document.createRange();

		containerRange.selectNode(node);
		//if the selected range is completely within the editor area
		return isCompletelyWithin(containerRange, selectionRange);
	},


	componentWillUpdate () {
	},


	componentDidUpdate () {
	},
};

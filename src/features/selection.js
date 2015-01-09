
function normalize(node){
	return (!node.tagName) ? node.parentNode : node;
}

function onlyHasTextNodes(node) {
	node = normalize(node);
	//The element contains only text nodes...
	return Array.from(node.childNodes)
				.filter(n=>n.nodeType!==3).length === 0;
}

export default {
	/**
	 * Return the selection the normalised selection model:
	 *	- nodes are sorted in ascending order
	 *	- includes the selection start and end for both nodes
	 * @type {[type]}
	 */
	getSelectionModel(){
    	var selection = global.getSelection();
    	var {anchorOffset, focusOffset, anchorNode, focusNode} = selection;
    	var anchor = normalize(anchorNode);
    	var focus = normalize(focusNode);
    	var nodes;

		var markAsBegining = x => {
			x.selectionStart = x.offset;
			x.selectionEnd = x.node.firstChild.length;
		};

		var markAsEnding = x => {
			x.selectionStart = 0;
			x.selectionEnd = x.offset;
		};

    	if (anchor === focus) {
    		return {
        		multilineSelection: false,
        		type: selection.type,
        		normalTextOnly: onlyHasTextNodes(anchor),
        		nodes: [{
        			node: anchor,
        			tagKey: anchor.getAttribute('data-tag-key'),
        			selectionStart: Math.min(anchorOffset, focusOffset),
        			selectionEnd: Math.max(anchorOffset, focusOffset)
        		}]
        	};
        }

		nodes = [
    		{
    			node: anchor,
    			offset: anchorOffset,
    			tagKey: anchor.getAttribute('data-tag-key')
    		}, {
    			node: focus,
    			offset: focusOffset,
    			tagKey: focus.getAttribute('data-tag-key')
    		}
		];

		nodes.sort((a, b)=>(a.tagKey <= b.tagKey) ? -1 : 1);

		markAsBegining(nodes[0]);
		markAsEnding(nodes[1]);

		return {
    		multilineSelection: true,
    		type: selection.type,
    		normalTextOnly: onlyHasTextNodes(anchor) && onlyHasTextNodes(focus),
    		nodes: nodes
		};
	}
};

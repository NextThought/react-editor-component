
export var Selection = {
	/**
	 * Return the selection the normalised selection model:
	 *	- nodes are sorted in ascending order
	 *	- includes the selection start and end for both nodes
	 * @type {[type]}
	 */
	getSelectionModel(){
    	var selection = global.getSelection();
    	var {anchorOffset, focusOffset, anchorNode, focusNode} = selection;
    	var anchor = this.normaliseSelectionNode(anchorNode);
    	var focus = this.normaliseSelectionNode(focusNode);
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
        		normalTextOnly: this.hasNodeNormalTextOnly(anchor),
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

		nodes.sort((a, b) => (a.tagKey <= b.tagKey) ? -1 : 1);

		markAsBegining(nodes[0]);
		markAsEnding(nodes[1]);

		return {
    		multilineSelection: true,
    		type: selection.type,
    		normalTextOnly: this.hasNodeNormalTextOnly(anchor) && this.hasNodeNormalTextOnly(focus),
    		nodes: nodes
		};
	},


	normaliseSelectionNode(node){
    	return (!node.tagName) ? node.parentNode : node;
	},


	hasNodeNormalTextOnly(node) {
    	return (node.parentNode.getAttribute('data-tag-key') === 'root');
	}
};

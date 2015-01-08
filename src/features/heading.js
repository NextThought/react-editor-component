import * as React from 'react/addons';

import {ELEMENT_NAMES, getNodeIndex} from './common';

export default {

    applyHeadingOne () { return this.applyHeading('h1'); },


    applyHeadingTwo () { return this.applyHeading('h2'); },


    applyHeadingThree () { return this.applyHeading('h3'); },


    applyHeadingFour () { return this.applyHeading('h4'); },


	applyHeading (headingLevel) {
    	var selection = global.getSelection();
        var {anchorNode, focusNode} = selection;
        var startIndex = getNodeIndex(this.getTopLevelSelectionNode(anchorNode));
        var endIndex = getNodeIndex(this.getTopLevelSelectionNode(focusNode));
        var childNodesConfig = {}, config, content;

    	if (startIndex > endIndex) {
            [startIndex, endIndex] = [endIndex, startIndex]; // Swap
    	}

    	for (let i = startIndex; i <= endIndex; ++i) {
    		childNodesConfig[i] = {
        		tagName: {
        			$set: headingLevel
        		}
		    };
    	}

    	config = {
    		childNodes: childNodesConfig
    	};

        content = React.addons.update(this.state.content, config);

    	return this.setState({
    		content: this.addKeysToTags(content, this.state.rootKey)
    	});
	},


	getTopLevelSelectionNode (node) {
    	if (!node.tagName) {
    		node = node.parentNode;
    	}

    	while (ELEMENT_NAMES.indexOf(node.tagName.toLowerCase()) === -1) {
    		node = node.parentNode;
    	}

    	return node;
	}
};

import * as React from 'react/addons';
import {
        buildConfigObject,
		getTagKeyArray,
		getDomNode,
		getNodeText,
		getNodeTagName
    } from './common';


export default {
	applyBoldFormat () { return this.applyFormat('b'); },

	applyItalicFormat () { return this.applyFormat('i'); },

	applyUnderlineFormat () { return this.applyFormat('u'); },

	applyStriketroughFormat () { return this.applyFormat('del'); },


	applyFormat: function(formatTag){
		var selectionModel = this.getSelectionModel();
        var {content} = this.state;
        var [selectedNode] = selectionModel.nodes;
        var {selectionStart, selectionEnd} = selectedNode;
        var tagName = getNodeTagName(selectedNode);
        var text = getDomNode(selectedNode).firstChild.data;

        var {tagKey} = selectedNode;
        var tagKeyArray = getTagKeyArray(tagKey);

        var spliceArray = [0, 1];
        var formatPosition = 0;

        var newFormattedNode = {
            tagName: formatTag,
            nodeType: 1,
            childNodes: [{
                nodeType: 3,
                textContent: text.substring(selectionStart, selectionEnd)
            }]
        };

        var c;
        var index;
        var selectionElTagKey;
        var mergeConfig;

        var makeNode = (text)=> ({
            tagName: 'span',
            nodeType: 1,
            childNodes: [{
                nodeType: 3,
                textContent: text
            }]
        });


		if (selectionModel.type === 'Caret') {
			return console.warn('Caret selection type is not supported yet');
		}


		if (selectionModel.multilineSelection) {
			return console.log('multiline selection');
		}



		if (tagName === 'span') {

			console.log(tagKey);
            //full tag
			if (selectionStart === 0 && selectionEnd === text.length) {
				c = {
					tagName: {
						$set: formatTag
					}
				};
			}

            else {//partial tag

                //Selection starts at the front of the containing node, ends in the middle somewhere...
				if (selectionStart === 0) {
					let node = makeNode(text.substring(selectionEnd));

                    content = React.addons.update(content, buildConfigObject(tagKeyArray, {
                        tagName: { $set: formatTag },
                        childNodes: [
                            { textContent: { $set: text.substring(0, selectionEnd) } }
                        ]
                    }));

					index = tagKeyArray.pop();

					c = { childNodes: { $splice: [[index + 1, 0, node]] } };
				}


                //Selection ends at the end of the containing node, begins in the middle somewhere...
                else if (selectionEnd === text.length) {
					let node = makeNode(text.substring(0, selectionStart));

                    content = React.addons.update(content, buildConfigObject(tagKeyArray, {
                        tagName: { $set: formatTag },
                        childNodes: [{textContent: {$set: text.substring(selectionStart)}}]
                    }));

					index = tagKeyArray.pop();
					c = {
						childNodes: {
							$splice: [[index, 0, node]]
						}
					};

                    selectionElTagKey = 'root.' + tagKeyArray.join('.') + '.' + (index + 1);
					console.log(selectionElTagKey);
				}


                //Both end points are in the middle of the containing tag
                else {
					let nodeA = makeNode(text.substring(0, selectionStart));


                    content = React.addons.update(content, buildConfigObject(tagKeyArray, {
                        tagName: { $set: formatTag },
                        childNodes: [{ textContent: { $set: text.substring(selectionStart, selectionEnd)}}]
                    }));

                    //next...

					index = tagKeyArray.pop();

                    content = React.addons.update(content, buildConfigObject(tagKeyArray, {
                        childNodes: {
                            $splice: [[index, 0, nodeA]]
                        }
                    }));

                    //next...

                    let nodeB = makeNode(text.substring(selectionEnd));
					c = {
						childNodes: {
							$splice: [[index + 2, 0, nodeB]]
						}
					};
					selectionElTagKey = 'root.' + tagKeyArray.join('.') + '.' + (index + 1);
					console.log(selectionElTagKey);
				}
			}
		}

        //tagName is not 'span'...
        else {

            //selection at the beginning...
			if (selectionStart !== 0) {
				let nodeA = makeNode(text.substring(0, selectionStart));

				formatPosition = 1;
				spliceArray.push(nodeA);
				spliceArray.push(newFormattedNode);

                if (selectionEnd !== text.length) {
					let nodeB = makeNode(text.substring(selectionEnd));
					spliceArray.push(nodeB);
				}
			}

            //selection does not start at 0
            else {
				spliceArray.push(newFormattedNode);
				if (selectionEnd !== text.length) {
					let node = makeNode(text.substring(selectionEnd));
					spliceArray.push(node);
				}
			}

			c = { childNodes: {$splice: [spliceArray]} };

        	selectionElTagKey = 'root.' + tagKeyArray.join('.') + '.' + formatPosition;
		}


		content = React.addons.update(content,
            buildConfigObject(tagKeyArray, c));

		content = this.addKeysToTags(content, this.state.rootKey);


        mergeConfig = this.mergeSiblingsFormattingNodes(content);
		if (mergeConfig) {
			console.log(mergeConfig);
		}

        return this.updateState(content, selectionElTagKey, selectionEnd - selectionStart);
	},


	mergeSiblingsFormattingNodes: function(content){
        var nodes = content.childNodes;

		for (let i = 0, len = nodes.length; i < len; ++i) {
			let x = nodes[i];
			if (x.nodeType === 3) {
				return;
			}

			this.mergeSiblingsFormattingNodes(x);

			let availableNodesForMerge = x.childNodes.map(n=>this.isPossibleNodeForMerge(n));

			for (let j = 0, to = x.childNodes.length - 2; j <= to; ++j) {
                let k = j + 1;
                let a = x.childNodes[j],
                    b = x.childNodes[k];
				if (availableNodesForMerge[j] &&
                    availableNodesForMerge[k] &&
                    getNodeTagName(a) === getNodeTagName(b)) {

					return {
						parentNode: x,
						index: j,
						newNode: this.tryMerge(a, b)
					};
				}
			}
		}
	},


	isPossibleNodeForMerge (node) {
		return (node.nodeType === 1 &&//Node.ELEMENT_NODE
            node.childNodes.length === 1 &&
            node.childNodes[0].nodeType === 3);//Node.TEXT_NODE
	},


	tryMerge (node1, node2) {
        var textA = getNodeText(node1.childNodes[0]);
        var textB = getNodeText(node2.childNodes[0]);

		console.log('trying to merge: ', textA, textB);
		return {
			nodeType: 1,
			tagName: getNodeTagName(node1),
			childNodes: [{
				nodeType: 3,
				textContent: textA + textB
			}]
		};
	}
};

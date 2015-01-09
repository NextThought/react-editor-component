import * as React from 'react/addons';
import {
    buildConfigObject,
    getTagKeyArray,
    getDomNode,
    getNodeText,
    getNodeTagName,
    getNodeTagKey,
    getNodeTagKeyBase,
    getNodeIndex
    } from './common';

const reactUpdate = React.addons.update;


export function isBackspaceKey(c) {
    return c === 'Backspace' || c === 'Delete';
}

export default {

    handleCharacterChange (isAppending, character) {
        let selModel = this.getSelectionModel();
        var normalTextOnly = selModel.normalTextOnly ||
                                        isAppending ||
                                        getDomNode(selModel.nodes[0]).firstChild.textContent.length !== 1;//this needs abstracting

        var handlerName = ['handleCharacterChangeFor'];

        console.log(selModel);

        handlerName.push(selModel.multilineSelection ? 'Multiline' : 'SingleLine');
        handlerName.push(normalTextOnly ? 'NormalText' : 'FormattedText');

        handlerName = handlerName.join('');

        if (!this[handlerName]) {
            console.error('No handler: %s', handlerName);
            return;
        }

        return this[handlerName](selModel, isAppending, character);
    },


    handleEnterKey () {
        let selModel = this.getSelectionModel();
        var handlerName = ['handleEnterKeyFor'];

        handlerName.push(selModel.multilineSelection ? 'Multiline' : 'SingleLine');
        handlerName.push(selModel.normalTextOnly ? 'NormalText' : 'FormattedText');

        handlerName = handlerName.join('');

        if (!this[handlerName]) {
            console.error('No handler: %s', handlerName);
            return;
        }

        return this[handlerName](selModel);
    },


	handleEnterKeyForSingleLineNormalText (selectionModel) {
		var content = this.state.content;
        var [selectedNode] = selectionModel.nodes;
        var selectionIndex = getNodeIndex(selectedNode);
        var text = getNodeText(selectedNode);
        var newNode;

		if (selectedNode.selectionStart === selectedNode.selectionEnd &&
            selectedNode.selectionStart === selectedNode.node.innerText.length) {

			newNode = {
				tagName: 'p',
				nodeType: 1,
				childNodes: [{
					nodeType: 1,
					tagName: 'br',
					childNodes: []
				}]
			};
		}

        else {
			newNode = {
				tagName: 'p',
				nodeType: 1,
				childNodes: [{
					nodeType: 3,
					textContent: text.substring(selectedNode.selectionStart)
				}]
			};

			content = reactUpdate(content, {
                childNodes: {
                    [selectionIndex]: {
                        childNodes: [
                            {
                                textContent: {
                                    $set: text.substring(0, selectedNode.selectionStart)
                                }
                            }
                        ]
                    }
                }
            });
		}

        content = reactUpdate(content, {
            childNodes: {
                $splice: [[selectionIndex + 1, 0, newNode]]
            }
        });

		content = this.addKeysToTags(content, this.state.rootKey);

		return this.updateState(content, content.childNodes[selectionIndex + 1].key, 0);
	},


	handleEnterKeyForSingleLineFormattedText (selectionModel, doReturn) {
		var content = this.state.content;

        var selectionNode = selectionModel.nodes[0];
        var {node, tagKey, selectionStart} = selectionNode;

        var newNodes = this.splitNode(node, selectionStart);

        var tagKeyArray = getTagKeyArray(tagKey);

        var selectedNodeIndex = tagKeyArray.pop();

		content = reactUpdate(content, buildConfigObject(tagKeyArray, {
            childNodes: {
                $splice: [[selectedNodeIndex, 1, newNodes[0], newNodes[1]]]
            }
        }));

        var topLevelParentIndex = tagKeyArray.shift();
		var topLevelParentNode = content.childNodes[topLevelParentIndex];


        // Creating first new node clone
		var newTopLevelNode1 = reactUpdate(topLevelParentNode, buildConfigObject(tagKeyArray, {
            childNodes: {
                $splice: [[selectedNodeIndex + 1]]
            }
        }));

        // removing parent next sibling nodes if array length > 1
		for (let i = 0, to = tagKeyArray.length - 2; i <= to; ++i) {
			let a = tagKeyArray.slice(0, i + 1);

			newTopLevelNode1 = reactUpdate(
                newTopLevelNode1,
                buildConfigObject(a, {
                    childNodes: {
                        $splice: [[tagKeyArray[i] + 1]]
                    }
                }));
		}

        // Creating second new node clone
		var newTopLevelNode2 = reactUpdate(topLevelParentNode,
            buildConfigObject(tagKeyArray, {
                childNodes: {
                    $splice: [[0, selectedNodeIndex + 1]]
                }
            }));

        // removing parent previous sibling nodes if array length > 1
		for (let i = 0, to = tagKeyArray.length - 1; i <= to; ++i) {
            let a = Array.apply(null, new Array(i)).map(()=>0);

			newTopLevelNode2 = reactUpdate(
                newTopLevelNode2,
                buildConfigObject(a, {
                    childNodes: {
                        $splice: [[0, tagKeyArray[i]]]
                    }
                }));
		}


		if (doReturn) {
			return [newTopLevelNode1, newTopLevelNode2];
		}


		content = reactUpdate(content, {
            childNodes: {
                $splice: [[topLevelParentIndex, 1, newTopLevelNode1, newTopLevelNode2]]
            }
        });

		content = this.addKeysToTags(content, this.state.rootKey);

        //Did these change??
        tagKey = selectionNode.tagKey;
		selectionStart = selectionNode.selectionStart;

        return this.updateState(content, tagKey, selectionStart);
	},


	/**
	 * When user press enter on selection between multiline text:
	 * 1. Delete text that is part of selection
	 * @type {[type]}
	 */
	handleEnterKeyForMultilineNormalText (selectionModel) {
		var content = this.state.content;
        var [selectionNodeA, selectionNodeB] = selectionModel.nodes;

        var getNodeConfig = (n, text) => ({
                nodeType: 1,
                tagName: getNodeTagName(n),
                childNodes: [{ nodeType: 3, textContent: text }]
            });

		var newNode1 = getNodeConfig(selectionNodeA, getNodeText(selectionNodeA).substring(0, selectionNodeA.selectionStart));

        var newNode2 = getNodeConfig(selectionNodeB, getNodeText(selectionNodeB).substring(selectionNodeB.selectionEnd));

		var startIndex = getNodeIndex(selectionNodeA);
		var endIndex = getNodeIndex(selectionNodeB) - startIndex + 1;

        var tagKey = getNodeTagKeyBase(selectionNodeA) + '.' + (startIndex + 1);

		var selectionStart = 0;

		content = reactUpdate(this.state.content, {
            childNodes: {
                $splice: [[startIndex, endIndex, newNode1, newNode2]]
            }
        });

		content = this.addKeysToTags(content, this.state.rootKey);

		return this.updateState(content, tagKey, selectionStart);
	},


	handleEnterKeyForMultilineFormattedText (selectionModel) {
		var [nodeA, nodeB] = selectionModel.nodes;

		var startIndex = getNodeIndex(nodeA);
		var endIndex = getNodeIndex(nodeB);

        var newNode1, newNode2;

		if (getNodeTagName(nodeA) === 'p') {
            [newNode1] = this.splitNode(nodeA, nodeA.selectionStart);
        }
        else {
            [newNode1] = this.handleEnterKeyForSingleLineFormattedText({ nodes: [nodeA] }, true);
			startIndex = getNodeIndex(nodeA);
		}

		if (getNodeTagName(nodeA) === 'p') {
            [,newNode2] = this.splitNode(nodeB, nodeB.selectionEnd);
        }
        else {
			nodeB.selectionStart = nodeA.selectionEnd;
            [,newNode2] = this.handleEnterKeyForSingleLineFormattedText({ nodes: [nodeB] }, true);
		}


		var content = reactUpdate(this.state.content, {
            childNodes: {
                $splice: [[startIndex, endIndex - startIndex + 1, newNode1, newNode2]]
            }
        });

		content = this.addKeysToTags(content, this.state.rootKey);

		var {selectionStart, tagKey} = nodeA;

		return this.updateState(content, tagKey, selectionStart);
	},


	handleCharacterChangeForSingleLineNormalText (selectionModel, isAppending, character) {
		var {content} = this.state;
        var [selectedNode] = selectionModel.nodes;

        var selectionStart = selectedNode.selectionStart;
        var selectionEnd = selectedNode.selectionEnd;
        var selectionLength = selectionEnd - selectionStart;

        var firstChild = getDomNode(selectedNode).firstChild;
        var {tagKey} = selectedNode;
        var tagKeyArray = getTagKeyArray(tagKey, 0);

        var isBackspace = isBackspaceKey(character);

        var config;


		if (getNodeTagName(firstChild) === 'br') {
			if (isBackspace) {
				if (this.state.content.childNodes.length === 1) {
					return;
				}

                //remove the added 0
				tagKeyArray.pop();

                config = {
					childNodes: {
						$splice: [[tagKeyArray[0], 1]]
					}
				};

                if (tagKeyArray[0] !== 0) {
					tagKey = 'root.' + (tagKeyArray[0] - 1);
					selectionStart = 'last-character';
				}

			}
            else {

				config = buildConfigObject(tagKeyArray, {
                    textContent: {
                        $set: character
                    },
                    nodeType: {
                        $set: 3
                    }
                });

				selectionStart += 1;
			}
		}
        else {
			if (firstChild.textContent.length === 1 && isBackspace) {

                config = buildConfigObject(tagKeyArray, {
                    nodeType: { $set: 1 },
                    childNodes: { $set: [] },
                    tagName: { $set: 'br' }
                });

			}
            else {

				if (character === 'Backspace' && selectionStart === selectionEnd) {
					selectionStart -= 1;
				}

				config = buildConfigObject(tagKeyArray, isAppending ?
                    this.appendText(character, selectionStart++, selectionLength) :
                    this.deleteText(selectionStart, selectionLength));
			}
		}

        content = reactUpdate(this.state.content, config);

		content = this.addKeysToTags(content, this.state.rootKey);

		return this.updateState(content, tagKey, selectionStart);
	},


	handleCharacterChangeForSingleLineFormattedText (selectionModel /*, isAppending, character*/) {
		var {content} = this.state;
        var [selectedNode] = selectionModel.nodes;
        var {tagKey} = selectedNode;

        var tagKeyArray = getTagKeyArray(tagKey, 0);
        var parent = getDomNode(selectedNode).parentNode;
        var currentIndex = tagKeyArray[tagKeyArray.length - 2];

        var selectionStart;

		tagKeyArray = getTagKeyArray(getNodeTagKey(parent));

		content = reactUpdate(this.state.content, buildConfigObject(tagKeyArray, {
            childNodes: {
                $splice: [[currentIndex, 1]]
            }
        }));


		if (currentIndex !== 0) {
			tagKey = getNodeTagKey(getDomNode(selectedNode).previousSibling);
			selectionStart = getDomNode(selectedNode).previousSibling.firstChild.textContent.length;

		} else {
			tagKey = getNodeTagKey(parent.parentNode);
			selectionStart = 'last-character';
		}

		content = this.addKeysToTags(content, this.state.rootKey);

		return this.updateState(content, tagKey, selectionStart);
	},


	handleCharacterChangeForMultilineNormalText (selectionModel, isAppending, character) {
        var isBackspace = isBackspaceKey(character);
		var {content} = this.state;
        var {nodes} = selectionModel;
        var [node0, node1] = nodes;

        var newNode = this.mergeNodes(nodes, character);
        var startIndex = getNodeIndex(node0);
        var endIndex = getNodeIndex(node1) + 1;

        console.log(startIndex, endIndex);

        var {tagKey} = node0;
		var selectionStart = node0.offset + (isBackspace ? 0 : 1);

		content = reactUpdate(content, {
            childNodes: {
                $splice: [[startIndex, endIndex, newNode]]
            }
        });

		content = this.addKeysToTags(content, this.state.rootKey);

		return this.updateState(content, tagKey, selectionStart);
	},


	handleCharacterChangeForMultilineFormattedText (selectionModel, isAppending, character) {
		var [node0,node1] = selectionModel.nodes;
        var startIndex = getNodeIndex(node0);
        var endIndex = getNodeIndex(node1);

        var newNode1;
        var newNode2;

        var tagKeyArray;

        var newNode;
        var content;
        var tagKey;
        var selectionStart;

		console.warn('handle-character-change-for-multiline-formatted-text is not supported yet');


		if (getNodeTagName(node0) === 'p') {

        	[newNode1] = this.splitNode(node0, node0.selectionStart);
			if (isAppending) {
				newNode1.childNodes[0].textContent += character;
			}
			newNode1.childNodes[0] = {
				tagName: 'span',
				nodeType: 1,
				childNodes: [newNode1.childNodes[0]]
			};
		}


		if (getNodeTagName(node1) === 'p') {
            [,newNode2] = this.splitNode(node1, node1.selectionEnd);
			newNode2.childNodes[0] = {
				tagName: 'span',
				nodeType: 1,
				childNodes: [newNode2.childNodes[0]]
			};
		}


		if (!newNode1) {
			[newNode1] = this.handleEnterKeyForSingleLineFormattedText({ nodes: [node0] }, true);

			if (isAppending) {
				tagKeyArray = getTagKeyArray(node0, 0).slice(1);

				newNode1 = reactUpdate(newNode1,
                    buildConfigObject(tagKeyArray,
                        this.appendText(character, node0.selectionStart)));
			}
		}



		if (!newNode2) {
			node1.selectionStart = node1.selectionEnd;

			[,newNode2] = this.handleEnterKeyForSingleLineFormattedText({nodes: [node1]}, true);
		}


		newNode = {
			tagName: 'p',
			nodeType: 1,
			childNodes: newNode1.childNodes.concat(newNode2.childNodes)
		};


		content = reactUpdate(this.state.content, {
            childNodes: {
                $splice: [[startIndex, endIndex - startIndex + 1, newNode]]
            }
        });

		content = this.addKeysToTags(content, this.state.rootKey);

		var {tagKey, selectionStart} = node0;

        if (isAppending) {
			selectionStart++;
		}

        return this.updateState(content, tagKey, selectionStart);
	},


	appendText (character, position, length) {
		return {
			textContent: {
				$apply: function(currentValue){
					currentValue = (currentValue || '').split('');
                    if (currentValue.length === 0) {
						currentValue.push(character);
					} else {
						currentValue.splice(
                            position == null ? currentValue.length: position,
                            length || 0,
                            character
                        );
					}
					return currentValue.join('');
				}
			}
		};
	},


	deleteText (start, length) {
		length = length || 1;
		return {
			textContent: {
				$apply: function(currentValue){
					var v = currentValue.split('');
                    v.splice(start, length);
                    return v.join('');
				}
			}
		};
	},


	mergeNodes (nodes, character) {
		var textFirst = getDomNode(nodes[0]).firstChild.textContent.substring(0, nodes[0].offset);
        var textSecond = getDomNode(nodes[1]).firstChild.textContent.substring(nodes[1].offset);

		if (isBackspaceKey(character)) {
			character = '';
		}

		return {
			tagName: getNodeTagName(nodes[1]),
			nodeType: 1,
			childNodes: [{
				nodeType: 3,
				textContent: textFirst + character + textSecond
			}]
		};
	},


	splitNode (node, splitPosition) {
        var tag = getNodeTagName(node);
        var text = getNodeText(node);
		return [{
			tagName: tag,
			nodeType: 1,
			childNodes: [{
				nodeType: 3,
				textContent: text.substring(0, splitPosition)
			}]
		},{
			tagName: tag,
			nodeType: 1,
			childNodes: [{
				nodeType: 3,
				textContent: text.substring(splitPosition)
			}]
		}];
	}
};

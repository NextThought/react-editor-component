export const ELEMENT_NAMES = ['div', 'p', 'h1', 'h2', 'h3', 'h4', 'code'];


export function buildConfigObject (a, obj){
	return a.reduceRight((pre, cur)=>({childNodes: {[cur]: pre}}), obj);
}

export function getDomNode(n) {
	return n.node || n;
}

export function getNodeIndex (node) {
	return parseInt(getNodeTagKey(node).split('.')[1], 10);
}

export function getNodeTagName(n) {
	n = getDomNode(n).tagName;
	return n && n.toLowerCase();
}

export function getNodeTagKey(node) {
	return node.tagKey || node.getAttribute('data-tag-key');
}

export function getNodeTagKeyBase(node) {
	return getNodeTagKey(node).split('.')[0];
}

export function getNodeText(n) {
	return getDomNode(n).textContent; //innerText
}

export function getTagKeyArray(tagKey, ...add) {
	var a = tagKey.split('.').splice(1).map(i=>parseInt(i, 10));
	if (add.length) {
		a.push(...add);
	}
	return a;
}

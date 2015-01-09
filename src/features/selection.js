
export default {

	getSelection(){
		if (window.getSelection) {
			let sel = window.getSelection();
			if (sel.getRangeAt && sel.rangeCount) {
				return sel.getRangeAt(0);
			}
		}

		if (document.selection && document.selection.createRange) {
			return document.selection.createRange();
		}

		return null;
	},


	restoreSelection (range) {
		if (range) {
			if (window.getSelection) {
				let sel = window.getSelection();
				sel.removeAllRanges();
				sel.addRange(range);
			}
			else if (document.selection && range.select) {
				range.select();
			}
		}
	}
};

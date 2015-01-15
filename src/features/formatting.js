
var FORMATS = [
	'bold',
	'italic',
	'underline'
];

export default {

	componentWillMount () {
		this.registerStateClassResolver(
			this.getActiveFormats
		);
	},


	getActiveFormats () {
		return FORMATS.filter(x=>document.queryCommandState(x)).join(' ');
	},


	onSetFormat (e) {
		e.preventDefault();
		e.stopPropagation();

		var style = e.target.getAttribute('data-format');
		this.applyFormat(style);
		this.wasInteractedWith();
	},

	applyFormat (style) {
		if (document.queryCommandSupported(style)) {
			document.execCommand(style, false, false);
		}
	}

};


var FORMATS = [
	'bold',
	'italic',
	'underline'
];

const savedSelection = Symbol('savedSelection');


export default {

	componentWillMount () {
		this.registerStateClassResolver(
			this.getActiveFormats
		);

		this.registerHandlers({
			onBlur: ()=> {
				//save cursor on blur
				this[savedSelection] = this.saveSelection();
			}
		});
	},


	getActiveFormats () {
		if (this.hasSelection()) {
			try {
				return FORMATS
					.filter(x=>document.queryCommandState(x))
					.map(x=>'format-'+x)
					.join(' ');

			} catch (e) {
				console.error(e.stack || e.message || e);
			}
		}

		return '';
	},


	onSetFormat (e) {
		e.preventDefault();
		e.stopPropagation();

		var sel = this[savedSelection];
		if (sel){
			this.restoreSelection(sel);
		}

		var style = e.target.getAttribute('data-format');
		this.applyFormat(style);

		this.wasInteractedWith();
	},


	applyFormat (style) {
		try {
			document.execCommand(style);
		} catch(e) {
			console.error('No execCommand support?');
		}
	}

};

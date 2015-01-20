import * as React from 'react/addons';

var str = s => s && JSON.stringify({start:s.start,end:s.end});

const savedRange = Symbol('savedRange');

export default React.createClass({
	displayName: 'ContentEditable',


	shouldComponentUpdate (/*nextProps, nextState*/) {
		//If there is a cursor/selection within the
		// editor, we do NOT want to update.
		return !this._owner.hasSelection();
	},


	componentWillUpdate () {
		this[savedRange] = this._owner.saveSelection();
	},

	componentDidUpdate () {
		if (this[savedRange]) {

			let a = str(this[savedRange]);

			this._owner.restoreSelection(this[savedRange]);

			let b = str(this._owner.saveSelection());
			if (a !== b) {
				console.warn(b === a, a, b);
			}

			delete this[savedRange];
		}
	},


	render () {
		return (
			<div {...this.props} contentEditable={true} content={null}
				dangerouslySetInnerHTML={{__html: this.props.content}}/>
		);
	}
});


export default {

	componentWillMount () {
		this.registerHandlers({
			//onKeyDown: this.__onKeyPress,
			onKeyUp: this.__onKeyPress,
			onKeyPress: this.__onKeyPress
		});
	},


	__onKeyPress (event) {
		this.wasInteractedWith();
		if (event.key !== 'Unidentified') {
			this.handleKeyEvent(event);
		}
	},


	handleKeyEvent () {
	}

};

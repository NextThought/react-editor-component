
const onKeyPress = 'key-handlers:OnKeyPressHandler';//Not a Symbol because Symbols cannot be enumerated.

export default {

	componentWillMount () {
		this.registerHandlers({
			//onKeyDown: this[onKeyPress],
			onKeyUp: this[onKeyPress],
			onKeyPress: this[onKeyPress]
		});
	},


	[onKeyPress] (event) {
		if (event.key !== 'Unidentified') {
			this.wasInteractedWith();
			this.handleKeyEvent(event);
		}
	},


	handleKeyEvent () {
	}

};


const onKeyPress = 'key-handlers:OnKeyPressHandler';//Not a Symbol because Symbols cannot be enumerated.

const bufferedKeyHandling = Symbol('bufferedKeyHandling');

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
			this.handleKeyEvent(event);
		}
	},


	handleKeyEvent (/*event*/) {
		clearTimeout(this[bufferedKeyHandling]);

		this[bufferedKeyHandling] = setTimeout(() => {

			this.wasInteractedWith();

		}, 500);
	}

};

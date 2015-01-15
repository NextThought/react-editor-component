
export default {

	componentWillMount () {
		this.registerHandlers({
			onPaste: this.onProcessPaste
		});
	},


	onProcessPaste () {
		this.wasInteractedWith();
	}

};

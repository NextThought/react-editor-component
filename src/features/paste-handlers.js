
export default {

	componentWillMount () {
		this.registerHandlers({
			onPaste: this.onProcessPaste
		});
	},


	onProcessPaste () {
		console.log(arguments);
	}

};

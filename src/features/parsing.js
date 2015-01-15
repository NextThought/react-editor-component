var placeholder = '\u200B';

export default {

	componentWillMount () {
		this.applyValue(this.props.value);
	},


	componentWillReceiveProps (props) {
		if (props.value !== this.state.current) {
			this.applyValue(props.value);
		}
	},


	getInitialState () {
		return {
			content: `<div><div>${placeholder}</div></div>`
		};
	},


	applyValue (value) {
		if (!value) {
			return;
		}

		this.setState({
			content: value
		});
	},


	parseValue (rawValue) {

		var value = rawValue;

		return value;
	}
};

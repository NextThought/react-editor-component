//import EventEmitter from 'events';

function getStateClassResolvers (obj) {
	var k = 'stateClassResolvers';
	return obj[k] || (obj[k] = []);
}

export default {

	getRegisteredHandlers () {
		let prop = 'editorHandlers';
		return this[prop] || (this[prop] = {});
	},

	registerHandlers (dict) {
		var handlers = this.getRegisteredHandlers();

		Object.keys(dict).forEach(x=>{
			if (x in handlers) {
				console.debug('Chaining %s handlers', x);
				let original = handlers[x],
					chained = dict[x];

				dict[x] = function(...args) {
					original(...args);
					chained(...args);
				};
			}
		});

		Object.assign(handlers, dict);
	},

	registerStateClassResolver (...resolvers) {
		getStateClassResolvers(this).push(...resolvers);
	},

	getStateClasses () {
		return getStateClassResolvers(this).map(fn=>fn());
	},


	componentDidMount () {
		this.setState({_previousValue: this.getValue()});
	},


	wasInteractedWith () {
		clearTimeout(this._interactionTimeout);
		this._interactionTimeout = setTimeout(()=>{
			if (this.isMounted()) {
				let curr = this.getValue().join('');
				let prev = this.state._previousValue;

				if (prev !== curr) {
					this.props.onChange(prev, curr);
					this.setState({_previousValue: curr});
				}
			}

		}, 500);
	},


	getEditorNode () {
		var {editor} = this.refs;
		return editor && editor.isMounted() && editor.getDOMNode();
	},


	getValue () {
		return this.parseValue(this.getEditorNode());
	}
};

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
				//console.debug('Chaining %s handlers', x);
				let original = handlers[x],
					chained = dict[x];

				dict[x] = function(...args) {// (...args) => {} produces a lint warning.
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


	componentWillMount () {
		this.registerHandlers({
			onBlur: () => {
				this.wasInteractedWith();
				if (!this.hasSelection()) {
					this.props.onBlur();
				}
			}
		});
	},


	wasInteractedWith () {
		clearTimeout(this._interactionTimeout);

		let timeout = this.hasSelection() ? 1000 : 0;

		this._interactionTimeout = setTimeout(()=>{
			if (this.isMounted()) {
				let getVal = x => (Array.isArray(x) ? x.join('') : x) || null;

				let curr = getVal(this.getValue());
				let prev = getVal(this.state._previousValue);

				if (prev !== curr || !timeout) {
					console.debug('Notifying onChange, flush: ', !timeout);
					this.props.onChange(prev, curr);
					this.setState({_previousValue: curr});
				}
			}

		}, timeout);

		this.forceUpdate();//needed to update state of format buttons
	},


	getEditorNode () {
		var {editor} = this.refs;
		return editor && editor.isMounted() && editor.getDOMNode();
	},


	getValue () {
		return this.parseValue(this.getEditorNode());
	}
};

//import EventEmitter from 'events';

function getStateClassResolvers (obj) {
	let k = 'stateClassResolvers';
	return obj[k] || (obj[k] = []);
}

const interactionTimeout = Symbol('interaction timer');

const update = 'editor:update';

export default {

	getRegisteredHandlers () {
		let prop = 'editorHandlers';
		return this[prop] || (this[prop] = {});
	},


	registerHandlers (dict) {
		let handlers = this.getRegisteredHandlers();

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
		this.registerStateClassResolver(()=>this.state.busy? 'busy' : '');
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
		clearTimeout(this[interactionTimeout]);

		let force = !this.hasSelection();

		let schedual = force ?
			fn=>fn(force)||0 :
			fn=>setTimeout(fn, 1000);

		this[interactionTimeout] = schedual(this[update]);
	},


	[update] (force) {

		if (this.isMounted()) {
			let getVal = x => (Array.isArray(x) ? x.join('') : x) || null;

			let curr = getVal(this.getValue());
			let prev = getVal(this.state.previousValue);

			if (prev !== curr || force) {
				//console.debug('Notifying onChange, flush: ', !timeout);
				this.props.onChange(prev, curr);
				this.setState({previousValue: curr});
			}

			this.setState({interaction: new Date()});
		}
	},


	getEditorNode () {
		let {editor} = this.refs;
		return editor && editor.isMounted() && editor.getDOMNode();
	},


	getValue () {
		return this.parseValue(this.getEditorNode());
	},


	markBusy () {
		if (this.state.busy) {
			throw new Error('Already Busy');
		}
		this.setState({busy: true});
	},

	clearBusy () {
		this.setState({busy: false});
	}
};

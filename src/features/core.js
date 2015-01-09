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


	wasInteractedWith () {
		clearTimeout(this._interactionTimeout);
		this._interactionTimeout = setTimeout(()=>this.forceUpdate(), 100);
	}
};

import React from 'react';

const FORMATS = [
	'bold',
	'italic',
	'underline'
];

import {SAVED_SELECTION} from './constants';


export default {

	childContextTypes: {
		setFormat: React.PropTypes.func
	},


	getChildContext () {
		return {
			setFormat: this.onSetFormat
		};
	},


	componentWillMount () {
		this.registerStateClassResolver(
			this.getActiveFormats
		);

		let touch = (
			'ontouchstart' in global || // everyone else
			'onmsgesturechange' in global //IE10
		);

		let touchEvent = touch ? 'onTouchStart' : 'onMouseDown';

		this.registerHandlers({
			[touchEvent]: ()=> {
				//save cursor on blur
				let s = this.saveSelection();
				if (s) {
					this[SAVED_SELECTION] = s;
				}
			}
		});
	},


	getActiveFormats () {
		if (this.hasSelection()) {
			try {
				return FORMATS
					.filter(x=>document.queryCommandState(x))
					.map(x => 'format-' + x)
					.join(' ');

			} catch (e) {
				console.error(e.stack || e.message || e);
			}
		}

		return '';
	},


	onSetFormat (e) {
		e.preventDefault();
		e.stopPropagation();

		let sel = this[SAVED_SELECTION];
		if (sel) {
			this.restoreSelection(sel);
		}

		let style = e.target.getAttribute('data-format');
		this.applyFormat(style);

		this.wasInteractedWith();
	},


	applyFormat (style) {
		try {
			document.execCommand(style);
		} catch(e) {
			console.error('No execCommand support?');
		}
	}

};

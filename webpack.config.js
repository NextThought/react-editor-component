/*eslint no-var: 0*/
var path = require('path');
exports = module.exports = {
	entry: './src/index.js',
	output: {
		path: 'lib/',
		filename: 'index.js',
		library: true,
		libraryTarget: 'commonjs2'
	},

	cache: true,
	debug: true,
	devtool: 'source-map',


	target: 'web',
	stats: {
		colors: true,
		reasons: true
	},

	resolve: {
		root: path.resolve(__dirname, 'src'),
		extensions: ['', '.jsx', '.js']
	},


	externals: [
		// Every non-relative module is external
		// abc -> require("abc")
		/^[a-z\-0-9]+/i
	],

	module: {
		loaders: [
			{ test: /\.js(x?)$/, exclude: /node_modules/, loader: 'babel' },
			{ test: /\.json$/, loader: 'json' }
		]
	}
};

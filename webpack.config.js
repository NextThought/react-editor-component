/*eslint no-var: 0*/
var path = require('path');
exports = module.exports = {
	entry: '<%= pkg.main %>',
	output: {
		path: '<%= pkg.dist %>',
		filename: 'index.js'
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


	module: {
		loaders: [
			{ test: /\.js(x?)$/, exclude: /node_modules/, loader: 'babel' },
			{ test: /\.json$/, loader: 'json' }
		]
	}
};

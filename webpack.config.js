exports = module.exports = {
	entry: '<%= pkg.main %>',
	output: {
		path: '<%= pkg.dist %>',
		filename: 'index.js'
	},

	cache: true,
	debug: true,
	devtool: 'inline-source-map',


	target: 'web',
	stats: {
		colors: true,
		reasons: true
	},

	resolve: {
		root: __dirname + '/src',
		extensions: ['', '.jsx', '.js']
	},


	module: {
		loaders: [
			{ test: /\.js(x?)$/, exclude: /node_modules/, loader: 'babel' },
			{ test: /\.json$/, loader: 'json' }
		]
	}
};

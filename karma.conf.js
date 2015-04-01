/*eslint no-var: 0*/
var path = require('path');
var stat = {
	version: false,
	hash: false,
	timings: false,
	assets: false,
	chunks: false,
	chunkModules: false,
	chunkOrigins: false,
	modules: false,
	cached: false,
	cachedAssets: false,
	showChildren: false,
	source: false,

	colors: true,
	reasons: true,
	errorDetails: true
};

module.exports = function (config) {
	config.set({
		basePath: '',
		frameworks: ['jasmine'],

		files: [
			'tests/helpers/**/*.js',
			'tests/specs/**/*.js'
		],

		preprocessors: {
			'tests/**/*.js': ['webpack', 'sourcemap']
		},

		exclude: [],

		port: 8090,
		logLevel: config.LOG_INFO,
		colors: true,
		autoWatch: false,
		// Start these browsers, currently available:
		// - Chrome
		// - ChromeCanary
		// - Firefox
		// - Opera
		// - Safari (only Mac)
		// - PhantomJS
		// - IE (only Windows)
		browsers: ['PhantomJS'],


		//coverageReporter: { type: 'html', dir: 'reports/coverage/' },

		htmlReporter: {
			//templatePath: __dirname+'/jasmine_template.html',
			outputDir: 'reports/test-results'
		},

		junitReporter: {
			outputFile: 'reports/test-results.xml',
			suite: ''
		},


		// other possible values: 'dots', 'progress', 'junit', 'html', 'coverage'
		reporters: ['mocha'],
		captureTimeout: 60000,
		singleRun: true,


		webpackServer: {
			stats: stat,
			quiet: true
		},

		webpack: {
			quiet: true,
			cache: true,
			debug: true,
			devtool: 'inline-source-map',

			stats: stat,

			resolve: {
				root: path.resolve(__dirname, 'src'),
				extensions: ['', '.js', '.jsx']
			},

			module: {
				loaders: [
					{ test: /\.js(x?)$/, /*exclude: /node_modules/,*/ loader: 'babel' },
					{ test: /\.json$/, loader: 'json' }
				]
			}
		}
	});
};

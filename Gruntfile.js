'use strict';
/*eslint no-var: 0*/
var path = require('path');
var wpcfg = require('./webpack.config');

module.exports = function(grunt) {
	var pkgConfig = grunt.file.readJSON('package.json');

	// Let *load-grunt-tasks* require everything
	require('load-grunt-tasks')(grunt);
	grunt.initConfig({
		pkg: pkgConfig,

		karma: {
			unit: {
				configFile: 'karma.conf.js'
			}
		},


		eslint: {
			target: [
				'src/**/*.js',
				'src/**/*.jsx',
				'tests/**/*.js',
				'*.js'
			]
		},

		webpack: wpcfg,

		'webpack-dev-server': {
			options: {
				webpack: wpcfg,
				publicPath: '/'
			},
			start: {
				watch: true,
				keepAlive: true,
				port: 8000,
				contentBase: path.resolve(__dirname, 'tests/app/'),
				webpack: {
					debug: true,
					publicPath: '/',
					entry: path.join(__dirname, 'tests/app/index.js'),
					output: {
						path: '/tests/app/',
						filename: 'index.js'
					}
				}
			}
		}
	});

	//grunt.registerTask('docs',['jsdoc']);
	grunt.registerTask('lint', ['eslint']);
	grunt.registerTask('test', ['karma']);
	grunt.registerTask('build', ['eslint', 'webpack']);
	grunt.registerTask('default', ['eslint', 'webpack-dev-server:start']);
};

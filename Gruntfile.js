'use strict';

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


		jshint: {
	        options: {
				jshintrc: true,
	            reporter: require('jshint-log-reporter')
			},
	        files: [
				'lib/**/*.js',
				'index.js',
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
				contentBase: __dirname + '/tests/app/',
				webpack: {
					debug: true,
					publicPath: '/',
					entry: __dirname + '/tests/app/index.js',
					output: {
						path: '/tests/app/',
						filename: "index.js",
					},
				}
			}
		}
	});

	//grunt.registerTask('docs',['jsdoc']);
	grunt.registerTask('test', ['karma']);
	grunt.registerTask('build', ['jshint', 'webpack']);
	grunt.registerTask('default', ['jshint', 'webpack-dev-server:start']);
};

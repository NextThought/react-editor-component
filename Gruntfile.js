'use strict';

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

		webpack: require('./webpack.config'),

		'webpack-dev-server': {
			options: {
				webpack: require('./webpack.config'),
				publicPath: '/'
			},
			start: {
				keepAlive: true,
				webpack: {
					debug: true
				}
			}
		}
	});

	//grunt.registerTask('docs',['jsdoc']);
	grunt.registerTask('test', ['karma']);
	grunt.registerTask('build', ['jshint', 'webpack']);
	grunt.registerTask('default', ['jshint', 'webpack-dev-server:start']);
};

module.exports = function (grunt) {
    'use strict';
    grunt.initConfig({
        bower: {
            install: {
                options: {
                    targetDir: 'node_modules/appsngen-dev-box/views/js/dependencies',
                    layout: 'byComponent',
                    install: true,
                    verbose: false,
                    cleanTargetDir: false,
                    cleanBowerDir: true,
                    bowerOptions: {}
                }
            }
        }
    });
    grunt.loadNpmTasks('grunt-bower-task');
};

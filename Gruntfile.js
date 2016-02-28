'use strict';

module.exports = function (grunt) {
  require('time-grunt')(grunt);
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    sass: {
      options: {
        sourceMap: true
      },
      dist: {
        files: {
          'public/css/styles.css': 'public/scss/styles.scss'
        }
      }
    },

    concat: {
      dist: {
        src: ['public/js/events.js', 'public/js/form.js'],
        dest: 'public/js/production.js'
      }
    },

    uglify: {
      build: {
        src: 'public/js/production.js',
        dest: 'public/js/production.min.js'
      }
    },

    jshint: {
      files: ['public/js/events.js', 'public/js/form.js']
    },

    connect: {
      server: {
        options: {
          hostname: '127.0.0.1',
          port: 9000,
          base: '.',
          livereload: true
        }
      }
    },

    open: {
      dist: {
        path: 'http://localhost:3000'
      }
    },

    watch: {
      css: {
        files: 'public/scss/**/*.scss',
        tasks: ['sass']
      },
      js: {
        files: ['public/js/events.js', 'public/js/form.js'],
        tasks: ['jshint', 'concat', 'uglify']
      },
      html: {
        files: '**/*.ejs'
      },
      options: {
        livereload: true
      }
    }
  });

  grunt.registerTask('default', ['sass', 'jshint', 'concat', 'uglify']);
  grunt.registerTask('serve', ['connect', 'open', 'watch']);
};

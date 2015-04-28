'use strict';

// Because you can't specify a directory as target for grunt-browserify
// we have to generate the file configuration at runtime
var fs = require('fs');
var browserifyFileConfig = {};
fs.readdirSync('src').forEach(function(fileName) {
  if(/\.js$/.test(fileName)) {
    browserifyFileConfig['./dist/' + fileName] = './src/' + fileName;
  }
});

module.exports = function(grunt) {

  grunt.initConfig({

    watch: {
      browserify: {
        files: ['src/*.js'],
        tasks: [] // necessary so watch keeps running
      }
    },

    browserify: {
      dist: {
        files: browserifyFileConfig,
        options: {
          transform: ['babelify'],
          watch: true // This does the real watching and can just recompile one single file at the time
        }
      }
    },
    clean: ['dist/*']
  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-browserify');

  grunt.registerTask('build', [
    'clean',
    'browserify'
  ]);

  grunt.registerTask('watch-src', [
    'build',
    'watch'
  ]);

};
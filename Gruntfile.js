module.exports = function(grunt) {

  // Configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    // ES5 Compatibility
    babel: {
      options: {
        comments: false,
        optional: ['runtime']
      },
      dist: {
        files: {
          'dist/webpurify.js': 'src/webpurify.js'
        }
      }
    },

    // Tests
    mochaTest: {
      test: {
        options: {
          reporter: 'spec',
        },
        src: ['test/**/*.js']
      }
    }
  });

  // Load plugins
  grunt.loadNpmTasks('grunt-babel');
  grunt.loadNpmTasks('grunt-mocha-test');

  // Tassks
  grunt.registerTask('default', ['babel']);
  grunt.registerTask('test', ['mochaTest']);

};

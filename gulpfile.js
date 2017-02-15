var gulp = require('gulp');
var karma = require('karma').server;
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var path = require('path');
var plumber = require('gulp-plumber');
var runSequence = require('run-sequence');
var jshint = require('gulp-jshint');
var coffee = require('gulp-coffee');
var es = require('event-stream');
var templateCache = require('gulp-angular-templatecache');

/**
 * File patterns
 **/

// Root directory
var rootDirectory = path.resolve('./');

// Source directory for build process
var sourceDirectory = path.join(rootDirectory, './src');

// // tests
// var testDirectory = path.join(rootDirectory, './test/unit');

var sourceCoffee = [
  // Make sure module files are handled first
  path.join(sourceDirectory, '/**/*.module.coffee'),
  // Then add all Coffee files
  path.join(sourceDirectory, '/**/*.coffee')
];

var sourceLess = [
  path.join(sourceDirectory, '/stylesheets/variables.less'),
  path.join(sourceDirectory, '/stylesheets/mixins.less'),
  path.join(sourceDirectory, '/stylesheets/globals.less'),
  path.join(sourceDirectory, '/components/**/*.less')
]

var sourceHtml = [
  path.join(sourceDirectory, '**/*.html')
]

// Builds Angular $templateCache, compile coffee, build js dist
gulp.task('build', ['styles'], function() {
  var templateCacheStream = gulp.src([
      path.join(sourceDirectory, '/components/**/*.html')
    ])
    .pipe(templateCache('temp.js', {
      module: 'transac.templates',
      transformUrl: function (url) {
        path_without_file_ext = url.split('.')[0]
        return path_without_file_ext;
      }
    }));

  return es.merge([
    templateCacheStream,
    gulp.src(sourceCoffee).pipe(coffee()),
  ])
  .pipe(plumber())
  .pipe(concat('transac.js'))
  .pipe(gulp.dest('./dist/'))
  .pipe(uglify())
  .pipe(rename('transac.min.js'))
  .pipe(gulp.dest('./dist'));
});

// Concat all less files to generate dist/impac-angular.less
gulp.task('styles', function () {
  return gulp.src(sourceLess)
    .pipe(concat('transac.less'))
    .pipe(gulp.dest('./dist'));
});

gulp.task('watch', function () {
  gulp.watch(sourceCoffee.concat(sourceLess).concat(sourceHtml), ['build']);
});

// /**
//  * Run test once and exit
//  */
// gulp.task('test-src', function (done) {
//   karma.start({
//     configFile: __dirname + '/karma-src.conf.js',
//     singleRun: true
//   }, done);
// });

// /**
//  * Run test once and exit
//  */
// gulp.task('test-dist-concatenated', function (done) {
//   karma.start({
//     configFile: __dirname + '/karma-dist-concatenated.conf.js',
//     singleRun: true
//   }, done);
// });

// /**
//  * Run test once and exit
//  */
// gulp.task('test-dist-minified', function (done) {
//   karma.start({
//     configFile: __dirname + '/karma-dist-minified.conf.js',
//     singleRun: true
//   }, done);
// });

gulp.task('default', function () {
  runSequence('build', 'watch');
});

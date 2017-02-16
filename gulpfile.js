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
var ngAnnotate = require('gulp-ng-annotate');


/**
 *    Directory patterns
 **/
// Root directory
var rootDirectory = path.resolve('./');
// Source directory for build process
var sourceDirectory = path.join(rootDirectory, './src/transac');
// // tests
// var testDirectory = path.join(rootDirectory, './test/unit');


/**
 *    Source file groups
 **/
var sourceCoffee = [
  // Make sure module files are handled first
  path.join(sourceDirectory, '/**/*.module.coffee'),
  // Then add all Coffee files
  path.join(sourceDirectory, '/**/*.coffee')
];
var sourceLess = [
  path.join(sourceDirectory, '/styles/variables.less'),
  path.join(sourceDirectory, '/styles/globals.less'),
  path.join(sourceDirectory, '/styles/mixins.less'),
  path.join(sourceDirectory, '/transac.less'),
  path.join(sourceDirectory, '/{components,common}/**/*.less'),
]
var sourceHtml = [
  path.join(sourceDirectory, '**/*.html')
]

/**
 *    Tasks
 **/
// Builds Angular $templateCache, compile coffee, build js dist
gulp.task('build', ['styles'], function() {
  var templateCacheStream = gulp.src([
      path.join(sourceDirectory, '/**/*.html')
    ])
    .pipe(templateCache('temp.js', {
      module: 'maestrano.transac',
      // Remove file extension and shorten path nesting.
      transformUrl: function (url) {
        if ((url = url.split('/')).length > 1) {
          url.pop()
          return url.join('/');
        } else {
          return url[0].split('.')[0]
        }
      }
    }));

  return es.merge([
    templateCacheStream,
    gulp.src(sourceCoffee).pipe(coffee()),
  ])
  .pipe(plumber())
  .pipe(concat('transac.js'))
  .pipe(ngAnnotate())
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

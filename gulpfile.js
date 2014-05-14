var gulp = require('gulp');

var coffee = require('gulp-coffee')
var concat = require('gulp-concat')
var uglify = require('gulp-uglify')
var rename = require('gulp-rename')

var paths = {
  scripts: ['src/*.coffee']
};

gulp.task('build', function() {
	// Minify and copy all JavaScript (except vendor scripts)
	return gulp.src(paths.scripts)
		.pipe(concat('lrs.coffee'))
		.pipe(coffee())
		.pipe(gulp.dest('lib'))
		.pipe(uglify())
		.pipe(rename({suffix: '.min'}))
		.pipe(gulp.dest('lib'))
});

gulp.task('watch', function() {
	gulp.watch(paths.scripts, ['build'])
});

gulp.task('default', ['build']);

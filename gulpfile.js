var gulp = require('gulp');

var concat = require('gulp-concat')
var uglify = require('gulp-uglify')
var rename = require('gulp-rename')
var iife = require('gulp-iife')
var babel = require('gulp-babel')

var paths = {
	js: ['src/*.js']
}

gulp.task('js', function() {
	// Minify and copy all JavaScript (except vendor scripts)
	return gulp.src(paths.js)
		.pipe(iife())
		.pipe(concat('lrs.js'))
		.pipe(babel({
			presets: ['es2015']
		}))
		
		.pipe(gulp.dest(''))
		.pipe(uglify())
		.pipe(rename({suffix: '.min'}))
		.pipe(gulp.dest(''))
})

gulp.task('watch', function() {
	gulp.watch(paths.scripts, ['js'])
})

gulp.task('default', ['js']);

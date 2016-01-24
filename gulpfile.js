var gulp = require('gulp');

var coffee = require('gulp-coffee')
var concat = require('gulp-concat')
var uglify = require('gulp-uglify')
var rename = require('gulp-rename')
var iife = require('gulp-iife')
var babel = require('gulp-babel')

var paths = {
	coffee: ['src/*.coffee'],
	js: ['src/*.js']
}

gulp.task('js', function() {
	// Minify and copy all JavaScript (except vendor scripts)
	return gulp.src(paths.js)
		.pipe(iife())
		.pipe(concat('lrs-es6.js'))
		.pipe(babel({
			presets: ['es2015']
		}))
		
		.pipe(gulp.dest(''))
		.pipe(uglify())
		.pipe(rename({suffix: '.min'}))
		.pipe(gulp.dest(''))
})

gulp.task('coffee', function() {
	// Minify and copy all JavaScript (except vendor scripts)
	return gulp.src(paths.coffee)
		.pipe(concat('lrs.coffee'))
		.pipe(coffee())
		.pipe(gulp.dest(''))
		.pipe(uglify())
		.pipe(rename({suffix: '.min'}))
		.pipe(gulp.dest(''))
})

gulp.task('watch', function() {
	gulp.watch(paths.scripts, ['cofee'])
})

gulp.task('default', ['coffee']);

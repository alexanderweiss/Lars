'use strict';

var gulp = require('gulp');

var concat = require('gulp-concat')
var uglify = require('gulp-uglify')
var rename = require('gulp-rename')
var iife = require('gulp-iife')
var babel = require('gulp-babel')
var order = require('gulp-order')

var paths = {
	js: ['src/*.js']
}

function scripts() {
	// Minify and copy all JavaScript (except vendor scripts)
	return gulp.src(paths.js)
		.pipe(order([
			'**/mixins.js',
			'**/*.js'
		]))
		.pipe(concat('lrs.js'))
		.pipe(iife())
		.pipe(babel({
			presets: ['es2015']
		}))
		.pipe(gulp.dest('./'))
		.pipe(uglify())
		.pipe(rename({suffix: '.min'}))
		.pipe(gulp.dest('./'))
}

function watch() {
	gulp.watch(paths.js, scripts)
}

exports.watch = watch
exports.scripts = scripts
exports.default = scripts

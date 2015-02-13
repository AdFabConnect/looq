var gulp = require('gulp'),
		path = require('path'),
		concat = require('gulp-concat'),
		less = require('gulp-less');

// CONCAT
gulp.task('scripts', function() {
	gulp.src(['./js/utils/*.js', './node_modules/socket.io/node_modules/socket.io-client/socket.io.js', './js/background/*.js'])
		.pipe(concat('background.all.js'))
		.pipe(gulp.dest('./dist/js/'));

	gulp.src(['./js/utils/*.js', './js/front/modules/*.js', './js/front/*.js'])
		.pipe(concat('front.all.js'))
		.pipe(gulp.dest('./dist/js/'));

	gulp.src(['./js/utils/*.js', './js/options/*.js'])
		.pipe(concat('options.all.js'))
		.pipe(gulp.dest('./dist/js/'));
});

// LESS
gulp.task('less', function () {
  gulp.src('./css/less/style.less')
    .pipe(less())
    .pipe(gulp.dest('./dist/css'));

  gulp.src('./css/less/style.less')
    .pipe(less())
    .pipe(gulp.dest('./dist/css'));

  gulp.src('./css/less/style.less')
    .pipe(less())
    .pipe(gulp.dest('./dist/css'));
});

gulp.task('watch', function() {
    gulp.watch('./css/less/*.less', ['less']);
    gulp.watch('./js/**/*.js', ['scripts']);
});

gulp.task('default', ['scripts', 'less', 'watch']);
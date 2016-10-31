// generated on 2016-10-24 using generator-webapp 2.2.0
const gulp = require('gulp');
const imagemin = require('gulp-imagemin');
//确保本地已安装imagemin-pngquant [cnpm install imagemin-pngquant --save-dev]
const pngquant = require('imagemin-pngquant');
const gulpLoadPlugins = require('gulp-load-plugins');
const browserSync = require('browser-sync');
const minifyCSS = require('gulp-minify-css');
var autoprefixer = require('gulp-autoprefixer');
var sass = require('gulp-sass');
const del = require('del');
const wiredep = require('wiredep').stream;
const runSequence = require('run-sequence');

const $ = gulpLoadPlugins();
const reload = browserSync.reload;

gulp.task('styles', () => {
	return gulp.src('app/*.scss')
		.pipe(sass())
		.pipe(gulp.dest('dist/css'))
});

gulp.task('css', () => {
	return gulp.src('app/css/*.css')
		.pipe($.autoprefixer({browsers: ['last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4']}))
		.pipe(minifyCSS())
		.pipe(gulp.dest('dist/css'))
});
 
gulp.task('scripts', () => {
	return gulp.src('app/scripts/**/*.js')
		.pipe($.plumber())
		.pipe($.sourcemaps.init())
		.pipe($.babel())
		.pipe($.sourcemaps.write('.'))
		.pipe(gulp.dest('dist/scripts'))
		.pipe(reload({stream: true}));
});

gulp.task('scripts1', () => {
	return gulp.src('app/scripts/**/*.js')
		.pipe(gulp.dest('dist/scripts'))
});

function lint(files, options) {
	return gulp.src(files)
		.pipe(reload({stream: true, once: true}))
		.pipe($.eslint(options))
		.pipe($.eslint.format())
		.pipe($.if(!browserSync.active, $.eslint.failAfterError()));
}

gulp.task('lint', () => {
	return lint('app/scripts/**/*.js', {
		fix: true
	})
		.pipe(gulp.dest('app/scripts'));
});
gulp.task('lint:test', () => {
	return lint('test/spec/**/*.js', {
		fix: true,
		env: {
			mocha: true
		}
	})
		.pipe(gulp.dest('test/spec'));
});

gulp.task('html', ['css', 'scripts1'], () => {
	return gulp.src('app/**/*.html')
		.pipe($.useref({searchPath: ['.tmp', 'app', '.']}))
		.pipe($.if('*.js', $.uglify()))
		.pipe($.if('*.css', $.cssnano({safe: true, autoprefixer: true})))
		.pipe($.if('*.html', $.htmlmin({collapseWhitespace: true})))
		.pipe(gulp.dest('dist'));
});

gulp.task('helphtml', ['styles', 'scripts'], () => {
	return gulp.src('app/help/*.html')
		.pipe($.useref({searchPath: ['.tmp', 'app', '.']}))
		.pipe($.if('*.js', $.uglify()))
		.pipe($.if('*.css', $.cssnano({safe: true, autoprefixer: true})))
		.pipe($.if('*.html', $.htmlmin({collapseWhitespace: true})))
		.pipe(gulp.dest('dist/help'));
});

gulp.task('images', () => {
		return gulp.src('app/images/*.{png,jpg,gif,ico}')
				.pipe(imagemin())
				.pipe(gulp.dest('dist/images'));
});

gulp.task('fonts', () => {
	return gulp.src(require('main-bower-files')('**/*.{eot,svg,ttf,woff,woff2}', function (err) {})
		.concat('app/fonts/**/*'))
		.pipe(gulp.dest('.tmp/fonts'))
		.pipe(gulp.dest('dist/fonts'));
});

gulp.task('extras', () => {
	return gulp.src([
		'app/*',
		'!app/*.html'
	], {
		dot: true
	}).pipe(gulp.dest('dist'));
});

gulp.task('ico', () => {
	return gulp.src('app/*.ico').pipe(gulp.dest('dist'));
});

gulp.task('clean', del.bind(null, ['.tmp', 'dist']));

gulp.task('serve', () => {
	runSequence(['clean', 'wiredep'], ['styles', 'scripts', 'fonts'], () => {
		browserSync({
			notify: false,
			port: 9000,
			server: {
				baseDir: ['.tmp', 'app'],
				routes: {
					'/bower_components': 'bower_components'
				}
			}
		});

		gulp.watch([
			'app/*.html',
				'app/images/**/*',
			'.tmp/fonts/**/*'
		]).on('change', reload); 

		gulp.watch('app/css/**/*.scss', ['styles']);
			gulp.watch('app/scripts/**/*.js', ['scripts']);
			gulp.watch('app/fonts/**/*', ['fonts']);
		gulp.watch('bower.json', ['wiredep', 'fonts']);
	});
});

gulp.task('serve:dist', () => {
	browserSync({
		notify: false,
		port: 9000,
		server: {
			baseDir: ['dist']
		}
	});
});

gulp.task('serve:test', ['scripts'], () => {
	browserSync({
		notify: false,
		port: 9000,
		ui: false,
		server: {
			baseDir: 'test',
			routes: {
				'/scripts': '.tmp/scripts',
				'/bower_components': 'bower_components'
			}
		}
	});

	gulp.watch('app/scripts/**/*.js', ['scripts']);
	gulp.watch(['test/spec/**/*.js', 'test/index.html']).on('change', reload);
	gulp.watch('test/spec/**/*.js', ['lint:test']);
});

// inject bower components
gulp.task('wiredep', () => {
	gulp.src('app/css/*.scss')
		.pipe(wiredep({
			ignorePath: /^(\.\.\/)+/
		}))
		.pipe(gulp.dest('app/css'));

	gulp.src('app/*.html')
		.pipe(wiredep({
			exclude: ['bootstrap-sass'],
			ignorePath: /^(\.\.\/)*\.\./
		}))
		.pipe(gulp.dest('app'));
});

gulp.task('build', ['lint', 'html', 'images', 'fonts', 'extras'], () => {
	return gulp.src('dist/**/*').pipe($.size({title: 'build', gzip: true}));
});

gulp.task('default', () => {
	runSequence(['clean', 'wiredep'], 'build');
});
gulp.task('dist', ['html', 'images', 'ico','extras'], () => {
	return gulp.src('dist/**/*').pipe(gulp.dest('dist'));
});

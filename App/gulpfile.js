/*
 * gulping TeleMD
 * Authour: mikecj184
 */

/* eslint-env node */
var gulp = require('gulp');
var version = require('gulp-version-number');
var bump = require('gulp-bump');
var args = require('yargs').argv;
var fs = require('fs');
var del = require('del');
var log = require('fancy-log');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var eslint = require('gulp-eslint');
var uglify = require('gulp-uglify');
var jsoncombine = require('gulp-jsoncombine');
var browserify = require('browserify');
var babel = require('babelify');
var vinylsource = require('vinyl-source-stream');
var vinylbuffer = require('vinyl-buffer');
var browserSync = require('browser-sync').create();
var rename = require('gulp-rename');

const shell = require('gulp-shell');
var pack = JSON.parse(fs.readFileSync('./package.json'));
var versionConfig = {
	'value': pack.version,
	'replaces' : ['#{VERSION_REPlACE}#'],
	'append': {
		'key': 'v',
		'to': ['css', 'js'],
	},
};

//This task will clean all files from 'dist'
gulp.task('clean', function(done)
{
	del.sync('./dist/**/*');
	done();
});

//This task will convert sass style features to css
gulp.task('styles', function() {
	// Our scss source folder: .scss files
	var scss = {
		in: './src/sass/main.scss',
		outdir: './dist/css/',
		sassOpts: {
			outputStyle: 'nested',
			precison: 3,
			errLogToConsole: true,
			includePaths: ['./node_modules/']
		}
	};

	return gulp.src(scss.in)
		.pipe(sass(scss.sassOpts).on('error', sass.logError))
		.pipe(gulp.dest(scss.outdir));
});


//This task will convert sass style features to css
gulp.task('rmp-styles', function() {
	// Our scss source folder: .scss files
	var scss = {
		in: './src/sass/rmp.scss',
		outdir: './dist/css/',
		sassOpts: {
			outputStyle: 'nested',
			precison: 3,
			errLogToConsole: true,
			includePaths: ['./node_modules/']
		}
	};

	return gulp.src(scss.in)
		.pipe(sass(scss.sassOpts).on('error', sass.logError))
		.pipe(gulp.dest(scss.outdir));
});

//This task will convert sass style features to css
gulp.task('admin-styles', function() {
	// Our scss source folder: .scss files
	var scss = {
		in: './src/sass/admin.scss',
		outdir: './dist/css/',
		sassOpts: {
			outputStyle: 'nested',
			precison: 3,
			errLogToConsole: true,
			includePaths: ['./node_modules/']
		}
	};

	return gulp.src(scss.in)
		.pipe(sass(scss.sassOpts).on('error', sass.logError))
		.pipe(gulp.dest(scss.outdir));
});



//This task will check for common errors in js files
gulp.task('lint', function() {
	return gulp.src('./src/js/**/*.js')
		.pipe(eslint({ fix: true }))
		.pipe(eslint.format())
		.pipe(eslint.failAfterError());
});

// This task will bundle all other js files and babelify them - Uses ES6 features
gulp.task('js-scripts', function() {

	var browserifyjs = {
		in: './src/js/main.js',
		outdir: './dist/js',
		out: 'bundle.js',
		jsOpts: {
			debug: false
		}
	};

	return browserify(browserifyjs.jsOpts)
		.transform(babel, { presets: ['@babel/preset-env'] })
		.require(browserifyjs.in, { entry: true })
		.bundle()
		.on('error', function(err){	console.log(err.stack); })
		.pipe(vinylsource(browserifyjs.out))
		.pipe(gulp.dest(browserifyjs.outdir));
});


// This task will bundle all other js files and babelify them - Uses ES6 features
gulp.task('rmp-js-scripts', function() {

	var browserifyjs = {
		in: './src/js/rmp.js',
		outdir: './dist/js',
		out: 'rmpbundle.js',
		jsOpts: {
			debug: false
		}
	};

	return browserify(browserifyjs.jsOpts)
		.transform(babel, { presets: ['@babel/preset-env'] })
		.require(browserifyjs.in, { entry: true })
		.bundle()
		.on('error', function(err){	console.log(err.stack); })
		.pipe(vinylsource(browserifyjs.out))
		.pipe(gulp.dest(browserifyjs.outdir));
});

// This task will bundle all other js files and babelify them - Uses ES6 features
gulp.task('admin-js-scripts', function() {

	var browserifyjs = {
		in: './src/js/admin.js',
		outdir: './dist/js',
		out: 'adminbundle.js',
		jsOpts: {
			debug: false
		}
	};

	return browserify(browserifyjs.jsOpts)
		.transform(babel, { presets: ['@babel/preset-env'] })
		.require(browserifyjs.in, { entry: true })
		.bundle()
		.on('error', function(err){	console.log(err.stack); })
		.pipe(vinylsource(browserifyjs.out))
		.pipe(gulp.dest(browserifyjs.outdir));
});


//This task will copy index.html into 'dist'
gulp.task('index', function()
{
	return gulp.src(['./src/index.html'])
		.pipe(version(versionConfig))
		.pipe(gulp.dest('./dist'));
});

//This task will copy index.html into 'dist'
gulp.task('rmp-index', function()
{
	return gulp.src(['./src/rmp.html'])
		.pipe(version(versionConfig))
		.pipe(gulp.dest('./dist'));
});

//This task will copy index.html into 'dist'
gulp.task('admin-index', function()
{
	return gulp.src(['./src/admin.html'])
		.pipe(version(versionConfig))
		.pipe(gulp.dest('./dist'));
});

//This task will copy manifest.json into 'dist'
gulp.task('pwa-mani', function()
{
	return gulp.src(['./src/manifest.json', './src/sw.js'])
		.pipe(version(versionConfig))
		.pipe(gulp.dest('./dist'));
});

//This task will copy assets into 'dist'
gulp.task('assets', function()
{
	return gulp.src(['./src/assets/**/*'])
		.pipe(gulp.dest('./dist/'));
});

//This task will copy assets into 'dist'
gulp.task('image-assets', function()
{
	return gulp.src(['./src/assets/images/**/*'])
		.pipe(gulp.dest('./dist/images/'));
});


//This task will copy third_party libraries into 'dist'
gulp.task('lib', function()
{
	gulp.src(['./node_modules/please-wait/build/**/*'])
		.pipe(gulp.dest('./dist/third_party/'));

	gulp.src(['./node_modules/spinkit/css/**/*'])
		.pipe(gulp.dest('./dist/third_party/'));

	gulp.src(['./node_modules/notyf/*.css'])
		.pipe(gulp.dest('./dist/third_party/'));


	gulp.src(['./node_modules/intense-images/*.js'])
		.pipe(gulp.dest('./dist/third_party/'));

	return gulp.src(['./src/third_party/**/*'])
		.pipe(uglify())
		.pipe(rename(function(path){path.basename += '.min';}))
		.pipe(gulp.dest('./dist/third_party/'));
});

//This task will bump up the version in package.json and update local version value.
// Ref: https://stackoverflow.com/questions/36339694/how-to-increment-version-number-via-gulp-task
/// <summary>
/// It bumps revisions
/// Usage:
/// 1. gulp bump : bumps the package.json and bower.json to the next minor revision.
///   i.e. from 0.1.1 to 0.1.2
/// 2. gulp bump --version 1.1.1 : bumps/sets the package.json and bower.json to the
///    specified revision.
/// 3. gulp bump --type major       : bumps 1.0.0
///    gulp bump --type minor       : bumps 0.1.0
///    gulp bump --type patch       : bumps 0.0.2
///    gulp bump --type prerelease  : bumps 0.0.1-2
/// </summary>
gulp.task('bump', function () {
	var type = args.type;
	var ver = args.version;
	var options = {};
	if (ver) {
		options.version = ver;
	} else {
		options.type = type;
	}

	return gulp.src(['./package.json'])
		.pipe(bump(options))
		.pipe(gulp.dest('./'));
});

gulp.task('bump:minor', function () {
	var type = args.type;
	var ver = args.version;
	var options = {};
	if (ver) {
		options.version = ver;
	} else {
		options.type = type;
	}


	options.type = 'minor';
	return gulp.src(['./package.json'])
		.pipe(bump(options))
		.pipe(gulp.dest('./'));
});

gulp.task('bump:major', function () {
	var type = args.type;
	var ver = args.version;
	var options = {};
	if (ver) {
		options.version = ver;
	} else {
		options.type = type;
	}


	options.type = 'minor';
	return gulp.src(['./package.json'])
		.pipe(bump(options))
		.pipe(gulp.dest('./'));
});

//This task will watch for changes in src and then run reload task upon change
gulp.task('watch', function(done)
{
	//
	var saas_watcher = gulp.watch('./src/sass/**/*', gulp.series('refresh:styles'));
	saas_watcher.on('change', function(event){
		log('File ' + event.path + ' was ' + event.type + ', running styles tasks...');
	});
	//
	var js_watcher = gulp.watch('./src/js/**/*', gulp.series('refresh:js'));
	js_watcher.on('change', function(event){
		log('File ' + event.path + ' was ' + event.type + ', running js tasks...');
	});
	//
	var index_watcher = gulp.watch('./src/*.html', gulp.series('refresh:index'));
	index_watcher.on('change', function(event){
		log('File ' + event.path + ' was ' + event.type + ', running index tasks...');
	});
	//
	done();

});


//This task will start browser-sync for multiple browser screen environment
gulp.task('browser-sync', function()
{
	browserSync.init({
		server: './dist/',
		https: true
	});
});
//
// Combined tasks
gulp.task('js', gulp.series('js-scripts'));
gulp.task('rmp-js', gulp.series('rmp-js-scripts'));
gulp.task('admin-js', gulp.series('admin-js-scripts'));

//This task will run by default - clean, process and start app - Development
gulp.task('default', gulp.series('clean', 'assets', 'image-assets', 'lib', 'styles', 'rmp-styles', 'admin-styles', 'lint', 'js', 'rmp-js', 'admin-js', 'index', 'rmp-index', 'admin-index', 'pwa-mani' , 'watch', 'browser-sync'));
gulp.task('firebase:host', gulp.series('clean', 'assets', 'image-assets', 'lib', 'styles', 'rmp-styles', 'admin-styles', 'lint', 'js', 'rmp-js', 'admin-js', 'index', 'rmp-index', 'admin-index', 'pwa-mani', shell.task(['firebase deploy --only hosting:telemd-call'])));
//
//
//This task will refresh other tasks upon watch
gulp.task('refresh:all', gulp.series('styles', 'rmp-styles', 'admin-styles', 'lint', 'js', 'rmp-js', 'admin-js', 'index', 'rmp-index', 'admin-index', 'pwa-mani', function(done) { browserSync.reload(); done(); }));
gulp.task('refresh:styles', gulp.series('styles', 'rmp-styles', 'admin-styles', function(done) { browserSync.reload(); done(); }));
gulp.task('refresh:js', gulp.series('lint', 'js', 'rmp-js', 'admin-js', function(done) { browserSync.reload(); done(); }));
gulp.task('refresh:index', gulp.series('index', 'rmp-index', 'admin-index', function(done) { browserSync.reload(); done(); }));

const gulp = require( 'gulp' );
const sass = require( 'gulp-sass' );
const postcss = require( 'gulp-postcss' );
const sourcemaps = require( 'gulp-sourcemaps' );
const browser_sync = require( 'browser-sync' );
const autoprefixer = require( 'autoprefixer' );
const cssnano = require( 'cssnano' );
const rename = require( 'gulp-rename' );
const imagemin = require( 'gulp-imagemin' );
const webpack_stream = require( 'webpack-stream' );
const webpack = require( 'webpack' );

const config = {
	src_path: './src/',
	dist_path: './dist/',
	environment: 'production'
};

// Styles
const styles = () => {
	return gulp.src( config.src_path + 'scss/**/*.scss' )
	           .pipe( sourcemaps.init() )
	           .pipe( sass() )
	           .on( 'error', sass.logError )
	           .pipe( postcss( [
		           autoprefixer(),
		           cssnano( {
			           discardComments: {
				           removeAll: true
			           },
			           minifySelectors: {
				           disable: true
			           },

		           } )
	           ] ) )
	           .pipe( sourcemaps.write() )
	           .pipe( rename( {
		           suffix: '.min'
	           } ) )
	           .pipe( gulp.dest( config.dist_path + 'css' ) );
};

// Scripts
const scripts = () => {
	return gulp
		.src( config.src_path + 'js/main.js' )
		.pipe( webpack_stream( {
			mode: config.environment,
			module: {
				rules: [
					{
						test: /\.m?js$/,
						exclude: /(node_modules|bower_components)/,
						use: {
							loader: 'babel-loader',
							options: {
								presets: ['@babel/preset-env']
							}
						}
					}
				]
			},
			output: {
				filename: 'bundle.min.js'
			},
			plugins: [
				new webpack_stream.webpack.ProvidePlugin( {
					$: 'jquery',
					jquery: 'jQuery',
					'window.jQuery': 'jquery'
				} )
			],
			externals: {
				jquery: 'jQuery'
			},			
			devtool: 'source-map',
			watch: true
		}, webpack ) )
		.pipe( gulp.dest( config.dist_path + 'js' ) );
};

// Images
const images = () => {
	return gulp.src( config.dist_path + 'img/**/*' )
	           .pipe( imagemin( [
		           imagemin.gifsicle( { interlaced: true } ),
		           imagemin.jpegtran( { progressive: true } ),
		           imagemin.optipng( { optimizationLevel: 5 } ),
		           imagemin.svgo( {
			           plugins: [
				           { removeViewBox: true },
				           { cleanupIDs: false }
			           ]
		           } )
	           ] ) )
	           .pipe( gulp.dest( config.dist_path + 'img' ) );
};

// Browsersync
const reload = () => {
	browser_sync.init( {
		files: [
			'**/*.html',
			config.dist_path + 'css/**/*.css',
			{
				match: [config.dist_path + 'js/**/*.js'],
				fn: ( event, file ) => {
					browser_sync.reload();
				}
			},
			{
				match: ['**/*.php'],
				fn: ( event, file ) => {
					browser_sync.reload();
				}
			}
		],
		server: true
	} );
};

// Watch
const watch = () => {
	
	reload();
	
	// Styles
	gulp.watch( config.src_path + 'scss/**/*.scss', styles );
};

// Tasks
gulp.task( 'default', gulp.parallel( [scripts, watch] ) );

gulp.task( 'images', images );
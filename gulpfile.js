'use strict';

const pkg = require('./package.json');
console.log('-'.repeat(38) + '\n' + pkg.name + ' version:' + pkg.version + '\n' + '-'.repeat(38));

/**
 * CLIでの引数を判定
 */
const argv = process.argv.slice(2);
let param = new Object();
argv.forEach((item, i) => {
  if(i % 2 === 0 && /--/.test(item) && !/--/.test(argv[i + 1])) param[item] = argv[i + 1];
});

/**
 * 環境設定
 */
const CONFIG_PATH = {
  src: 'src/',
  dev: 'develop/',
  assets: 'src/assets/',
  release: 'release/',
  cms: 'cms/',
  php: 'php/'
};
const CONFIG = {
  outputDirectory: {
    dev: CONFIG_PATH.src,
    assets: CONFIG_PATH.assets,
    release: CONFIG_PATH.release,
    img: CONFIG_PATH.dev + 'assets/img/',
  },
  sourceDirectory: {
    sass: CONFIG_PATH.dev + '**/*.scss',
    js: CONFIG_PATH.dev + '**/*.js',
    es6: CONFIG_PATH.dev + '**/*.es6',
    img: CONFIG_PATH.src + 'assets/img/**/*'
  },
  watchDirectory: {
    html: CONFIG_PATH.src + '**/*.html',
    php: CONFIG_PATH.src + '**/*.php',
    css: CONFIG_PATH.src + '**/*.css',
    sass: CONFIG_PATH.dev + '**/*.scss',
    js: CONFIG_PATH.src + '**/*.js',
    es6: CONFIG_PATH.dev + '**/*.es6'
  },
  watchIgnoreDirectory: {
    html: [
      '!' + CONFIG_PATH.src + '**/vender/*.html',
      '!' + CONFIG_PATH.src + '_**/*.html'
    ],
    js: [
      '!' + CONFIG_PATH.src + '**/vender/*.js',
      '!' + CONFIG_PATH.src + '**/libs/*.js'
    ]
  }
};
const SASS_AUTOPREFIXER_BROWSERS = [
  'ie >= 10',
  'ios >= 8',
  'android >= 4.4',
  'last 2 versions'
];
const SASS_OUTPUT_STYLE = 'expanded'; //nested, compact, compressed, expanded.

/**
 * IMPORT MODULES
 */
const gulp = require('gulp');
const sass = require('gulp-sass');
const postcss = require('gulp-postcss');
const csscomb = require('gulp-csscomb');
const babel = require('gulp-babel');
const eslint = require('gulp-eslint');
const htmlhint = require('gulp-htmlhint');
const cache = require('gulp-cached');
const plumber = require('gulp-plumber');
const progeny = require('gulp-progeny');
const ignore = require('gulp-ignore');
const notifier = require('node-notifier');
const pixrem = require('pixrem');
const postcssOpacity = require('postcss-opacity');
const autoprefixer = require('autoprefixer');
const cssMqpacker = require('css-mqpacker');
const browserSync = require('browser-sync').create();
const runSequence = require('run-sequence');
const webpack = require('webpack');
const webpackStream = require('webpack-stream');
const aigis = require('gulp-aigis');

/**
 * Sass Task
 */
gulp.task('sass', () => {
  return gulp.src(CONFIG.sourceDirectory.sass)
    .pipe(cache('sass'))
    .pipe(progeny())
    .pipe(plumber({
      errorHandler(error) {
        notifier.notify({
          title: 'Sass コンパイル エラー',
          message: error.message
        });
      }
    }))
    .pipe(sass({outputStyle: SASS_OUTPUT_STYLE}).on('error', sass.logError))
    .pipe(csscomb())
    .pipe(postcss([
      autoprefixer({browsers: SASS_AUTOPREFIXER_BROWSERS}),
      cssMqpacker(),
      pixrem(),
      postcssOpacity()
    ]))
    .pipe(gulp.dest(CONFIG.outputDirectory.dev));
});

/**
 * HtmlLint Task
 */
gulp.task('htmllint', () => {
  return gulp.src([
    CONFIG.watchDirectory.html,
    CONFIG.watchIgnoreDirectory.html[0],
    CONFIG.watchIgnoreDirectory.html[1]
  ])
    .pipe(plumber({
      errorHandler(error) {
        notifier.notify({
          title: 'HTML LINT エラー',
          message: error.message
        });
        this.emit('end');
      }
    }))
    .pipe(htmlhint({
      'tagname-lowercase': true,
      'attr-lowercase': true,
      'attr-value-double-quotes': true,
      'attr-value-not-empty': false,
      'attr-no-duplication': true,
      'doctype-first': false,
      'tag-pair': true,
      'tag-self-close': false,
      'spec-char-escape': true,
      'id-unique': true,
      'src-not-empty': true,
      'alt-require': true,
      'head-script-disabled': false,
      'img-alt-require': true,
      'doctype-html5': true,
      'id-class-value': 'false',
      'style-disabled': false,
      'space-tab-mixed-disabled': true,
      'id-class-ad-disabled': true,
      'href-abs-or-rel': false,
      'attr-unsafe-chars': true
    }))
    .pipe(htmlhint.reporter());
});

/**
 * Js Task
 */
gulp.task('js_babel', () => {
  return gulp.src([CONFIG.sourceDirectory.es6])
    .pipe(plumber({
      errorHandler(error) {
        notifier.notify({
          title: 'BABEL コンパイル エラー',
          message: error.message
        });
      }
    }))
    .pipe(babel())
    .pipe(gulp.dest(CONFIG.outputDirectory.dev));
});

/**
 * Js Task
 */
gulp.task('js', () => {
  return gulp.src([
    CONFIG.sourceDirectory.js,
    CONFIG.watchIgnoreDirectory.js[0],
    CONFIG.watchIgnoreDirectory.js[1]
  ])
    .pipe(plumber({
      errorHandler(error) {
        notifier.notify({
          title: 'Js エラー',
          message: error.message
        });
        this.emit('end');
      }
    }))
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

/**
 * Watch Task
 */
gulp.task('watch', ['server'], () => {

  // Set Watch Tasks.
  gulp.watch(CONFIG.watchDirectory.sass, ['sass']);
  // gulp.watch(CONFIG.watchDirectory.es6, ['js_babel']);
  gulp.watch(CONFIG.sourceDirectory.js, ['webpack']);
  // gulp.watch(CONFIG.watchDirectory.html, ['htmllint']);
  // gulp.watch(CONFIG.watchDirectory.js, ['js']);

  notifier.notify({
    title: 'Start Gulp',
    message: new Date(),
    sound: 'Glass'
  });

});

/**
 * Server Task
 */
gulp.task('server', () => {

  // Set BrowserSync server.

  if(param['--proxy']){
    browserSync.init({
      proxy: param['--proxy']
    });
  }else{
    browserSync.init({
      server: {
        baseDir: CONFIG.outputDirectory.dev
      }
    });
  }

  // Browser reload.
  gulp.watch(CONFIG.watchDirectory.html, browserSync.reload);
  gulp.watch(CONFIG.watchDirectory.js, browserSync.reload);
  gulp.watch(CONFIG.watchDirectory.php, browserSync.reload);
  gulp.watch(CONFIG.watchDirectory.css, () => {
    gulp.src(CONFIG.watchDirectory.css).pipe(browserSync.stream());
  });

});

/**
 * Webpack Task
 */
const webpackConfig = require('./webpack.config');
gulp.task('webpack', () => {
  // ☆ webpackStreamの第2引数にwebpackを渡す☆
  return webpackStream(webpackConfig, webpack)
    .pipe(gulp.dest(`${CONFIG.outputDirectory.src}js/`));
});

/**
 * Img copy
 */
gulp.task('img_copy', () => {
  return gulp.src(CONFIG.sourceDirectory.img)
    .pipe(gulp.dest(CONFIG.outputDirectory.img));
});

/**
 * Deploy Task
 */
gulp.task('deploy', () => {
  notifier.notify({
    title: 'Deploy',
    message: new Date(),
    sound: 'Glass'
  });
  return gulp.src([
    CONFIG.outputDirectory.dev + '**/*',
    '!' + CONFIG.outputDirectory.dev + '_*/**',
    '!' + CONFIG.outputDirectory.dev + '_twig.module.php',
    '!' + CONFIG.outputDirectory.dev + 'vendor/**',
    '!' + CONFIG.outputDirectory.dev + '**/_*.css',
    '!' + CONFIG.outputDirectory.dev + '**/*.scss',
    '!' + CONFIG.outputDirectory.dev + '**/*.es6'
  ])
    .pipe(ignore.include({isFile: true}))
    .pipe(gulp.dest(CONFIG.outputDirectory.release));
});

/*
* task aigis
* */

gulp.task('aigis', function () {
  return gulp.src('./aigis_config.yml')
    .pipe(aigis());
});

/**
 * Default Task
 */
gulp.task('default', (callback) => {
  return runSequence(['sass'], 'webpack', 'watch', callback);
});

/**
 * Release Task
 */

gulp.task('release', (callback) => {
  return runSequence(['sass'], 'deploy', callback);
});

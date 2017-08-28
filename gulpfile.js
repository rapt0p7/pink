'use strict';

const gulp = require('gulp');
const $ = require('gulp-load-plugins')();
const merge = require('merge-stream');
const buffer = require('vinyl-buffer');
const imageminPngquant = require('imagemin-pngquant');
const browserSync = require('browser-sync').create();

const reload = browserSync.reload;
const group = require('less-plugin-group-css-media-queries');
const HubRegistry = require('gulp-hub');

const hub = new HubRegistry(['tasks/*.js']);
gulp.registry(hub);

const isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';

const path = require('./projectConfig.json').path;

const onError = (err) => {
  $.notify.onError({
    title: `Error in ${err.plugin}`,
    message: err.message
  })(err);
  this.emit('end');
};

// ЗАДАЧА: билд html
gulp.task('html:build', () => {
  return gulp
    .src(path.src.html)
    .pipe($.plumber({ errorHandler: onError }))
    .pipe(
      $.fileInclude({
        prefix: '@@',
        basepath: '@file',
        indent: true
      })
    )
    .pipe($.replace(/\n\s*<!--DEV[\s\S]+?-->/gm, ''))
    .pipe(
      $.size({
        showFiles: true,
        showTotal: false,
        title: 'HTML'
      })
    )
    .pipe(gulp.dest(path.build.common))
    .pipe(reload({ stream: true }));
});

// ЗАДАЧА: билд js
gulp.task('js:build', () => {
  return gulp
    .src(path.src.js)
    .pipe($.plumber({ errorHandler: onError }))
    .pipe($.concat('script.min.js'))
    .pipe($.sourcemaps.init())
    .pipe($.uglify())
    .pipe($.sourcemaps.write())
    .pipe(
      $.size({
        showFiles: true,
        showTotal: false,
        title: 'Total JavaScript'
      })
    )
    .pipe(gulp.dest(path.build.js))
    .pipe(reload({ stream: true }));
});

// ЗАДАЧА: билд less
gulp.task('less', () => {
  return gulp
    .src(path.src.css)
    .pipe($.plumber({ errorHandler: onError }))
    .pipe($.sourcemaps.init())
    .pipe(
      $.less({
        plugins: [group]
      })
    )
    .on('error', $.lessReporter)
    .pipe(
      $.autoprefixer({
        browsers: ['last 2 versions']
      })
    )
    .pipe($.csscomb())
    .pipe(
      $.size({
        showFiles: true,
        showTotal: false,
        title: 'Common CSS'
      })
    )
    .pipe(gulp.dest(path.build.css))
    .pipe($.rename('style.min.css'))
    .pipe($.csso())
    .pipe($.sourcemaps.write('/'))
    .pipe(
      $.size({
        showFiles: true,
        showTotal: false,
        title: 'Minified CSS'
      })
    )
    .pipe(gulp.dest(path.build.css))
    .pipe(reload({ stream: true }));
});

// ЗАДАЧА: очистка директории /build
gulp.task('clean', () => {
  return gulp.src(path.clean, { read: false }).pipe($.destClean(path.clean));
});

// ЗАДАЧА: запуска сервера
gulp.task('server', () => {
  browserSync.init({
    server: {
      baseDir: './build/'
    },
    port: 3000,
    startPath: '/index.html'
  });
});

// ЗАДАЧА: оптимизция всей графики, запуск вручную
gulp.task('image:opt', () => {
  return gulp
    .src(path.src.img, { since: gulp.lastRun('image:opt') })
    .pipe($.plumber({ errorHandler: onError }))
    .pipe($.newer(path.build.img))
    .pipe(
      $.imagemin({
        progressive: true,
        svgoPlugins: [{ removeViewBox: false }],
        interlaced: true,
        optimizationLevel: 3,
        use: [imageminPngquant()]
      })
    )
    .pipe(
      $.size({
        showFiles: true,
        showTotal: false,
        title: 'Images'
      })
    )
    .pipe(gulp.dest(path.build.img))
    .pipe(reload({ stream: true }));
});

// ЗАДАЧА: копирвание всей графики в директорию /build/img
gulp.task('img', () => {
  return gulp
    .src(path.src.img, { since: gulp.lastRun('img') })
    .pipe($.plumber({ errorHandler: onError }))
    .pipe($.newer(path.build.img))
    .pipe(gulp.dest(path.build.img));
});

// ЗАДАЧА: сборка png спрайта
gulp.task('png:sprite', () => {
  const fileName = `sprite-${Math.random().toString().replace(/[^0-9]/g, '')}.png`;
  // let fileName2x = 'sprite-' + Math.random().toString().replace(/[^0-9]/g, '') + '-2x.png';
  const spriteData = gulp.src(path.src.pngsprite)
    .pipe($.plumber({ errorHandler: onError }))
    .pipe($.spritesmith({
      imgName: fileName,
      cssName: 'sprite.less',
      cssFormat: 'less',
      padding: 4,
      cssTemplate: 'less.template.mustache',
      imgPath: `../img/'${fileName}`
      // retinaSrcFilter: path.src.png2x,
      // retinaImgName: + fileName2x,
      // retinaImgPath: '../img/' + fileName2x,
    }));
  const imgStream = spriteData.img
    .pipe(buffer())
    .pipe($.imagemin())
    .pipe(gulp.dest(path.build.img));
  const cssStream = spriteData.css
    .pipe(gulp.dest(path.src.less));
  return merge(imgStream, cssStream);
});

// ЗАДАЧА: сборка svg спрайта
gulp.task('svg:sprite', () => {
  return gulp
    .src(path.src.svgsprite)
    .pipe(
      $.svgmin({
        js2svg: {
          pretty: true
        }
      })
    )
    .pipe(
      $.cheerio({
        run: ($) => {
          $('[fill]').removeAttr('fill');
          $('[stroke]').removeAttr('stroke');
          $('[style]').removeAttr('style');
        },
        parserOptions: { xmlMode: true }
      })
    )
    .pipe($.replace('&gt;', '>'))
    .pipe(
      $.svgSprite({
        mode: {
          symbol: {
            sprite: '../sprite.svg',
            render: {
              less: {
                dest: './../../../src/less/sprite.less',
                template: 'less.svg.template.mustache'
              }
            }
          }
        }
      })
    )
    .pipe(
      $.size({
        showFiles: true,
        showTotal: false,
        title: 'SVG Sprite'
      })
    )
    .pipe(gulp.dest(path.build.img));
});

// ЗАДАЧА: билд шрифтов
gulp.task('fonts:build', () => {
  return gulp
    .src(path.src.fonts, { since: gulp.lastRun('fonts:build') })
    .pipe($.newer(path.build.fonts))
    .pipe(
      $.size({
        showFiles: true,
        showTotal: false,
        title: 'Fonts'
      })
    )
    .pipe(gulp.dest(path.build.fonts))
    .pipe(reload({ stream: true }));
});

// ЗАДАЧА: билд htaccess
gulp.task('htaccess:build', () => {
  return gulp.src(path.src.htaccess, { since: gulp.lastRun('htaccess:build') })
    .pipe(gulp.dest(path.build.common));
});

// ЗАДАЧА: выгрузка в gh-Pages, запуск вручную
gulp.task('deploy', () => {
  return gulp.src(path.outputDir)
    .pipe($.ghPages());
});

// ЗАДАЧА: билд всего
gulp.task('build', gulp.series(
  'clean',
  gulp.parallel(
    'less',
    'html:build',
    'img',
    'png:sprite',
    'svg:sprite',
    'fonts:build',
    'js:build',
    'htaccess:build'
  ))
);

// ЗАДАЧА: отслеживание изменений
gulp.task('watch', () => {
   // билдим html в случае изменения
  $.watch([path.watch.html], (event, cb) => {
    gulp.start('html:build');
  });

   // билдим png спрайты в случае изменения
  $.watch([path.watch.pngsprite], (event, cb) => {
    gulp.start('png:sprite');
  });

  // билдим svg спрайты в случае изменения
  $.watch([path.watch.svgsprite], (event, cb) => {
    gulp.start('svg:sprite');
  });

   // билдим css в случае изменения
  $.watch([path.watch.css], (event, cb) => {
    gulp.start('less');
  });

   // билдим js в случае изменения
  $.watch([path.watch.js], (event, cb) => {
    gulp.start('js:build');
  });

   // копируем изображения в случае изменения
  $.watch([path.watch.img], (event, cb) => {
    gulp.start('img');
  });

   // билдим шрифты в случае изменения
  $.watch([path.watch.fonts], (event, cb) => {
    gulp.start('fonts:build');
  });

   // билдим htaccess в случае изменения
  $.watch([path.watch.htaccess], (event, cb) => {
    gulp.start('htaccess:build');
  });
});

gulp.task('default', gulp.series('build', gulp.parallel('watch', 'server')));

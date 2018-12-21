
//Gulp packages
var gulp = require('gulp'),
    gulp_sass = require('gulp-sass'),
    cssmin = require('gulp-minify-css'),
    scsslint = require('gulp-sass-lint'),
    rename = require('gulp-rename'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    prefix = require('gulp-autoprefixer'),
    jshint = require('gulp-jshint'),
    minifyHTML = require('gulp-minify-html'),
    gulp_size = require('gulp-size'),
    gulp_imagemin = require('gulp-imagemin'),
    imageminMozjpeg  = require('imagemin-mozjpeg'),
    imagemin_pngquant = require('imagemin-pngquant'),
    plumber = require('gulp-plumber'),
    gulp_hPages = require('gulp-gh-pages'),
    notify = require('gulp-notify'),
    browserSync = require('browser-sync'),
    reload = browserSync.reload,
    cache = require('gulp-cached');

//Directory paths
var path = {
    rootDest: 'dist/',
    htmlSrc: './src/*.html',
    htmlDest: 'dist',
    scssSrc: './src/scss/**/*.scss',
    scssDist: 'dist/css',
    jsSrc: './src/js/*.js',
    jstemp: './js',
    jsDest: 'dist/js',
    imgSrc: './src/img/*',
    imgDest: 'dist/img'
};

//Browser sync live reload
gulp.task('browser-sync', function () {
    browserSync({
        server: {
            baseDir: "dist/"
        }
    });
});

gulp.task('gulp_hPages', function () {
    return gulp.src('dist/**/*')
        .pipe(gulp_hPages());
});


//Scss compile, minify, gzip and inject to dist folder
gulp.task('scss', function () {
    var onError = function (err) {
        notify.onError({
            message: "Error: <%= error.message %>"
        })(err);
        this.emit('end');
    };

    return gulp.src(path.scssSrc)
        .pipe(plumber({ errorHandler: onError }))
        .pipe(gulp_sass())
        .pipe(gulp_size({ gzip: true, showFiles: true }))
        .pipe(prefix())
        .pipe(rename('main.css'))
        .pipe(gulp.dest(path.scssDist))
        .pipe(reload({ stream: true }))

        .pipe(cssmin())
        .pipe(gulp_size({ gzip: true, showFiles: true }))
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest(path.scssDist))
});

//Handle scss errors
gulp.task('scss-lint', function () {
    gulp.src(path.scssSrc)
        .pipe(cache('scsslint'))
        .pipe(scsslint());
});

//JS compile, minify, gzip and inject to dist folder
gulp.task('js', function () {
    gulp.src(path.jsSrc)
        .pipe(uglify())
        .pipe(gulp_size({ gzip: true, showFiles: true }))
        .pipe(concat(path.jstemp))
        .pipe(rename({ suffix: '.min.js' }))
        .pipe(gulp.dest(path.jsDest))
        .pipe(reload({ stream: true }));
});

//Handle js errors
gulp.task('jshint', function () {
    gulp.src('js/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

//Minify html
gulp.task('minify-html', function () {
    var opts = {
        comments: true,
        spare: true
    };

    gulp.src('./src/*.html')
        .pipe(minifyHTML(opts))
        .pipe(gulp.dest(path.rootDest))
        .pipe(reload({ stream: true }));
});

//Minify images and inject to dist folder
gulp.task('imgmin', function () {
    return gulp.src(path.imgSrc)
    .pipe(gulp_imagemin([
        gulp_imagemin.gifsicle({interlaced: true}),
        gulp_imagemin.jpegtran({progressive: true}),
        gulp_imagemin.optipng({optimizationLevel: 9}),//Adjust the quailty of png image according to your  need
        imageminMozjpeg({
            quality: 50 //Adjust the quailty of Jpeg image according to your  need
        }),
        gulp_imagemin.svgo({
            plugins: [
                {removeViewBox: true},
                {cleanupIDs: false}
            ]
        })
    ])).pipe(gulp.dest(path.imgDest));
});

// Watch for all changes including scss, html, js and images
gulp.task('watch', function () {
    gulp.watch('./src/scss/**/*.scss', ['scss']);
    gulp.watch('./src/js/*.js', ['js']);
    gulp.watch('./src/*.html', ['minify-html']);
    gulp.watch('./src/img/*', ['imgmin']);
});


//All the tasks added in default task
gulp.task('default', ['browser-sync', 'js', 'imgmin', 'minify-html', 'scss', 'watch']);

const gulp = require("gulp"),
  browserSync = require("browser-sync").create(),
  reload = browserSync.reload,
  sass = require("gulp-sass")(require("sass")),
  concat = require("gulp-concat"),
  pug = require("gulp-pug"),
  postcss = require("gulp-postcss"),
  autoprefixer = require("autoprefixer"),
  cssnano = require("cssnano"),
  purgecss = require("gulp-purgecss"),
  uglify = require("gulp-uglify"),
  imagemin = require("gulp-imagemin"),
  cache = require("gulp-cache"),
  markdown = require("gulp-markdown"),
  rename = require("gulp-rename"),
  html2pug = require("gulp-html2pug"),
  plumber = require("gulp-plumber"),
  del = require("del"),
  log = require("fancy-log"),
  replace = require("gulp-replace");

const root = "dev/",
  pg = root + "pug/",
  scss = root + "scss/",
  md = root + "md/",
  js = root + "js/",
  jsDist = "prod/" + "js/";

const htmlWatchFiles = root + "html/**/*.html",
  styleWatchFiles = scss + "**/*.scss",
  markdownWatchFiles = md + "**/*.md",
  imageWatchFiles = root + "images/**/*.+(png|jpg|jpeg|gif|svg)",
  pugWatchFiles = pg + "**/*.pug";

const jsSrc = js + "**/*.js";

// pug to html
function buildHTML() {
  return gulp
    .src(pg + "*.pug")
    .pipe(pug({ pretty: true }))
    .pipe(gulp.dest(root + "html"))
    .pipe(gulp.dest("prod/"));
}

// markdown to html
function mdown() {
  return gulp
    .src([md + "**/*.md"])
    .pipe(markdown())
    .pipe(gulp.dest(root + "html"));
}

// html to pug
function mdpug() {
  return gulp
    .src(root + "html/*.html")
    .pipe(html2pug())
    .pipe(gulp.dest(pg));
}

// css for testing
function editorCSS() {
  return gulp
    .src(scss + "styles.scss")
    .pipe(
      sass({
        outputStyle: "expanded",
      }).on("error", sass.logError)
    )
    .pipe(gulp.dest("prod/css/"));
}

// optimized css for production
function css() {
  return gulp
    .src(scss + "styles.scss", { sourcemaps: true })
    .pipe(
      sass({
        outputStyle: "compressed",
      }).on("error", sass.logError)
    )
    .pipe(postcss([autoprefixer(), cssnano()]))
    .pipe(gulp.dest("prod/css/", { sourcemaps: "." }))
    .on("end", function () {
      log("*---CSS optimized!---*");
    });
}

// purge unused css styles
function purge() {
  return gulp
    .src("prod/css/styles.css")
    .pipe(
      purgecss({
        content: ["prod/**/*.html"],
      })
    )
    .pipe(gulp.dest("prod/css/"))
    .on("end", function () {
      log("*---Purge done!---*");
    });
}

// optimized js
function javascript() {
  return gulp
    .src(
      [
        jsSrc,
        //,'!' + 'includes/js/jquery.min.js', //exclude any specific files
      ],
      { sourcemaps: true }
    )
    .pipe(concat("all.js"))
    .pipe(uglify())
    .pipe(gulp.dest(jsDist, { sourcemaps: "." }));
}

//cache
function cacheBustTask() {
  var cbString = new Date().getTime();
  return gulp
    .src([root + "html/*.html"])
    .pipe(replace(/cb=\d+/g, "cb=" + cbString))
    .pipe(gulp.dest("prod/"));
}

// optimize images
function images() {
  return gulp
    .src(root + "images/**/*.+(png|jpg|jpeg|gif|svg)")
    .pipe(
      cache(
        imagemin({
          interlaced: true,
        })
      )
    )
    .pipe(gulp.dest("prod/images/"))
    .on("end", function () {
      log("*---Images optimized!---*");
    });
}

//browser watch
function watch() {
  browserSync.init({
    notify: false,
    files: ["**/*.html"],
    server: {
      baseDir: "prod/",
    },
  });

  gulp.watch(styleWatchFiles, editorCSS);
  gulp.watch(pugWatchFiles, buildHTML);
  gulp.watch(markdownWatchFiles, mdown);
  gulp.watch(jsSrc, javascript);
  gulp.watch(imageWatchFiles , images);
  gulp
    .watch(
      [
        htmlWatchFiles,
        jsDist + "all.js",
        styleWatchFiles,
      ],
      gulp.series(cacheBustTask)
    )
    .on("change", reload);
}

// cleanup before build
function clean() {
  return del(["prod/css/**/*", "prod/images/**/*"]);
}

exports.css = css;
exports.editorCSS = editorCSS;
exports.javascript = javascript;
exports.watch = watch;
exports.buildHTML = buildHTML;
exports.mdown = mdown;
exports.mdpug = mdpug;
exports.images = images;
exports.clean = clean;
exports.purge = purge;

const dev = gulp.series(cacheBustTask, watch);
gulp.task("default", dev);

const build = gulp.series(clean, css, purge, images);
gulp.task("build", build);



const gulp = require("gulp"),
  browserSync = require("browser-sync").create(),
  reload = browserSync.reload,
  sass = require("gulp-sass")(require("sass")),
  concat = require("gulp-concat"),
  pug = require("gulp-pug"),
  postcss = require("gulp-postcss"),
  autoprefixer = require("autoprefixer"),
  cssnano = require("cssnano"),
  uglify = require("gulp-uglify"),
  imagemin = require("gulp-imagemin"),
  cache = require("gulp-cache"),
  markdown = require("gulp-markdown"),
  del = require("del"),
  replace = require("gulp-replace");

const root = "src/",
  pg = root + "pug/",
  scss = root + "scss/",
  md = root + "md/",
  js = root + "js/",
  jsDist = "dist/" + "js/";

const htmlWatchFiles = root + "html/**/*.html",
  styleWatchFiles = scss + "**/*.scss",
  markdownWatchFiles = md + "**/*.md",
  pugWatchFiles = pg + "**/*.pug";

const jsSrc = js + "**/*.js";

// pug to html
function buildHTML() {
  return gulp
    .src([pg + "*.pug"])
    .pipe(pug({ pretty: true }))
    .pipe(gulp.dest(root + "html"))
    .pipe(gulp.dest("dist/"));
}

// markdown to html
function mdown() {
  return gulp
    .src([md + "**/*.md"])
    .pipe(markdown())
    .pipe(gulp.dest(root + "html"))
    .pipe(gulp.dest("dist/"));
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
    .pipe(gulp.dest("dist/css/", { sourcemaps: "." }));
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
    .pipe(gulp.dest("dist/css/"));
}

// optimized js
function javascript() {
  return gulp
    .src(
      [
        jsSrc,
        //,'!' + 'includes/js/jquery.min.js', // to exclude any specific files
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
    .pipe(replace(/acab=\d+/g, "acab=" + cbString))
    .pipe(gulp.dest("dist/"));
}

// optimize images
function images() {
  return gulp
    .src(root + "img/**/*.+(png|jpg|jpeg|gif|svg)")
    .pipe(
      cache(
        imagemin({
          interlaced: true,
        })
      )
    )
    .pipe(gulp.dest("dist/img/"));
}

//browser watch
function watch() {
  browserSync.init({
    notify: false,
    files: ["**/*.html"],
    server: {
      baseDir: "dist/",
    },
  });
  // gulp.watch(styleWatchFiles, css);
  gulp.watch(styleWatchFiles, editorCSS);
  gulp.watch(pugWatchFiles, buildHTML);
  gulp.watch(markdownWatchFiles, mdown);
  gulp.watch(jsSrc, javascript);
  gulp
    .watch(
      [htmlWatchFiles, jsDist + "all.js", "dist/css/styles.css"],
      gulp.series(cacheBustTask)
    )
    .on("change", reload);
}

// cleanup before build
function clean() {
  return del(["dist/css/**/*", "dist/img/**/*"]);
}

exports.css = css;
exports.editorCSS = editorCSS;
exports.javascript = javascript;
exports.watch = watch;
exports.buildHTML = buildHTML;
exports.mdown = mdown;
exports.images = images;
exports.clean = clean;

const dev = gulp.series(cacheBustTask, watch);
gulp.task("default", dev);

const build = gulp.series(css, images);
gulp.task("build", build);


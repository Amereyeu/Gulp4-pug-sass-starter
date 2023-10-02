const gulp = require("gulp"),
  autoprefixer = require("autoprefixer"),
  browserSync = require("browser-sync").create(),
  cache = require("gulp-cache"),
  concat = require("gulp-concat"),
  cssnano = require("cssnano"),
  del = require("del"),
  html2pug = require("gulp-html2pug"),
  imagemin = require("gulp-imagemin"),
  log = require("fancy-log"),
  markdown = require("gulp-markdown"),
  postcss = require("gulp-postcss"),
  plumber = require("gulp-plumber"),
  pug = require("gulp-pug"),
  purgecss = require("gulp-purgecss"),
  reload = browserSync.reload,
  rename = require("gulp-rename"),
  replace = require("gulp-replace"),
  sass = require("gulp-sass")(require("sass")),
  uglify = require("gulp-uglify");

const root = "dev/",
  pg = root + "pug/",
  scss = root + "scss/",
  md = root + "md/",
  files = root + "files/",
  js = root + "js/",
  jsSrc = js + "**/*.js",
  jsDist = "prod/" + "js/";

const htmlWatchFiles = root + "html/**/*.html",
  styleWatchFiles = scss + "**/*.scss",
  markdownWatchFiles = md + "**/*.md",
  filesWatch = files + "**/*.*",
  imageWatchFiles = root + "images/**/*.+(png|jpg|jpeg|gif|svg)",
  jsWatchFiles = js + "extra/**/*.js",
  pugWatchFiles = pg + "**/*.pug";

// pug to html
function pugToHTML() {
  return gulp
    .src(pg + "*.pug")
    .pipe(pug({ pretty: true }))
    .pipe(gulp.dest(root + "html"))
    .pipe(gulp.dest("prod/"));
}

// markdown to html
function mdToHTML() {
  return gulp
    .src([md + "**/*.md"])
    .pipe(markdown())
    .pipe(gulp.dest(root + "html"));
}

// copy files to production
function filesToProd() {
  return gulp
    .src([files + "**/*.*"])
    .pipe(gulp.dest("prod/files/"))
    .on("end", function () {
      log("*---Files copied to production!---*");
    });
}

// html to pug
function HTMLToPug() {
  return gulp
    .src(root + "html/*.html")
    .pipe(html2pug())
    .pipe(gulp.dest(pg));
}

// css for testing in dev
function developementCSS() {
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
function productionCSS() {
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
function purgeUnusedCSS() {
  return gulp
    .src("prod/css/styles.css")
    .pipe(
      purgecss({
        content: ["prod/**/*.html"],
      })
    )
    .pipe(gulp.dest("prod/css/"))
    .on("end", function () {
      log("*---CSS Purge done!---*");
    });
}

// optimize js
function optimizeJS() {
  return gulp
    .src([jsSrc, "!" + js + "extra/**/*.js"], {
      sourcemaps: true,
    })
    .pipe(concat("js.min.js"))
    .pipe(uglify())
    .pipe(gulp.dest(jsDist, { sourcemaps: "." }))
    .on("end", function () {
      log("*---JS optimized!---*");
    });
}

// copy other js files to production
function jsToProd() {
  return gulp
    .src(js + "extra/**/*.js")
    .pipe(gulp.dest(jsDist))
    .on("end", function () {
      log("*---JS copied to production!---*");
    });
}

//cache bust
function cacheBust() {
  var cbString = new Date().getTime();
  return gulp
    .src([root + "html/*.html"])
    .pipe(replace(/cb=\d+/g, "cb=" + cbString))
    .pipe(gulp.dest("prod/"));
}

// optimize images
function optimizeImages() {
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
      log("*---Images optimized!---*")
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

  gulp.watch(styleWatchFiles, developementCSS);
  gulp.watch(pugWatchFiles, pugToHTML);
  gulp.watch(markdownWatchFiles, mdToHTML);
  gulp.watch(jsSrc, optimizeJS);
  gulp.watch(jsWatchFiles, jsToProd);
  gulp.watch(imageWatchFiles, optimizeImages);
  gulp.watch(filesWatch, filesToProd);
  gulp
    .watch(
      [htmlWatchFiles, jsWatchFiles, styleWatchFiles],
      gulp.series(cacheBust)
    )
    .on("change", reload);
}

// cleanup before build
function deleteAll() {
  return del(["prod/css/**/*", "prod/images/**/*"]);
}

exports.productionCSS = productionCSS;
exports.developementCSS = developementCSS;
exports.optimizeJS = optimizeJS;
exports.jsToProd = jsToProd;
exports.watch = watch;
exports.pugToHTML = pugToHTML;
exports.mdToHTML = mdToHTML;
exports.filesToProd = filesToProd;
exports.HTMLToPug = HTMLToPug;
exports.optimizeImages = optimizeImages;
exports.deleteAll = deleteAll;
exports.purgeUnusedCSS = purgeUnusedCSS;

const dev = gulp.series(cacheBust, watch);
gulp.task("default", dev);

const build = gulp.series(
  deleteAll,
  productionCSS,
  purgeUnusedCSS,
  optimizeImages
);
gulp.task("build", build);


















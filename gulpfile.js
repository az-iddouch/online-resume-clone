const gulp = require("gulp");
const sass = require("gulp-sass");
const autoprefixer = require("gulp-autoprefixer");
const browserSync = require("browser-sync").create();
const useref = require("gulp-useref");
const uglify = require("gulp-uglify");
const gulpIf = require("gulp-if");
const cssnano = require("gulp-cssnano");
const imagemin = require("gulp-imagemin");
// const cache = require("gulp-cache");
const del = require("del");
const runSequence = require("run-sequence");

gulp.task("browser-sync", function() {
  browserSync.init({
    server: {
      baseDir: "src"
    }
  });
});

gulp.task("sass", function() {
  return gulp
    .src("src/scss/**/*.scss") // Gets all files ending with .scss in src/scss
    .pipe(sass().on("error", sass.logError))
    .pipe(
      autoprefixer({
        browsers: ["last 4 versions"],
        cascade: false
      })
    )
    .pipe(gulp.dest("src/css"))
    .pipe(
      browserSync.reload({
        stream: true
      })
    );
});

gulp.task("useref", function() {
  return (
    gulp
      .src("src/*.html")
      .pipe(useref())
      .pipe(gulpIf("*.js", uglify()))
      // Minifies only if it's a CSS file
      .pipe(gulpIf("*.css", cssnano()))
      .pipe(gulp.dest("dist"))
  );
});

// Compress all images and move them to /dist/images
gulp.task("images", function() {
  return (
    gulp
      .src("src/images/**/*.+(png|jpg|jpeg|gif|svg)")
      // Caching images that ran through imagemin
      .pipe(
        imagemin({
          interlaced: true
        })
      )
      .pipe(gulp.dest("dist/images"))
  );
});

// Moves all fonts into /dist folder
// gulp.task("fonts", function() {
//   return gulp.src("src/fonts/**/*").pipe(gulp.dest("dist/fonts"));
// });

// Gulp will delete the `dist` folder for you whenever gulp clean:dist is run.
gulp.task("clean:dist", function() {
  return del.sync("dist");
});

gulp.task("watch", ["browser-sync", "sass"], function() {
  gulp.watch("src/scss/**/*.scss", ["sass"]);
  gulp.watch("src/*.html", browserSync.reload);
  gulp.watch("src/js/**/*.js", browserSync.reload);
});

gulp.task("build", function(callback) {
  runSequence("clean:dist", ["sass", "useref", "images"], callback);
});

gulp.task("default", function(callback) {
  runSequence(["sass", "browser-sync", "watch"], callback);
});

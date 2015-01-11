var gulp = require('gulp'),
  jade = require('gulp-jade'),
  stylus = require('gulp-stylus'),
  hogan = require('gulp-hogan'),
  config = require('config'),
  mainBowerFiles = require('main-bower-files'),
  mocha = require('gulp-mocha'),
  imageop = require('gulp-image-optimization');
  
// --- Basic Tasks ---
gulp.task('css', function() {
  return gulp.src('src/assets/stylesheets/*.styl')
    .pipe(stylus({
      set: ['compress']
    }))
    .pipe(gulp.dest('public/assets/css'));
});

gulp.task('js', function() {
  return gulp.src('src/assets/js/*.mustache')
    .pipe(hogan({
      mountPoint: config.get('mountPoint')
    }))
    .pipe(gulp.dest('public/assets/js/'));
});

gulp.task('templates', function() {
  return gulp.src('src/**/*.jade')
    .pipe(jade({
      pretty: true
    }))
    .pipe(gulp.dest('public/'));
});

gulp.task('images', function() {
  return gulp.src(['src/assets/img/*.png','src/assets/img/*.jpg','src/assets/img/*.gif','src/assets/img/*.jpeg']).pipe(imageop({
    optimizationLevel: 5,
    progressive: true,
    interlaced: true
  })).pipe(gulp.dest('public/assets/images/'));
});

gulp.task('icons', function() {
  return gulp.src(['src/assets/icons/*.png','src/assets/icons/*.jpg','src/assets/icons/*.gif','src/assets/icons/*.jpeg']).pipe(imageop({
    optimizationLevel: 5,
    progressive: true,
    interlaced: true
  })).pipe(gulp.dest('public/assets/icons/'));
});

gulp.task('watch', function() {
  gulp.watch('src/assets/stylesheets/*.styl', ['css']);
  gulp.watch('src/assets/js/*.mustache', ['js']);
  gulp.watch('src/**/*.jade', ['templates']);

});

gulp.task("vendor", function() {
  return gulp.src(mainBowerFiles( /* options */ ), {
    base: 'bower_components/'
  }).pipe(gulp.dest('public/assets/vendor/'));
});

gulp.task('test', function() {
  return gulp.src('test/**/*.js', {
      read: false
    })
    .pipe(mocha({
      reporter: 'spec' //or nyan :)
    }))
    .once('end', function() {
      process.exit();
    });
});

// Default Task
gulp.task('default', ['js', 'css', 'images', 'icons', 'templates', 'vendor', 'watch']);

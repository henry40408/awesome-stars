import gulp from 'gulp';
import gulpSequence from 'gulp-sequence';

gulp.task('build', gulpSequence(
  'clean', [
    'manifest',
    'scripts',
    'styles',
    'pages',
    'locales',
    'images',
    'fonts',
    'chromereload'
  ]
));

let gulp = require('gulp');
let ts = require('gulp-typescript');
let tsProject = ts.createProject('tsconfig.json');
let electron = require("electron");
let runElectron = require("gulp-run-electron");
let del = require("del");


gulp.task('typescript', () => {
    return tsProject.src()
        .pipe(tsProject())
        .js.pipe(gulp.dest('dist'));
});

gulp.task('launch', (cb) => {
    return gulp.src("dist")
        .pipe(runElectron(["index.js"], {cwd: "dist"}));
});

gulp.task('clean', () => {
    return del([
        "dist/**/*"
    ]);
});

gulp.task('copy', () => {
    return gulp.src([
        'web/**/*'
    ], {
        base: 'web'
    }).pipe(gulp.dest('dist'));
});

gulp.task('default', gulp.series(['clean','copy','typescript', 'launch']))

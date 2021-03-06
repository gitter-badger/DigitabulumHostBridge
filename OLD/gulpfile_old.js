var gulp = require('gulp');

// ports
var livereloadport = 35729;
var serverport = 5000;

// reqs
var glove = require('./../app.js');
var defs = require('./lib/defs.js');

var digitabulum

console.log("defs: " + defs.outCommand);

// tasks
gulp.task('lint', function() {
    var jshint = require('gulp-jshint');
    gulp.src(['./app/**/*.js', '!./app/bower_components/**'])
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(jshint.reporter('fail'));
});
gulp.task('clean', function() {
    var clean = require('gulp-clean');
    gulp.src('./dist/*')
        .pipe(clean({force: true}));
    gulp.src('./app/js/bundled.js')
        .pipe(clean({force:true}));
});
gulp.task('minify-css', function() {
    var minifyCSS = require('gulp-minify-css');
    var opts = {comments:true,spare:true};
    gulp.src(['./app/**/*.css', '!./app/bower_components/**'])
        .pipe(minifyCSS(opts))
        .pipe(gulp.dest('./dist/'))
});
gulp.task('minify-js', function() {
    var uglify = require('gulp-uglify');
    gulp.src(['./app/**/*.js', '!./app/bower_components/**'])
        .pipe(uglify({
            // inSourceMap:
            // outSourceMap: "app.js.map"
        }))
        .pipe(gulp.dest('./dist/'))
});
gulp.task('copy-bower-components', function() {
    gulp.src('./app/bower_components/**')
        .pipe(gulp.dest('dist/bower_components'));
});
gulp.task('copy-html-files', function() {
    gulp.src('./app/**/*.html')
        .pipe(gulp.dest('dist/'));
});
gulp.task('browserify', function() {
    var concat = require('gulp-concat');
    var browserify = require('gulp-browserify');
    gulp.src(['app/js/main.js'])
        .pipe(browserify({
            insertGlobals: true,
            debug: true
        }))
        .pipe(concat('bundled.js'))
        .pipe(gulp.dest('./app/js'))
});
gulp.task('watch', ['lint'], function() {
    gulp.watch(['./app/js/*.js', './app/js/**/*.js'], [
    ]);
});
gulp.task('develop', function() {
    var nodemon = require('gulp-nodemon');
    nodemon({ 
        script: 'app.js', 
        ignore: ['app/**/*.js'] 
    })
    .on('change', ['lint'])
    .on('restart', function() {
        console.log('restarted node')
    })
});

gulp.task('express' , function() {
    var express = require('express');
    var app = express();
    app.use(express.static(__dirname + '/app'));


    // ROUTES FOR API
    // ========================
    var router = express.Router();

    // middleware to use for all requests
    router.use(function(req,res, next) {
        // logging
        //console.log('api working...');
        next(); // move to next routes
    });

    router.get('/', function(req, res) {
        res.json({ message:'api is up' });
    });

    //router.get('/sendTestData', function(req, res) {
    router.get('/sendTestData/:mode/:messageId/:args', function(req, res) {
        console.log(req.params.messageId);
        console.log('arg' + req.params.args);
        sendTest(defs.outCommand[req.params.messageId], req.params.mode, req.params.args);
        res.json({ message: 'test data sent' });
    });

    router.get('/commands', function(req, res) {
        //res.json({ message: 'test data' });
        res.json(defs.outCommand);
    });

    router.get('/gloveModel', function(req, res) {
        res.json(defs.gloveModel);
    });
    
    router.get('/updateGloveModel', function(req, res) {
        updateGloveModel();
        res.json(defs.gloveModel);
    });
    
    router.get('/updateGloveModelFakeData', function(req, res) {
        fakeGloveModel();
    });

    router.get('/sendSync/:mode', function(req, res){
        sendSync(req.params.mode);
        res.json({ message: 'sync packet sent'})
    })

    router.get('/testLegend', function(req, res){
        glove.parser.write(glove.testLegend);
        res.json({ message: 'legend packet sent'})
    })

    router.get('/connectBT', function(req, res){
        glove.connectBT();
        res.json({ message: 'connecting to BT'})
    })

    router.get('/disconnectBT', function(req, res){
        glove.disconnectBT();
        res.json({ message: 'disconnecting from BT'})
    })

    app.use('/api', router);
    var server = app.listen(4000);

    // Set up socket.io
    var io = require('socket.io').listen(server);
    
    console.log('Express running');
    
    // Run the glove, pass in socket.io reference
    defs(io);
    glove(io, defs);
    //glove.parser.write(new Buffer([0x06, 0x00, 0x00, 0xfc, 0xa5, 0x01, 0x01, 0x00]));
});

// default task
gulp.task('default',
    ['express', 'develop'] , function() {

});

var sendTest = function(messageId, dest, args) {
    var uniqueId = Math.floor((Math.random() * 1000) + 1);
    if (args == 0) {
        argBuffObj = undefined;
    }
    else {
        var argBuffObj = new Buffer(args, "hex");
    }
    console.log(argBuffObj);
    var msg = glove.builder(messageId, uniqueId, argBuffObj);

    if (dest === "host") {
        glove.parser.write(msg);
    } else if (dest === "glove") {
        if (glove.btSerial !== undefined) {
            glove.btSerial.write(msg, function(err, bytesWritten) {
                if (err) console.log(err);
                console.log("sent " + bytesWritten + " to the BT connection");
            });
        }
    }
};


var sendSync = function(dest) {
    var argBuffObj = undefined;
    var msg = glove.syncPacket;

    if (dest === "host") {
        glove.parser.write(msg);
    } else if (dest === "glove") {
        if (glove.btSerial !== undefined) {
            glove.btSerial.write(msg, function(err, bytesWritten) {
                if (err) console.log(err);
                console.log("sync packet sent to glove");
            });
        }
    }
};



var fakeGloveModel = function() {
    // generate fake data 
    var args = {};
    var time = Date.now();
    var fakeData = [Math.sin( time / 2000 ), Math.cos( time / 3000 ), Math.sin( time / 1000 )];
    var sets = 51;
    var reads = ['x', 'y', 'z'];
    for (var i = 0; i <= sets; i++) { 
            args[i] = {};
        for (j = 0; j < reads.length; j++) {
            args[i][reads[j]] = fakeData[j];
        }
    }
    var fakeJsonBuff = {
        args : args
    };
    defs.execute_IMU_MAP_STATE(fakeJsonBuff); 

    setTimeout(fakeGloveModel, 50);
};


// ****************
// REQUIRES
// ****************
var EventEmitter = require('events').EventEmitter;
var events = new EventEmitter();

var bt = require('./bluetooth.js')();
var dhbModels = require('./dhb-models.js');
var dhbParser = require('./dhb-parser.js');
var dhbBuilder = require('./dhb-builder.js');
var argparse = require('./dhb-argparser.js');
var exec = require('./dhb-exec.js');
var gesture = require('../capture/capture.js');
var runGestures = gesture(events);

// instantiated with pass-through requires
var dhbArgParser = new argparse(dhbModels);
var dhbExec = new exec(dhbModels, dhbArgParser);

// adding temp for logging. remove and move to helper lib
var fs = require('fs');

// ****************
// HELPER FUNCTIONS
// ****************

// reinstatiates pass-through requires when dhbModels is updated
var refreshModels = function() {
	dhbModels.outCommand = buildOutCommands(dhbModels);
	dhbArgParser = new argparse(dhbModels);
	dhbExec = new exec(dhbModels, dhbArgParser);
};

var buildOutCommands = function (obj) {
	new_obj = {};
	for (var prop in obj) {
		if (obj.hasOwnProperty(prop)) {
			new_obj[obj[prop].def] = parseInt(prop);
		}
	}
	return new_obj;
};

// first pass outCommand instantiation
dhbModels.outCommand = buildOutCommands(dhbModels.commands);

// ****************
// REPLY QUEUEING
// ****************

// if true, this will bypass the reply queue and execute
var autoExecReplies = true;
var sendReplies = false;

// we'll want this to emit whenever it's updated. Stick objects here prior to building...
var replyQueue = [];

var processReply = function(uniqueID, params) {

};

var sendReply = function() {

};

// ****************
// EXECUTION
// ****************

var execute = function(jsonBuffer) {
	var metaObj = dhbExec.runIt(jsonBuffer);
	doStuff(metaObj);
	if(metaObj.refresh) refreshModels();
};

// We'll put actionable executions here based on the type
var doStuff = function(metaObj) {
	console.log(metaObj.type);
	switch(metaObj.type) {
		case "LEGEND_MESSAGES":
      console.log(metaObj.output);
			dhbModels.commands = metaObj.output;
      events.emit('outCommand', metaObj.output);
			break;
		case "GLOVE_MODEL":
			//emit the glove model
			var temp = dhbModels.gloveModel;
			temp.IMU_set = metaObj.output;
			events.emit('gloveModel', temp);

            // TEMP LOG TO FILE
            // This needs to be added a generic helper lib
            // Remove require to fs above
            
            //fs.appendFile("outputData.txt", JSON.stringify(temp), function(err) {
            //    if(err) throw err;
            //});

			console.log(temp);
			break;
		case "NONE":
			events.emit('genericMessage', metaObj.msg, metaObj.def);
			//console.log(metaObj.msg);
		default:
			console.log(metaObj.msg);
			break;
	}
};

// ****************
// LISTENERS
// ****************

dhbParser.parser.on("readable", function() {
	var e;
	while (e = dhbParser.parser.read()) {
		execute(e);
	}
});

dhbParser.events.on('sendSync', function(){
	bt.write(Buffer([0x04, 0x00, 0x00, 0x55], 'hex'));
})

bt.ee.on("btListAdd", function(address, name) {
	events.emit('btFound', address, name);
});

bt.ee.on("btData", function(buffer) {
	dhbParser.parser.write(buffer);
});

bt.ee.on('connected', function(status) {
	events.emit('btConnection', status)
});

events.emit('testEmit');
    
// ****************
// TEST COMMANDS
// ****************

//dhbParser.write(Buffer([0x04, 0x00, 0x00, 0x55], 'hex'));
//console.log(dhbBuilder(0x04, 0x04, undefined));
//dhbParser.write(Buffer([0xac, 0x06, 0x00, 0x79, 0x55, 0x4e, 0x11, 0x00, 0xfd, 0xff, 0x00, 0x00, 0x52, 0x45, 0x50, 0x4c, 0x59, 0x5f, 0x50, 0x41, 0x52, 0x53, 0x45, 0x5f, 0x46, 0x41, 0x49, 0x4c, 0x00, 0x00, 0xfe, 0xff, 0x00, 0x00, 0x52, 0x45, 0x50, 0x4c, 0x59, 0x5f, 0x52, 0x45, 0x54, 0x52, 0x59, 0x00, 0x00, 0xff, 0xff, 0x00, 0x00, 0x43, 0x4f, 0x55, 0x4e, 0x54, 0x45, 0x52, 0x50, 0x41, 0x52, 0x54, 0x59, 0x5f, 0x52, 0x45, 0x50, 0x4c, 0x59, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x53, 0x59, 0x53, 0x5f, 0x42, 0x4f, 0x4f, 0x54, 0x5f, 0x43, 0x4f, 0x4d, 0x50, 0x4c, 0x45, 0x54, 0x45, 0x44, 0x00, 0x00, 0x02, 0x00, 0x00, 0x00, 0x53, 0x59, 0x53, 0x5f, 0x42, 0x4f, 0x4f, 0x54, 0x4c, 0x4f, 0x41, 0x44, 0x45, 0x52, 0x00, 0x00, 0x03, 0x00, 0x00, 0x00, 0x53, 0x59, 0x53, 0x5f, 0x52, 0x45, 0x42, 0x4f, 0x4f, 0x54, 0x00, 0x00, 0x04, 0x00, 0x00, 0x00, 0x53, 0x59, 0x53, 0x5f, 0x53, 0x48, 0x55, 0x54, 0x44, 0x4f, 0x57, 0x4e, 0x00, 0x00, 0x05, 0x00, 0x00, 0x00, 0x53, 0x59, 0x53, 0x5f, 0x50, 0x52, 0x45, 0x41, 0x4c, 0x4c, 0x4f, 0x43, 0x41, 0x54, 0x49, 0x4f, 0x4e, 0x00, 0x00, 0x14, 0x00, 0x00, 0x00, 0x56, 0x45, 0x52, 0x53, 0x49, 0x4f, 0x4e, 0x5f, 0x50, 0x52, 0x4f, 0x54, 0x4f, 0x43, 0x4f, 0x4c, 0x00, 0x08, 0x00, 0x00, 0x13, 0x00, 0x00, 0x00, 0x56, 0x45, 0x52, 0x53, 0x49, 0x4f, 0x4e, 0x5f, 0x46, 0x49, 0x52, 0x4d, 0x57, 0x41, 0x52, 0x45, 0x00, 0xaf, 0x00, 0x00, 0x10, 0x00, 0x00, 0x00, 0x4c, 0x45, 0x47, 0x45, 0x4e, 0x44, 0x5f, 0x54, 0x59, 0x50, 0x45, 0x53, 0x00, 0x00, 0x11, 0x00, 0x00, 0x00, 0x4c, 0x45, 0x47, 0x45, 0x4e, 0x44, 0x5f, 0x4d, 0x45, 0x53, 0x53, 0x41, 0x47, 0x45, 0x53, 0x00, 0x0f, 0x00, 0x00, 0x12, 0x00, 0x00, 0x00, 0x4c, 0x45, 0x47, 0x45, 0x4e, 0x44, 0x5f, 0x4d, 0x41, 0x50, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x53, 0x59, 0x53, 0x5f, 0x44, 0x41, 0x54, 0x45, 0x54, 0x49, 0x4d, 0x45, 0x5f, 0x43, 0x48, 0x41, 0x4e, 0x47, 0x45, 0x44, 0x00, 0x00, 0x01, 0x01, 0x00, 0x00, 0x53, 0x59, 0x53, 0x5f, 0x53, 0x45, 0x54, 0x5f, 0x44, 0x41, 0x54, 0x45, 0x54, 0x49, 0x4d, 0x45, 0x00, 0x00, 0x02, 0x01, 0x00, 0x00, 0x53, 0x59, 0x53, 0x5f, 0x52, 0x45, 0x50, 0x4f, 0x52, 0x54, 0x5f, 0x44, 0x41, 0x54, 0x45, 0x54, 0x49, 0x4d, 0x45, 0x00, 0x00, 0x00, 0x02, 0x00, 0x00, 0x53, 0x59, 0x53, 0x5f, 0x50, 0x4f, 0x57, 0x45, 0x52, 0x5f, 0x4d, 0x4f, 0x44, 0x45, 0x00, 0x06, 0x00, 0x00, 0x00, 0x03, 0x00, 0x00, 0x53, 0x59, 0x53, 0x5f, 0x49, 0x53, 0x53, 0x55, 0x45, 0x5f, 0x4c, 0x4f, 0x47, 0x5f, 0x49, 0x54, 0x45, 0x4d, 0x00, 0xaf, 0x00, 0x00, 0x01, 0x03, 0x00, 0x00, 0x53, 0x59, 0x53, 0x5f, 0x4c, 0x4f, 0x47, 0x5f, 0x56, 0x45, 0x52, 0x42, 0x4f, 0x53, 0x49, 0x54, 0x59, 0x00, 0x06, 0x00, 0x00, 0x00, 0x04, 0x00, 0x00, 0x53, 0x43, 0x48, 0x45, 0x44, 0x5f, 0x45, 0x4e, 0x41, 0x42, 0x4c, 0x45, 0x5f, 0x42, 0x59, 0x5f, 0x50, 0x49, 0x44, 0x00, 0x00, 0x01, 0x04, 0x00, 0x00, 0x53, 0x43, 0x48, 0x45, 0x44, 0x5f, 0x44, 0x49, 0x53, 0x41, 0x42, 0x4c, 0x45, 0x5f, 0x42, 0x59, 0x5f, 0x50, 0x49, 0x44, 0x00, 0x00, 0x02, 0x04, 0x00, 0x00, 0x53, 0x43, 0x48, 0x45, 0x44, 0x5f, 0x50, 0x52, 0x4f, 0x46, 0x49, 0x4c, 0x45, 0x52, 0x5f, 0x53, 0x54, 0x41, 0x52, 0x54, 0x00, 0x00, 0x03, 0x04, 0x00, 0x00, 0x53, 0x43, 0x48, 0x45, 0x44, 0x5f, 0x50, 0x52, 0x4f, 0x46, 0x49, 0x4c, 0x45, 0x52, 0x5f, 0x53, 0x54, 0x4f, 0x50, 0x00, 0x00, 0x04, 0x04, 0x00, 0x00, 0x53, 0x43, 0x48, 0x45, 0x44, 0x5f, 0x50, 0x52, 0x4f, 0x46, 0x49, 0x4c, 0x45, 0x52, 0x5f, 0x44, 0x55, 0x4d, 0x50, 0x00, 0x00, 0x05, 0x04, 0x00, 0x00, 0x53, 0x43, 0x48, 0x45, 0x44, 0x5f, 0x44, 0x55, 0x4d, 0x50, 0x5f, 0x4d, 0x45, 0x54, 0x41, 0x00, 0x00, 0x06, 0x04, 0x00, 0x00, 0x53, 0x43, 0x48, 0x45, 0x44, 0x5f, 0x44, 0x55, 0x4d, 0x50, 0x5f, 0x53, 0x43, 0x48, 0x45, 0x44, 0x55, 0x4c, 0x45, 0x53, 0x00, 0x00, 0x07, 0x04, 0x00, 0x00, 0x53, 0x43, 0x48, 0x45, 0x44, 0x5f, 0x57, 0x49, 0x50, 0x45, 0x5f, 0x50, 0x52, 0x4f, 0x46, 0x49, 0x4c, 0x45, 0x52, 0x00, 0x00, 0x08, 0x04, 0x00, 0x00, 0x53, 0x43, 0x48, 0x45, 0x44, 0x5f, 0x44, 0x45, 0x46, 0x45, 0x52, 0x52, 0x45, 0x44, 0x5f, 0x45, 0x56, 0x45, 0x4e, 0x54, 0x00, 0x00, 0x00, 0x10, 0x00, 0x00, 0x42, 0x54, 0x5f, 0x43, 0x4f, 0x4e, 0x4e, 0x45, 0x43, 0x54, 0x49, 0x4f, 0x4e, 0x5f, 0x4c, 0x4f, 0x53, 0x54, 0x00, 0x00, 0x01, 0x10, 0x00, 0x00, 0x42, 0x54, 0x5f, 0x43, 0x4f, 0x4e, 0x4e, 0x45, 0x43, 0x54, 0x49, 0x4f, 0x4e, 0x5f, 0x47, 0x41, 0x49, 0x4e, 0x45, 0x44, 0x00, 0x00, 0x03, 0x10, 0x00, 0x00, 0x42, 0x54, 0x5f, 0x51, 0x55, 0x45, 0x55, 0x45, 0x5f, 0x52, 0x45, 0x41, 0x44, 0x59, 0x00, 0x00, 0x04, 0x10, 0x00, 0x00, 0x42, 0x54, 0x5f, 0x52, 0x58, 0x5f, 0x42, 0x55, 0x46, 0x5f, 0x4e, 0x4f, 0x54, 0x5f, 0x45, 0x4d, 0x50, 0x54, 0x59, 0x00, 0x00, 0x05, 0x10, 0x00, 0x00, 0x42, 0x54, 0x5f, 0x45, 0x4e, 0x54, 0x45, 0x52, 0x45, 0x44, 0x5f, 0x43, 0x4d, 0x44, 0x5f, 0x4d, 0x4f, 0x44, 0x45, 0x00, 0x00, 0x06, 0x10, 0x00, 0x00, 0x42, 0x54, 0x5f, 0x45, 0x58, 0x49, 0x54, 0x45, 0x44, 0x5f, 0x43, 0x4d, 0x44, 0x5f, 0x4d, 0x4f, 0x44, 0x45, 0x00, 0x00, 0x00, 0x20, 0x00, 0x00, 0x49, 0x32, 0x43, 0x5f, 0x51, 0x55, 0x45, 0x55, 0x45, 0x5f, 0x52, 0x45, 0x41, 0x44, 0x59, 0x00, 0x00, 0x99, 0x20, 0x00, 0x00, 0x49, 0x32, 0x43, 0x5f, 0x44, 0x55, 0x4d, 0x50, 0x5f, 0x44, 0x45, 0x42, 0x55, 0x47, 0x00, 0x00, 0x01, 0x05, 0x00, 0x00, 0x53, 0x50, 0x49, 0x5f, 0x51, 0x55, 0x45, 0x55, 0x45, 0x5f, 0x52, 0x45, 0x41, 0x44, 0x59, 0x00, 0x00, 0x00, 0x30, 0x00, 0x00, 0x52, 0x4e, 0x47, 0x5f, 0x42, 0x55, 0x46, 0x46, 0x45, 0x52, 0x5f, 0x45, 0x4d, 0x50, 0x54, 0x59, 0x00, 0x00, 0x02, 0x30, 0x00, 0x00, 0x49, 0x4e, 0x54, 0x45, 0x52, 0x52, 0x55, 0x50, 0x54, 0x53, 0x5f, 0x4d, 0x41, 0x53, 0x4b, 0x45, 0x44, 0x00, 0x00, 0x00, 0x40, 0x00, 0x00, 0x49, 0x4d, 0x55, 0x5f, 0x49, 0x52, 0x51, 0x5f, 0x52, 0x41, 0x49, 0x53, 0x45, 0x44, 0x00, 0x00, 0x01, 0x40, 0x00, 0x00, 0x49, 0x4d, 0x55, 0x5f, 0x44, 0x49, 0x52, 0x54, 0x59, 0x00, 0x06, 0x12, 0x00, 0x00, 0x02, 0x40, 0x00, 0x00, 0x49, 0x4d, 0x55, 0x5f, 0x4d, 0x41, 0x50, 0x5f, 0x52, 0x45, 0x51, 0x55, 0x45, 0x53, 0x54, 0x00, 0x00, 0x21, 0xe4, 0x00, 0x00, 0x49, 0x4d, 0x55, 0x5f, 0x4d, 0x41, 0x50, 0x5f, 0x53, 0x54, 0x41, 0x54, 0x45, 0x00, 0x12, 0x12, 0x12, 0x12, 0x12, 0x12, 0x12, 0x12, 0x12, 0x12, 0x12, 0x12, 0x12, 0x12, 0x12, 0x12, 0x12, 0x00, 0x00, 0x03, 0x40, 0x00, 0x00, 0x49, 0x4e, 0x49, 0x54, 0x5f, 0x49, 0x4d, 0x55, 0x53, 0x00, 0x00, 0x04, 0x40, 0x00, 0x00, 0x49, 0x4e, 0x49, 0x54, 0x5f, 0x4b, 0x4d, 0x41, 0x50, 0x00, 0x00, 0x00, 0x50, 0x00, 0x00, 0x53, 0x45, 0x4e, 0x53, 0x4f, 0x52, 0x5f, 0x49, 0x4e, 0x41, 0x32, 0x31, 0x39, 0x00, 0x00, 0x00, 0x51, 0x00, 0x00, 0x53, 0x45, 0x4e, 0x53, 0x4f, 0x52, 0x5f, 0x49, 0x53, 0x4c, 0x32, 0x39, 0x30, 0x33, 0x33, 0x00, 0x00, 0x00, 0x52, 0x00, 0x00, 0x53, 0x45, 0x4e, 0x53, 0x4f, 0x52, 0x5f, 0x4c, 0x50, 0x53, 0x33, 0x33, 0x31, 0x00, 0x00, 0x00, 0x53, 0x00, 0x00, 0x53, 0x45, 0x4e, 0x53, 0x4f, 0x52, 0x5f, 0x53, 0x49, 0x37, 0x30, 0x32, 0x31, 0x00, 0x00, 0x00, 0x54, 0x00, 0x00, 0x53, 0x45, 0x4e, 0x53, 0x4f, 0x52, 0x5f, 0x54, 0x4d, 0x50, 0x30, 0x30, 0x36, 0x00, 0x00, 0x00, 0x60, 0x00, 0x00, 0x4b, 0x4d, 0x41, 0x50, 0x5f, 0x50, 0x45, 0x4e, 0x44, 0x49, 0x4e, 0x47, 0x5f, 0x46, 0x52, 0x41, 0x4d, 0x45, 0x00, 0x00, 0x01, 0x60, 0x00, 0x00, 0x4b, 0x4d, 0x41, 0x50, 0x5f, 0x55, 0x53, 0x45, 0x52, 0x5f, 0x43, 0x48, 0x41, 0x4e, 0x47, 0x45, 0x44, 0x00, 0x00, 0x02, 0x60, 0x00, 0x00, 0x4b, 0x4d, 0x41, 0x50, 0x5f, 0x42, 0x49, 0x4f, 0x4d, 0x45, 0x54, 0x52, 0x49, 0x43, 0x5f, 0x4d, 0x41, 0x54, 0x43, 0x48, 0x00, 0x00, 0x03, 0x60, 0x00, 0x00, 0x4b, 0x4d, 0x41, 0x50, 0x5f, 0x42, 0x49, 0x4f, 0x4d, 0x45, 0x54, 0x52, 0x49, 0x43, 0x5f, 0x4e, 0x55, 0x4c, 0x4c, 0x00, 0x00, 0x00, 0x80, 0x00, 0x00, 0x4f, 0x4c, 0x45, 0x44, 0x5f, 0x44, 0x49, 0x52, 0x54, 0x59, 0x5f, 0x46, 0x52, 0x41, 0x4d, 0x45, 0x5f, 0x42, 0x55, 0x46, 0x00, 0x00, 0x00, 0xa0, 0x00, 0x00, 0x47, 0x50, 0x49, 0x4f, 0x5f, 0x56, 0x49, 0x42, 0x52, 0x41, 0x54, 0x45, 0x5f, 0x30, 0x00, 0x07, 0x06, 0x00, 0x07, 0x00, 0x00, 0x01, 0xa0, 0x00, 0x00, 0x47, 0x50, 0x49, 0x4f, 0x5f, 0x56, 0x49, 0x42, 0x52, 0x41, 0x54, 0x45, 0x5f, 0x31, 0x00, 0x07, 0x06, 0x00, 0x07, 0x00, 0x00, 0x02, 0xa0, 0x00, 0x00, 0x4c, 0x45, 0x44, 0x5f, 0x57, 0x52, 0x49, 0x53, 0x54, 0x5f, 0x4f, 0x46, 0x46, 0x00, 0x00, 0x03, 0xa0, 0x00, 0x00, 0x4c, 0x45, 0x44, 0x5f, 0x57, 0x52, 0x49, 0x53, 0x54, 0x5f, 0x4f, 0x4e, 0x00, 0x00, 0x04, 0xa0, 0x00, 0x00, 0x4c, 0x45, 0x44, 0x5f, 0x44, 0x49, 0x47, 0x49, 0x54, 0x53, 0x5f, 0x4f, 0x46, 0x46, 0x00, 0x06, 0x06, 0x06, 0x06, 0x06, 0x06, 0x00, 0x06, 0x06, 0x06, 0x06, 0x06, 0x00, 0x06, 0x06, 0x06, 0x06, 0x00, 0x06, 0x06, 0x06, 0x00, 0x06, 0x06, 0x00, 0x06, 0x00, 0x00, 0x05, 0xa0, 0x00, 0x00, 0x4c, 0x45, 0x44, 0x5f, 0x44, 0x49, 0x47, 0x49, 0x54, 0x53, 0x5f, 0x4f, 0x4e, 0x00, 0x06, 0x06, 0x06, 0x06, 0x06, 0x06, 0x00, 0x06, 0x06, 0x06, 0x06, 0x06, 0x00, 0x06, 0x06, 0x06, 0x06, 0x00, 0x06, 0x06, 0x06, 0x00, 0x06, 0x06, 0x00, 0x06, 0x00, 0x00, 0x06, 0xa0, 0x00, 0x00, 0x4c, 0x45, 0x44, 0x5f, 0x50, 0x55, 0x4c, 0x53, 0x45, 0x00, 0x08, 0x02, 0x06, 0x06, 0x06, 0x06, 0x06, 0x06, 0x00, 0x08, 0x02, 0x06, 0x06, 0x06, 0x06, 0x06, 0x00, 0x08, 0x02, 0x06, 0x06, 0x06, 0x06, 0x00, 0x08, 0x02, 0x06, 0x06, 0x06, 0x00, 0x08, 0x02, 0x06, 0x06, 0x00, 0x08, 0x02, 0x06, 0x00, 0x00, 0x07, 0xa0, 0x00, 0x00, 0x4c, 0x45, 0x44, 0x5f, 0x44, 0x49, 0x47, 0x49, 0x54, 0x5f, 0x4c, 0x45, 0x56, 0x45, 0x4c, 0x00, 0x06, 0x00, 0x06, 0x08, 0x00, 0x06, 0x08, 0x02, 0x00, 0x00, 0x08, 0xa0, 0x00, 0x00, 0x4c, 0x45, 0x44, 0x5f, 0x4d, 0x4f, 0x44, 0x45, 0x00, 0x06, 0x00, 0x00, 0x00, 0xb0, 0x00, 0x00, 0x53, 0x44, 0x5f, 0x45, 0x4a, 0x45, 0x43, 0x54, 0x45, 0x44, 0x00, 0x00, 0x01, 0xb0, 0x00, 0x00, 0x53, 0x44, 0x5f, 0x49, 0x4e, 0x53, 0x45, 0x52, 0x54, 0x45, 0x44, 0x00, 0x00, 0x00, 0xe0, 0x00, 0x00, 0x53, 0x45, 0x53, 0x53, 0x5f, 0x45, 0x53, 0x54, 0x41, 0x42, 0x4c, 0x49, 0x53, 0x48, 0x45, 0x44, 0x00, 0x00, 0x01, 0xe0, 0x00, 0x00, 0x53, 0x45, 0x53, 0x53, 0x5f, 0x48, 0x41, 0x4e, 0x47, 0x55, 0x50, 0x00, 0x00, 0x02, 0xe0, 0x00, 0x00, 0x53, 0x45, 0x53, 0x53, 0x5f, 0x41, 0x55, 0x54, 0x48, 0x5f, 0x43, 0x48, 0x41, 0x4c, 0x4c, 0x45, 0x4e, 0x47, 0x45, 0x00, 0x00, 0x03, 0xe0, 0x00, 0x00, 0x53, 0x45, 0x53, 0x53, 0x5f, 0x53, 0x55, 0x42, 0x43, 0x52, 0x49, 0x42, 0x45, 0x00, 0x00, 0x04, 0xe0, 0x00, 0x00, 0x53, 0x45, 0x53, 0x53, 0x5f, 0x55, 0x4e, 0x53, 0x55, 0x42, 0x43, 0x52, 0x49, 0x42, 0x45, 0x00, 0x00, 0x05, 0xe0, 0x00, 0x00, 0x53, 0x45, 0x53, 0x53, 0x5f, 0x44, 0x55, 0x4d, 0x50, 0x5f, 0x44, 0x45, 0x42, 0x55, 0x47, 0x00, 0x00, 0x10, 0xe0, 0x00, 0x00, 0x53, 0x45, 0x53, 0x53, 0x5f, 0x4f, 0x52, 0x49, 0x47, 0x49, 0x4e, 0x41, 0x54, 0x45, 0x5f, 0x4d, 0x53, 0x47, 0x00, 0x00], 'hex'))
//bt.scan();


// ****************
// EXPOSED OBJECT
// ****************

var dhb = module.exports =  function(options){
	if (!(this instanceof dhb)) { return new dhb(); }

	// if we want options in the future, they can be in this object
	if (!options) {
		options = {};
	}

	this.scan = function(){
		bt.scan();
	};

	this.sendToGlove = function(buffer){
		bt.write(buffer);
	};

	this.sendToHost = function(buffer){
		dhbParser.parser.write(buffer);
	};

	this.build = function(messageID, uniqueID, argBuffObj) {
		return dhbBuilder(messageID, uniqueID, argBuffObj);
	};

	this.events = events;

	// should alias by reference... I'm not 100% though, so we may need the refresh script to do this
	this.models = dhbModels;

	this.bt = bt;
};

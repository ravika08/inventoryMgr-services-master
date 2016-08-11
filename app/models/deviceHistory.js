var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var DeviceHistorySchema   = new Schema({
		deviceId:String,
    status:String,
		hours:Number,
		user:String,
		os:String,
		osversion:String,
		client:String,
		lastUpdated_at:Date
	});

	module.exports = mongoose.model('DeviceHistory', DeviceHistorySchema);

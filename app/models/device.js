var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var DeviceSchema   = new Schema({
    name: String,
    deviceId:String,
    os:String,
    status:String,
    user:String,
		hours:Number,
		location:String,
		category:String,
		macAddress:String,
		serialNumber:String,
		screenResolution:String,
		cloudType:String,
		lastUpdated_at:Date
});

module.exports = mongoose.model('Device', DeviceSchema);

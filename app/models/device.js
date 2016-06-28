var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var DeviceSchema   = new Schema({
    name: String,
    deviceId:String,
    os:String,
		osversion:String,
		client:String,
    status:String,
    user:String,
		hours:Number,
		location:String,
		category:String,
		macAddress:String,
		serialNumber:String,
		screenResolution:String,
		assetID:String,
		cloudType:String,
		lastUpdated_at:Date,
		purchase_date:Date
});

module.exports = mongoose.model('Device', DeviceSchema);

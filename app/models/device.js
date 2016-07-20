var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var DeviceSchema   = new Schema({
    manufacturer: String,
		model:String,
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
		imei:String,
		purchase_date:Date
});
DeviceSchema.plugin(require('historical'), {
    connection: mongoose.createConnection('mongodb://localhost/inventoryMgr'),
    name: null,
    primaryKeyName: null,
    primaryKeyType: null
});
module.exports = mongoose.model('Device', DeviceSchema);

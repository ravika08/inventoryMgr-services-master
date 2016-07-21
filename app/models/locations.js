var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var locationSchema   = new Schema({
    locationName:String
});

module.exports = mongoose.model('Location', locationSchema);

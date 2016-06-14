// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
var mongoose   = require('mongoose');
var Device       = require('./app/models/device');

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

mongoose.connect('mongodb://localhost/inventoryMgr');

var port = process.env.PORT || 8080;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router
// middleware to use for all requests
router.use(function(req, res, next) {
    // do logging
    console.log('Something is happening.');
    next(); // make sure we go to the next routes and don't stop here
});
// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
    res.json({ message: 'hooray! welcome to our api!' });
});

// on routes that end in /devices
// ----------------------------------------------------
router.route('/devices')

    // create a device (accessed at POST http://localhost:8080/api/devices)
    .post(function(req, res) {

        var device = new Device();      // create a new instance of the Device model
        device.name = req.body.name;  // set the device name (comes from the request)
        device.deviceId=req.body.deviceId;
        device.os=req.body.os;
        device.status=req.body.status;
        device.user=req.body.user;
				device.location=req.body.location;
				device.category=req.body.category;
				device.cloudType=req.body.cloudType;
				device.macAddress=req.body.macAddress;
				device.serialNumber=req.body.serialNumber;
				device.screenResolution=req.body.screenResolution;
				device.hours=0;
        // save the device and check for errors
        device.save(function(err) {
            if (err)
                res.send(err);

            res.json(device);
        });
    })
    // get all the devices (accessed at GET http://localhost:8080/api/devices)
    .get(function(req, res) {
        Device.find(function(err, devices) {
            if (err)
                res.send(err);

            res.json(devices);
        });
    });

    // on routes that end in /bears/:bear_id
    // ----------------------------------------------------
    router.route('/devices/:deviceId')

        // get the device with that id (accessed at GET http://localhost:8080/api/devices/:device_id)
        .get(function(req, res) {
            Device.findOne({deviceId: req.params.deviceId}, function(err, device) {
                if (err)
                    res.send(err);
                res.json(device);
            });
        })
        // update the device with this id (accessed at PUT http://localhost:8080/api/devices/:device_id)
            .put(function(req, res) {

                // use our device model to find the device we want

                Device.findOne({deviceId: req.params.deviceId}, function(err, device) {

                    if (err)
                        res.send(err);

                    console.log("device name "+device.name);
                    device.status = req.body.status;
                    device.user=req.body.user; // update the devices info
                    console.log("device status "+req.body.status);
										if(req.body.status=="available"){
											console.log("available");
											var now=Date.now();
											var hours = Math.abs(now - device.lastUpdated_at) / 36e5;
											device.hours=device.hours+hours;
											device.hours=device.hours.toFixed(2);
											console.log("hours "+hours);
										}
										device.lastUpdated_at=Date.now();

                    // save the device
                    device.save(function(err) {
                        if (err)
                            res.send(err);

                        res.json(device);
                    });

                });
            })
            .delete(function(req, res) {
        Device.remove({
            deviceId: req.params.deviceId
        }, function(err, device) {
            if (err)
                res.send(err);

            res.json({ message: 'Successfully deleted' });
        });
    });

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);
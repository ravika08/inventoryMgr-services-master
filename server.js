// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
var mongoose   = require('mongoose');
var Device     = require('./app/models/device');

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

    console.log('Service received a request');
    next();
});
// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
    res.json({ message: 'Cognizant Asset management api ' });
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
				device.osversion=req.body.osversion;
				device.client=req.body.client;
				device.hours=0;
				device.assetID=req.body.assetID;
				device.purchase_date=Date.now();
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

//on routes that end in /devices/searchBy/:filter
router.route('/devices/searchBy/:filter')

	.post(function(req, res) {
		 if(req.params.filter=="OS")
		 {
			 Device.find({os: req.body.searchValue}, function(err, devices) {
					 if (err)
							 res.send(err);
					 res.json(devices);
			 });

		 }else if(req.params.filter=="OSVersion"){
			 Device.find({osversion: req.body.searchValue}, function(err, devices) {
					 if (err)
							 res.send(err);
					 res.json(devices);
			 });

		 }else if(req.params.filter=="Client"){
			 Device.find({client: req.body.searchValue}, function(err, devices) {
					 if (err)
							 res.send(err);
					 res.json(devices);
			 });
		 }
		});

//on routes that end in /devices/countBy/:filter
 router.route('/devices/countBy/:filter')

       .post(function(req,res){
				 if(req.params.filter=="Client"){
				    Device.count({
            client:req.body.searchValue
		        }, function (err, result) {
              if (err) {
                next(err);
              } else {
               res.json(result);
            }
          });
				}else if(req.params.filter=="OS"){
	        Device.count({
             os:req.body.searchValue
              }, function (err, result) {
             if (err) {
              next(err);
              } else {
         res.json(result);
         }
          });
    }
});

//on routes that end in /devices/hoursBy/:filter
router.route('/devices/hoursBy/:filter')
    .get(function(req,res){
			if(req.params.filter=="Client"){
				Device.aggregate([
        { $group: {
            _id:  {client : '$client',os:'$os'},
            total_hours: { $sum: '$hours'}
        }}
    ], function (err, results) {
        if (err) {
            console.error(err);
        } else {
            res.json(results);
        }
    }
);
			}else if(req.params.filter=="OS"){
				Device.aggregate([
        { $group: {
            _id:'$os',
            total_hours: { $sum: '$hours'}
        }}
    ], function (err, results) {
        if (err) {
            console.error(err);
        } else {
            res.json(results);
        }
    }
);
			}else if(req.params.filter=="OSVersion"){
				Device.aggregate([
        { $group: {
            _id:{os:'$os',version:'$osversion'},
            total_hours: { $sum: '$hours'}
        }}
    ], function (err, results) {
        if (err) {
            console.error(err);
        } else {
            res.json(results);
        }
    }
);
			}
		})

//on routes that end in /devices/clients
router.route('/device/clients/')

   .get(function(req,res){
		 Device.distinct("client", function (err, result) {
      if (err) {
        next(err);
      } else {
        res.json(result);
      }
  });
});

    // on routes that end in /devices/:deviceId
    // ----------------------------------------------------
    router.route('/devices/:deviceId')

        // get the device with that id (accessed at GET http://localhost:8080/api/devices/:device_id)
        .get(function(req, res) {
            Device.findOne({deviceId: req.params.deviceId},{hours:1}, function(err, device) {
                if (err)
                    res.send(err);
                res.json(device);
            });
        })

				.post(function(req, res) {

					Device.findOne({deviceId: req.params.deviceId}, function(err, device) {

							if (err)
									res.send(err);

						device.location=req.body.location;
						device.cloudType=req.body.cloudType;
						device.osversion=req.body.osversion;
						device.client=req.body.client;
		        // save the device and check for errors
		        device.save(function(err) {
		            if (err)
		                res.send(err);

		            res.json(device);
		        });
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
console.log('Service started on port ' + port);

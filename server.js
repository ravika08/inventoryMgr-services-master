// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express      = require('express');        // call express
var app          = express();                 // define our app using express
var bodyParser   = require('body-parser');
var mongoose     = require('mongoose');
var Device       = require('./app/models/device');
var DeviceHistory= require ('./app/models/deviceHistory');
var Location     = require('./app/models/locations');

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
        device.manufacturer = req.body.manufacturer;
				device.model=req.body.model; // set the device name (comes from the request)
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
				device.hours=req.body.hours;
				device.assetID=req.body.assetID;
				device.purchase_date=Date.now();
        // save the device and check for errors
        device.save(function(err,dev) {
            if (err)
                res.send(err);
								var deviceHistory = new DeviceHistory();
								deviceHistory.user=req.body.user;
								deviceHistory.lastUpdated_at=Date.now();
								deviceHistory.deviceId=dev.deviceId;
								deviceHistory.status=device.status;
								deviceHistory.hours=0;
								deviceHistory.os=device.os;
								deviceHistory.osversion=device.osversion;
								deviceHistory.client=device.client;
								deviceHistory.save(function(err){
									if(err){
										console.log("History save error :"+err);
									}
								});
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
//on routes that end in /atm/locations
router.route('/atm/locations')
//create new location
.post(function(req,res){
	var location= new Location();
	location.locationName=req.body.locationName;
	location.save(function(err) {
			if (err)
					res.send(err);

			res.json(location);
	});
})
//get all locations
   .get(function(req,res){
		 Location.find(function(err,locations){
			 if(err)
			   res.send(err);
			res.json(locations);
		});
	})

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


router.route('/deviceinfo/client/:clientId')
    .get(function(req,res){
			Device.find({client: req.params.clientId}, function(err, devices) {
					if (err)
							res.send(err);
					res.json(devices);
				});
		});
//on routes that end in /devices/clients
router.route('/atm/clients')

   .get(function(req,res){
		 Device.distinct("client", function (err, result) {
      if (err) {
        next(err);
      } else {
        res.json(result);
      }
  });
});

router.route('/atm/osversions')
				.get(function(req,res){
					Device.aggregate([
	        { $group: {
	            _id:{os:'$os',osversion:'$osversion'}
	        }}
	    ], function(err,result){
						if(err){
							next(err);
						}else{
							res.json(result);
						}
					});
				});

	router.route('/atm/hoursUsed/groupedByClient/:startDate/:endDate')
	       .get(function(req,res){
					 var startDate = new Date(req.params.startDate);
					 var endDate = new Date(req.params.endDate);
					 DeviceHistory.aggregate([{$match:{lastUpdated_at:{$gte: startDate, $lt: endDate}}},
						 { $group: {
								 _id:{client:'$client',os:'$os'},
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
				 })
router.route('/atm/devicesUsed/groupedByClient/:startDate/:endDate')
      .get(function(req,res){
				var startDate=new Date(req.params.startDate);
				var endDate = new Date(req.params.endDate);
				DeviceHistory.aggregate([{$match:{lastUpdated_at:{$gte: startDate, $lt: endDate}}},
					{ $group: {
                _id:{client:'$client',os:'$os'},
								deviceIds:{$addToSet: '$deviceId'}
            }},
						{$project: {
			 						_id: 0,
			 						client: '$_id.client',
									os:'$_id.os',
			            DeviceCount: {$size: '$deviceIds'}
	 }}
			], function (err, results) {
					if (err) {
							console.error(err);
					} else {
							res.json(results);
					}
			}
	);
			})

router.route('/atm/devicesUsed/groupedByOS/:startDate/:endDate')
			      .get(function(req,res){
							var startDate=new Date(req.params.startDate);
							var endDate = new Date(req.params.endDate);
							DeviceHistory.aggregate([{$match:{lastUpdated_at:{$gte: startDate, $lt: endDate}}},
								{ $group: {
			                _id:{os:'$os'},
											deviceIds:{$addToSet: '$deviceId'}
			            }},
									{$project: {
						 						_id: 0,
												os:'$_id.os',
						            DeviceCount: {$size: '$deviceIds'}
				 }}
						], function (err, results) {
								if (err) {
										console.error(err);
								} else {
										res.json(results);
								}
						}
				);
						})

    // on routes that end in /devices/:deviceId
    // ----------------------------------------------------
	router.route('/atm/history/:deviceId')
				.get(function(req,res){
					DeviceHistory.find({deviceId:req.params.deviceId},function(err,device){
						if(err)
						  res.send(err);
						res.json(device);
					});
				})

    router.route('/devices/:deviceId')

        // get the device with that id (accessed at GET http://localhost:8080/api/devices/:device_id)
        .get(function(req, res) {
            Device.findOne({deviceId: req.params.deviceId}, function(err, device) {
                if (err)
                    res.send(err);
                res.json(device);
            });
        })

				.post(function(req, res) {

					Device.findOne({deviceId: req.params.deviceId}, function(err, device) {


            if(device){

						device.location=req.body.location;
						device.cloudType=req.body.cloudType;
						device.osversion=req.body.osversion;
						device.client=req.body.client;
						if(req.body.hours!=null){
						   device.hours=device.hours+parseInt(req.body.hours);
						 }
		        // save the device and check for errors
		        device.save(function(err,dev) {

							var deviceHistory = new DeviceHistory();
							deviceHistory.lastUpdated_at=Date.now();
							deviceHistory.deviceId=device.deviceId;
							deviceHistory.status=device.status;
							if(req.body.hours!=null){
							deviceHistory.hours=parseInt(req.body.hours);
						}else{
							deviceHistory.hours=0;
						}
							deviceHistory.os=device.os;
							deviceHistory.osversion=device.osversion;
							deviceHistory.client=device.client;
							deviceHistory.save(function(err){
											if(err){
												console.log("History save error :"+err);
											}
										});
		            res.json(device);
		        });
					}else{

						res.status(400).json({status:400,message:"Error:Unable to find device"});
					}
		    });
			})
        // update the device with this id (accessed at PUT http://localhost:8080/api/devices/:device_id)
            .put(function(req, res) {

                // use our device model to find the device we want

                Device.findOne({deviceId: req.params.deviceId}, function(err, device) {

                    if(device){
										var hours=0;
                    device.status = req.body.status;
                    device.user=req.body.user; // update the devices info
										if(req.body.status=="available"){
											var now=Date.now();
											hours = Math.abs(now - device.lastUpdated_at) / 36e5;
											device.hours=device.hours+hours;
											device.hours=device.hours.toFixed(2);

										}

										device.lastUpdated_at=Date.now();
										var deviceHistory = new DeviceHistory();
										deviceHistory.user=req.body.user;
										deviceHistory.lastUpdated_at=Date.now();
										deviceHistory.deviceId=device.deviceId;
										deviceHistory.status=device.status;
										deviceHistory.hours=hours;
										deviceHistory.client=device.client;
										deviceHistory.osversion=device.osversion;
										deviceHistory.os=device.os;
										deviceHistory.save(function(err){
											if(err){
												console.log("History save error :"+err);
											}
										});
                    // save the device
                    device.save(function(err,dev) {

                        if (err){
												   console.log("error"+err);
                            res.send(err);
													}

                        res.json(device);
                    });
									}else{
										res.status(400).json({status:400,message:"Error:Unable to find device"});
									}
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

var express = require('express')
    , morgan = require('morgan')
    , memjs = require('memjs')
    , async = require('async')
    , crypto = require('crypto')
    , path = require('path')
    , bodyParser = require('body-parser')
    , uuid = require('node-uuid')
    , request = require('request')
    , methodOverride = require('method-override')
    , app = express()
    , port = process.env.PORT || 3000
    , router = express.Router();

var client = memjs.Client.create('pub-memcache-10246.us-east-1-2.3.ec2.garantiadata.com:10246');


router.post('/verify', function(req, res, next) { //URL for signup form to Post to
	var email = req.body.email;
	console.log('signup request received for: ' + email);
	var token = req.body.token;
	console.log('token: ' + token);
	resp = 'nope';


	client.set(token, '-1', function(err, success) {
  	if (success) 
  	{
  		console.log('successfully set token with trust level: -1');
  		var timeout = 0;
  		var timerId = setInterval(function() {
  			timeout = timeout + .4;
  			if (timeout > 25) {
  				resp = 'manufacturer timeout';
			    clearInterval(timerId);
			    res.send(resp);

  			}
  			client.get(token, function (err, value, key) {
		    	if (value != null) {
			      	//console.log('current token trust level: ' + value.toString());
			      	if (parseInt(value.toString()) > 50) {
			      		resp = 'verified';
			      		clearInterval(timerId);
			      		res.send(resp);
			      	}
			      	else if (parseInt(value.toString()) != -1) {  //manufacturer says it's a bot
			      		clearInterval(timerId); 
			      		res.send(resp);
			      	}
		    	}	 
		  	});
  		},400);
		}	
		else {
			console.log('DB error: ' + err)
		}

  });
	
});

router.post('/devicecheck', function(req, res, next) { //URL for manufacturer to Post to
	var trustlevel = req.body.trust,
		token = req.body.token;
	console.log('manufacturer response received for token ' + token + ' with trust level: ' + trustlevel);

	//only do this for a trusted manufacturer 
	client.set(token, trustlevel);
	res.send('thanks');
    
});

module.exports = router;

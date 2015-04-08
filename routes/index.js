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


router.get('/', function(req, res, next) {
	res.statusCode = 302; 
    res.setHeader("Location", "https://github.com/trustware");
    res.end();
});

//DEPRECIATED, use /api and /demo instead

//stuff to be included on example website
/*router.get('/', function(req, res, next) {
	var uuidtext = uuid.v4();
    res.render('index', {token: uuidtext});
});*/


router.post('/createaccount', function(req, res, next) { //singup form posts here, do the server side checking to /verify
	var email = req.body.email,
		token = req.body.token;

	var verified = 'gotdevices?'
	//post email/token to /verify	
	
	if (verified = 'verified') {
		res.send('Congrats you have devices - account created'); 
	} 
	else {
		res.send('Nice try robot!');
	}    
});




//the actual web service
router.post('/verify', function(req, res, next) { //URL for signup form to Post to
	var email = req.body.email;
	console.log('signup request received for: ' + email);
	var token = req.body.token;//crypto.createHash('sha1').update(email).digest("hex");
	console.log('token: ' + token);
	resp = 'nope';


	client.set(token, '-1', function(err, success) {
  	if (success) 
  	{
  		console.log('successfully set token with trust level: -1');

  		var timerId = setInterval(function() {
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

	client.set(token, trustlevel);
	res.send('thanks');
    
});

module.exports = router;

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

			      	// no longer do this, just wait for trust/timeout (unless client tells us # of devices)
			      	/*else if (parseInt(value.toString()) != -1) {  //manufacturer says it's a bot
			      		clearInterval(timerId); 
			      		res.send(resp);
			      	}*/
		    	}	 
		  	});
  		},400);
		}	
		else {
			console.log('DB verify error: ' + err);
		}

  });
	
});

router.post('/devicecheck', function(req, res, next) { //URL for manufacturer to Post to
	var trustlevel = req.body.trust,
		sig = req.body.sig,
		token = req.body.token;
	console.log('manufacturer response received for token ' + token + ' with trust level: ' + trustlevel);
	console.log('signature: ' + sig);

	//only do this for a trusted manufacturer 
	var pubkey = '-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEArPpYkhI1/yO1IS7vNWPe\nc3WpmKaTw6+PaEu1+pc1goqYHQZT8sty+VnN5GCthlLdqbrB1TLrLAIpvqFd1byh\nCLKfFdCg0VoGzj1wFYhbOFQUZ9lGc7s2Sby59hL/ibWWlVYsYlagzzCSAkEk9Wbk\ngcQIDUhb1RimpbcuY//yZryZDXi34AXiSAVJejcYCFJ7ZUiGicAIsM/HdDVeEZLO\nLXf0LP653Mh/2qb4rO2WHj+ZAdZRPrj4YA53j9LfN0MtVYmYHEm7WCcVE+xHFCv6\n3Ibp36t1V/s05zjjQLROkydQacaFLG4BDn3uVNjYxYqJvwzy/rbuDazC4fCmlvFa\nPwIDAQAB\n-----END PUBLIC KEY-----';

	var verifier = crypto.createVerify('sha256');

	verifier.update(token);

	var ver = verifier.verify(pubkey, sig, 'hex');

	console.log(ver);

	if (ver) {
		client.get(token, function (err, value, key) {
			var theval = parseInt(value.toString());
			console.log('old trust: ' + value.toString());

			theval = theval + parseInt(trustlevel);
			console.log('new trust: ' + theval.toString());

			client.set(token, theval.toString());
			res.send('thanks');
		});
	}
	else {
		res.send('only trusted manufacturers allowed');
	}

});

module.exports = router;

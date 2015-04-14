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


//stuff to be included on demo website

router.get('/', function(req, res, next) {
	var uuidtext = uuid.v4();
  res.render('index', {token: uuidtext});
});


//singup form posts here, do the check to /api/verify (or the custom URL)
router.post('/createaccount', function(req, res, next) { 
	var emailtext = req.body.email , 
		tokentext = req.body.trustwareInfo;

	var verified = 'gotdevices?';

  console.log('FORM SUBMITTED');

  //request.post('http://localhost:3000/api/verify', {form: {email: emailtext, token: tokentext}},
	request.post('https://gotdevices.herokuapp.com/api/verify', {form: {email: emailtext, token: tokentext}}, 
		function (err, response, body) {
  		verified = body;

  		console.log('response: %s, error: %s', verified, err);
  		
	  	if (verified == 'verified') {
				res.send('Congrats you have devices - account created'); 
			}
      else if (verified == 'manufacturer timeout') {
        res.send('Error: Manufacturer timeout'); 
      }
		  else {
			 res.send('Nice try robot!');
		  }
	}); 

});


module.exports = router;

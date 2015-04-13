Trustware web service
=======================
Got devices?

=======================
API implementation in /routes/api.js


Currently two API endpoints:

POST to /api/verify: for the client website's server to validate a form submission via Trustware

POST to /api/devicecheck: for the manufacturer's server to report trust values for a Trustware request

=======================
Demo implementation in /routes/demo.js + /views/index.ejs


To implement:

1. Added hidden input to form you wish to check with Trustware (<%= token %> is generated server side as a uuid.v4() via Embedded Javascript):

<input style="display:none" type="text" url="https://gotdevices.herokuapp.com/api/devicecheck" value=<%= token %> id="trustwareInfo" name="trustwareInfo">

2. POST to /api/verify on form submission (example shown in Node.js):
router.post('/createaccount', function(req, res, next) { 
	var emailtext = req.body.email , 
		tokentext = req.body.trustwareInfo;

	request.post('https://gotdevices.herokuapp.com/api/verify', {form: {email: emailtext, token: tokentext}}, 
		function (err, response, body) {
		  	if (body == 'verified') {
					res.send('Congrats you have devices - account created'); 
			}
			else {
				 res.send('Nice try robot!');
			 }
	}); 
}); 


Live demo URL: http://gotdevices.herokuapp.com/demo
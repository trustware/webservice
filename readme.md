Trustware web service
=======================
Got devices?
=======================
Demo implementation in /routes/demo.js + /views/index.ejs


To implement:

- Add a hidden input to form (which submits the hidden input and an email to /createaccount in this example) you wish to check with Trustware (<%= token %> is generated server side as a uuid.v4() via Embedded Javascript):

```html
<input style="display:none" type="text" url="https://gotdevices.herokuapp.com/api/devicecheck" value=<%= token %> id="trustwareInfo" name="trustwareInfo">
```

- POST to Trustware via https://gotdevices.herokuapp.com/api/verify on form submission (example shown in Node.js-- token is the only required parameter):

```html
router.post('/createaccount', function(req, res, next) { 
	var emailtext = req.body.email , 
		tokentext = req.body.trustwareInfo;

	request.post('https://gotdevices.herokuapp.com/api/verify', {form: {token: tokentext}}, 
		function (err, response, body) {
		  	if (body == 'verified') {

	  			//The client is verified, do whatever you want a legit client to do here

				res.send('Congrats you have devices - account created'); 
			}
			else {

				//Not verified via Trustware, maybe try a CAPTCHA

				res.send('Nice try robot!');
			 }
	}); 
}); 
```


Live demo URL: http://gotdevices.herokuapp.com/demo

=======================
API implementation in /routes/api.js


Currently two API endpoints:

POST to /api/verify: for the client website's server to validate a form submission via Trustware

POST to /api/devicecheck: for the manufacturer's server to report trust values for a Trustware request
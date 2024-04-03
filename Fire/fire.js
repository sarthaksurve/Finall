



var currentLocation;
// Check if geolocation is supported by the browser
if ('geolocation' in navigator) {
    // Request geolocation permission
    navigator.geolocation.getCurrentPosition(
      // Success callback
      function(position) {
        // Permission granted, load the page normally
        console.log('Geolocation permission granted:', position);
		currentLocation = position;
       
		
      },
      // Error callback
      function(error) {
        // Permission denied, disable the page
        console.error('Geolocation permission denied:', error);
        document.body.innerHTML = '<h1>Geolocation permission denied</h1><p>This page requires access to your location.</p>';

      }
    );
  } else {
    // Geolocation not supported, disable the page
    console.error('Geolocation not supported');
    document.body.innerHTML = '<h1>Geolocation not supported</h1><p>This page requires a browser that supports geolocation.</p>';
  }




// const sendMessage = (message) => {
//   var xhttp = new XMLHttpRequest()
//   xhttp.onreadystatechange = () => {
//     if(this.readyState == 4 && this.status == 200){
//       debugger;
//       var responseText = JSON.parse(this.responseText)
//       alert('msg sent')
//       console.log(responseText)
//     }
//   }
//   xhttp.open('GET', `http://10.10.11.219:8090/SendSMS?username=sarthak&password=12345&phone=9284246443&message=${message}`, true)
//   xhttp.send()
// }



//////////////////////////////////////////////////////////////////////////////////////////

$(function() {
	//values pulled from query string
	$('#model').val("fire-and-smoke-ikpgn");
	$('#version').val("1");
	$('#api_key').val("NLUEAD4duB8UcOH0Mcn0");

	setupButtonListeners();
});

var infer = function() {
	// $('#output').html("Uploding");
	$("#resultContainer").show();
	$('html').scrollTop(100000);

	getSettingsFromForm(function(settings) {
		settings.error = function(xhr) {
			$('#output').html("").append([
				"Error loading response.",
				"",
				"Check your API key, model, version,",
				"and other parameters",
				"then try again."
			].join("\n"));
		};


        $.ajax(settings)
        .then(function(response) {
			console.log("response"+response.predictions[0].class)
            try {
                var fire = response.predictions[0].class;
                var confidence = response.predictions[0].confidence;
                console.log(fire); //string
                console.log("Confidence" + confidence); //number
                console.log("Prediction" + response.predictions[0]); //number
    
                var Detection = "";
                if (fire === 'fire') {
					$('#output').html("").append("Fire Accident Detected");
					sendEmail(); 
                    Detection = "Great! We've received your response";
                // } else {
                //     console.log("not detected");
                //     Detection = "Not Detected";
                // }
				const textmsg = 'Fire detected at latitude: ' + currentLocation.coords.latitude + '   longitude: ' + currentLocation.coords.longitude ;
		
		
				sendMessage(textmsg);
				console.log("SMS SENT")
				}
				else {
					$('#output').html("").append("Fire Accident Detected");

				}
    
                $('#output').html("").append(Detection);
                $('html').scrollTop(100000);
            } catch (error) {
                console.log("Error occurred: " + error);
            }
        })
        
        .catch(function(error) {
            console.log("Request failed: " + error);
            console.log("Fire Not Detected");
			$('#output').html("").append("Fire Accident Not Detected");

		});
	});
};


function sendEmail( ) {
	Email.send({
	  Host: "smtp.elasticemail.com",
	  Username: "bhushanbpatil3322@gmail.com",
	  Password: "3FBC67DE3AF96E6C74B932F884D5A95D949A",
	  To: "bhushanbpatil3322@gmail.com",
	  From: "bhushanbpatil3322@gmail.com",
	  Subject: "Fire Accident Detected",
	  Body: "An Fire accident has been detected with high confidence at latitude: 18.5153, longitude: 73.8217" 
	}).then(
	  message => alert("Email sent successfully")
	);
  }

var retrieveDefaultValuesFromLocalStorage = function() {
	try {
		var api_key = localStorage.getItem("rf.api_key");
		var model = localStorage.getItem("rf.model");
		var format = localStorage.getItem("rf.format");

		if (api_key) $('#api_key').val(api_key);
		if (model) $('#model').val(model);
		if (format) $('#format').val(format);
	} catch (e) {
		// localStorage disabled
	}

	$('#model').change(function() {
		localStorage.setItem('rf.model', $(this).val());
	});

	$('#api_key').change(function() {
		localStorage.setItem('rf.api_key', $(this).val());
	});

	$('#format').change(function() {
		localStorage.setItem('rf.format', $(this).val());
	});
};

var setupButtonListeners = function() {
	// run inference when the form is submitted
	$('#inputForm').submit(function() {
		infer();
		return false;
	});

	// make the buttons blue when clicked
	// and show the proper "Select file" or "Enter url" state
	$('.bttn').click(function() {
		$(this).parent().find('.bttn').removeClass('active');
		$(this).addClass('active');

		if($('#computerButton').hasClass('active')) {
			$('#fileSelectionContainer').show();
			$('#urlContainer').hide();
		} else {
			$('#fileSelectionContainer').hide();
			$('#urlContainer').show();
		}

		if($('#jsonButton').hasClass('active')) {
			$('#imageOptions').hide();
		} else {
			$('#imageOptions').show();
		}

		return false;
	});

	// wire styled button to hidden file input
	$('#fileMock').click(function() {
		$('#file').click();
	});

	// grab the filename when a file is selected
	$("#file").change(function() {
		var path = $(this).val().replace(/\\/g, "/");
		var parts = path.split("/");
		var filename = parts.pop();
		$('#fileName').val(filename);
	});
};

var getSettingsFromForm = function(cb) {
	var settings = {
		method: "POST",
	};

	var parts = [
		"https://classify.roboflow.com/",
		$('#model').val(),
		"/",
		$('#version').val(),
		"?api_key=" + $('#api_key').val()
	];

	var method = $('#method .active').attr('data-value');
	if(method == "upload") {
		var file = $('#file').get(0).files && $('#file').get(0).files.item(0);
		if(!file) return alert("Please select a file.");

		getBase64fromFile(file).then(function(base64image) {
			settings.url = parts.join("");
			settings.data = base64image;

			console.log(settings);
			cb(settings);
		});
	} else {
		var url = $('#url').val();
		if(!url) return alert("Please enter an image URL");

		parts.push("&image=" + encodeURIComponent(url));

		settings.url = parts.join("");
		console.log(settings);
		cb(settings);
	}
};

var getBase64fromFile = function(file) {
	return new Promise(function(resolve, reject) {
		var reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = function() {
		resizeImage(reader.result).then(function(resizedImage){
			resolve(resizedImage);
		});
    };
		reader.onerror = function(error) {
			reject(error);
		};
	});
};

var resizeImage = function(base64Str) {
	return new Promise(function(resolve, reject) {
		var img = new Image();
		img.src = base64Str;
		img.onload = function(){
			var canvas = document.createElement("canvas");
			var MAX_WIDTH = 1500;
			var MAX_HEIGHT = 1500;
			var width = img.width;
			var height = img.height;
			if (width > height) {
				if (width > MAX_WIDTH) {
					height *= MAX_WIDTH / width;
					width = MAX_WIDTH;
				}
			} else {
				if (height > MAX_HEIGHT) {
					width *= MAX_HEIGHT / height;
					height = MAX_HEIGHT;
				}
			}
			canvas.width = width;
			canvas.height = height;
			var ctx = canvas.getContext('2d');
			ctx.drawImage(img, 0, 0, width, height);
			resolve(canvas.toDataURL('image/jpeg', 1.0));  
		};
	});	
};


function makeAPICall(){
	var street = $('#street').val()
	var city = $('#city').val()
	var state = $('#state').val()
	var zip = $('#zip').val()

    var osmString = "http://nominatim.openstreetmap.org/search?street=" + street.replace(" ","+") + "&city=" + city + "&state= "+ state +"&postalcode="+ zip + "&format=json&addressdetails=1&limit=1"

		$.ajax({
		    url: osmString,
		    type: 'GET',
		    dataType:"json", 
		    success: function(data) {
		    	if(data.length == 0){
		    		badAddress();
		    	}
		    	else{	
			    	var lat = data[0].lat
			    	var lon = data[0].lon
			    	var fccString = "http://data.fcc.gov/api/block/find?format=jsonp&latitude=" + lat + "&longitude=" + lon + "&showall=true&callback=JSONPCallback"
			 
			    	var jsonp = {
				    callbackCounter: 0,
				 
					    fetch: function(url, callback) {
					        var fn = 'JSONPCallback_' + this.callbackCounter++;
					        window[fn] = this.evalJSONP(callback);
					        url = url.replace('=JSONPCallback', '=' + fn);
					 
					        var scriptTag = document.createElement('SCRIPT');
					        scriptTag.src = url;
					        document.getElementsByTagName('HEAD')[0].appendChild(scriptTag);
					    },
					 
					    evalJSONP: function(callback) {
					        return function(data) {
					            var validJSON = false;
					        if (typeof data == "string") {
					            try {validJSON = JSON.parse(data);} catch (e) {
					                /*invalid JSON*/}
					        } else {
					            validJSON = JSON.parse(JSON.stringify(data));
					                window.console && console.warn(
					                'response data was not a JSON string');
					            }
					            if (validJSON) {
					                callback(validJSON);
					            } else {
					                throw("JSONP call returned invalid or empty JSON");
					            }
					        }
					    }
					}

					jsonp.fetch(fccString, function(data) {
						showBurden(data)
						drawMap(lat,lon)
					});
				}
		    },
		    error: function() { console.log('Failed!'); }
		});
}

function drawMap(lat,lon){
	$("#fake-map").text(lat + ", " + lon)
}

function badAddress(){
	$("#fake-error").text(":(")
}

function showBurden(data){
	$("#fake-burden").text(data.Block.FIPS)
}



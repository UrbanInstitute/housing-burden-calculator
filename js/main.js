var burdenData;

function makeAPICall(){
	var street = $('#street').val()
	var city = $('#city').val()
	var state = $('#state').val()
	var zip = $('#zip').val()
	
	var rent = $('#rent').val()
	var income = $('#income').val()

	calculateBurden(rent,income)

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
			    	var fccString = "http://data.fcc.gov/api/block/find?format=jsonp&latitude=" + lat + "&longitude=" + lon + "&censusYear=2010&showall=true&callback=JSONPCallback"
			 
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

// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!! START OF FUNCTIONS FOR TIM TO WRITE !!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

function drawMap(lat,lon){
	$("#fake-map").text(lat + ", " + lon)
}

function badAddress(){
	$("#fake-error").text("Could not understand that address :(")
}

function badBurdenData(tractFIPS){
	$("#fake-error").text("FIPS code " + tractFIPS + " can not be found in our data :(")
}

function calculateBurden(rent,income){
	console.log("Doing some math with rent=" + rent + " and income="+income)
}

function showBurden(data){
	var fullFIPS = data.Block.FIPS
	var tractFIPS = fullFIPS.substring(0,fullFIPS.length - 4)
	tractFIPS = tractFIPS.replace(/^0+/, '');
	//Time, you can check out the console to see the full data object. Let me know if you need state, county, etc
	//(look at data.State.code or data.State.name, for example in the console)
	console.log("Address data returned from FCC:")
	console.log(data)

	var burden = burdenData[tractFIPS]
	if(typeof(burden) !== "undefined"){
		console.log("Urban data for tract " + tractFIPS + ":")
		console.log(burden)
	}
	else{
		badBurdenData(tractFIPS)
	}
}
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!! END OF FUNCTIONS FOR TIM TO WRITE !!!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!


$(document).ready(function() {
    $.ajax({
        type: "GET",
        url: "data/rentburden_tracts.csv",
        dataType: "text",
        success: function(data) {processData(data);}
     });
});

function processData(text) {
    var lines = text.split('\n');
    var header = lines.shift();
    var data = {};

    for (var i=0; i<lines.length; i++) {
        var line = lines[i].split(',')
        data[line[0]] = {
        	"burden1980": line[1],
        	"burden1990": line[2],
        	"burden2000": line[3],
        	"burden2010": line[4]
        }
    }
    burdenData = data;
}
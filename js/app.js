'use strict';

function mapsError() {
	alert("An error occured while loading the Map. Please reload the page and try again/open a issue at https://github.com/MagicMarvMan/Neighborhood-Map/issues.");
}

var defaultQuery = "";

var config = {
	locations: [
		{
			name: 'Roemerberg',
			lat: 50.110421,
			long: 8.68214
		},

		{
			name: 'Main-Tower',
			lat: 50.112557,
			long: 8.672145
		},

		{
			name: 'Goethe-House and Museum',
			lat: 50.111276,
			long: 8.677586
		},

		{
			name: 'Main-Station',
			lat: 50.107726,
			long: 8.664607
		},

		{
			name: 'Senckenberg Natural History Museum',
			lat: 50.117574,
			long: 8.651723
		},

		{
			name: 'The Frankfurt Museum of Modern Art',
			lat: 50.112022,
			long: 8.684780
		},

		{
			name: 'The Old Opera House',
			lat: 50.116046,
			long: 8.671895
		},

		{
			name: 'Zoo Frankfurt',
			lat: 50.116368,
			long: 8.699447
		},

		{
			name: 'St. Paul\'s Church',
			lat: 50.111228,
			long: 8.680736
		},

		{
			name: 'Palm Garden',
			lat: 50.123133,
			long: 8.656486
		}

	],
	map: {
		lat: 50.111221,
		long: 8.682562,
		zoom: 14
	},

	keys: {
		google: {
			// Place your key in the <script> tag in the index.html footer
		},

		foursquare {
			client_id: "PLTZT1HHN0Q20XAE5TRDFUPJLV3YKW4F5ZA00SJYPVTOHO5B",
			client_secret: "RMJKT5CTWVEIFUEKRSAAF01TTABE53IA2OU4IGA4ZRPL1TBV"
		}
	}
}


var map;
var allInfowindows = ko.observableArray([]);

var Location = function(data) {
	var self = this;

	this.name = data.name;
	this.lat = Number(data.lat);
	this.long = Number(data.long);
	this.phone = "Unknown";
	this.url = "#Unknown";
	this.hereNow = "Nobody here";
	$.getJSON("https://api.foursquare.com/v2/venues/search?client_id="+config.keys.foursquare.client_id+"&client_secret="+config.keys.foursquare.client_secret+"&v=20171228&ll="+self.lat+","+self.long+"&query="+self.name, function(data) {
		console.log(self.name+":");
		if(data.response.venues.length > 0) {
			console.log(data);
			console.log(data.response);
			console.log(data.response.venues[0]);
			if (typeof data.response.venues[0].url !== 'undefined') {
  				self.url = data.response.venues[0].url;
			}

			if(typeof data.response.venues[0].contact.formattedPhone !== 'undefined') {
				self.phone = data.response.venues[0].contact.formattedPhone;
			}

			if(typeof data.response.venues[0].hereNow.summary !== 'undefined') {
				self.hereNow = data.response.venues[0].hereNow.summary;
			}
		}
		
		
	});
/*
	$.ajax({
		url: "https://api.foursquare.com/v2/venues/search?client_id=PLTZT1HHN0Q20XAE5TRDFUPJLV3YKW4F5ZA00SJYPVTOHO5B&client_secret=RMJKT5CTWVEIFUEKRSAAF01TTABE53IA2OU4IGA4ZRPL1TBV&v=20171228&ll="+self.lat+","+self.long
	}).success(function(data) {
		console.log(data);
			if(data.response.venues[0].url.length >= 1) {
			self.url = data.response.venues[0].url;
		}

		if(data.response.venues[0].contact.formattedPhone.length >= 1) {
			self.phone = data.response.venues[0].contact.formattedPhone;
		}
	});

	*/


	console.log("Initialized "+this.name);
	console.log("Lat: "+this.lat);
	console.log("Long: "+this.long);

	this.isVisible = ko.observable(true);

	this.windowContent = '<div class="infwindowcon"><span class="tit"><b>'+data.name+'</b></span><center><br><span style="font-weight:bold;">Homepage:&nbsp;</span><a href="'+self.url+'" target="_blank">'+self.url+'</a><br><span style="font-weight:bold;">Phone:&nbsp;</span>'+self.phone+'<br><span style="font-weight:bold;">Here now:&nbsp;</span>'+self.hereNow+'</center></div>';
	this.infoWindow = new google.maps.InfoWindow({content: self.windowContent});
	allInfowindows().push(self.infoWindow);
	this.marker = new google.maps.Marker({
			position: {lat:Number(self.lat),lng:Number(self.long)},
			map: map,
			title: self.name
	});
	this.toggleMarker = ko.computed(function() {
		if(this.isVisible() === true) {
			this.marker.setMap(map);
		} else {
			this.marker.setMap(null);
		}
		return true;
	}, this);

	this.marker.addListener('click', function(){

		allInfowindows().forEach(function(e) {
			e.close();
		});

		self.contentString = '<div class="infwindowcon"><span class="tit"><b>'+data.name+'</b></span><center><br><span style="font-weight:bold;">Homepage:&nbsp;</span><a href="'+self.url+'" target="_blank">'+self.url+'</a><br><span style="font-weight:bold;">Phone:&nbsp;</span>'+self.phone+'<br><span style="font-weight:bold;">Here now:&nbsp;</span>'+self.hereNow+'</center></div>';
		self.infoWindow.setContent(self.contentString);
		self.infoWindow.open(map, this);
		self.marker.setAnimation(google.maps.Animation.BOUNCE);
      	setTimeout(function() {
      		self.marker.setAnimation(null);
     	}, 2100);
	});
	this.bounceMarker = function(place) {
		google.maps.event.trigger(self.marker, 'click');
	};

	this.toggleMarker();
}


function AppViewModel() {
	var self = this;

	map = new google.maps.Map(document.getElementById('map'), {
			zoom: config.map.zoom,
			center: {lat: config.map.lat, lng: config.map.long}
	});

	this.query = ko.observable(defaultQuery);
	this.locations = ko.observableArray([]);
	config.locations.forEach(function(e) {
		console.log(e.name);
		self.locations.push(new Location(e));
	});
	this.list = ko.computed(function() {
		var searchQuery = self.query().toLowerCase();
		if(!searchQuery) {
			self.locations().forEach(function(e) {
				e.isVisible(true);
			});
			return self.locations();
		} else {
			return ko.utils.arrayFilter(self.locations(),function(e) {
				var uneditedTitle = e.name.toLowerCase();
				var computedVisibility = (uneditedTitle.search(searchQuery) >= 0);
				e.isVisible(computedVisibility);
				return computedVisibility;
			});
		}
	},self);
	

	this.mapElem = document.getElementById('map');
	//this.mapElem.style.height = window.innerHeight - 50;
}

function startBootstrap() {
	ko.applyBindings(new AppViewModel());
}

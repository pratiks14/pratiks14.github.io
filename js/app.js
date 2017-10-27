var map;
//list of locations for markers in the map.
var locations = [{
		title: 'Wonderla Amusement Park',
		visible: true,
		filter: true,
		location: {
			lat: 12.834556,
			lng: 77.400972
		},
		icon: 'images/camping.png',
		favourite: false
	},
	{
		title: 'Iscon Temple Bangalore',
		visible: true,
		filter: true,
		location: {
			lat: 13.0096323,
			lng: 77.55107099999999
		},
		icon: 'images/temple.png',
		favourite: false
	},
	{
		title: 'UB City Bangalore',
		visible: true,
		filter: true,
		location: {
			lat: 12.9715895,
			lng: 77.59605859999999
		},
		icon: 'images/mall.png',
		favourite: false
	},
	{
		title: 'Art of Living Bangalore',
		visible: true,
		filter: true,
		location: {
			lat: 12.793013,
			lng: 77.5051502
		},
		icon: 'images/temple.png',
		favourite: false
	},
	{
		title: 'Lalbagh Botanical Garden',
		visible: true,
		filter: true,
		location: {
			lat: 12.9507432,
			lng: 77.5847773
		},
		icon: 'images/forest.png',
		favourite: false
	},
	{
		title: 'Cubbon Park',
		visible: true,
		filter: true,
		location: {
			lat: 12.9763472,
			lng: 77.59292839999999
		},
		icon: 'images/forest.png',
		favourite: false
	},
	{
		title: 'M. Chinnaswamy Stadium',
		visible: true,
		filter: true,
		location: {
			lat: 12.9788139,
			lng: 77.5995932
		},
		icon: 'images/stadium.png',
		favourite: false
	},
	{
		title: 'Commercial Street Bangalore',
		visible: true,
		filter: true,
		location: {
			lat: 12.9821663,
			lng: 77.6083553
		},
		icon: 'images/mall.png',
		favourite: false
	}
];


// @description object respresent a marker on the map.
// @constructor-
// @param {string} loc- represent a element in location list

var mark = function (loc) {
	var self = this;
	self.title = loc.title;
	self.latLng = loc.location;
	self.icon = loc.icon;
	self.visible = ko.observable(loc.visible);
	self.favourite = ko.observable(loc.favourite);
	self.filter = ko.observable(loc.filter);

};
var markers = [];

//knockout viewModel
//Containes set of observable elemnet and array
//viewModel object is databinded with the contents on the html page
var viewModel = function () {
	var self = this;
	self.selected_marker = ko.observable(null);
	self.marks = ko.observableArray($.map(locations, function (loc) {
		return new mark(loc);
	}));
	self.wiki = function () {
		var query = self.selected_marker().title.split(' ').join('+');
		var wikiLink = $('#wiki-link');
		var wikiRequestTimeout = setTimeout(function () {
			wikiLink.html('<li>The wikipedia links could not be fetched</li>');
		}, 8000);

		$.ajax({
			url: 'https://en.wikipedia.org/w/api.php?action=opensearch&search=' + query + '&format=json&callback=?',
			dataType: 'jsonp',
			success: function (response) {
				clearTimeout(wikiRequestTimeout);
				wikiLink.html('');
				if (response[1].length === 0) {
					wikiLink.append('<p>No Artciles Available</p>');
				} else {
					var titles = response[1];
					var urls = response[3];
					var contents = response[2];
					titles.forEach(function (title, id) {
						wikiLink.append('<li><a target="_blank" href="' + urls[id] + '">' + title + '</a><p>' + contents[id] + '</p></li>');
					});
				}
			},
			error: function (err) {
				console.error('An error has occurred');
			}
		});
	};
	//is true when an element is selected
	self.selected = false;
	//when an user clicks on an element in the list this is run
	self.enableCurrent = function (loc) {
		self.selected_marker(loc);
		self.selected = true;
		for (var i = 0; i < self.marks().length; i++) {
			if (self.marks()[i] === self.selected_marker()) {
				self.marks()[i].visible(true);
				continue;
			}
			self.marks()[i].visible(false);

		}
		var bounds = new google.maps.LatLngBounds();
		createMarkers(map, bounds);
		map.fitBounds(bounds);
		map.setZoom(14);
		self.wiki();

	};

	//this resets the zoom level and displays all the initial markers
	self.getInitial = function () {
		for (var i = 0; i < self.marks().length; i++) {
			self.marks()[i].visible(true);
		}
		var bounds = new google.maps.LatLngBounds();
		createMarkers(map, bounds);
		map.fitBounds(bounds);

	};

	//filter property used to filter marker based on user search option
	self.filteredMarks = ko.computed(function () {
		return ko.utils.arrayFilter(self.marks(), function (loc) {
			return loc.filter();
		});
	}, self);
	self.filtered = ko.observable(false);

	//flters the list availlable if the user has not yet selected a
	//destination else resets the filter list
	self.filterClick = function () {
		if (self.filtered() && self.selected) {
			self.unfilterClick();
		} else {
			var substr = $('#search-dest').val().toLowerCase();
			for (var i = 0; i < self.marks().length; i++) {
				if (self.marks()[i].title.toLowerCase().indexOf(substr) < 0) {
					self.marks()[i].filter(false);
				}
			}
			$('#filter').html('<img src="images/filter-applied.png">');
			self.filtered(true);
			self.selected = false;
		}

	};
	//this is called when filter has been clicked when user has already
	//selected an option
	self.unfilterClick = function () {
		for (var i = 0; i < self.marks().length; i++) {
			self.marks()[i].filter(true);
		}
		$('#filter').html('<img src="images/filter.png">');
		$('#search-dest').val('');
		self.filtered(false);
	};
};
var newvm = new viewModel();
ko.applyBindings(newvm);


//This is the callback function for google api
function initMap() {
	// Constructor creates a new map.
	map = new google.maps.Map(document.getElementById('map'), {
		center: {
			lat: 12.971594,
			lng: 77.594561
		},
		zoom: 8,
		mapTypeControl: false,
		zoomControl: true
	});

	var bounds = new google.maps.LatLngBounds();
	createMarkers(map, bounds);


	map.fitBounds(bounds);
}


//
// * @description creates a merker icon
// * @constructor
// * @param {string}  markerColor-color of the marker icon

function makeMarkerIcon(markerColor) {

	var markerImage = new google.maps.MarkerImage(
		'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' + markerColor +
		'|40|_|%E2%80%A2',
		new google.maps.Size(21, 25),
		new google.maps.Point(0, 0),
		new google.maps.Point(10, 34),
		new google.maps.Size(21, 34));
	return markerImage;
}

// /**
// * @description creates a marker and populate the infowindow
// * @constructor
// * @param {string} map - map for the marker to set
// * @param {string} bounds- used to adjust the display area  of the map
// */
function createMarkers(map, bounds) {
	for (var i = 0; i < newvm.marks().length; i++) {
		if (!markers[i] && newvm.marks()[i].visible()) {
			//this code is run when a initially markers are created
			var position = newvm.marks()[i].latLng;
			var title = newvm.marks()[i].title;
			var favourite = newvm.marks()[i].favourite;
			var defaultIcon = makeMarkerIcon('D3D3D3');
			// Create a marker per location, and put into markers array.
			var marker = new google.maps.Marker({
				position: position,
				title: title,
				animation: google.maps.Animation.DROP,
				id: i,
				icon: defaultIcon
			});
			markers[i] = marker;
			bounds.extend(position);
			marker.setMap(map);
			marker.addListener('click', populateInfoWindow);
			marker.addListener('mouseover', mouseoverFunc);

			marker.addListener('mouseout', mouseoutFunc);
		} else {
			if (newvm.marks()[i].visible()) {
				//for the marker which is selected
				markers[i].setMap(map);
				bounds.extend(markers[i].position);
			} else {
				//for marker which arebt selected
				markers[i].setMap(null);
			}
		}
	}

}

//This function changes the marker color cursor hovers above it
//no change if marker destination is favourite.
function mouseoutFunc() {
	var hoverIcon = makeMarkerIcon('D3D3D3');
	if (!newvm.marks()[this.id].favourite())
		this.setIcon(hoverIcon);
}

function mouseoverFunc() {
	var defaultIcon = makeMarkerIcon('FFFFFF');
	if (!newvm.marks()[this.id].favourite())
		this.setIcon(defaultIcon);
}


// * @description populated infowindow of the marker upon click
// * @constructor
// * @param {string} marker-the marker clicked on

function populateInfoWindow() {

	var infowindow = new google.maps.InfoWindow();
	// Check to make sure the infowindow is not already opened on this marker.
	var marker = this;
	if (infowindow.marker != marker) {
		infowindow.marker = marker;
		infowindow.open(map, marker);
		infowindow.setContent(marker.title);

		// Make sure the marker property is cleared if the infowindow is closed.
		infowindow.addListener('closeclick', function () {
			infowindow.marker = null;
		});
		//include street if availlable in the infowindow.
		//
		var getStreetView = function (data, status) {
			if (status == google.maps.StreetViewStatus.OK) {
				var nearStreetViewLocation = data.location.latLng;
				var heading = google.maps.geometry.spherical.computeHeading(nearStreetViewLocation, marker.position);
				infowindow.setContent('<div><a id="heart" href=""><img src="images/heart-empty.png"></a><h4>' + marker.title + ' <span><img src="' + newvm.marks()[marker.id].icon + '"></span></h4></div><div id="pano"></div>');
				var panoramaOptions = {
					position: nearStreetViewLocation,
					pov: {
						heading: heading,
						pitch: 30
					}
				};
				var panorama = new google.maps.StreetViewPanorama(
					document.getElementById('pano'), panoramaOptions);
			} else {
				infowindow.setContent('<div><a id="heart" href=""><img src="images/heart-empty.png"></a><h4>' + marker.title + '  <span><img src="' + newvm.marks()[marker.id].icon + '"></span></h4></div><div>No Street View Found</div>');
			}
			$('#heart').click(function (event) {
				event.preventDefault();
				var htmlstr;
				if (!newvm.marks()[marker.id].favourite()) {
					htmlstr = '<img src="images/heart.png">';
					newvm.marks()[marker.id].favourite(true);
					marker.setIcon(makeMarkerIcon('FF1493'));
				} else {
					htmlstr = '<img src="images/heart-empty.png">';
					newvm.marks()[marker.id].favourite(false);
					marker.setIcon(makeMarkerIcon('D3D3D3'));
				}
				$(this).html(htmlstr);
			});
		};
		var streetViewService = new google.maps.StreetViewService();
		var radius = 50;
		// Use streetview service to get the closest streetview image within
		// 50 meters of the markers position
		streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
		// Open the infowindow on the correct marker.
		infowindow.open(map, marker);
	}
}


//open the search window on click
$("#search-button").click(function () {
	$("#side-div").animate({
		width: "toggle"
	});

});

//open the wiki window on click
$("#wiki-button").click(function () {
	$(".wiki-panel").animate({
		width: "toggle"
	});

});

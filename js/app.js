var map;

// create a new blank array for all the course markers.
var markers = [];

var courses = [
    {title: 'Golden Gate Park DGC', location: {lat: 37.7713551, lng: -122.4870443}, city: "San_Francisco"},
    {title: 'Aquatic Park DGC', location: {lat: 37.8606053, lng: -122.3019786}, city: "Berkeley"},
    {title: 'Parque De La Raza', location: {lat: 37.2765672, lng: -121.8053173}, city: "San_Jose"},
    {title: 'Kelley Park', location: {lat: 37.3211456, lng: -121.8566618}, city: "San_Jose"},
    {title: 'Helleyer DGC', location: {lat: 37.2810901, lng: -121.8077479}, city: "San_Jose"},
    {title: 'Black Mouse', location: {lat: 37.0633611, lng: -122.0860058}, city: "Aptos"},
    {title: 'DeLaveaga DGC', location: {lat: 37.0052987, lng: -121.9982765}, city: "Santa_Cruz"},
    {title: 'UC Santa Cruz', location: {lat: 36.994260, lng: -122.053233}, city: "Santa_Cruz"},
    {title: 'Emerald Hills', location: {lat: 37.4537762, lng: -122.2665137}, city: "Redwood_City"},
    {title: 'Gleneagles', location: {lat: 37.712421, lng: -122.424261}, city: "San_Francisco"},
    {title: 'Chabot Park', location: {lat: 37.7155783, lng: -122.1026621}, city: "San_Leandro"},
    {title: 'Lake Chabot DGC', location: {lat: 37.7416161, lng: -122.1196805}, city: "San_Leandro"},
    {title: 'Stafford Lake', location: {lat: 38.1159232, lng: -122.650210}, city: "Novato"},
    {title: 'Moraga Commons Park', location: {lat: 37.8422489, lng: -122.1284099}, city: "Moraga"},
    {title: 'Old Ranch Park', location: {lat: 37.7348142, lng: -121.9202075}, city: "San_Ramon"},
    {title: 'Livermore DGC', location: {lat: 37.6701288, lng: -121.7525737}, city: "Livermore"},
    {title: 'Walden Park', location: {lat: 37.9139839, lng: -122.0804073}, city: "Walnut_Creek"},
    {title: 'Benicia Community Park', location: {lat: 38.0880603, lng: -122.1619546}, city: "Benicia"},
];


function initMap() {
    // Credit to samisel at Snazzymaps for the custom map style
    // https://snazzymaps.com/style/1243/xxxxxxxxxxx
    var styles = [
    {
        "featureType": "administrative.country",
        "elementType": "geometry",
        "stylers": [
            {
                "visibility": "simplified"
            },
            {
                "hue": "#ff0000"
            }
        ]
    }
];
    // Constructor creates a new map - only center and zoom are required.
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 37.534240, lng: -122.247775},
        zoom: 10,
        styles: styles,
        mapTypeControl: false
    });


    // instantiate knockout
    ko.applyBindings(new appViewModel());

}


function appViewModel() {
    var self = this;

    // create an array to list and filter our courses
    self.courseList = ko.observableArray([]);

    self.sortList = ko.computed(function () {
        return self.courseList.sort(function (left, right) {return left.title == right.title ? 0 : (left.title < right.title ? -1 : 1) });
    });

    self.courseSearch = ko.observable('');

    self.currentCourse = ko.observable(self.courseList()[0]);

    courses.forEach(function(courseInfo) {
        var course = new Course(courseInfo);

        self.courseList().push(course);

        // filter based on "list filter" example from w3schools
        course.isFiltered = ko.computed(function () {
            if (course.title().toUpperCase().indexOf(self.courseSearch().toUpperCase()) > -1) {
                showCourse(course);
                return true;
            } else {
                hideCourse(course);
                return false;
            }
        });

    });


    self.centerCourse = function(clickedCourse) {
        self.currentCourse(clickedCourse);
        map.panTo(clickedCourse.location());

        for (var i = 0; i < markers.length; i++) {
            if (clickedCourse.title() == markers[i].title) {
                console.log('ok');
                populateInfoWindow(markers[i], largeInfowindow);

            }
        }

    }

    // style the markers. This is our COURSE MARKER ICON
    // var defaultIcon = makeMarkerIcon('0091ff');
    var defaultIcon = {
        url: 'images/bluewhite.png',
        size: new google.maps.Size(31.5,51),
        origin: new google.maps.Point(0,0),
        anchor: new google.maps.Point(15.75,51),
        scaledSize: new google.maps.Size(31.5,51)
    };

    var highlightedIcon = {
        url: 'images/orangewhite.png',
        size: new google.maps.Size(31.5,51),
        origin: new google.maps.Point(0,0),
        anchor: new google.maps.Point(15.75,51),
        scaledSize: new google.maps.Size(31.5,51)
    };

    // create a "highlighted location" marker color for when the user mouses over it
    // var highlightedIcon = makeMarkerIcon('FFAA00');

    var largeInfowindow = new google.maps.InfoWindow();
    // the following group uses the location array to create an array of markers on initialize.
    for (var i = 0; i < courses.length; i++) {
        // get the position from the location array.
        var position = courses[i].location;
        var title = courses[i].title;
        var city = courses[i].city;
        // create a marker per location, and put into markers array.
        var marker = new google.maps.Marker({
            position: position,
            title: title,
            city: city,
            icon: defaultIcon,
            animation: google.maps.Animation.DROP,
            id: i
        });
        // push the marker to our array of markers.
        markers.push(marker);
        // create an onclick event to open an infowindow at each marker.
        marker.addListener('click', function() {
            populateInfoWindow(this, largeInfowindow);
            map.panTo(this.position);
        });
        // These two event listeners will change the color on mouseover and mouseout.
        marker.addListener('mouseover', function() {
            this.setIcon(highlightedIcon);
        });
        marker.addListener('mouseout', function() {
            this.setIcon(defaultIcon);
        });
    }

    // this function populates the infowindow when the marker is clicked. We will only allow
    // one infowindow which will open at the marker that is clicked, and populate based on
    // that marker's position
    function populateInfoWindow(marker, infowindow) {
        // check to make sure the infowindow is not already opened on this marker.
        if (infowindow.marker != marker) {
            infowindow.marker = marker;


            // This adds an error message to the infowindow if the weather API doesn't
            // load in time.
            var requestTimeout = setTimeout(function() {
                infowindow.setContent('<div><strong>' + marker.title +
                                      '</strong></div>' + 'Failed to' +
                                      ' load weather data.');
            }, 5000);

            jQuery(document).ready(function($) {
                // Thanks to Weather Underground for use of their free weather API!
                // api.wunderground.com
                $.ajax({
                    url: 'http://api.wunderground.com/api/da5a66ad7ce3d713/' +
                    'conditions/q/CA/' + marker.city + '.json',
                    dataType: "jsonp",
                    success: function(data) {
                        var conditions = data.current_observation.weather;
                        var temperature = data.current_observation.temperature_string;
                        infowindow.setContent('<div><strong>' + marker.title +
                                              '</strong></br>Weather: ' + conditions +
                                              '</br>' + temperature + '</div>');
                        clearTimeout(requestTimeout);
                    }
                });
            });

            infowindow.open(map, marker);
            // make sure the marker property is cleared if the infowindow is closed.
            infowindow.addListener('closeclick', function() {
                infowindow.marker(null);
            });
        }
    }

    // This function will loop through the markers array and display them all.
    function showCourses() {
        var bounds = new google.maps.LatLngBounds();
        // Extend the boundaries of the map for each marker and display the marker
        for (var i = 0; i < markers.length; i++) {
            markers[i].setMap(map);
            bounds.extend(markers[i].position);
        }
        map.fitBounds(bounds);
    }

    function showCourse(course) {
        //var bounds = new google.maps.LatLngBounds();
        for (var i = 0; i < markers.length; i++){
            //alert('for loop');
            if (course.title() == markers[i].title) {
                markers[i].setMap(map);
                //bounds.extend(markers[i].position);
            }
            //map.fitBounds(bounds);
        }
    }

    self.isVisible = ko.observable(false);
    self.toggle = function() {
        self.isVisible(!self.isVisible());
    };



    // // This function will loop through the listings and hide them all.
    function hideCourse(course) {
        for (var i = 0; i < markers.length; i++){
            if (course.title() == markers[i].title) {
                markers[i].setMap(null);
            }
        }
    }
    // this function takes in a color, then creates a new marker icon of that color.
    // The icon will be 21px by 34px, origin 0, anchored at 10,34).
    function makeMarkerIcon(markerColor) {
        var markerImage = new google.maps.MarkerImage(
            'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' + markerColor +
            '|40|_|%E2%80%A2',
            new google.maps.Size(21,34),
            new google.maps.Point(0,0),
            new google.maps.Point(10,34),
            new google.maps.Size(21,34));
        return markerImage;
    }


    // This displays all of our markers when the map is initialized
    showCourses();


}

function Course(courseInfo) {
    this.title = ko.observable(courseInfo.title);
    this.location = ko.observable(courseInfo.location);
}


var autocomplete,
  map,
  service,
  infoWindow,
  distance = 50000,
  markers = [],
  geolocation = {
    lat: 37.7749,
    lng: -122.4194 //San Francisco
  };
  
(function init() {
  getCurrentLocation();
  initAutocomplete();
  initMap();
})();

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: {
      lat: geolocation.lat,
      lng: geolocation.lng
    }
  });
  service = new google.maps.places.PlacesService(map);
  infoWindow = new google.maps.InfoWindow();
}

function initAutocomplete() {
  autocomplete = new google.maps.places.Autocomplete(
    (document.getElementById('autocomplete')), {
      types: ['geocode']
    });
  autocomplete.addListener('place_changed', addressSelected);
}

function getCurrentLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      geolocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      var circle = new google.maps.Circle({
        center: geolocation,
        radius: position.coords.accuracy
      });
      //bias auto complete to current location
      autocomplete.setBounds(circle.getBounds());
    });
  } else console.log("Location not provided");
}

function addressSelected() {
  //remove previous markers when a new address is selected.
  removeMarkers();
  address = autocomplete.getPlace();
  map.setCenter(address.geometry.location);
  var marker = new google.maps.Marker({
    map: map,
    label: 'A',
    position: address.geometry.location
  });
  markers.push(marker);
  geolocation = address.geometry.location;
}

function setBounds(val) {
  distance = val * 1000;
}

function performSearch() {
  var request = {
    location: geolocation,
    radius: distance,
    type: 'restaurant'
  };
  service.radarSearch(request, callback);
}

function callback(results, status) {
  if (status !== google.maps.places.PlacesServiceStatus.OK) {
    return;
  }
  for (var i = 0, result; result = results[i]; i++) {
    addMarker(result);
  }
}

function addMarker(place) {
  marker = new google.maps.Marker({
    map: map,
    position: place.geometry.location
  });
  google.maps.event.addListener(marker, 'click', function() {
    service.getDetails(place, function(result, status) {
      if (status !== google.maps.places.PlacesServiceStatus.OK) {
        return;
      }
      infoWindow.setContent(result.name);
      infoWindow.open(map, this.marker);
    });
  });
}

function removeMarkers() {
  markers.forEach((marker) => marker.setMap(null));
}

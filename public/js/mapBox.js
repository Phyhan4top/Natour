console.log('Hello from the client :D')
const locations = JSON.parse(document.getElementById('map').dataset.location)
console.log(locations)

 mapboxgl.accessToken =
   'pk.eyJ1Ijoiam9uYXNzY2htZWR0bWFubiIsImEiOiJjam54ZmM5N3gwNjAzM3dtZDNxYTVlMnd2In0.ytpI7V7w7cyT1Kq5rT9Z1A';

  const map = new mapboxgl.Map({
          container: 'map',
          style: 'mapbox://styles/jonasschmedtmann/cjnxfn3zk7bj52rpegdltx58h',
          scrollZoom: false,
  });
        
  const bounds = new mapboxgl.LngLatBounds();

locations.forEach(function (marker) {
    var el = document.createElement('div');
    el.className = 'marker';

    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom',
    })
      .setLngLat(marker.coordinates)
      .addTo(map);

    new mapboxgl.Popup({
      offset: 30,
      closeOnClick: false,
    })
      .setLngLat(marker.coordinates)
      .setHTML('<p>' + marker.description + '</p>')
      .addTo(map);

    bounds.extend(marker.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 50,
      right: 50,
    },
  });

  map.on('load', function () {
    map.addLayer({
      id: 'route',
      type: 'line',
      source: {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: [
              [-112.987418, 37.198125],
              [-111.376161, 36.86438],
              [-112.115763, 36.058973],
              [-116.107963, 34.011646],
            ],
          },
        },
      },
      layout: {
        'line-join': 'round',
        'line-cap': 'round',
      },
      paint: {
        'line-color': '#55c57a',
        'line-opacity': 0.6,
        'line-width': 3,
      },
    });
  });
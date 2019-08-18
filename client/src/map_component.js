/* global fetch, L */
import React, {useEffect, useRef, useState} from 'react';
import Moment from 'moment';

// new component wich will help us to pick a datetime
import DateTimePicker from 'react-datetime-picker';

const getRouteSummary = (locations) => {
  const to = Moment(locations[0].time).format('hh:mm DD.MM');
  const from = Moment(locations[locations.length - 1].time).format('hh:mm DD.MM');
  return `${from} - ${to}`;
}

const MapComponent = () => {
  const map = useRef();
  const [trips,
    setTrips] = useState();
  const [dateTime,
    setDateTime] = useState();
  const [marker,
    setMarker] = useState();
  // Request location data.
  useEffect(() => {
    setDateTime(new Date());
    fetch('http://localhost:3000')
      .then(response => response.json())
      .then((json) => {
        setTrips(json)
      });
  }, []);

  // Initialize map.
  useEffect(() => {
    map.current = new L.Map('mapid');
    const osmUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    const attribution = 'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors';
    const osm = new L.TileLayer(osmUrl, {
      minZoom: 8,
      maxZoom: 12,
      attribution
    });
    map
      .current
      .setView(new L.LatLng(52.51, 13.40), 9);
    map
      .current
      .addLayer(osm);
  }, []);

  // Update location data on map.
  useEffect(() => {
    if (!map.current || !trips) {
      return // If map or locations not loaded yet.
    }
    // TODO(Task 1): Replace the single red polyline by the different segments on
    // the map. to be removed in the return
    const allPolylines = [];

    // loop over thr trips and and a polyline for every trip
    trips.forEach(trip => {
      // generate a random number from stackover flow
      const randomColor = '#' + Math.floor(Math.random() * (111111 + 999999) - 111111);

      const latlons = trip.map(({lat, lon}) => [lat, lon]);

      const polyline = L
        .polyline(latlons, {color: randomColor})
        .bindPopup(getRouteSummary(trip));

      allPolylines.push(polyline);

      polyline.addTo(map.current);

      map
        .current
        .fitBounds(polyline.getBounds());
    });

    return () => allPolylines.forEach(polyne => {
      map
        .current
        .remove(polyline);
    });
  }, [trips, map.current]);

  // TODO(Task 2): Request location closest to specified datetime from the
  // back-end.
  function dateTimeSelected(dateTime) {
    setDateTime(dateTime);

    // remove the old marker
    if (marker) {
      map
        .current
        .removeLayer(marker);
    }

    if (!dateTime) {
      return;
    }

    fetch('http://localhost:3000/location/' + dateTime.getTime())
      .then(response => response.json())
      .then((json) => {
        const newMarker = L.marker([json.lat, json.lon]);
        // to be removed if a new marker selected
        setMarker(newMarker);
        newMarker.addTo(map.current);
      });
  };

  return (
    <div>
      {(trips && trips.length && trips[0] && trips[0].length) && <DateTimePicker
        onChange={dateTimeSelected}
        value={dateTime}
        minDate={new Date(trips[0][0].time)}
        maxDate={new Date()}/>}
      {trips && ` - ${trips.length} trips loaded`}
      {!trips && 'Loading...'}
      <div id='mapid'/>
    </div>
  );
}

export default MapComponent;

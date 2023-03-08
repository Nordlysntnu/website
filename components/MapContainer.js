import React, { useState } from 'react'
import { GoogleMap, LoadScript, DirectionsService, DirectionsRenderer, Marker } from '@react-google-maps/api'


const containerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '1em',
  overflow: 'hidden',
}

const center = {
    lat: -26.1772288,
    lng: 133.4170119
}

const origin = 'Darwin'

const destination = 'Adelaide'

export default  function MapContainer() {
  const [state, setState] = useState({
    response: null,
    travelMode: 'DRIVING',
    origin: '',
    destination: ''
  })

  function directionsCallback(response) {
    if (response !== null) {
      if (response.status === 'OK') {
        setState(
          () => ({
            response
          })
        )
      } else {
        console.log('response: ', response)
      }
    }
  }

  return (
    <LoadScript
      googleMapsApiKey="AIzaSyDI3QEbA9Cg2FiepzjoWmKFOTQw7aW6deQ"
      styles={{height: '100%'}}
      mapIds={['87b161701f01efe']}
    >
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        options={{
          controls: 'none',
          mapId: '87b161701f01efe',
        }}
        zoom={2}
      >
        <DirectionsService
                  // required
                  options={{ // eslint-disable-line react-perf/jsx-no-new-object-as-prop
                    destination: destination,
                    origin: origin,
                    travelMode: 'DRIVING'
                  }}
                  // required
                  callback={directionsCallback}
                />
        <DirectionsRenderer
                  // required
                  options={{ // eslint-disable-line react-perf/jsx-no-new-object-as-prop
                    directions: state.response,
                    suppressMarkers: true
                  }}
                />
        <Marker position={{lat: -12.462827, lng: 130.841782}} />
        <Marker position={{lat: -34.921230, lng: 138.599503}} />
      </GoogleMap>
    </LoadScript>
  )
}
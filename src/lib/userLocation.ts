async function getLocationFromIP() {
  try {
    // Using a free IP geolocation service
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    console.log('LOCATION DATa', data);
    return {
      city: data.city,
      country: data.country_name,
      latitude: data.latitude,
      longitude: data.longitude,
    };
  } catch (error) {
    console.log('Error getting location from IP:', error);
    return null;
  }
}

export const getUserLocation = () =>
  new Promise<{
    latitude: number;
    longitude: number;
  }>((res, rej) => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          const accuracy = position.coords.accuracy; // in meters

          console.log(
            `Location: ${latitude}, ${longitude} (accuracy: ${accuracy}m)`
          );

          res({
            latitude,
            longitude,
          });
        },

        (error) => {
          getLocationFromIP().then((loc) => {
            if (loc) {
              res({
                latitude: loc.latitude,
                longitude: loc.longitude,
              });
            } else {
              rej('Cant get location');
            }
          });
          switch (error.code) {
            case error.PERMISSION_DENIED:
              console.log('User denied the request for geolocation');
              break;
            case error.POSITION_UNAVAILABLE:
              console.log('Location information is unavailable');
              break;
            case error.TIMEOUT:
              console.log('The request to get user location timed out');
              break;
            default:
              console.log('An unknown error occurred');
              break;
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );
    } else {
      getLocationFromIP().then((loc) => {
        if (loc) {
          res({
            latitude: loc.latitude,
            longitude: loc.longitude,
          });
        } else {
          rej('Cant get location');
        }
      });
      console.log('Geolocation is not supported by this browser');
    }
  });

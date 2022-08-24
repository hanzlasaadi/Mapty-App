'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

//Global Variables to avoid errors
let map;
let mapEvent;

//Get current location from the browser
//for old browsers
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    function (position) {
      console.log(position);
      const { latitude, longitude } = position.coords;
      console.log(latitude, longitude);

      //Using Leaflet library to display a map
      map = L.map('map').setView([latitude, longitude], 13);
      //"l" is a namespace just like {intl} that gives us certain methods such as map, tilelayer, marker
      L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      //   console.log(map);
      //ON is the map's own method which it inherits from its prototype chain.
      //Handling clicks on map
      map.on('click', function (mapClickEvent) {
        mapEvent = mapClickEvent; //attribute copying to global variable

        form.classList.remove('hidden');
        inputDistance.focus();
      });
    },
    function () {
      alert('No position');
    }
  );
}

//when the form is submitted, this happens
form.addEventListener('submit', function (e) {
  e.preventDefault();

  //input fields are emptied when form submits
  inputCadence.value =
    inputDistance.value =
    inputDuration.value =
    inputElevation.value =
      '';

  const { lat, lng } = mapEvent.latlng; //destructuring lat & lng from "map click event"
  L.marker([lat, lng])
    .addTo(map)
    .bindPopup(
      L.popup({
        maxWidth: 200,
        minWidth: 100,
        autoClose: false,
        closeOnClick: false,
        className: 'running-popup',
      })
    )
    .setPopupContent('Workout happening')
    .openPopup();
});

//Change cadence/elevation for running/cycling
inputType.addEventListener('change', function () {
  inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
  inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
});

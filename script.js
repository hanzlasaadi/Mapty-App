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

class Workout {
  //properties
  date = new Date();
  id = (Date.now() + '').slice(-10);

  constructor(coords, distance, duration) {
    this.coords = coords; //[lat, lng]
    this.distance = distance; // km
    this.duration = duration; // min
  }
}

class Running extends Workout {
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
  }

  calcPace() {
    this.pace = this.duration / this.distance;
  }
}

class Cycling extends Workout {
  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    this.calcSpeed();
  }

  calcSpeed() {
    this.speed = this.distance / this.duration;
  }
}

const run1 = new Running([34, 56], 76, 12, 6);
const cyc1 = new Cycling([34, 56], 66, 22, 8);
console.log(run1, cyc1);

class App {
  //Global Variables to avoid errors
  #map;
  #mapEvent;

  constructor() {
    this._getPosition();
    //when the form is submitted, this happens
    form.addEventListener('submit', this._newWorkout.bind(this));
    //Change cadence/elevation for running/cycling
    inputType.addEventListener('change', this._toggleElevationField);
  }

  //Defining Methods
  _getPosition() {
    //Get current location from the browser
    //for old browsers
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this), //success
        //fail
        function fail(err) {
          alert(
            `No position, error: ${err.code}, error message: ${err.message}`
          );
        }
      );
    }
  }

  _loadMap(position) {
    console.log('position parameter: ', position);
    const { latitude, longitude, accuracy } = position.coords;
    // const { accuracy } = position.coords;
    console.log(latitude, longitude);
    console.log('Accuracy(meters): ', accuracy);

    //Using Leaflet library to display a map
    this.#map = L.map('map').setView([latitude, longitude], 13);
    //"l" is a namespace just like {intl} that gives us certain methods such as map, tilelayer, marker
    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    //   console.log(map);
    //ON is the map's own method which it inherits from its prototype chain.
    //Handling clicks on map
    this.#map.on('click', this._showForm.bind(this));
  }

  _showForm(mapClickEvent) {
    this.#mapEvent = mapClickEvent; //attribute copying to global variable

    form.classList.remove('hidden');
    inputDistance.focus();
  }

  _toggleElevationField() {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }

  _newWorkout(e) {
    e.preventDefault();

    //input fields are emptied when form submits
    inputCadence.value =
      inputDistance.value =
      inputDuration.value =
      inputElevation.value =
        '';

    const { lat, lng } = this.#mapEvent.latlng; //destructuring lat & lng from "map click event"
    L.marker([lat, lng])
      .addTo(this.#map)
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
  }
}

//creating instance
const theFuckingApp = new App();

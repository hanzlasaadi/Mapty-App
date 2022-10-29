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
  #workouts = [];
  #capitalize = string => string.charAt(0).toUpperCase() + string.slice(1);

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
    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png').addTo(
      this.#map
    );

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

    const validity = (...inputs) => inputs.every(val => Number.isFinite(val));
    const positivity = (...inputs) => inputs.every(val => val > 0);

    // get data from form
    const type = inputType.value;
    const distance = Number(inputDistance.value);
    const duration = Number(inputDuration.value);
    // some variables
    const { lat, lng } = this.#mapEvent.latlng; //destructuring lat & lng from "map click event"
    let workout;

    // if input running, create running object
    if (type === 'running') {
      const cadence = Number(inputCadence.value);

      //data validity
      if (
        !validity(distance, duration, cadence) ||
        !positivity(distance, duration, cadence)
      )
        return alert('Enter valid numbers. Please!!!');

      workout = new Running([lat, lng], distance, duration, cadence);
      console.log(workout);
    }
    // if input cycling, then create cycling object
    if (type === 'cycling') {
      const elevation = Number(inputElevation.value);

      //data validity
      if (
        !validity(distance, duration, elevation) ||
        !positivity(distance, duration)
      )
        return alert('Enter valid numbers. Please!!!');

      workout = new Cycling([lat, lng], distance, duration, elevation);
      console.log(workout);
    }

    // add new object to workout array
    this.#workouts.push(workout);

    // render workout on map as marker
    L.marker([lat, lng])
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 200,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${type}-popup`,
        })
      )
      .setPopupContent(`${this.#capitalize(type)} happening`)
      .openPopup();

    // render workout as a list

    // hide form and clear input fields

    //input fields are emptied when form submits
    inputCadence.value =
      inputDistance.value =
      inputDuration.value =
      inputElevation.value =
        '';
  }
}

//creating instance
const theFuckingApp = new App();

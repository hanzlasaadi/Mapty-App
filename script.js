'use strict';

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

  _setDescription() {
    // prettier-ignore
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
      months[this.date.getMonth()]
    } ${this.date.getDate()}`;
  }
}

class Running extends Workout {
  type = 'running';
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
    this._setDescription();
  }

  calcPace() {
    this.pace = this.duration / this.distance; // pace(1/v) = t/s -- potential energy
  }
}

class Cycling extends Workout {
  type = 'cycling';
  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    this.calcSpeed();
    this._setDescription();
  }

  calcSpeed() {
    this.speed = this.distance / this.duration; // v = s/t -- kinetic energy
  }
}

// const run1 = new Running([34, 56], 76, 12, 6);
// const cyc1 = new Cycling([34, 56], 66, 22, 8);
// console.log(run1, cyc1);

class App {
  //Global Variables to avoid errors
  #map;
  #mapEvent;
  #workouts = [];
  #coords;
  #capitalize = string => string.charAt(0).toUpperCase() + string.slice(1);

  constructor() {
    this._getPosition();
    //when the form is submitted, this happens
    form.addEventListener('submit', this._newWorkout.bind(this));
    //Change cadence/elevation for running/cycling
    inputType.addEventListener('change', this._toggleElevationField);
    //adding an event listener to the list to move the map to the specific marker
    containerWorkouts.addEventListener('click', this._moveToMarker.bind(this));
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
    // console.log('position parameter: ', position);
    const { latitude, longitude, accuracy } = position.coords;
    // const { accuracy } = position.coords;
    // console.log(latitude, longitude);
    // console.log('Accuracy(meters): ', accuracy);

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

  _hideForm() {
    // prettier-ignore
    inputCadence.value = inputDistance.value = inputDuration.value = inputElevation.value = '';

    form.style.display = 'none';
    form.classList.add('hidden');
    setTimeout(() => {
      form.style.display = 'grid';
    }, 1000);
  }

  _toggleElevationField() {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }

  _newWorkout(e) {
    e.preventDefault();

    const validity = (...inputs) => inputs.every(val => Number.isFinite(val)); //check if inputs aren't NaN
    const positivity = (...inputs) => inputs.every(val => val > 0); //check if inputs aren't 0

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
      // console.log(workout);
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
      // console.log(workout);
      this.#coords = workout.coords;
      // console.log('cords', workout.coords);
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
      .setPopupContent(
        `${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'} ${workout.description}`
      )
      .openPopup();

    // render workout as a list
    this._renderWorkoutList(workout);

    // hide form and clear input fields
    this._hideForm();
  }

  _renderWorkoutList(workout) {
    let html = `
        <li class="workout workout--${workout.type}" data-id="${workout.id}">
          <h2 class="workout__title">${workout.description}</h2>
          <div class="workout__details">
            <span class="workout__icon">${
              workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'
            }</span>
            <span class="workout__value">${workout.distance}</span>
            <span class="workout__unit">km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${workout.duration}</span>
            <span class="workout__unit">min</span>
          </div>
    `;

    if (workout.type === 'running') {
      html += `
          <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.pace.toFixed(1)}</span>
            <span class="workout__unit">min/km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">🦶🏼</span>
            <span class="workout__value">${workout.cadence}</span>
            <span class="workout__unit">spm</span>
          </div>
        </li>
      `;
    }

    if (workout.type === 'cycling') {
      html += `
          <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.speed}</span>
            <span class="workout__unit">km/h</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⛰</span>
            <span class="workout__value">${workout.elevationGain}</span>
            <span class="workout__unit">m</span>
          </div>
        </li>
      `;
    }

    //add this html element after the first element EACH TIME
    form.insertAdjacentHTML('afterend', html);
  }

  _moveToMarker(e) {
    const workoutEl = e.target.closest('.workout');

    if (!workoutEl) return;

    //find the clicked workout;
    const workout = this.#workouts.find(
      work => work.id === workoutEl.dataset.id
    );

    //zooming into the clicked workout
    this.#map.setView(workout.coords, 13, {
      animate: true,
      pan: {
        duration: 1,
      },
    });
  }
}

//creating instance
const theFuckingApp = new App();

let MAX_FALL_HEIGHT_METERS = 100;
let INITIAL_HEIGHT_METERS = 50;
//Body related variables
let myfallBody;
let bottomBarrier;
let timerFont;
//Drawing related variables
let framerate = 120;
let canvasWidth = 350;
let barrierHeightPx = 30;
let canvasHeight = 530;
let fallHeightPx = canvasHeight - barrierHeightPx;
let worldScale = MAX_FALL_HEIGHT_METERS / fallHeightPx;
let startingPointPx = canvasHeight - INITIAL_HEIGHT_METERS / worldScale - barrierHeightPx;

let bg;
let strokeColour = 'black';

//World configuration
let velShow = false;
let worldData = {
  gravity: 10,
  planet: 'earth',
  initialVelocity: 0,
  initialVelocityUn: 'ms',
  bodyMass: 1,
  bodyMassUn: 'kg',
  fallHeight: 10,
};
//Document utilities
let fallButton = document.getElementById('fall-button');
let resetButton = document.getElementById('reset-button');
let objectMass = document.getElementById('object-mass-input');
let initialVelocity = document.getElementById('initial-velocity-input');
let initialVelocityCheck = document.getElementById('initial-velocity-check');
let showVelocity = document.getElementById('show-velocity-check');
let showEnergy = document.getElementById('show-energy-check');
let fallHeightRange = document.getElementById('height-slider');
let earthIcon = document.getElementById('earth-icon');
let marsIcon = document.getElementById('mars-icon');
let jupiterIcon = document.getElementById('jupiter-icon');
let moonIcon = document.getElementById('moon-icon');

function setup() {
  //initializing canvas for drawing the simulation
  let canvas;
  canvas = createCanvas(canvasWidth, canvasHeight);
  width = canvasWidth;
  height = canvasHeight;
  canvas.parent('sketch-holder');
  bg = loadImage('assets\\img\\earth.png');
  frameRate(framerate);

  //------------------------------------------------
  //Creating instances for bottom barrier and fall body
  bottomBarrier = new Barrier(0, height - 30, width, height - 30);
  myfallBody = new fallBody(null, null, null, null, null, true);
  //-----------------------------------------------
  //Defining the worldScale, used in calculations.
  //The cauculation of the velocity of the body, depends on it's position, which is measured in
  // meters. The rendering of the animation, on the other hand, is measured in pixels. Therefore, we
  // need to define a scale (m/px) to use in defining the position of the body on the screen.
  //------------------------------------------------
}

function preload() {
  timerFont = loadFont('assets\\fonts\\Roboto-Thin.ttf');
}

function draw() {
  background(bg);
  myfallBody.show();
  myfallBody.update();
  fill('#DFDCE3');
}

fallButton.addEventListener('click', () => {
  createFallBody(showVelocity.checked, showEnergy.checked);
  startFall();
});

fallHeightRange.addEventListener('change', () => {
  worldData.fallHeight = fallHeightRange.value;
  startingPointPx = canvasHeight - fallHeightRange.value / worldScale - 30;
  myfallBody.setY(startingPointPx - 30);
  // worldScale = worldData.fallHeight / fallHeightPx;
});

showVelocity.addEventListener('change', () => {
  if (showVelocity.checked) {
    myfallBody.showVel();
  } else {
    myfallBody.hideVel();
  }
});

showEnergy.addEventListener('change', () => {
  if (showEnergy.checked) {
    myfallBody.showEn();
  } else {
    myfallBody.hideEn();
  }
});

resetButton.addEventListener('click', () => {
  createFallBody(showVelocity.checked, showEnergy.checked);
});

earthIcon.addEventListener('click', () => {
  earthIcon.classList.add('selected');
  marsIcon.classList.remove('selected');
  jupiterIcon.classList.remove('selected');
  moonIcon.classList.remove('selected');
  worldData.planet = 'earth';
  worldData.gravity = 10;
  bg = loadImage('assets\\img\\' + worldData.planet + '.png');
  strokeColour = 'black';
});

marsIcon.addEventListener('click', () => {
  earthIcon.classList.remove('selected');
  marsIcon.classList.add('selected');
  jupiterIcon.classList.remove('selected');
  moonIcon.classList.remove('selected');
  worldData.planet = 'mars';
  worldData.gravity = 4;
  bg = loadImage('assets\\img\\' + worldData.planet + '.png');
  strokeColour = 'white';
});

jupiterIcon.addEventListener('click', () => {
  earthIcon.classList.remove('selected');
  marsIcon.classList.remove('selected');
  jupiterIcon.classList.add('selected');
  moonIcon.classList.remove('selected');
  worldData.planet = 'jupiter';
  worldData.gravity = 25;
  bg = loadImage('assets\\img\\' + worldData.planet + '.png');
  strokeColour = 'black';
});

moonIcon.addEventListener('click', () => {
  earthIcon.classList.remove('selected');
  marsIcon.classList.remove('selected');
  jupiterIcon.classList.remove('selected');
  moonIcon.classList.add('selected');
  worldData.planet = 'moon';
  worldData.gravity = 1.6;
  bg = loadImage('assets\\img\\' + worldData.planet + '.png');
  strokeColour = 'white';
});

function cookieParser(cookieString) {
  if (!cookieString) {
    return null;
  }
  let stringToParse = cookieString;
  let stringArray = stringToParse.split(';');
  let cookies = {};
  for (let string of stringArray) {
    let key = string.split('=')[0];
    key = key.trim();
    let value = string.split('=')[1];
    value = value.trim();
    cookies[key] = value;
  }
  return cookies;
}

function createFallBody(showVel, showEn) {
  let bodyMass;
  worldData.bodyMass = objectMass.value.replace(/\D+/g, '');
  if (worldData.bodyMass == '') {
    worldData.bodyMass = 1;
  }
  switch (worldData.bodyMassUn) {
    case 'kg':
      bodyMass = worldData.bodyMass;
      break;
    case 'g':
      bodyMass = worldData.bodyMass / 1000;
      break;
    case 'ton':
      bodyMass = worldData.bodyMass * 1000;
      break;
    default:
      bodyMass = worldData.bodyMass;
      break;
  }
  myfallBody = new fallBody(bodyMass, null, null, null, null, !showVel, !showEn);
}

function startFall() {
  let initialVel;

  if (initialVelocityCheck.checked) {
    worldData.initialVelocity = parseFloat(initialVelocity.value.replace(/\D+/g, ''));
    switch (worldData.initialVelocityUn) {
      case 'ms':
        initialVel = worldData.initialVelocity;
        break;
      case 'kh':
        initialVel = worldData.initialVelocity / 3.6;
        break;
      case 'ks':
        initialVel = worldData.initialVelocity * 1000;
      default:
        initialVel = worldData.initialVelocity;
    }
  } else {
    initialVel = 0;
  }
  myfallBody.fall(initialVel);
}

document.addEventListener('keypress', function(e){
  console.log("aa")
  if(e.key == ' '){
    console.log("SPACE!");
    fallButton.click();
  }
})

function deleteAllCookies() {
  var cookies = document.cookie.split(';');
  for (var i = 0; i < cookies.length; i++) {
    var cookie = cookies[i];
    var eqPos = cookie.indexOf('=');
    var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
    document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT';
  }
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function roundIt(value, precision) {
  var multiplier = Math.pow(10, precision || 0);
  return Math.round(value * multiplier) / multiplier;
}

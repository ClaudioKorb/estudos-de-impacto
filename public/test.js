let MAX_HEIGHT_METERS = 30;
let BOTTOM_BARRIER_HEIGHT_PX = 30;
let socket; //socket used to send data to the server

//Body related variables
let myfallBody;
let bottomBarrier;

//Drawing related variables
let framerate = 120;
let canvasWidth = window.innerWidth - 10 > 400 ? 400 : window.innerWidth - 10;
let barrierHeightPx = BOTTOM_BARRIER_HEIGHT_PX;
let canvasHeight = 660;
let fallHeightPx = canvasHeight - barrierHeightPx;
let worldScale = MAX_HEIGHT_METERS / fallHeightPx;
let startingPointPx = canvasHeight - MAX_HEIGHT_METERS / worldScale - barrierHeightPx;

let bg;
let strokeColour = 'black';


//World configuration
let worldData = {
  gravity: 10,
  planet: 'earth',
  initialVelocity: 0,
  initialVelocityUn: 'ms',
  bodyMass: 80,
  bodyMassUn: 'kg',
  fallHeight: 2,
};
//Document utilities
let questionTitle = document.getElementById('question-title');
let questionBody = document.getElementById('question-body');
let submitAnswer = document.getElementById('submit-answer');
let startTest = document.getElementById('startButton');
let cardDisplay = document.getElementById('card-div');
let drawDisplay = document.getElementById('sketch-div');
let nextButtonDisplay = document.getElementById('next-button-div');
let replayButton = document.getElementById('replay-div');
let logoutButton = document.getElementById('logout-button');
let exitButton = document.getElementById('exit-button');
let answerRadios = [
  document.getElementById('radio-answer-1'),
  document.getElementById('radio-answer-2'),
  document.getElementById('radio-answer-3'),
  document.getElementById('radio-answer-4'),
  document.getElementById('radio-answer-5'),
];
//    let numberRootButton = document.getElementById('submit-number');
//Boolean control variables
let simulating = false;
let fim = false;
//Client related variables
let myQuestions;
let currentQuestion = 0;
let myID = '';
let cookies;
let gotGrade = false;
//
function setup() {
  //socket = io.connect('http://localhost:3000');
  //Parsing session cookies into dictionary for easy manipulation
  cookies = cookieParser(document.cookie);
  //If user is not logged in, redirect him to login page
  if (!document.cookie) {
    window.location.replace('/index.html');
  }
  //-------------------------------------------------------------
  //connecting socket to server
  myID = cookies['studentID'];
  socket = io.connect(document.location.origin);
  //verifying if client has already finished the test
  if (document.cookie.includes('fim=sim')) {
    showEndOfTest();
    if (!gotGrade) {
      socket.emit('endTest', myID);
    }
  }
  //initializing canvas for drawing the simulation
  let canvas;
  canvas = createCanvas(canvasWidth, canvasHeight);
  width = canvasWidth;
  height = canvasHeight;
  canvas.parent('sketch-holder');
  bg = loadImage('assets\\img\\earth.png');
  frameRate(framerate);
  //-----------------------------------------------
  //Defining variables for the texts shown on the sketch screen
  textSize(18);
  //------------------------------------------------
  //Creating instances for bottom barrier and fall body
  bottomBarrier = new Barrier(0, height - barrierHeightPx, width, height - barrierHeightPx);
  myfallBody = new fallBody(null, null, null, null, null, true);
  //-----------------------------------------------
  //Defining the scale, used in calculations.
  //The cauculation of the velocity of the body, depends on it's position, which is measured in
  // meters. The rendering of the animation, on the other hand, is measured in pixels. Therefore, we
  // need to define a scale (m/px) to use in defining the position of the body on the screen.
  scale = worldData.fallHeight / fallHeightPx;
  //------------------------------------------------
  let studentData = {
    name: cookies['nome'],
    id: myID,
  };
  socket.emit('newStudent', studentData);
  // When the client gets a message called 'yourQuestions', it means that the server is sending the
  // state of the questions of the client. It might be the first time the client gets it's questions or not
  socket.on('yourQuestions', function (data) {
    gotQuestions = true;
    if (data) {
      myQuestions = data;
      changeQuestion();
    } else {
      alert('Falha no sistema. Favor atualizar a página!');
    }
  });

  socket.on('checkAnswer', function (msgData) {
    changeWorldParameters(myQuestions.questionData[myQuestions.currentQuestion].experimentData);
    createFallBody();
    showSketch();
    if (msgData.correct == true) {
      simulating = true;
      alert('Correto \uD83D\uDE00');
      myQuestions.correctQuestions[myQuestions.currentQuestion] = 1;
      myQuestions.questionsWeight[myQuestions.currentQuestion] = 1;
    } else {
      simulating = true;
      alert('Errado \uD83D\uDE13');
      myQuestions.correctQuestions[myQuestions.currentQuestion] = 0;
      myQuestions.questionsWeight[myQuestions.currentQuestion] = 0;
    }
    socket.emit('currentQuestion', myID);
    startFall();
  });

  socket.on('thisIsTheCurrentQuestion', function (questionIndex) {
    if (questionIndex == 'end') {
      fim = true;
      socket.emit('endTest', myID);
    } else {
      myQuestions.currentQuestion = questionIndex;
      changeQuestion();
    }
  });

  socket.on('yourGrade', function (grade) {
    if (grade != 'error') {
      document.getElementById('customizable-text').innerHTML = 'Nota final: ' + grade;
      gotGrade = true;
    } else {
      alert('Falha no sistema');
      socket.emit('removeMyConnection', myID);
      deleteAllCookies();
      window.location.replace('/index.html');
    }
  });
}

function draw() {
  background(bg);
  myfallBody.show();
  if (simulating) {
    if (wait < 120) {
      wait++;
    } else {
      //background(bg);
      myfallBody.update();
      //myfallBody.show();
      //bottomBarrier.show();
      fill('#DFDCE3');
    }
  }
}

class ruler {
  constructor(size, maxPixels, scale) {
    this.sizeOfMark = size / 4.0;
    this.sizeOfMarkPx = Math.round(parseFloat(this.sizeOfMark) / scale);
    this.first = 0;
    this.last = size;
  }

  show() {}
}

replayButton.addEventListener('click', function () {
  createFallBody();
  startFall();
  wait = 0;
});

submitAnswer.addEventListener('click', function () {
  simulating = false;
  wait = 0;
  let index = 0;
  let answered = false;
  let studentAnswer;
  for (const radio of answerRadios) {
    if (radio.checked) {
      answered = true;
      break;
    }
    index++;
  }
  if (answered) {
    studentAnswer = document.getElementById('label' + index).innerHTML;
    let myId = cookieParser(document.cookie)['studentID'];
    let answerData = {
      question: myQuestions.questionData[myQuestions.currentQuestion].number,
      answer: studentAnswer,
      studentID: myId,
    };
    socket.emit('answerQuestion', answerData);
  } else {
    alert('Escolha uma opção!');
  }
});

/*submitAnswer.addEventListener('mousedown', function(){
    let studentAnswer = document.getElementById('answer').value;
    let myId = cookieParser(document.cookie)['studentID'];
    let answerData = {
        question : myQuestions.questionData[myQuestions.currentQuestion].number,
        answer : studentAnswer,
        studentID : myId
    }
    socket.emit('answerQuestion', answerData);
});*/

nextButtonDisplay.addEventListener('click', function () {
  if (fim) {
    alert('Você finalizou a prova!');
    document.cookie = 'fim=sim;';
    showEndOfTest();
  } else {
    showQuiz();
    myfallBody = new fallBody();
  }
});

logoutButton.addEventListener('click', function () {
  deleteAllCookies();
  socket.emit('removeMyConnection', myID);
  window.location.replace('/index.html');
});

exitButton.addEventListener('click', function () {
  if (confirm('Todo o seu progresso será perdido! Deseja sair?')) {
    deleteAllCookies();
    socket.emit('removeMyConnection', myID);
    window.location.replace('/index.html');
  } else {
  }
});
/*numberRootButton.addEventListener('click', function () {
  let number = Number(document.getElementById('number').value);
  let root = roundIt(Math.sqrt(number), 2);
  document.getElementById('resultado').innerHTML = 'Resultado: ' + root;
});*/

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

function changeQuestion() {
  let options = [...myQuestions.questionData[myQuestions.currentQuestion].options];
  options = shuffleArray(options);
  for (const radio of answerRadios) {
    radio.checked = false;
  }
  for (let i = 0; i < options.length; i++) {
    document.getElementById('label' + i).innerHTML = options[i];
  }
  questionTitle.innerHTML = 'Questão ' + (Number(myQuestions.currentQuestion) + Number(1));
  questionBody.innerHTML = myQuestions.questionData[myQuestions.currentQuestion].text;
}

function changeWorldParameters(experimentData) {
  worldData.gravity = experimentData.gravity;
  worldData.planet = experimentData.planet;
  worldData.initialVelocity = experimentData.initialVelocity;
  worldData.initialVelocityUn = experimentData.initialVelocityUn;
  worldData.bodyMass = experimentData.bodyMass;
  worldData.bodyMassUn = experimentData.bodyMassUn;
  worldData.fallHeight = experimentData.fallHeight;
  startingPointPx = canvasHeight - experimentData.fallHeight / worldScale - barrierHeightPx;
  scale = worldData.fallHeight / fallHeightPx;
  bg = loadImage('assets\\img\\' + worldData.planet + '.png');
  if (worldData.planet == 'earth' || worldData.planet == 'jupiter') {
    strokeColour = 'black';
  } else {
    strokeColour = 'white';
  }
}

function createFallBody() {
  let bodyMass;
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
  myfallBody = new fallBody(bodyMass);
}

function startFall() {
  let initialVel;
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
  myfallBody.fall(initialVel);
}

function showQuiz() {
  cardDisplay.classList.remove('hide');
  drawDisplay.classList.add('hide');
  nextButtonDisplay.classList.add('hide');
  replayButton.classList.add('hide');
  logoutButton.classList.add('hide');
  exitButton.classList.remove('hide');
}

function showSketch() {
  cardDisplay.classList.add('hide');
  drawDisplay.classList.remove('hide');
  nextButtonDisplay.classList.remove('hide');
  replayButton.classList.remove('hide');
  logoutButton.classList.add('hide');
  exitButton.classList.add('hide');
}

function showEndOfTest() {
  cardDisplay.classList.add('hide');
  drawDisplay.classList.add('hide');
  nextButtonDisplay.classList.add('hide');
  replayButton.classList.add('hide');
  document.getElementById('end-text-msg').innerHTML = document.getElementById('end-text-msg').innerHTML + ', ' + cookies['nome'];
  document.getElementById('end-test-text').classList.remove('hide');
  document.getElementById('customizable-text-div').classList.remove('hide');
  logoutButton.classList.remove('hide');
  exitButton.classList.add('hide');
}

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

function shuffleArray(array) {
  let currentIndex = array.length,
    randomIndex;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }

  return array;
}

function roundIt(value, precision) {
  var multiplier = Math.pow(10, precision || 0);
  return Math.round(value * multiplier) / multiplier;
}

function getWidth() {
  if (self.innerWidth) {
    return self.innerWidth;
  }

  if (document.documentElement && document.documentElement.clientWidth) {
    return document.documentElement.clientWidth;
  }

  if (document.body) {
    return document.body.clientWidth;
  }
}

function getHeight() {
  if (self.innerHeight) {
    return self.innerHeight;
  }

  if (document.documentElement && document.documentElement.clientHeight) {
    return document.documentElement.clientHeight;
  }

  if (document.body) {
    return document.body.clientHeight;
  }
}

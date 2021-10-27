let socket;         //socket used to send data to the server
//Body related variables
let myfallBody;     
let bottomBarrier;
let myTimer = new Timer();
let timerFont;
//Drawing related variables
let framerate = 120;
let scale;
let canvasWidth = 400;
let canvasHeight = 660;
let bg;
//World configuration
let worldData = {
    gravity : 10,
    planet : 'earth',
    initialVelocity : 0,
    initialVelocityUn : 'ms',
    bodyMass : 80,
    bodyMassUn : 'kg',
    fallHeight : 2
}
//Document utilities
let questionTitle = document.getElementById('question-title');
let questionBody = document.getElementById('question-body');
let submitAnswer = document.getElementById('submit-answer');
let startTest = document.getElementById('startButton');
let cardDisplay = document.getElementById('card-div');
let drawDisplay = document.getElementById('sketch-div');
let nextButtonDisplay = document.getElementById('next-button-div');
let exitButton = document.getElementById('logout-button');
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
function setup(){
    //socket = io.connect('http://localhost:3000');
    //Parsing session cookies into dictionary for easy manipulation
    cookies = cookieParser(document.cookie);
    //If user is not logged in, redirect him to login page
    if(!document.cookie){
        window.location.replace("/index.html");
    }
    //-------------------------------------------------------------
    //connecting socket to server
    myID = cookies['studentID'];
    socket = io.connect(document.location.origin);
    //verifying if client has already finished the test
    if(document.cookie.includes("fim=sim")){
        showEndOfTest();
        if(!gotGrade){
            console.log('PEDI!!');
            socket.emit('endTest', myID);
        }
    }
    //initializing canvas for drawing the simulation
    let canvas;
    canvas = createCanvas(canvasWidth,canvasHeight);
    width = canvasWidth;
    height = canvasHeight;
    canvas.parent('sketch-holder');
    bg = loadImage('assets\\img\\earth.png');
    frameRate(framerate);
    //-----------------------------------------------
    //Defining variables for the texts shown on the sketch screen
    textSize(18);
    textFont(timerFont);
    //------------------------------------------------
    //Creating instances for bottom barrier and fall body
    bottomBarrier = new Barrier(0, height - 30, width, height-30);
    myfallBody = new fallBody();
    //-----------------------------------------------
    //Defining the scale, used in calculations. 
    //The cauculation of the velocity of the body, depends on it's position, which is measured in
    // meters. The rendering of the animation, on the other hand, is measured in pixels. Therefore, we
    // need to define a scale (m/px) to use in defining the position of the body on the screen.
    scale = worldData.fallHeight / 600;
    //------------------------------------------------
    let studentData = {                 
        name : cookies['nome'],         
        id : myID                       
    }
    socket.emit("newStudent", studentData);
    // When the client gets a message called 'yourQuestions', it means that the server is sending the
    // state of the questions of the client. It might be the first time the client gets it's questions or not
    socket.on('yourQuestions', function(data){
        gotQuestions = true;
        if(data){
            myQuestions = data;
            changeQuestion();
        }else{     
            alert("Falha no sistema. Favor atualizar a página!");
        }
    });

    socket.on('checkAnswer', function(msgData){
        changeWorldParameters(myQuestions.questionData[myQuestions.currentQuestion].experimentData);
        showSketch();
        createFallBody();
        startFall();
        if(msgData.correct == true){
            simulating = true;
            alert("CORRETO!");
            myQuestions.correctQuestions[myQuestions.currentQuestion] = 1;
            myQuestions.questionsWeight[myQuestions.currentQuestion] = 1;
        }else{
            simulating = true;
            alert("ERRADO!");
            myQuestions.correctQuestions[myQuestions.currentQuestion] = 0;
            myQuestions.questionsWeight[myQuestions.currentQuestion] = 0;
        }
        socket.emit('currentQuestion', myID);
    });
    
    socket.on('thisIsTheCurrentQuestion', function(questionIndex){
        if(questionIndex == 'end'){
            fim = true;
            socket.emit('endTest', myID);
        }else{
            myQuestions.currentQuestion = questionIndex;
            changeQuestion();
        }
    });

    socket.on('yourGrade', function(grade){
        if(grade != 'error'){
            document.getElementById('customizable-text').innerHTML = "Nota final: " + grade;
            gotGrade = true;    
        }else{
            alert('Falha no sistema');
            socket.emit('removeMyConnection', myID);
            deleteAllCookies();
            window.location.replace("/index.html");
        }
    });
}

function preload(){
    timerFont = loadFont('assets\\fonts\\Roboto-Thin.ttf');
}

function draw(){
    if(simulating){
        background(bg);
        myfallBody.update();
        myfallBody.show();
        bottomBarrier.show();
        fill('#DFDCE3');
        text(paddy(myTimer.min, 2)+":"+paddy(myTimer.sec, 2)+":"+paddy(myTimer.mili, 3), 320, 20);
    }
}

setInterval(function(){
    if(myTimer.running){
        myTimer.count();
    }
},10)

class ruler{
    constructor(size, maxPixels, scale){
        this.sizeOfMark = size / 4.0;
        this.sizeOfMarkPx = Math.round(parseFloat(this.sizeOfMark) / scale);
        this.first = 0;
        this.last = size;
    }

    show(){
        
    }
}

submitAnswer.addEventListener('mousedown', function(){
    let studentAnswer = document.getElementById('answer').value;
    let myId = cookieParser(document.cookie)['studentID'];
    let answerData = {
        question : myQuestions.questionData[myQuestions.currentQuestion].number,
        answer : studentAnswer,
        studentID : myId
    }
    socket.emit('answerQuestion', answerData);
});

nextButtonDisplay.addEventListener('click', function(){
    if(fim){
        alert("Você finalizou a prova!");
        document.cookie = 'fim=sim;';
        showEndOfTest();
    }else{
        showQuiz();
        myfallBody = new fallBody();    
    }
});

exitButton.addEventListener('click', function(){
    deleteAllCookies();
    socket.emit('removeMyConnection', myID);
    window.location.replace("/index.html");
})

function cookieParser(cookieString){
    if(!cookieString){
        return null;
    }
    let stringToParse = cookieString;
    let stringArray = stringToParse.split(";");
    let cookies = {};
    for(let string of stringArray){
        let key = string.split("=")[0];
        key = key.trim();
        let value = string.split("=")[1];
        value = value.trim();
        cookies[key] = value;
    }
    return cookies;
}

function changeQuestion(){
    questionTitle.innerHTML = myQuestions.questionData[myQuestions.currentQuestion].title;
    questionBody.innerHTML = myQuestions.questionData[myQuestions.currentQuestion].text;
}

function changeWorldParameters(experimentData){
    worldData.gravity = experimentData.gravity;
    worldData.planet = experimentData.planet;
    worldData.initialVelocity = experimentData.initialVelocity;
    worldData.initialVelocityUn = experimentData.initialVelocityUn;
    worldData.bodyMass = experimentData.bodyMass;
    worldData.bodyMassUn = experimentData.bodyMassUn;
    worldData.fallHeight = experimentData.fallHeight;
    bg = loadImage('assets\\img\\' + worldData.planet + ".png");

}

function createFallBody(){
    let bodyMass;
    switch(worldData.bodyMassUn){
        case 'kg' : 
            bodyMass = worldData.bodyMass;
            break;
        case 'g' :
            bodyMass = worldData.bodyMass / 1000;
            break;
        case 'ton':
            bodyMass = worldData.bodyMass * 1000;
            break;
        default: 
            bodyMass = worldData.bodyMass;
            break
    }
    myfallBody = new fallBody(bodyMass);
}

function startFall(){
    let initialVel;
    switch(worldData.initialVelocityUn){
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

function showQuiz(){
    cardDisplay.classList.remove('d-none');
    drawDisplay.classList.add('d-none');
    nextButtonDisplay.classList.add('d-none');
}

function showSketch(){
    cardDisplay.classList.add('d-none');
    drawDisplay.classList.remove('d-none');
    nextButtonDisplay.classList.remove('d-none');
}

function showEndOfTest(){
    cardDisplay.classList.add('d-none');
    drawDisplay.classList.add('d-none');
    nextButtonDisplay.classList.add('d-none');
    document.getElementById('end-text-msg').innerHTML = document.getElementById('end-text-msg').innerHTML + ", " + cookies['nome'];
    document.getElementById('end-test-text').classList.remove('d-none');
    document.getElementById('customizable-text-div').classList.remove('d-none');
    exitButton.classList.remove('d-none');
}

function deleteAllCookies() {
    var cookies = document.cookie.split(";");
    for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i];
        var eqPos = cookie.indexOf("=");
        var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
}

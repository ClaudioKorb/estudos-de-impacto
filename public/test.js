let socket;         //socket used to send data to the server

let myfallBody;     
let bottomBarrier;
let gravity = 9.81; //standard Earth gravity acceleration
let framerate = 120;
let myTimer = new Timer();
let timerFont;
let fallHeight = 2; //meters
let scale;
let speedUnity = 0; //0 == m/s, 1 == km/h
let canvasWidth = 400;
let canvasHeight = 660;


let fallButton = document.getElementById("fall-button");
let resetButton = document.getElementById("reset-button");
let fallHeigthText = document.getElementById('fall-height');
let showVelCheckBox = document.getElementById('show-velocity-check');
let showEnergyCheckBox = document.getElementById('show-energy-check');
let massInput = document.getElementById('object-mass-input');
let speedUnityMS = document.getElementById('initial-velocity-dropdown-ms');
let speedUnityKH = document.getElementById('initial-velocity-dropdown-kh');
let speedUnityKS = document.getElementById('initial-velocity-dropdown-ks');
let initVelocityCheck = document.getElementById('initial-velocity-check');
let questionTitle = document.getElementById('question-title');
let questionBody = document.getElementById('question-body');
let submitAnswer = document.getElementById('submit-answer');
let startTest = document.getElementById('startButton');

let loaded = false;
let myQuestions;
let currentQuestion = 0;
let myID = '';

function setup(){
    //socket = io.connect('http://localhost:3000');
    socket = io.connect(document.location.origin);

    let canvas;
    loaded = true;
    canvas = createCanvas(canvasWidth,canvasHeight);
    width = canvasWidth;
    height = canvasHeight;
    canvas.parent('sketch-holder');
    frameRate(framerate);
    bottomBarrier = new Barrier(0, height - 30, width, height-30);

    myfallBody = new fallBody();
    scale = fallHeight / 600;
    textSize(18);
    textFont(timerFont);
    let cookies = cookieParser(document.cookie);
    myID = cookies['studentID'];
    
    if(cookies['login'] == 'ok'){
        socket.emit('getQuestions', myID);
    }else{
        console.log('OPA '+myID);
        let studentData = {
            name : cookies['nome'],
            id : myID
        }
        console.log(studentData);
        socket.emit("newStudent", studentData);
    }

    socket.on('yourQuestions', function(data){
        gotQuestions = true;
        if(data){
            console.log("Got My Questions");
            console.log(data);
            myQuestions = data;
            questionTitle.innerHTML = myQuestions.questionData[myQuestions.currentQuestion].title;
            questionBody.innerHTML = myQuestions.questionData[myQuestions.currentQuestion].text;    
        }else{     
            console.log('Numero de perguntas disponíveis é menor que o solicitado');
        }
    });

    socket.on('checkAnswer', function(msgData){
        if(msgData.correct == true){
            myQuestions.correctQuestions[myQuestions.currentQuestion] = 1;
            myQuestions.questionsWeight[myQuestions.currentQuestion] = 1;
        }else{
            alert("Errado");
            myQuestions.correctQuestions[myQuestions.currentQuestion] = 0;
            myQuestions.questionsWeight[myQuestions.currentQuestion] = 0;
        }
        socket.emit('currentQuestion', myID);
    });

    socket.on('thisIsTheCurrentQuestion', function(questionIndex){
        if(questionIndex == 'end'){
            alert('FIM');
        }else{
            myQuestions.currentQuestion = questionIndex;
            changeQuestion();
        }
    });
}

function preload(){
    timerFont = loadFont('assets\\fonts\\Roboto-Thin.ttf');
}

function draw(){
    if(loaded){
        background('#4abdac');
        myfallBody.update();
        myfallBody.show();
        bottomBarrier.show();
        fill('#DFDCE3');
        text(paddy(myTimer.min, 2)+":"+paddy(myTimer.sec, 2)+":"+paddy(myTimer.mili, 3), 320, 20);
        fallHeigthText.innerHTML = document.getElementById('fall-height-range').value + "m";
        if(initVelocityCheck.checked){
            document.getElementById('dropdown-initial-velocity').disabled = false;
            document.getElementById('initial-velocity-input').disabled = false;
    
        }else{
            document.getElementById('dropdown-initial-velocity').disabled = true;
            document.getElementById('initial-velocity-input').disabled = true;
        }
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


showVelCheckBox.addEventListener('change', function(event){
    if(event.currentTarget.checked){
        myfallBody.tooltip.setShowVel(true);
        console.log("checked");
    }else{
        myfallBody.tooltip.setShowVel(false);
        console.log("unchecked");
    }
})

showEnergyCheckBox.addEventListener('change', function(event){
    if(event.currentTarget.checked){
        myfallBody.tooltip.setShowEnergy(true);
        console.log("checked");
    }else{
        myfallBody.tooltip.setShowEnergy(false);
        console.log("unchecked");
    }
})

speedUnityMS.addEventListener('click', function(){
    document.getElementById('initial-velocity-input').placeholder = "Em m/s"
    speedUnity = 0;
})

speedUnityKH.addEventListener('click', function(){
    document.getElementById('initial-velocity-input').placeholder = "Em km/h"
    speedUnity = 1;
})

submitAnswer.addEventListener('mousedown', function(){
    let studentAnswer = document.forms['question-form'].answer.value;
    let myId = cookieParser(document.cookie)['studentID'];
    let answerData = {
        question : myQuestions.questionData[myQuestions.currentQuestion].number,
        answer : studentAnswer,
        studentID : myId
    }
    socket.emit('answerQuestion', answerData);
});

fallButton.addEventListener('mousedown', function(){
    fallHeight = document.getElementById('fall-height-range').value;
    console.log("fallHeight = " + fallHeight);
    scale = fallHeight / 600;
    myTimer.start();
    myfallBody = new fallBody(parseFloat(massInput.value));
    if(initVelocityCheck.checked){
        switch(speedUnity){
            case 0:
                myfallBody.fall(parseInt(document.getElementById('initial-velocity-input').value));
                break;
            case 1:
                myfallBody.fall(parseInt(document.getElementById('initial-velocity-input').value)/3.6);
            default:
                myfallBody.fall();
        }
    }else{
        myfallBody.fall();
    }
})

resetButton.addEventListener('mousedown', function(){
    fallHeight = document.getElementById('fall-height-range').value;
    scale = fallHeight / 600;
    myTimer.stop();
    myTimer.reset();
    myfallBody = new fallBody(massInput.value);
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
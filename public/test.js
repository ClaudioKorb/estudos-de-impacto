let socket;         //socket used to send data to the server

let myfallBody;     
let bottomBarrier;
let framerate = 120;
let myTimer = new Timer();
let timerFont;
let scale;
let canvasWidth = 400;
let canvasHeight = 660;
let bg;
let fim = false;

let worldData = {
    gravity : 10,
    planet : 'earth',
    initialVelocity : 0,
    initialVelocityUn : 'ms',
    bodyMass : 80,
    bodyMassUn : 'kg',
    fallHeight : 2
}


let questionTitle = document.getElementById('question-title');
let questionBody = document.getElementById('question-body');
let submitAnswer = document.getElementById('submit-answer');
let startTest = document.getElementById('startButton');
let cardDisplay = document.getElementById('card-div');
let drawDisplay = document.getElementById('sketch-div');
let nextButtonDisplay = document.getElementById('next-button-div');

let simulating = false;
let myQuestions;
let currentQuestion = 0;
let myID = '';
function setup(){
    //socket = io.connect('http://localhost:3000');

    if(document.cookie.includes("fim=sim")){
        showEndOfTest();
        }else{
            socket = io.connect(document.location.origin);

            let canvas;
            canvas = createCanvas(canvasWidth,canvasHeight);
            width = canvasWidth;
            height = canvasHeight;
            canvas.parent('sketch-holder');
            bg = loadImage('assets\\img\\earth.png');
        
            frameRate(framerate);
            bottomBarrier = new Barrier(0, height - 30, width, height-30);
        
            myfallBody = new fallBody();
            scale = worldData.fallHeight / 600;
            textSize(18);
            textFont(timerFont);
            let cookies = cookieParser(document.cookie);
            myID = cookies['studentID'];
            
            if(cookies['login'] == 'ok'){
                socket.emit('getQuestions', myID);
            }else{
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
                    myQuestions = data;
                    questionTitle.innerHTML = myQuestions.questionData[myQuestions.currentQuestion].title;
                    questionBody.innerHTML = myQuestions.questionData[myQuestions.currentQuestion].text;    
                }else{     
                    console.log('Numero de perguntas disponíveis é menor que o solicitado');
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
                    alert("ERRADO!");
                    myQuestions.correctQuestions[myQuestions.currentQuestion] = 0;
                    myQuestions.questionsWeight[myQuestions.currentQuestion] = 0;
                }
                socket.emit('currentQuestion', myID);
            });
        
            socket.on('thisIsTheCurrentQuestion', function(questionIndex){
                if(questionIndex == 'end'){
                    fim = true;
                }else{
                    myQuestions.currentQuestion = questionIndex;
                    changeQuestion();
                }
            });
        }
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
    cardDisplay.style.visibility = "visible";
    drawDisplay.style.visibility = "hidden";
    nextButtonDisplay.style.visibility = "hidden";
}

function showSketch(){
    cardDisplay.style.visibility = "hidden";
    drawDisplay.style.visibility = "visible";
    nextButtonDisplay.style.visibility = "visible";
}

function showEndOfTest(){
    cardDisplay.style.visibility = "hidden";
    drawDisplay.style.visibility = "hidden";
    nextButtonDisplay.style.visibility = "hidden";
    document.getElementById('end-test-text').style.visibility = "visible";
}

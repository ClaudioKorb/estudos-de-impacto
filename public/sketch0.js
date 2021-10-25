let socket;
let myfallBody;
let bottomBarrier;
let gravity = 9.81; //standard Earth gravity acceleration
let framerate = 120;
let myTimer = new Timer();
let timerFont;
let fallHeight = 2; //meters
let scale;
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
let speedUnity = 0; //0 == m/s, 1 == km/h
let myQuestions = [];
let myQuestionNumbers = [];
let numberOfQuestions = 5;

function setup(){
    socket = io.connect('http://localhost:3000');
    /*while(myQuestions.length < numberOfQuestions){
        socket.emit('getQuestion', myQuestionNumbers);
    }*/
    let canvas;
    socket.on("canvasCreation", function(canvasData){
        canvas = createCanvas(canvasData.width,canvasData.height);
        width = canvasData.width;
        height = canvasData.height;
        canvas.parent('sketch-holder');
        frameRate(framerate);
        bottomBarrier = new Barrier(0, height - 30, width, height-30);

    })
    myfallBody = new fallBody();
    scale = fallHeight / 600;
    textSize(18);
    textFont(timerFont);

    /*socket.on('newQuestion', function(data){
        if(data == -1){
            console.log('nenhuma nova pergunta');
            numberOfQuestions = myQuestions.length;
        }else{
            myQuestions.push(data);
            myQuestions.push(data.number);
        }
    })*/
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
    if(Math.random() > 0.5){
        questionTitle.innerHTML = "Velocidade final";
        questionBody.innerHTML = "Considerando um corpo com velocidade inicial de 15 m/s, em queda livre na superfície terrestre (g = 9.81 m/s²), qual sua velocidade final ao cair de uma altura de 15 metros?"
    }else{
        questionTitle.innerHTML = "Energia cinética";
        questionBody.innerHTML = "Considerando um corpo de 10 kg em queda livre na superfície terrestre (g = 9.81 m/s²), partindo do repouso. Qual a energia cinética do mesmo ao cair de uma altura de 10 m?"
    }
})

function preload(){
    timerFont = loadFont('assets\\fonts\\Roboto-Thin.ttf');
}

function draw(){
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

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

let canvasWidth = 400;
let canvasHeight = 660;
let bodyDiameter = canvasWidth / 20;
let fallDistancePx = canvasHeight - (bodyDiameter * 3);
let fallDistanceMt = 10;
let worldGravity = 9.81;
let clientFramerate = 120;
let clientSpeedUnit = 0;
let scale = fallDistanceMt / fallDistancePx; // meters per pixel
const questions = require('./questions.json');
const answers = require('./answers.json');
let students = [];
let numberOfQuestions = 3;
const PORT = process.env.PORT;

let worldConfig = {
    gravity : 9.81,
    
}
let express = require('express');
let app = express();

//let server = app.listen(3000);
let server = app.listen(PORT, ()=>{
    console.log('Server listening on port ' + PORT);
})
app.use(express.static('public'));

console.log("Socket server running...");

let socket = require('socket.io');
let io = socket(server);


io.sockets.on('connection', newConnection);

function newConnection(socket){
    console.log("New connection: " + socket.id);
    socket.on('animationPage', function(){
        console.log('asdpoaskdpasjdpoas');
        let canvasData = {
            width : canvasWidth,
            height : canvasHeight
        }
        socket.emit("canvasCreation",canvasData);    
    });

    socket.on('newStudent', function(studentData){
        let newQuestions = [];
        let newQuestionsNumbers = [];
        while(newQuestions.length < numberOfQuestions){
            let candidateQuestion = getRandomInt(1, questions.length);
            if(!newQuestionsNumbers.includes(candidateQuestion)){
                newQuestions.push(questions[candidateQuestion-1]);
                newQuestionsNumbers.push(questions[candidateQuestion-1].number)
            }
        }
        let newStudent = new student(studentData, newQuestions);
        students.push(newStudent);
    });

    socket.on('getQuestions', function(studentID){
        console.log(studentID);
        let questionData = null;
        for(const student of students){
            if(student.id == studentID){
                questionData = student.questions.questionData;
            }
        }
        socket.emit('newQuestions', questionData);  
    })

/*    socket.on('getQuestions', function(amount){
        if(amount > questions.length){
            socket.emit('newQuestions', null);
        }else{
            let newQuestions = [];
            let newQuestionsNumbers = [];
            while(newQuestions.length < amount){
                let candidateQuestion = getRandomInt(1, questions.length);
                if(!newQuestionsNumbers.includes(candidateQuestion)){
                    newQuestions.push(questions[candidateQuestion-1]);
                    newQuestionsNumbers.push(questions[candidateQuestion-1].number)
                }
            }
            socket.emit('newQuestions', newQuestions);
        }
    });
*/
    socket.on('answerQuestion', function(answerData){
        if(answerData){
            let rightAnswer = false;
            console.log(answerData.question);
            for(let answer of answers){
                if(answer.number == answerData.question){
                    console.log(answer.number == answerData.question);
                    //later change to multiple correct answers
                    let studenAnswer = answerData.answer;
                    let correctAnswer = answer.answer;
                    if(studenAnswer.trim().toLowerCase() == correctAnswer.trim().toLowerCase()){
                        rightAnswer = true;
                    }
                    break;
                }
            }
            if(rightAnswer){
                studentIndex = findStudent(answerData.studentID);
                students[studentIndex].markAsCorrect(answerData.question);
                console.log("Estado das questoes: " + students[studentIndex].questions.correctQuestions);

            }
            let msgData = {
                question: answerData.question,
                correct : rightAnswer
            }
            socket.emit('checkAnswer', msgData);
        }
    })
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

if (!String.prototype.trim) {
    String.prototype.trim = function () {
      return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
    };
}

app.post('/', function(req, res) {
    res.redirect('/animation.html');
});

class student{
    constructor(studentData, studentQuestions){
        this.name = studentData.name;
        this.id = studentData.id;
        this.questions = {
            questionData : studentQuestions,
            correctQuestions : [],
            questionsWeight : []
        }
        for(let i = 0; i < numberOfQuestions; i++){
            this.questions.correctQuestions.push(0);
            this.questions.questionsWeight.push(1);
        }
    }

    changeWeight(questionNumber, newWeight){
        let index = this.indexOfQuestion(questionNumber)
        if(index != -1){
            this.questions.questionsWeight[index] = newWeight;
            return newWeight;
        }else{
            return null;
        }
    }

    markAsCorrect(questionNumber){
        let index = this.indexOfQuestion(questionNumber);
        console.log('questao acertada: ' + index);
        this.questions.correctQuestions[index] = 1;
    }

    indexOfQuestion(questionNumber){
        let index = -1;
        for(let i = 0; i < this.questions.questionData.length; i++){
            if(this.questions.questionData[i].number == questionNumber){
                index = i;
            }
        }
        return index;
    }
}

function findStudent(studentID){
    let index = -1;
    for(let i = 0; i < students.length; i++){
        if(students[i].id == studentID) {
            index = i;
        }
    }
    return index;
}

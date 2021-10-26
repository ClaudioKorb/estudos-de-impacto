let studentClass = require('./student');
const questions = require('./questions.json');
const answers = require('./answers.json');

let students = new studentClass.studentList();
let numberOfQuestions = process.env.IMPACT_NUMBER_OF_QUESTIONS;
let socketMap = [];

const PORT = process.env.PORT;

let express = require('express');
let app = express();

let server = app.listen(PORT)
console.log("Server listening on port " + PORT);

app.use(express.static('public'));

console.log("Socket server running...");
//console.log("Number of questions: " + numberOfQuestions);

let socket = require('socket.io');
let io = socket(server);


io.sockets.on('connection', newConnection);

function newConnection(socket){
    try{
        console.log("New connection: " + socket.id);
    }catch(e){
        console.log("Não foi possivel estabelecer a conexão");
        console.log(e);
    }
    
    socket.on('newStudent', function(studentData){
        let newQuestions = [];
        let newQuestionsNumbers = [];
        try{
            while(newQuestions.length < numberOfQuestions){
                let candidateQuestion = getRandomInt(1, questions.length);
                if(!newQuestionsNumbers.includes(candidateQuestion)){
                    newQuestions.push(questions[candidateQuestion-1]);
                    newQuestionsNumbers.push(questions[candidateQuestion-1].number)    
                }
            }
            let newStudent = new studentClass.student(studentData, newQuestions);
            if(students.addStudent(newStudent)){
                console.log('Estudante <' + newStudent.id+'> não existe');
                console.log('Novo estudante adicionado: ' + newStudent.name);
                console.log('Numero de estudantes ativo: ' + students.list.length);
                let studentSocket = {
                    studentID : newStudent.id,
                    socketID : socket.id
                }
                socketMap.push(studentSocket);
            }else{
                console.log('Estudante já está cadastrado');
                //changeSocketID(newStudent.id, socket.id);
            }
            let questionData = null;
            if(students.findStudentIndex(studentData.id) >= 0){
                questionData = students.findStudent(studentData.id).questions;
            }
            socket.emit('yourQuestions', questionData);
        }catch(e){
            console.log("Falha ao gerar questões para o usuário " + studentData.id);
            console.log(e);
        }
    });

    socket.on('getQuestions', function(studentID){
        if(studentID){
            try{
                console.log('Estudante ' + studentID + ' solicitou questões');
                let questionData = null;
                if(students.findStudentIndex(studentID) >= 0){
                    questionData = students.findStudent(studentID).questions;
                }
                socket.emit('yourQuestions', questionData);          
            }catch(e){
                console.log("Falha ao enviar perguntas para o usuário " + studentID);
                console.log(e);
            }
        }
    });

    socket.on('currentQuestion', function(studentID){
        if(studentID){
            try{
                let thisStudent = students.findStudent(studentID);
                console.log('questao atual: ' + thisStudent.questions.currentQuestion);
                console.log('numero de questoes: ' + thisStudent.questions.questionData.length);
                if(!thisStudent.nextQuestion()){
                    console.log('mandando end');
                    socket.emit('thisIsTheCurrentQuestion', 'end');
                }else{
                    console.log('mandando ' +thisStudent.questions.currentQuestion);
                    socket.emit('thisIsTheCurrentQuestion', thisStudent.questions.currentQuestion);
                }
            }catch(e){
                console.log("Erro ao enviar pergunta atual para o usuário " + studentID);
                console.log(e);
            }
        }
    })

    socket.on('answerQuestion', function(answerData){
        if(answerData){
            try{
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
                    studentIndex = students.findStudentIndex(answerData.studentID);
                    students.list[studentIndex].markAsCorrect(answerData.question);
    
                }else{
                    //TO DO reduzir peso da questão para tentativas subsequentes
                }
                let msgData = {
                    question: answerData.question,
                    correct : rightAnswer
                }
                socket.emit('checkAnswer', msgData);
            }catch(e){
                console.log("Erro ao verificar resposta do usuário " + answerData.studentID);
                console.log(e);
            }
            
        }
    });

    socket.on('disconnect', function(){
        console.log('disconnected');
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

function findSocketIndexBySudentID(studentID){
    for(let i = 0; i < socketMap; i++){
        if(socketMap[i].studentID == studentID){
            return i;
        }
    }
    return null;
}

function findSocketIDBySudentID(studentID){
    for(let i = 0; i < socketMap; i++){
        if(socketMap[i].studentID == studentID){
            return socketMap[i].socketID;
        }
    }
    return null;
}

function findSocketIndexBySocketID(socketID){
    for(let i = 0; i < socketMap; i++){
        if(socketMap[i].socketID == socketID){
            return i;
        }
    }
    return null;
}

function findStudentIDBySocketID(socketID){
    for(let i = 0; i < socketMap; i++){
        if(socketMap[i].socketID == socketID){
            return socketMap[i].studentID;
        }
    }
    return null;
}

function removeSocketMap(socketID){
    let index = findSocketIndexBySocketID(socketID);
    if(index >= 0){
        return (socketMap.splice(index, 1));
    }else{
        return false;
    }
}

function changeSocketID(studentID, socketID){
    let index = findSocketIndexBySudentID(studentID);
    if(index >= 0){
        socketMap[index].socketID = socketID;
        return true;
    }else{
        return false;
    }
}

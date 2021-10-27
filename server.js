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
                console.log('-----------------');
                console.log('Estudante <' + newStudent.id+'> não existe');
                console.log('Novo estudante adicionado: ' + newStudent.name);
                console.log('Socket do novo estudante: ' + socket.id);
                console.log('Numero de estudantes ativo: ' + students.list.length);
                console.log('----------------');
                let studentSocket = {
                    studentID : newStudent.id,
                    socket : socket
                }
                socketMap.push(studentSocket);
            }else{
                console.log('Estudante já está cadastrado');
                console.log('Estudante ' + studentData.id + ' agora está conectado ao socket ' + socket.id);
                changeSocketID(studentData.id, socket);
            }
            let questionData = null;
            if(students.findStudentIndex(studentData.id) >= 0){
                questionData = students.findStudent(studentData.id).questions;
            }
            socket.emit('yourQuestions', questionData);
            console.log('Questões enviadas para o usuário ' + studentData.id);
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

    socket.on('endTest', function(studentID){
        console.log('Usuario ' + studentID + ' solicitou sua nota');
        let thisStudent = students.findStudent(studentID);
        if(thisStudent){
            let grade = thisStudent.calculateGrade();
            console.log('Questões certas: ' +thisStudent.questions.correctQuestions);
            console.log('Peso das questões: '+thisStudent.questions.questionsWeight);
            console.log('Nota do usuário: ' + grade);
            socket.emit('yourGrade', grade);
        }else{
            socket.emit('yourGrade', 'error');
        }
    });

    socket.on('removeMyConnection', function(studentID){
        console.log('Removendo conexão do aluno ' + studentID);
        let removeSocket = findSocketIDBySudentID(studentID);
        console.log('Socket ' + removeSocket + ' removido');
        removeSocketMap(removeSocket);
        students.removeStudent(studentID);
        console.log('Remoção concluída, número de sockets ativos: ' +socketMap.length);
        console.log('Número de estudantes conectados: ' +students.list.length);
    });

    socket.on('disconnect', function(){
        console.log('Socket ' + socket.id + ' disconnected');
    });
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
    for(let i = 0; i < socketMap.length; i++){
        if(socketMap[i].studentID == studentID){
            return i;
        }
    }
    return null;
}

function findSocketIDBySudentID(studentID){
    for(let i = 0; i < socketMap.length; i++){
        if(socketMap[i].studentID == studentID){
            return socketMap[i].socket.id;
        }
    }
    return null;
}

function findSocketIndexBySocketID(socketID){
    for(let i = 0; i < socketMap.length; i++){
        if(socketMap[i].socket.id == socket){
            return i;
        }
    }
    return null;
}

function findStudentIDBySocketID(socket){
    for(let i = 0; i < socketMap.length; i++){
        if(socketMap[i].socket.id == socket.id){
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

function changeSocketID(studentID, socket){
    let index = findSocketIndexBySudentID(studentID);
    if(index >= 0){
        console.log('Mudando relação de socket');
        console.log(socketMap[index].id);
        console.log('---->')    
        socketMap[index].socket = socket;
        console.log(socketMap[index].id);    
        return true;
    }else{
        return false;
    }
}

setInterval(function(){
    console.log('----------------------------------------');
    console.log('Servidor efetuando limpeza de sockets inativos');
    for(let i = 0; i < socketMap.length; i++){
        if(socketMap[i].socket.connected){
            console.log('Socket ' + socketMap[i].socket.id + ' ainda ativo');
        }else{
            console.log('Socket ' + socketMap[i].socket.id + ' inativo, deletando');
            let deleteStudent = findStudentIDBySocketID(socketMap[i].socket);
            students.removeStudent(deleteStudent);
            removeSocketMap(socketMap[i].socket.id);
            console.log('Relação de socket x Estudante removida');
        }
    }
    console.log('Limpeza concluída, número de sockets ativos: ' +socketMap.length);
    console.log('Número de estudantes conectados: ' +students.list.length);
    console.log(students.list);
}, 3600000);

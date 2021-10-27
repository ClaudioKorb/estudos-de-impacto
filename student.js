module.exports = {
    student : class{
        constructor(studentData, studentQuestions){
            this.name = studentData.name;
            this.id = studentData.id;
            this.questions = {
                questionData : studentQuestions,
                correctQuestions : [],
                questionsWeight : [],
                currentQuestion : 0
            }
            for(let i = 0; i < studentQuestions.length; i++){
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

        nextQuestion(){
            if(this.questions.currentQuestion == this.questions.questionData.length -1){
                return false;
            }else{
                this.questions.currentQuestion++;
                return true;
            }
        }

        calculateGrade(){
            let sum = 0;
            for(let i = 0; i < this.questions.correctQuestions.length; i++){
                let partial = this.questions.correctQuestions[i]*this.questions.questionsWeight[i];
                sum += partial;
            }
            return sum;
        }
    },

    studentList : class{
        constructor(){
            this.list = [];
        }

        findStudentIndex(studentID){
            let index = null;
            for(let i = 0; i < this.list.length; i++){
                if(this.list[i].id == studentID) {
                    index = i;
                    break;
                }
            }
            return index;    
        }

        addStudent(student){
            if(this.findStudentIndex(student.id) == null){
                this.list.push(student);
                console.log('NOVA LISTA:');
                for(const student of this.list){
                    console.log(student.id + ' ,');
                }
                console.log('-------------------');
                return true;
            }else{
                return false;
            }
        }

        findStudent(studentID){
            for(let i = 0; i < this.list.length; i++){
                if(this.list[i].id == studentID) {
                    return this.list[i];
                }
            }
            return null; 
        }

        removeStudent(studentID){
            let studentIndex = this.findStudentIndex(studentID);
            console.log('removendo aluno ' + studentIndex);
            if(studentIndex >= 0){
                console.log('removeu');
                this.list.splice(studentIndex,1);
                return true;
            }else{
                return false;
            }
        }
    }
}



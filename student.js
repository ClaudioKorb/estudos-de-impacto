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
            let studentIndex = this.findStudentIndex(studentID)
            if(studentIndex >= 0){
                this.list = this.list.splice(studentIndex,1);
                return true;
            }else{
                return false;
            }
        }
    }
}



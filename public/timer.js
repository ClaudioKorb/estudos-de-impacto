class Timer{
    constructor(){
        this.min = 0;
        this.sec = 0;
        this.mili = 0;
        this.running = false;
    }

    start(){
        this.reset();
        this.count();
        this.running = true;     
    }
    
    count(){
        this.mili += 10;
        if(this.mili >= 1000){
            this.sec += 1;
            this.mili = 0;
            if(this.sec >= 60){
                this.min += 1;
                this.sec = 0;
            }
        }
    }

    stop(){
        this.running = false;
    }

    reset(){
        this.min = 0;
        this.sec = 0;
        this.mili = 0;
        this.running = false;
    }
}

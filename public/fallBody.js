class fallBody{
    constructor(mass, xpos, ypos, diameter, myColor){
        mass ? this.mass = mass : this.mass = 1;
        xpos ? this.xpos = xpos : this.xpos = width/2;
        ypos ? this.ypos = ypos : this.ypos = 20 ;
        diameter ? this.diameter = diameter : this.diameter = 20;
        myColor ? this.color = myColor : this.color = color('#fc4a1a');
        this.speed = 0;
        this.acc = 0;
        this.energy = 0;
        this.lastSpeed = 0;
        this.tooltip = new tooltip(this.xpos, this.ypos, document.getElementById('show-velocity-check').checked, document.getElementById('show-energy-check').checked);
    };

    show(){
        if(this.speed == 0){
            this.tooltip.showVelocity(this.lastSpeed);
        }else{
            this.tooltip.showVelocity(this.speed);
        }
        this.tooltip.showEnergy(this.energy);
        noStroke();
        fill(this.color);
        ellipse(this.xpos, this.ypos, this.diameter, this.diameter);
    }

    fall(speed){
        this.acc = gravity;
        if(speed){
            this.speed = speed;
            console.log("SPEED: " + this.speed);
        }else{
            speed = 0;
        }
        //this.speed = 1/(scale*framerate);
    }

    update(){
        if(bottomBarrier){
            if(bottomBarrier.checkCollision(this)){
                if(this.speed > 0){
                    this.lastSpeed = this.speed;
                    this.lastAcc = this.acc;
                    this.stop();
                    this.ypos = bottomBarrier.y1 - (this.diameter / 2);
                    myTimer.stop();
                }
            }else{
                this.speed += (this.acc)*(1/(framerate));
                this.ypos += this.speed/(framerate*scale);    
            }    
        }
        // if(this.ypos + this.diameter/2 >= height){
        //     this.ypos = height - this.diameter/2;
        //     this.stop();
        //     myTimer.stop();
        // }
        
        if(this.speed == 0){
            this.energy = (1/2) * (this.mass*this.lastSpeed*this.lastSpeed);
        }
        else{
            this.energy = (1/2) * (this.mass*this.speed*this.speed);
        }
        this.tooltip.update(this.xpos, this.ypos);
    }

    stop(){
        this.acc = 0;
        this.speed = 0;
    }

    setY(yValue){
        this.ypos = yValue; 
    }

    setX(xValue){
        this.xpos = xValue;
    }

    setMass(mValue){
        this.mass = mValue;
    }
};

class tooltip{
    constructor(xpos, ypos, willShowVel, willShowEnergy){
        this.xpos = xpos;
        this.ypos = ypos; 
        this.showVel = willShowVel;
        this.showAcc = false;
        this.showForce = false;
        this.showEn = willShowEnergy;
    };

    update(posx, posy){
        this.xpos=posx;
        this.ypos=posy;
    }

    showVelocity(speed){
        if(this.showVel){
            stroke(255);
            let offset = (roundIt(speed,2)).toString().length - 3;
            if(offset < 0) offset = 0;
            line(this.xpos, this.ypos, this.xpos+110+(offset*15), this.ypos);
            line(this.xpos+110+(offset*15), this.ypos,this.xpos+110+(offset*15)+10, this.ypos-7)
            textSize(13);
            noFill();
            stroke(255);
            textFont(timerFont);
            text("V = "+roundIt(speed,2)+" m/s", this.xpos+50,this.ypos - 5);
        }
    }

    showEnergy(energy){
        if(this.showEn){
            stroke(255);
            let offset = (roundIt(energy,2)).toString().length - 3;
            if(offset < 0) offset = 0;
            line(this.xpos, this.ypos, this.xpos-15, this.ypos-20);
            line(this.xpos-15, this.ypos-20, this.xpos-110, this.ypos-20);
            textSize(13);
            noFill();
            stroke(255);
            textFont(timerFont);
            text("E = "+roundIt(energy,2)+" J", this.xpos-110,this.ypos - 25);

        }
    }

    setShowVel(value){
        this.showVel = value;
    }

    setShowEnergy(value){
        this.showEn = value;
    }
}

function paddy(num, padlen, padchar) {
    let pad_char = typeof padchar !== 'undefined' ? padchar : '0';
    let pad = new Array(1 + padlen).join(pad_char);
    return (pad + num).slice(-pad.length);
}

function roundIt(value, precision) {
    var multiplier = Math.pow(10, precision || 0);
    return Math.round(value * multiplier) / multiplier;
}
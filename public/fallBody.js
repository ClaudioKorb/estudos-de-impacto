class fallBody {
  constructor(mass, xpos, ypos, diameter, myColor, hideSpeed, hideEnergy) {
    diameter ? (this.diameter = diameter) : (this.diameter = 40);
    mass ? (this.mass = mass) : (this.mass = 1);
    xpos ? (this.xpos = xpos) : (this.xpos = width / 2);
    ypos ? (this.ypos = ypos) : (this.ypos = startingPointPx - this.diameter / 2);
    myColor ? (this.color = myColor) : (this.color = color(51)); //'#fc4a1a'
    hideSpeed ? (this.showSpeed = false) : (this.showSpeed = true);
    hideEnergy ? (this.showEnergy = false) : (this.showEnergy = true);
    this.speed = 0;
    this.acc = 0;
    this.energy = 0;
    this.lastSpeed = 0;
    this.tooltip = new tooltip(this.xpos, this.ypos, this.showSpeed, this.showEnergy);
  }

  show() {
    if (this.speed == 0) {
      this.tooltip.showVelocity(this.lastSpeed);
    } else {
      this.tooltip.showVelocity(this.speed);
    }
    this.tooltip.showEnergy(this.energy);
    noStroke();
    fill(this.color);
    ellipse(this.xpos, this.ypos, this.diameter, this.diameter);
    noFill();
    stroke('white');
    textFont(timerFont);
    textAlign(CENTER);
    text(this.mass + ' kg', this.xpos, this.ypos + (textSize() / 2 - 2));
  }

  fall(speed) {
    this.acc = worldData.gravity;
    if (speed) {
      this.speed = speed;
    } else {
      speed = 0;
    }
    //this.speed = 1/(scale*framerate);
  }

  update() {
    if (this.speed > 0) {
      this.acc = worldData.gravity;
    }
    if (bottomBarrier) {
      if (bottomBarrier.checkCollision(this)) {
        if (this.speed > 0) {
          this.lastSpeed = this.speed;
          this.lastAcc = this.acc;
          this.stop();
          this.ypos = bottomBarrier.y1 - this.diameter / 2;
          myTimer.stop();
        }
      } else {
        this.speed += this.acc * (1 / framerate);
        this.ypos += this.speed / (framerate * worldScale);
      }
    }
    // if(this.ypos + this.diameter/2 >= height){
    //     this.ypos = height - this.diameter/2;
    //     this.stop();
    //     myTimer.stop();
    // }

    if (this.speed == 0) {
      this.energy = (1 / 2) * (this.mass * this.lastSpeed * this.lastSpeed);
    } else {
      this.energy = (1 / 2) * (this.mass * this.speed * this.speed);
    }
    this.tooltip.update(this.xpos, this.ypos);
  }

  stop() {
    this.acc = 0;
    this.speed = 0;
  }

  setY(yValue) {
    this.ypos = yValue;
  }

  setX(xValue) {
    this.xpos = xValue;
  }

  setMass(mValue) {
    this.mass = mValue;
  }

  showVel() {
    this.tooltip.setShowVel(true);
  }

  hideVel() {
    this.tooltip.setShowVel(false);
  }

  showEn() {
    this.tooltip.setShowEnergy(true);
  }

  hideEn() {
    this.tooltip.setShowEnergy(false);
  }
}

class tooltip {
  constructor(xpos, ypos, willShowVel, willShowEnergy) {
    this.xpos = xpos;
    this.ypos = ypos;
    this.showVel = willShowVel;
    this.showAcc = false;
    this.showForce = false;
    this.showEn = willShowEnergy;
  }

  update(posx, posy) {
    this.xpos = posx;
    this.ypos = posy;
  }

  showVelocity(speed) {
    if (this.showVel) {
      stroke(strokeColour);
      let offset = roundIt(speed, 2).toString().length - 3;
      if (offset < 0) offset = 0;
      line(this.xpos, this.ypos, this.xpos + 110 + offset * 15, this.ypos);
      line(this.xpos + 110 + offset * 15, this.ypos, this.xpos + 110 + offset * 15 + 10, this.ypos - 7);
      textSize(13);
      noFill();
      stroke(strokeColour);
      textFont(timerFont);
      text('V = ' + roundIt(speed, 1) + ' m/s', this.xpos + 60, this.ypos - 5);
    }
  }

  showEnergy(energy) {
    if (this.showEn) {
      stroke(strokeColour);
      let offset = roundIt(energy, 2).toString().length - 3;
      if (offset < 0) offset = 0;
      line(this.xpos, this.ypos, this.xpos - 15, this.ypos - 20);
      line(this.xpos - 15, this.ypos - 20, this.xpos - 110, this.ypos - 20);
      textSize(13);
      noFill();
      stroke(strokeColour);
      textFont(timerFont);
      text('E = ' + roundIt(energy, 2) + ' J', this.xpos - 80, this.ypos - 25);
    }
  }

  setShowVel(value) {
    this.showVel = value;
  }

  setShowEnergy(value) {
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

class Barrier{
    constructor(x1, y1, x2, y2){
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
    }
    show(){
        stroke('#DFDCE3');
        line(this.x1, this.y1, this.x2, this.y2);
    }

    checkCollision(body){
        let xc = body.xpos;
        let yc = body.ypos;
        let m = (1.0 * this.y1 - this.y2) / (1.0 * this.x1 - this.x2); //y = mx
        let mp; 
        let xi;
        let yi;
        if(m == 0){                             // if m = 0, there's no slope
            xi = xc;
            yi = this.y2;
        }else{
            mp = -1.0 / m;
            xi = ((mp * xc) - (m * this.x2)) / (mp - m);
            yi = (m * xi) - (m * this.x2) - this.y2;    
        }
        let d = Math.sqrt((yi - yc)*(yi - yc) + (xi - xc)*(xi - xc));
        if(d <= parseFloat(body.diameter/2)){
            return true;
        }else{
            return false;
        }
    }
}

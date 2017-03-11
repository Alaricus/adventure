class character {

    constructor(scene) {
        this.x = 430;
        this.y = 555; //655;
        this.way = null;
        this.speed = null;   
        this.size = 1;
        this.ph = 247;
        this.pw = 95;
        this.h = this.ph * this.size;
        this.w = this.pw * this.size;   
        this.sc = scene;
    }

    move() {         
        // create coordinates to travel to
        if (this.way[0] === 0) this.way.shift();
        const destinationX = this.way[0].x;
        const destinationY = this.way[0].y;
        
        let distX = destinationX - this.x;
        let distY = destinationY - this.y;
        let distance = Math.sqrt(distX*distX + distY*distY);
        let factor = distance / this.speed;
        this.x += (distX / factor);
        this.y += (distY / factor);

        if (distance < this.speed) {
            this.x = destinationX;
            this.y = destinationY;
        }

        if (this.x === destinationX && this.y === destinationY) this.way.shift();
    }

    adjustSpeed() {
        this.speed = (this.y / this.sc.background.height + 1) / 0.75;
    }

    adjustSize() {
        this.size = (this.y / this.sc.background.height + 1) / 2;
        this.h = this.ph * this.size;
        this.w = this.pw * this.size;
    }

    isBehind() {
        for (let i = 0; i < this.sc.topImageCoords.length; i++) {
            if ((this.x > this.sc.topImageCoords[i].x - this.w / 2 
            && this.x < this.sc.topImageCoords[i].x + this.sc.topImageCoords[i].w + this.w / 2) 
            && (this.y > this.sc.topImageCoords[i].y 
            && this.y < this.sc.topImageCoords[i].y + this.sc.topImageCoords[i].h )) {
                return true;
            }
        }
        return false;
    }
}

module.exports = character;
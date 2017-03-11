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

    adjustSpeed(sceneHeight) {
        this.speed = (this.y / sceneHeight + 1) / 0.75;
    }

    adjustSize(sceneHeight) {
        this.size = (this.y / sceneHeight + 1) / 2;
        this.h = this.ph * this.size;
        this.w = this.pw * this.size;
    }

    isBehind(x, y, w, h) {
        if ((this.x > x - this.w / 2 && this.x < x + w + this.w / 2) && (this.y > y && this.y < y + h )) {
            return true;
        }
        return false;
    }
}

module.exports = character;
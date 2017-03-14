class character {

    constructor() {
        this.x = 430;
        this.y = 555;
        this.way = null;
        this.speed = null;   
        this.size = 1;
        this.ph = 48;
        this.pw = 48;
        this.h = this.ph * this.size;
        this.w = this.pw * this.size; 
        this.direction = 0;  
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

        this.facing();
    }

    adjustSpeed(sceneHeight) {
        this.speed = (this.y / sceneHeight + 1) / 0.75;
    }

    adjustSize(sceneHeight) {
        this.size = (this.y / sceneHeight + 1) / 2;
        this.h = this.ph * this.size;
        this.w = this.pw * this.size;
    }

    facing() {

        if (this.way[0] !== undefined) {
            const xDiff = Math.abs(this.way[0].x - this.x);
            const yDiff = Math.abs(this.way[0].y - this.y);

            if (xDiff >= yDiff) { // horizontal
                if (this.way[0].x - this.x <= 0) { 
                    this.direction = 1; // left
                } else {
                    this.direction = 2; // right
                }
            } else { // vertical
                if (this.way[0].y - this.y <= 0) { 
                    this.direction = 3; // up
                } else {
                    this.direction = 0; // down
                }
            }
        }
    }

    isBehind(x, y, w, h) {
        if ((this.x > x - this.w / 2 && this.x < x + w + this.w / 2) && (this.y > y && this.y < y + h )) {
            return true;
        }
        return false;
    }
}

module.exports = character;
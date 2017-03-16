class character {

    constructor(charId) {
        this.initialize(charId);
    }

    async initialize(charId) {
        await this.getCharacterData(charId);
        await this.getSpriteSheet(charId);

        this.x = this.data.start.x;
        this.y = this.data.start.y;
        this.direction = this.data.direction;

        this.way = null;
        this.speed = null;   
        this.size = 1;

        this.maxH = this.data.maxH;
        this.maxW = this.data.maxW;
        this.h = this.maxH * this.size;
        this.w = this.maxW * this.size; 
        
        this.frameIndex = 0;
        this.totalFrames = 0;
        this.ticksPerFrame = 0;
        this.tickCount = 0;

        // This is a hack because I know that the sprite sheet is the largest asset (right now)
        // TODO: Make sure the event fires when everything is loaded
        this.sprite.onload = () => {
            const doneLoading = new Event("characterloaded");
            window.dispatchEvent(doneLoading);
        };
    }

    async getCharacterData(id) {
        try {
            const response = await fetch(`./assets/character${id}/character.json`);
            this.data = await response.json();
        } catch(err) {
            console.log(`Error loading character${id} data.`)
        } 
    }

    async getSpriteSheet(id) {
        try {
            const url = `./assets/character${id}/sprite.png`;
            this.sprite = new Image();
            const response = await fetch(url);
            const blob = await response.blob();
            this.sprite.src = await URL.createObjectURL(blob);
        } catch(err) {
            console.log(`Error loading character${id} sprite.`);
        }
    }

    update() {
        this.facing();
        this.getAnimationInfo();

        if (this.way !== null && this.way.length > 0) {
            this.move();        
            this.tickCount += 1;                
            if (this.tickCount > this.ticksPerFrame) {        
                this.tickCount = 0;        	
                this.frameIndex += 1; 
            }
            if (this.frameIndex > this.totalFrames - 1) this.frameIndex = 1;
        } else {
            this.frameIndex = 1;
        }
        this.animationFrame = [
            this.sprite, 
            this.spriteStartX + this.frameIndex * 32, // This assumes character frames are horizontal
            this.spriteStartY, 
            this.frameW, 
            this.frameH, 
            this.x-this.w / 2, 
            this.y-this.h, 
            this.w, 
            this.h
        ];
    }

    move() {         
        // create coordinates to travel to
        if (this.way[0] === 0) this.way.shift();
        const destinationX = this.way[0].x;
        const destinationY = this.way[0].y;
        
        const distX = destinationX - this.x;
        const distY = destinationY - this.y;
        const distance = Math.sqrt(distX*distX + distY*distY);
        const factor = distance / this.speed;
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
        this.h = this.maxH * this.size;
        this.w = this.maxW * this.size;
    }

    facing() {
        if (this.way !== null && this.way[0] !== undefined) {
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

    getAnimationInfo() {
        switch (this.direction) {
            case 0:
                this.totalFrames = this.data.sprite.down.frames;
                this.ticksPerFrame = this.data.sprite.down.ticks;
                this.spriteStartX = this.data.sprite.down.sx;
                this.spriteStartY = this.data.sprite.down.sy;
                this.frameW = this.data.sprite.down.sw;
                this.frameH = this.data.sprite.down.sh;
                break;
            case 1:
                this.totalFrames = this.data.sprite.left.frames;
                this.ticksPerFrame = this.data.sprite.left.ticks;
                this.spriteStartX = this.data.sprite.left.sx;
                this.spriteStartY = this.data.sprite.left.sy;
                this.frameW = this.data.sprite.left.sw;
                this.frameH = this.data.sprite.left.sh;
                break;
            case 2:
                this.totalFrames = this.data.sprite.right.frames;
                this.ticksPerFrame = this.data.sprite.right.ticks;
                this.spriteStartX = this.data.sprite.right.sx;
                this.spriteStartY = this.data.sprite.right.sy;
                this.frameW = this.data.sprite.right.sw;
                this.frameH = this.data.sprite.right.sh;
                break;
            case 3:
                this.totalFrames = this.data.sprite.up.frames;
                this.ticksPerFrame = this.data.sprite.up.ticks;
                this.spriteStartX = this.data.sprite.up.sx;
                this.spriteStartY = this.data.sprite.up.sy;
                this.frameW = this.data.sprite.up.sw;
                this.frameH = this.data.sprite.up.sh;
                break;
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
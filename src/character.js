"use strict";

const Animation = require("./animation");

class character {

    constructor(charInfo) {
        this.initialize(charInfo);
    }

    async initialize(charInfo) {
        const charId = charInfo.id;

        await this.getCharacterData(charId);
        await this.getSpriteSheet(charId);

        this.anims = {};
        for (let anim in this.data.animations) {
            this.anims[anim] = new Animation(this.data.animations[anim]);
        }

        this.x = charInfo.start.x;
        this.y = charInfo.start.y;
        this.direction = charInfo.direction;

        this.way = null;
        this.speed = null;   
        this.size = 1;

        this.maxH = this.data.maxH;
        this.maxW = this.data.maxW;
        this.h = this.maxH * this.size;
        this.w = this.maxW * this.size; 

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
        if (this.facing() !== undefined) this.direction = this.facing();
        if (this.way !== null && this.way.length > 0) {
            this.move();
            this.anims[this.direction].nextTick();
        } else {
            this.anims[this.direction].returnToIdle();
        }        
        this.createCompleteFrame();
    }

    createCompleteFrame() {
        const animInfo = this.anims[this.direction].frame;
        this.animationFrame = [
            this.sprite, 
            animInfo[0], 
            animInfo[1], 
            animInfo[2], 
            animInfo[3],
            this.x-this.w / 2, 
            this.y-this.h, 
            this.w, 
            this.h
        ];
    }

    move() {         
        // Create coordinates to travel to
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

            if (xDiff >= yDiff) {
                if (this.way[0].x - this.x <= 0) { 
                    return "left";
                } else {
                    return "right";
                }
            } else {
                if (this.way[0].y - this.y <= 0) { 
                    return "up";
                } else {
                    return "down";
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
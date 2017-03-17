class animation {
    
    constructor(animData) {
        this.totalFrames = animData.frames;
        this.ticksPerFrame = animData.ticks;
        this.spriteStartX = animData.sx;
        this.spriteStartY = animData.sy;
        this.frameW = animData.sw;
        this.frameH = animData.sh;
        this.idleFrame = animData.idle - 1;
        this.returnToIdle();
    }

    nextTick() {                   
        this.tickCount += 1;                
        if (this.tickCount > this.ticksPerFrame) {        
            this.tickCount = 0;        	
            this.frameIndex += 1; 
        }
        if (this.frameIndex > this.totalFrames - 1) this.frameIndex = 1;

        this.createFrame();
    }

    createFrame()
    {
        this.frame = [
            this.spriteStartX + this.frameIndex * this.frameW, // This assumes character frames are horizontal
            this.spriteStartY, 
            this.frameW, 
            this.frameH, 
        ];
    }

    returnToIdle() {
        this.tickCount = 0;
        this.frameIndex = this.idleFrame;
        this.createFrame();
    }
}

module.exports = animation;
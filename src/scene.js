class scene {
    
    constructor(sceneNum) {
        this.initialize(sceneNum);
    }

    async initialize(sceneNum) {
        await this.getData(sceneNum);

        await this.data.characters.forEach((char) => {
            this.getImage(char, null)
        });

        await this.getImage("sprite", sceneNum);
        
        // This is a hack because I know that the sprite sheet is the largest asset (right now)
        // TODO: Make sure the event fires when everything is loaded
        this.sprite.onload = () => {
            let doneLoading = new Event("sceneloaded");
            window.dispatchEvent(doneLoading);
        };
    }

    async getData(num) {
        try {
            let response = await fetch(`./assets/scene${num}/scene.json`);
            this.data = await response.json();
        } catch(err) {
            console.log(`Error loading scene${num} data.`)
        } 
    }

    async getImage(img, num) {
        try {
            let url;
            if (num !== null) {
                url = `./assets/scene${num}/${img}.png`;
            } else {
                url = `./assets/character${img}/character.png`;
                img = `character`;
            }
            this[img] = new Image();
            let response = await fetch(url);
            let blob = await response.blob();
            this[img].src = await URL.createObjectURL(blob);
        } catch(err) {
            console.log(`Error loading an asset: ${img} ${num}`);
        }
    }
}

module.exports = scene;

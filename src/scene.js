class scene {
    
    constructor(sceneNum) {
        this.initialize(sceneNum);
    }

    async initialize(sceneNum) {
        await this.getSceneData(sceneNum);

        await this.getWalkable(sceneNum);
        this.topImageCoords = this.sceneData.topAreas;

        this.sceneData.backgrounds.forEach((image) => {
            this.getImage(image, sceneNum);
        });

        this.sceneData.foregrounds.forEach((image) => {
            this.getImage(image, sceneNum);
        });  

        this.sceneData.characters.forEach((char) => {
            this.getImage(char, null)
        });
        
        // This is a hack because I know that background is the largest asset (right now)
        // TODO: Make sure the event fires when everything is loaded
        this.background.onload = () => {
            // This event will fire after the promise is fulfilled and we get the data
            let doneLoading = new Event("sceneloaded");
            window.dispatchEvent(doneLoading);
        };
    }

    async getSceneData(num) {
        try {
            let response = await fetch(`./assets/scene${num}/scene.json`);
            this.sceneData = await response.json();
        } catch(err) {
            console.log(`Error loading scene${num} data.`)
        } 
    }

    async getWalkable(num) {
        try {
            let response = await fetch(`./assets/scene${num}/walkable.json`);
            this.walkableAreaJSON = await response.json();
        } catch(err) {
            console.log(`Error loading scene${num} walkable areas.`)
        } 
    }

    async getImage(img, num) {
        try {
            let url;
            if (num !== null) {
                url = `./assets/scene${num}/${img}.png`;
            } else {
                url = `./assets/character${img}/character.png`;
                img = `character${img}`;
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

class scene {
    
    constructor(sceneNum) {

        this.foreground = new Image();
        this.background = new Image();
        this.character = new Image();

        let self = this;

        const request1 = fetch(`./assets/scene${sceneNum}/walkable.json`);
        const request2 = fetch(`./assets/scene${sceneNum}/foreground.png`);
        const request3 = fetch(`./assets/scene${sceneNum}/background.png`);
        const request4 = fetch(`./assets/character${sceneNum}/char.png`);

        Promise.all([request1, request2, request3, request4])
            .then((results) => {

                let walkableJSON = results[0].json();
                walkableJSON.then((value) => {
                    self.walkableAreaJSON = value;
                });

                let foregroundBlob = results[1].blob();
                foregroundBlob.then((value) => {
                    self.foreground.src = URL.createObjectURL(value);
                });
                
                let backgroundBlob = results[2].blob();
                backgroundBlob.then((value) => {
                    self.background.src = URL.createObjectURL(value);
                });

                let characterBlob = results[3].blob();
                characterBlob.then((value) => {
                    self.character.src = URL.createObjectURL(value);
                });                
            })
            .catch((err) => {  
                console.log(`Error fetching assets for scene and character ${sceneNum}: `, err);  
            });
            
        this.topImageCoords = [
            {x: 555, y: 430, w: 426, h: 140},
            {x: 0, y: 575, w: 250, h: 200},
            {x: 310, y: 165, w: 170, h: 150}
        ];

        // This is a hack because I know that background is the largest asset (right now)
        // TODO: Make sure the event fires when everything is loaded
        this.background.onload = () => {
            // This event will fire after the promise is fulfilled and we get the data
            let doneLoading = new Event("sceneloaded");
            window.dispatchEvent(doneLoading);
        };
    }
}

module.exports = scene;

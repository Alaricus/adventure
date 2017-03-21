"use strict";

class scene {
    
    constructor(sceneId) {
        this.initialize(sceneId);
    }

    async initialize(sceneId) {
        await this.getSceneData(sceneId);
        await this.getSpriteSheet(sceneId);
        
        // This is a hack because I know that the sprite sheet is the largest asset (right now)
        // TODO: Make sure the event fires when everything is loaded
        this.sprite.onload = () => {
            const doneLoading = new Event("sceneloaded");
            window.dispatchEvent(doneLoading);
        };
    }

    async getSceneData(id) {
        try {
            const response = await fetch(`./assets/scene${id}/scene.json`);
            this.data = await response.json();
        } catch(err) {
            console.log(`Error loading scene${id} data.`)
        } 
    }

    async getSpriteSheet(id) {
        try {
            const url = `./assets/scene${id}/sprite.png`;
            this.sprite = new Image();
            const response = await fetch(url);
            const blob = await response.blob();
            this.sprite.src = await URL.createObjectURL(blob);
        } catch(err) {
            console.log(`Error loading scene${id} sprite.`);
        }
    }

    // runActions(chars) {
    //     // TODO: Need to process each action individually and create an action object
    //     this.data.actions.forEach((action) => {
    //         if (action.finite) {
    //             if (action.subject.startsWith("char")) {
    //                 const charId = action.subject.charAt(5);
    //                 if (action.type === "move") {
    //                     chars[charId].way = action.destination;
    //                 }
    //             }
    //         }
    //     });
    // }
}

module.exports = scene;

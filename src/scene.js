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

    runScripts(chars) {
        // TODO: Need to process each script individually and create a script object
        this.data.scripts.forEach((script) => {
            if (script.finite) {
                if (script.subject.startsWith("char")) {
                    const charId = script.subject.charAt(5);
                    if (script.action === "move") {
                        chars[charId].way = script.destination;
                    }
                }
            }
        });
    }
}

module.exports = scene;

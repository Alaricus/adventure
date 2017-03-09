"use strict";

(function () {  

    const Scene = require("./scene");
    const Pathfinding = require("./pathfinding");
    const Character = require("./character");
    
    const sc = new Scene(0);
    let ch;
    let pf;

    window.addEventListener("sceneloaded", () => {
        canvas.width = sc.background.width;
        canvas.height = sc.background.height;
        pf = new Pathfinding(sc);
        ch = new Character(sc);
        document.getElementById("loading").style.display = "none";
        document.getElementById("debug").style.display = "block";        
    }, false);

    const canvas = document.getElementById("game");
    const ctx = canvas.getContext("2d");
    
    let mouseData = { x: -1, y: -1 };

    canvas.addEventListener("mousemove", (e) => {
        mouseData = getMouseData(canvas, e);
    }, false); 

    canvas.addEventListener("click", () => {        
        // If the area is within bounds and destination isn't the same as origin
        if (pf.accessible(mouseData.x, mouseData.y) 
            && pf.accessible(ch.x, ch.y) 
            && !(mouseData.x === ch.x && mouseData.y === ch.y)) {

            // Add the origin and destination points to the list of path nodes
            pf.pathNodes.unshift({x: ch.x, y: ch.y});
            pf.pathNodes.push(mouseData);

            // Create a list of all valid A-to-B paths with distance
            pf.buildListOfValidPaths(pf.pathNodes);

            ch.way = pf.buildPath(pf.dijkstra());

            // When all done walking, remove the paths and two nodes that were added above
            pf.pathNodes.shift();
            pf.pathNodes.pop();
            pf.validPaths = [];
        }
    }, false);

    const getMouseData = (canv, e) => {
        let rect = canv.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    };

    const main = () => {
        if (ch !== undefined && pf !== undefined) {
            update();
            draw();
        }
        requestAnimationFrame(main);
    };

    const update = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ch.adjustSize();
        ch.adjustSpeed();
        if (ch.way !== null && ch.way.length > 0) ch.move();
    };

    const draw = () => {
        ctx.drawImage(sc.background, 0, 0, canvas.width, canvas.height);
        if (ch.isBehind()) {
            ctx.drawImage(sc.character, ch.x-ch.w/2, ch.y-ch.h, ch.w, ch.h);
            ctx.drawImage(sc.foreground, 0, 0, canvas.width, canvas.height);
        } else {
            ctx.drawImage(sc.foreground, 0, 0, canvas.width, canvas.height);
            ctx.drawImage(sc.character, ch.x-ch.w/2, ch.y-ch.h, ch.w, ch.h);
        }

        /****************************************/
        /*           Debugging Stuff            */
        /****************************************/

        // Draw foreground image areas
        if (document.getElementById("foreground").checked) {
            for (let i = 0; i < sc.topImageCoords.length; i++) {
                ctx.strokeStyle = "#ff471a";
                ctx.strokeRect(sc.topImageCoords[i].x, sc.topImageCoords[i].y, sc.topImageCoords[i].w, sc.topImageCoords[i].h);
                ctx.strokeStyle = "#000000";
            }
        }

        // Draw walkable area
        if (document.getElementById("walkArea").checked) {
            pf.allPolygons.forEach((polygon) => {
                polygon.forEach((vertex, index) => {
                    ctx.fillStyle = "#0066ff";
                    ctx.fillRect(vertex.x - 4, vertex.y - 4, 9, 9);
                    ctx.fillStyle = "#000000";

                    ctx.strokeStyle="#0066ff";
                    ctx.beginPath();
                    ctx.moveTo(vertex.x, vertex.y);
                    let i;
                    index < polygon.length-1 ? i = index + 1 : i = 0;
                    ctx.lineTo(polygon[i].x, polygon[i].y);
                    ctx.stroke();
                    ctx.strokeStyle = "#000000";
                });                    
            });
        }

        // Draw path nodes
        if (document.getElementById("pathNodes").checked) {
            pf.pathNodes.unshift({x: ch.x, y: ch.y});
            pf.pathNodes.push(mouseData);

            pf.pathNodes.forEach((item) => {
                ctx.fillStyle = "#ff00ff";
                ctx.fillRect(item.x - 4, item.y - 4, 9, 9);
                ctx.fillStyle = "#000000";

                // ctx.font = "15px Arial";
                // ctx.fillText(index,item.x,item.y);
            });

            pf.pathNodes.shift();
            pf.pathNodes.pop();
        }

        // Draw path
        if (document.getElementById("pathLine").checked) {
            if (pf.accessible(mouseData.x, mouseData.y)
                && pf.accessible(ch.x, ch.y)) {
                pf.pathNodes.unshift({x: ch.x, y: ch.y});
                pf.pathNodes.push(mouseData);
                pf.buildListOfValidPaths();
                const travelNodes = pf.buildPath(pf.dijkstra());
                travelNodes.forEach((item, index) =>{
                    if (index !== travelNodes.length - 1) {
                        ctx.strokeStyle = "#33cc33";
                        ctx.lineWidth = 2;
                        ctx.beginPath();
                        ctx.moveTo(item.x, item.y);
                        ctx.lineTo(travelNodes[index + 1].x, travelNodes[index + 1].y);
                        ctx.stroke();
                        ctx.lineWidth = 1;
                        ctx.strokeStyle = "#000000";
                    }
                });
                pf.pathNodes.shift();
                pf.pathNodes.pop();
                pf.validPaths = [];
            }
        }
    };

    main();

})();

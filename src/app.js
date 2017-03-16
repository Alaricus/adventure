"use strict";

(function () {

    const Scene = require("./scene");
    const Pathfinding = require("./pathfinding");
    const Character = require("./character");

    const canvas = document.getElementById("game");
    const ctx = canvas.getContext("2d");
    
    let mouseData = { x: -1, y: -1 };    
    let sc = new Scene(0);
    let ch;
    let pf;

    window.addEventListener("sceneloaded", () => {
        canvas.width = sc.data.background.sw;
        canvas.height = sc.data.background.sh;
        pf = new Pathfinding(sc);
        ch = new Character(sc);
        document.getElementById("loading").style.display = "none";
        document.getElementById("debug").style.display = "block";        
    }, false);

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

    document.getElementById("newScene").addEventListener("click", () => {
        ch = undefined;
        pf = undefined;
        canvas.width = 0;
        canvas.height = 0;
        document.getElementById("loading").style.display = "block";
        document.getElementById("debug").style.display = "none";

        (sc.data.name === "Cliff Daytime") ? sc = new Scene(1) : sc = new Scene(0);
    });

    const getMouseData = (canv, e) => {
        const rect = canv.getBoundingClientRect();
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
        
        // TODO: Redo these at some point to not have y-based calculations (try alpha-maps maybe)
        ch.adjustSize(sc.data.background.sh);
        ch.adjustSpeed(sc.data.background.sh);
        
        ch.update();
    };

    const draw = () => {
        ctx.drawImage(sc.sprite, sc.data.background.sx, sc.data.background.sy, sc.data.background.sw, sc.data.background.sh, sc.data.background.sx, sc.data.background.sy, sc.data.background.sw, sc.data.background.sh);
        
        sc.data.foregrounds.forEach((foreground, index) => {
            const sx = sc.data.foregrounds[index].sx;
            const sy = sc.data.foregrounds[index].sy;
            const sw = sc.data.foregrounds[index].sw;
            const sh = sc.data.foregrounds[index].sh;
            const px = sc.data.foregrounds[index].px;
            const py = sc.data.foregrounds[index].py;
            const pw = sc.data.foregrounds[index].pw;
            const ph = sc.data.foregrounds[index].ph;
            if (!ch.isBehind(px, py, pw, ph)) ctx.drawImage(sc.sprite, sx, sy, sw, sh, px, py, pw, ph);
        });

        // Animate the character
        const af = ch.animationFrame;
        ctx.drawImage(af[0], af[1],  af[2], af[3], af[4], af[5], af[6], af[7], af[8]);
        
        // Drawing a non-animated character
        // ctx.drawImage(sc.character, ch.x-ch.w/2, ch.y-ch.h, ch.w, ch.h);
        
        sc.data.foregrounds.forEach((foreground, index) => {
            const sx = sc.data.foregrounds[index].sx;
            const sy = sc.data.foregrounds[index].sy;
            const sw = sc.data.foregrounds[index].sw;
            const sh = sc.data.foregrounds[index].sh;
            const px = sc.data.foregrounds[index].px;
            const py = sc.data.foregrounds[index].py;
            const pw = sc.data.foregrounds[index].pw;
            const ph = sc.data.foregrounds[index].ph;
            if (ch.isBehind(px, py, pw, ph)) ctx.drawImage(sc.sprite, sx, sy, sw, sh, px, py, pw, ph);
        });

        /****************************************/
        /*           Debugging Stuff            */
        /****************************************/

        // Draw foreground image areas
        if (document.getElementById("foreground").checked) {
            sc.data.foregrounds.forEach((item) => {
                ctx.strokeStyle = "#ff471a";
                ctx.strokeRect(item.px, item.py, item.pw, item.ph);
                ctx.strokeStyle = "#000000";
            });
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

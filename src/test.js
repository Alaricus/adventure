"use strict";

(function () {  

    let screen = {
        canvas: null,
        ctx: null,
        mouseData: null,
        initialize: () => {
            screen.canvas = document.getElementById("game");
            screen.ctx = screen.canvas.getContext("2d");
            screen.ctx.canvas.width = 1010;
            screen.ctx.canvas.height = 720;
            screen.canvas.addEventListener("click", (e) => {
                screen.mouseData = screen.getMouseData(screen.canvas, e);
            }, false);
        },
        getMouseData: (canv, e) => {
            let rect = canv.getBoundingClientRect();
            return {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
        },
    };    

    let before = Date.now();     

    let scene = {
        foreground: null,
        background: null,
        topImageCoords: null,
        initialize: () => {
            scene.foreground = new Image();
            scene.foreground.src = "./assets/scene0/foreground.png";
            scene.background = new Image();
            scene.background.src = "./assets/scene0/background.png";
            screen.mouseData = { x: 430, y: 655 };
            character.x = 430;
            character.y = 655;
            scene.topImageCoords = [{x: 481, y: 430, w: 500, h: 140}, {x: 0, y: 575, w: 250, h: 200}, {x: 310, y: 165, w: 170, h: 150}];
        },
        main: () => {
            let now = Date.now();
            let delta = now - before;
            scene.update(delta/1000);
            scene.draw();
            before = now;
            requestAnimationFrame(scene.main);
        },
        update: () => {

            screen.ctx.clearRect(0, 0, screen.ctx.canvas.width, screen.ctx.canvas.height);

            // If the area is within bounds and destination isn't the same as origin
            if (pathfinding.accessible(screen.mouseData.x, screen.mouseData.y) 
                && screen.mouseData.x !== character.x 
                && screen.mouseData.y !== character.y) {

                // Add the origin point to the list of path nodes
                pathfinding.pathNodes.push({x: character.x, y: character.y});

                // Add the destination point to the list of path nodes
                pathfinding.pathNodes.push(screen.mouseData);

                // If origin and destination are within the line of sight
                if (pathfinding.lineOfSight(pathfinding.pathNodes[pathfinding.pathNodes.length-1], pathfinding.pathNodes[pathfinding.pathNodes.length-2])) {
                    character.moving = true;                    
                }
            
                if (character.moving) character.move(pathfinding.pathNodes[pathfinding.pathNodes.length-1]);

                // When all done walking, remove the two path nodes that were added above
                pathfinding.pathNodes.splice(-2, 2);
            }
        },
        draw: () => {
            
            screen.ctx.drawImage(scene.background, 0, 0, screen.ctx.canvas.width, screen.ctx.canvas.height);
            if (scene.isBehind()) {
                screen.ctx.drawImage(character.image, character.x-character.w/2, character.y-character.h, character.w, character.h);
                screen.ctx.drawImage(scene.foreground, 0, 0, screen.ctx.canvas.width, screen.ctx.canvas.height);
            } else {
                screen.ctx.drawImage(scene.foreground, 0, 0, screen.ctx.canvas.width, screen.ctx.canvas.height);
                screen.ctx.drawImage(character.image, character.x-character.w/2, character.y-character.h, character.w, character.h);
            }

            /****************************************/
            /*           Debugging Stuff            */
            /****************************************/

            // Draw foreground image areas
            if (document.getElementById("foreground").checked) {
                for (let i = 0; i < scene.topImageCoords.length; i++) {
                    screen.ctx.strokeRect(scene.topImageCoords[i].x, scene.topImageCoords[i].y, scene.topImageCoords[i].w, scene.topImageCoords[i].h);
                }
            }

            // Draw path nodes
            if (document.getElementById("pathNodes").checked) {
                pathfinding.pathNodes.forEach((item) => {
                    screen.ctx.fillStyle="#ff00ff";
                    screen.ctx.fillRect(item.x - 4, item.y - 4, 9, 9);
                });
            }

            // Draw path
            if (document.getElementById("pathLine").checked) {
                screen.ctx.strokeStyle="#ff00ff";
                screen.ctx.beginPath();
                screen.ctx.moveTo(character.x, character.y);
                screen.ctx.lineTo(screen.mouseData.x, screen.mouseData.y);
                screen.ctx.stroke();
            }
            
        },
        isBehind: () => {
            for (let i = 0; i < scene.topImageCoords.length; i++) {
                if ((character.x > scene.topImageCoords[i].x-character.w / 2 
                && character.x < scene.topImageCoords[i].x + scene.topImageCoords[i].w + character.w / 2) 
                && (character.y > scene.topImageCoords[i].y 
                && character.y < scene.topImageCoords[i].y + scene.topImageCoords[i].h )) {
                    return true;
                }
            }
            return false;
        }
    };

    let character = {
        size: null,
        ph: null,
        pw: null,
        h: null,
        w: null,
        x: null,
        y: null,
        speed: 3,
        m2x: null,
        m2y: null,        
        image: null,
        moving: false,
        initialize: () => {
            character.size = 1;
            character.ph = 262;
            character.pw = 112;
            character.h = character.ph * character.size;
            character.w = character.pw * character.size;
            character.image = new Image();
            character.image.src = "./assets/character0/char.png";
        },
        move: (destination) => {
            let distX = destination.x - character.x;
            let distY = destination.y - character.y;
            let distance = Math.sqrt(distX*distX + distY*distY);
            let factor = distance / character.speed;
            character.x += (distX / factor);
            character.y += (distY / factor);
            character.size = (character.y / screen.ctx.canvas.height + 1) / 2;
            character.h = character.ph * character.size;
            character.w = character.pw * character.size;

            if (distance < character.speed) {
                character.moving = false;
                character.x = destination.x;
                character.y = destination.y;
            }

            if (character.x === destination.x && character.y === destination.y) character.moving = false;
        }
    };

    let pathfinding = {
        allPolygons: [],
        pathNodes: [],
        initialize: () => {
            pathfinding.importWalkableArea();
        },
        importWalkableArea: () => {
            fetch("./assets/scene0/walkable.json")
                .then(response => response.json())
                .then(json => {
                    pathfinding.allPolygons = json.polygons;
                    pathfinding.buildGraphOfConcavePoints(json.polygons);
                })
        },
        segmentsCross: (A, B, C, D) => {
            const crossProductABCD = ((B.x - A.x) * (D.y - C.y)) - ((B.y - A.y) * (D.x - C.x));            
            if (crossProductABCD == 0) return false;        
            const crossProductACDC = ((A.y - C.y) * (D.x - C.x)) - ((A.x - C.x) * (D.y - C.y)); 
            const crossProductABAC = ((A.y - C.y) * (B.x - A.x)) - ((A.x - C.x) * (B.y - A.y));            
            if (crossProductACDC == 0 || crossProductABAC == 0) return false;            
            const test1 = crossProductACDC / crossProductABCD;
            const test2 = crossProductABAC / crossProductABCD;            
            return (test1 > 0 && test1 < 1) && (test2 > 0 && test2 < 1);
        },
        rayCrossings: (polygon, start, end) => {
            const isInside = false;
            let crossings = 0;
            for (let i = 0; i < polygon.length; i++) {
                let j = null;
                i === polygon.length - 1 ? j = 0 : j = i+1;
                if (pathfinding.segmentsCross(start, end, polygon[i], polygon[j])) crossings++;
            }
            return crossings;
        },
        isConcave: (vertices, vertex) => {
            const prev = vertices[vertex === 0 ? vertices.length - 1 : vertex - 1];
            const curr = vertices[vertex];
            const next = vertices[(vertex + 1) % vertices.length];
            const vector1 = { x: curr.x - prev.x, y: curr.y - prev.y };
            const vector2 = { x: next.x - curr.x, y: next.y - curr.y };
            const zCrossProduct = (vector1.x * vector2.y) - (vector1.y * vector2.x);
            return zCrossProduct < 0;
        },
        accessible: (x, y) => {
            let totalCrossings = 0;
            pathfinding.allPolygons.forEach((item) => {
                totalCrossings += pathfinding.rayCrossings(item, {x: -1, y: -1}, {x: x, y: y});
            });
            if (totalCrossings === 0) {
                return false;
            } else if (totalCrossings % 2 === 0) {
                return false;
            } else {
                return true;
            }
        },
        lineOfSight: (a, b) => {
            // Does ab cross any side of any polygon?
            let intersections = 0;
            pathfinding.allPolygons.forEach((polygon) => {
                intersections += pathfinding.rayCrossings(polygon, a, b);
            });
            return intersections === 0 ? true : false;
        },
        buildGraphOfConcavePoints: (polygons) => {
            polygons.forEach((polygon) => {
                polygon.forEach((vertex, index) => {
                    if (pathfinding.isConcave(polygon, index)) pathfinding.pathNodes.push(vertex);
                });
            });
        }
    };

    screen.initialize();
    scene.initialize();
    character.initialize();
    pathfinding.initialize();
    scene.main();
})();

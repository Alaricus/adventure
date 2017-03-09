(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{"./character":2,"./pathfinding":3,"./scene":4}],2:[function(require,module,exports){
class character {

    constructor(scene) {
        this.x = 430;
        this.y = 655;
        this.way = null;
        this.speed = null;   
        this.size = 1;
        this.ph = 247;
        this.pw = 95;
        this.h = this.ph * this.size;
        this.w = this.pw * this.size;   
        this.sc = scene;
    }

    move() {         
        // create coordinates to travel to
        if (this.way[0] === 0) this.way.shift();
        const destinationX = this.way[0].x;
        const destinationY = this.way[0].y;
        
        let distX = destinationX - this.x;
        let distY = destinationY - this.y;
        let distance = Math.sqrt(distX*distX + distY*distY);
        let factor = distance / this.speed;
        this.x += (distX / factor);
        this.y += (distY / factor);
        this.h = this.ph * this.size;
        this.w = this.pw * this.size;

        if (distance < this.speed) {
            this.x = destinationX;
            this.y = destinationY;
        }

        if (this.x === destinationX && this.y === destinationY) this.way.shift();
    }

    adjustSpeed() {
        this.speed = (this.y / this.sc.background.height + 1) / 0.75;
    }

    adjustSize() {
        this.size = (this.y / this.sc.background.height + 1) / 2;
    }

    isBehind() {
        for (let i = 0; i < this.sc.topImageCoords.length; i++) {
            if ((this.x > this.sc.topImageCoords[i].x-this.w / 2 
            && this.x < this.sc.topImageCoords[i].x + this.sc.topImageCoords[i].w + this.w / 2) 
            && (this.y > this.sc.topImageCoords[i].y 
            && this.y < this.sc.topImageCoords[i].y + this.sc.topImageCoords[i].h )) {
                return true;
            }
        }
        return false;
    }
}

module.exports = character;
},{}],3:[function(require,module,exports){
class pathfinding {
    
    constructor(scene) {
        this.pathNodes = [];
        this.validPaths = [];
        this.allPolygons = scene.walkableAreaJSON.polygons;
        this.buildListOfConcavePoints(this.allPolygons);
    }

    // Takes four node objects where A and B are segment 1 and C and D are segment 2
    segmentsCross(A, B, C, D) {
        const crossProductABCD = ((B.x - A.x) * (D.y - C.y)) - ((B.y - A.y) * (D.x - C.x));            
        if (crossProductABCD == 0) return false;        
        const crossProductACDC = ((A.y - C.y) * (D.x - C.x)) - ((A.x - C.x) * (D.y - C.y)); 
        const crossProductABAC = ((A.y - C.y) * (B.x - A.x)) - ((A.x - C.x) * (B.y - A.y));            
        if (crossProductACDC == 0 || crossProductABAC == 0) return false;            
        const test1 = crossProductACDC / crossProductABCD;
        const test2 = crossProductABAC / crossProductABCD;            
        return (test1 > 0 && test1 < 1) && (test2 > 0 && test2 < 1);
    }

    // Takes polygon array and node objects
    rayCrossings(polygon, start, end) {
        let crossings = 0;
        for (let i = 0; i < polygon.length; i++) {
            let j = null;
            i === polygon.length - 1 ? j = 0 : j = i+1;
            if (this.segmentsCross(start, end, polygon[i], polygon[j])) {
                crossings++;                   
            }
        }
        return crossings;
    }

    // Takes two node indexes and checks if they form an edge on any of the polygons
    isAnEdge(a, b) {
        const ax = this.pathNodes[a].x;
        const ay = this.pathNodes[a].y;
        const bx = this.pathNodes[b].x;
        const by = this.pathNodes[b].y;
        let index1;
        let index2;
        let match = 0;
        // For every polygon check if it has a vertex at given coordinates
        this.allPolygons.forEach((polygon) => {
            index1 = polygon.findIndex((vertex) => {
                return vertex.x === ax && vertex.y === ay;
            })
            index2 = polygon.findIndex((vertex) => {
                return vertex.x === bx && vertex.y === by;
            })
            if (index1 + 1 === index2 || index2 + 1 === index1) match++;
        }, this);
        return match > 0 ? true : false;
    }

    // Checks if a vertex in a polygon is concave or convex
    isConcave(vertices, vertex) {
        const prev = vertices[vertex === 0 ? vertices.length - 1 : vertex - 1];
        const curr = vertices[vertex];
        const next = vertices[(vertex + 1) % vertices.length];
        const vector1 = { x: curr.x - prev.x, y: curr.y - prev.y };
        const vector2 = { x: next.x - curr.x, y: next.y - curr.y };
        const zCrossProduct = (vector1.x * vector2.y) - (vector1.y * vector2.x);
        return zCrossProduct < 0;
    }

    // Checks if a point is within the walkable area
    accessible(x, y) {
        const polygons = this.allPolygons;
        let totalCrossings = 0;
        polygons.forEach((polygon) => {
            totalCrossings += this.rayCrossings(polygon, {x: -1, y: -1}, {x: x, y: y});
        });
        if (totalCrossings === 0) {
            return false;
        } else if (totalCrossings % 2 === 0) {
            return false;
        } else {
            return true;
        }
    }

    // Takes indexes for pathNodes array to get correct nodes
    lineOfSight(a, b) {
        // Does ab cross any side of any polygon and is it's center in an accessible area
        const node1 = this.pathNodes[a];
        const node2 = this.pathNodes[b];
        const polygons = this.allPolygons;
        let intersections = 0;

        // Find the middle
        let middleX = node1.x + (node2.x - node1.x) / 2;
        let middleY = node1.y + (node2.y - node1.y) / 2;

        // Find if LOS
        if (this.accessible(middleX, middleY) || this.isAnEdge(a, b)) {
            polygons.forEach((polygon) => {
                intersections += this.rayCrossings(polygon, node1, node2);
            });
        } else {
            return false;
        }
        
        return intersections === 0 ? true : false;
    }

    // Builds a list of all the concave point currently on the screen
    buildListOfConcavePoints(polygons) {
        polygons.forEach((polygon) => {
            polygon.forEach((vertex, index) => {
                if (this.isConcave(polygon, index)) this.pathNodes.push(vertex);
            });
        });
    }

    // Builds a list of all valid connections between concave vertices (nodes)
    buildListOfValidPaths() {
        const nodes = this.pathNodes;
        nodes.forEach((node1, index1) => {
            if (index1 !== nodes.length - 1) {
                nodes.forEach((node2, index2) => {
                    // So long as the valid paths array doesn't already have an inverse pass
                    let inverseExists = this.validPaths.findIndex((path) => {
                        return path.a === index2 && path.b === index1;
                    });
                    // Check for non-zero distance and LOS then add to the validPaths
                    if (inverseExists === -1) {
                        if (this.nodesDistance(index1, index2) > 0 && this.lineOfSight(index1, index2)) {
                            this.validPaths.push({a: index1, b: index2, d: this.nodesDistance(index1, index2)});
                        }
                    }
                });
            }
        });
    }

    // Takes indexes for pathNodes array to get correct nodes
    nodesDistance(a, b) {
        const node1 = this.pathNodes[a];
        const node2 = this.pathNodes[b];
        if (node1.x === node2.x && node1.y === node2.y) {
            return 0;
        } else {
            const distX = node1.x - node2.x;
            const distY = node1.y - node2.y;
            return Math.sqrt(distX*distX + distY*distY);
        }    
    }

    // Dijkstar's algorythm. Not Sigismund Dijkstra
    dijkstra() {
        const nodes = this.pathNodes; // array of nodes: {x: 4, y: 8}
        const edges = this.validPaths; // array of edges: {a: 0, b: 1, d: 428}

        // Make an "unvisited" array store a list of all nodes' indexes         
        let unvisited = [];
        nodes.forEach((item, index) => { unvisited[index] = index; });

        // Make a data chart array, it will (at the corresponding index) store [shortest_distance_from_start, previous_node_index]
        let data = [[0, 0]];

        // Start with node 0 because it will always be the character's location
        let currentNode = 0;

        // Go through each node in unvisited
        while (unvisited.length > 0) {
            // Go through all edges and build a new array of those that are within LOS of this node
            const LOSedges = edges.filter((edge) => {
                // Return those that have this current unvisited node as one of the vertices
                return edge.a === currentNode || edge.b === currentNode;
            });

            // If distance to origin is shorter than recorded (or doesn't exist) update (or create) the entry
            LOSedges.forEach((edge) => {

                // If current node is B, switch it with A
                if (edge.b === currentNode) {
                    const temp = edge.a;
                    edge.a = edge.b;
                    edge.b = temp;
                }

                const edgeLength = edge.d;
                const edgeStartIndex = edge.a;
                const edgeEndIndex = edge.b;
                let distanceEdgeStartToOrigin = data[edgeStartIndex][0];
                const totalDistance = edgeLength + distanceEdgeStartToOrigin;

                if (unvisited.indexOf(edgeEndIndex) !== -1) {
                    if (data[edgeEndIndex] === undefined || totalDistance < data[edgeEndIndex][0]) {
                        data[edgeEndIndex] = [totalDistance, edgeStartIndex];
                    }
                }
            });

            // Once done, remove this node from unvisited
            const indexOfCurrentNode = unvisited.findIndex((item) => { return item === currentNode});
            unvisited.splice(indexOfCurrentNode, 1);

            // When all finished need to decide what unvisited vertex to go to next: needs to be closest to origin
            // go through all unvisited indexes in data, find one with shortest distance
            let test = { id: null, dist: null };

            data.forEach((item, index) => {
                if (unvisited.indexOf(index) !== -1 && (test.dist === null || item[0] < test.dist )) { 
                    test = { id: index, dist: item[0] };
                }
            });

            currentNode = test.id;
        }
        
        return data;
    }

    // Builds an array of nodes
    buildPath(data) {
        let nodesToTravel = [];
        let currentNode = data.length - 1;
        while (currentNode !== 0) {
            nodesToTravel.push(this.pathNodes[currentNode]);
            currentNode = data[currentNode][1];
        }
        nodesToTravel.push(this.pathNodes[0]);
        nodesToTravel.reverse();
        return nodesToTravel;
    }

}

module.exports = pathfinding;

},{}],4:[function(require,module,exports){
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

},{}]},{},[1]);

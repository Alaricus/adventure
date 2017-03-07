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
            screen.canvas.addEventListener("mousemove", (e) => {
                screen.mouseData = screen.getMouseData(screen.canvas, e);
            }, false);
            screen.canvas.addEventListener("click", (e) => {
                
                // If the area is within bounds and destination isn't the same as origin
                if (pathfinding.accessible(screen.mouseData.x, screen.mouseData.y) 
                    && !(screen.mouseData.x === character.x && screen.mouseData.y === character.y)) {

                    // Add the origin and destination points to the list of path nodes
                    pathfinding.pathNodes.unshift({x: character.x, y: character.y});
                    pathfinding.pathNodes.push(screen.mouseData);

                    // Create a list of all valid A-to-B paths with distance
                    pathfinding.buildListOfValidPaths(pathfinding.pathNodes);

                    character.way = pathfinding.buildPath(pathfinding.dijkstra());

                    // When all done walking, remove the paths and two nodes that were added above
                    pathfinding.pathNodes.shift();
                    pathfinding.pathNodes.pop();
                    pathfinding.validPaths = [];
                }

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

    let scene = {
        foreground: null,
        background: null,
        topImageCoords: null,
        initialize: () => {
            scene.foreground = new Image();
            scene.foreground.src = "./assets/scene0/foreground.png";
            scene.background = new Image();
            scene.background.src = "./assets/scene0/background.png";
            screen.mouseData = { x: -1, y: -1 };
            character.x = 430;
            character.y = 655;
            scene.topImageCoords = [{x: 481, y: 430, w: 500, h: 140}, {x: 0, y: 575, w: 250, h: 200}, {x: 310, y: 165, w: 170, h: 150}];
        },
        main: () => {
            scene.update();
            scene.draw();
            requestAnimationFrame(scene.main);
        },
        update: () => {
            screen.ctx.clearRect(0, 0, screen.ctx.canvas.width, screen.ctx.canvas.height);
            if (character.way !== null && character.way.length > 0) character.move();
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
                    screen.ctx.strokeStyle = "#ff471a";
                    screen.ctx.strokeRect(scene.topImageCoords[i].x, scene.topImageCoords[i].y, scene.topImageCoords[i].w, scene.topImageCoords[i].h);
                    screen.ctx.strokeStyle = "#000000";
                }
            }

            // Draw walkable area
            if (document.getElementById("walkArea").checked) {
                pathfinding.allPolygons.forEach((polygon) => {
                    polygon.forEach((vertex, index) => {
                        screen.ctx.fillStyle = "#0066ff";
                        screen.ctx.fillRect(vertex.x - 4, vertex.y - 4, 9, 9);
                        screen.ctx.fillStyle = "#000000";

                        screen.ctx.strokeStyle="#0066ff";
                        screen.ctx.beginPath();
                        screen.ctx.moveTo(vertex.x, vertex.y);
                        let i;
                        index < polygon.length-1 ? i = index + 1 : i = 0;
                        screen.ctx.lineTo(polygon[i].x, polygon[i].y);
                        screen.ctx.stroke();
                        screen.ctx.strokeStyle = "#000000";
                    });                    
                });
            }

            // Draw path nodes
            if (document.getElementById("pathNodes").checked) {
                pathfinding.pathNodes.unshift({x: character.x, y: character.y});
                pathfinding.pathNodes.push(screen.mouseData);

                pathfinding.pathNodes.forEach((item, index) => {
                    screen.ctx.fillStyle = "#ff00ff";
                    screen.ctx.fillRect(item.x - 4, item.y - 4, 9, 9);
                    screen.ctx.fillStyle = "#000000";

                    // screen.ctx.font = "15px Arial";
                    // screen.ctx.fillText(index,item.x,item.y);
                });

                pathfinding.pathNodes.shift();
                pathfinding.pathNodes.pop();
            }

            // Draw path
            if (document.getElementById("pathLine").checked) {
                if (pathfinding.accessible(screen.mouseData.x, screen.mouseData.y)) {
                    pathfinding.pathNodes.unshift({x: character.x, y: character.y});
                    pathfinding.pathNodes.push(screen.mouseData);
                    pathfinding.buildListOfValidPaths();
                    const travelNodes = pathfinding.buildPath(pathfinding.dijkstra());
                    travelNodes.forEach((item, index) =>{
                        if (index !== travelNodes.length - 1) {
                            screen.ctx.strokeStyle = "#33cc33";
                            screen.ctx.lineWidth = 2;
                            screen.ctx.beginPath();
                            screen.ctx.moveTo(item.x, item.y);
                            screen.ctx.lineTo(travelNodes[index + 1].x, travelNodes[index + 1].y);
                            screen.ctx.stroke();
                            screen.ctx.lineWidth = 1;
                            screen.ctx.strokeStyle = "#000000";
                        }
                    });
                    pathfinding.pathNodes.shift();
                    pathfinding.pathNodes.pop();
                    pathfinding.validPaths = [];
                }
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
        way: null,
        speed: null,       
        image: null,
        moving: false,
        initialize: () => {
            character.size = 1;
            character.speed = 3;
            character.ph = 262;
            character.pw = 112;
            character.h = character.ph * character.size;
            character.w = character.pw * character.size;
            character.image = new Image();
            character.image.src = "./assets/character0/char.png";
        },
        move: () => {
            // create coordinates to travel to
            if (character.way[0] === 0) character.way.shift();
            const destinationX = character.way[0].x;
            const destinationY = character.way[0].y;
            
            let distX = destinationX - character.x;
            let distY = destinationY - character.y;
            let distance = Math.sqrt(distX*distX + distY*distY);
            let factor = distance / character.speed;
            character.x += (distX / factor);
            character.y += (distY / factor);
            character.size = (character.y / screen.ctx.canvas.height + 1) / 2;
            character.h = character.ph * character.size;
            character.w = character.pw * character.size;

            if (distance < character.speed) {
                character.moving = false;
                character.x = destinationX;
                character.y = destinationY;
            }

            if (character.x === destinationX && character.y === destinationY) character.way.shift();
        }
    };

    let pathfinding = {
        allPolygons: [],
        pathNodes: [],
        validPaths: [],
        initialize: () => {
            pathfinding.importWalkableArea();
        },
        importWalkableArea: () => {
            fetch("./assets/scene0/walkable.json")
                .then(response => response.json())
                .then(json => {
                    pathfinding.allPolygons = json.polygons;
                    pathfinding.buildListOfConcavePoints(pathfinding.allPolygons);
                });
        },
        // takes four node objects where A and B are segment 1 and C and D are segment 2
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
        // Takes polygon array and node objects
        rayCrossings: (polygon, start, end) => {
            let crossings = 0;
            for (let i = 0; i < polygon.length; i++) {
                let j = null;
                i === polygon.length - 1 ? j = 0 : j = i+1;
                if (pathfinding.segmentsCross(start, end, polygon[i], polygon[j])) {
                    crossings++;                   
                }
            }
            return crossings;
        },
        // takes two node indexes and checks if they form an edge on any of the polygons
        isAnEdge: (a, b) => {
            const ax = pathfinding.pathNodes[a].x;
            const ay = pathfinding.pathNodes[a].y;
            const bx = pathfinding.pathNodes[b].x;
            const by = pathfinding.pathNodes[b].y;
            let index1;
            let index2;
            let match = 0;
            // for every polygon check if it has a vertex at given coordinates
            pathfinding.allPolygons.forEach((polygon) => {
                index1 = polygon.findIndex((vertex) => {
                    return vertex.x === ax && vertex.y === ay;
                })
                index2 = polygon.findIndex((vertex) => {
                    return vertex.x === bx && vertex.y === by;
                })
                if (index1 + 1 === index2 || index2 + 1 === index1) match++;
            }, this);
            return match > 0 ? true : false;
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
            const polygons = pathfinding.allPolygons;
            let totalCrossings = 0;
            polygons.forEach((polygon) => {
                totalCrossings += pathfinding.rayCrossings(polygon, {x: -1, y: -1}, {x: x, y: y});
            });
            if (totalCrossings === 0) {
                return false;
            } else if (totalCrossings % 2 === 0) {
                return false;
            } else {
                return true;
            }
        },
        // Takes indexes for pathNodes array to get correct nodes
        lineOfSight: (a, b) => {
            // Does ab cross any side of any polygon and is it's center in an accessible area
            const node1 = pathfinding.pathNodes[a];
            const node2 = pathfinding.pathNodes[b];
            const polygons = pathfinding.allPolygons;
            let intersections = 0;

            // find the middle
            let middleX = node1.x + (node2.x - node1.x) / 2;
            let middleY = node1.y + (node2.y - node1.y) / 2;

            // find if LOS
            if (pathfinding.accessible(middleX, middleY) || pathfinding.isAnEdge(a, b)) {
                polygons.forEach((polygon) => {
                    intersections += pathfinding.rayCrossings(polygon, node1, node2);
                });
            } else {
                return false;
            }
            
            return intersections === 0 ? true : false;
        },
        buildListOfConcavePoints: (polygons) => {
            polygons.forEach((polygon) => {
                polygon.forEach((vertex, index) => {
                    if (pathfinding.isConcave(polygon, index)) pathfinding.pathNodes.push(vertex);
                });
            });
        },
        buildListOfValidPaths: () => {
            const nodes = pathfinding.pathNodes;
            nodes.forEach((node1, index1) => {
                if (index1 !== nodes.length - 1) {
                    nodes.forEach((node2, index2) => {
                        // So long as the valid paths array doesn't already have an inverse pass
                        let inverseExists = pathfinding.validPaths.findIndex((path) => {
                            return path.a === index2 && path.b === index1;
                        });
                        // Check for non-zero distance and LOS then add to the validPaths
                        if (inverseExists === -1) {
                            if (pathfinding.nodesDistance(index1, index2) > 0 && pathfinding.lineOfSight(index1, index2)) {
                                pathfinding.validPaths.push({a: index1, b: index2, d: pathfinding.nodesDistance(index1, index2)});
                            }
                        }
                    });
                }
            });
        },
        // Takes indexes for pathNodes array to get correct nodes
        nodesDistance: (a, b) => {
            const node1 = pathfinding.pathNodes[a];
            const node2 = pathfinding.pathNodes[b];
            if (node1.x === node2.x && node1.y === node2.y) {
                return 0;
            } else {
                const distX = node1.x - node2.x;
                const distY = node1.y - node2.y;
                return Math.sqrt(distX*distX + distY*distY);
            }    
        },
        dijkstra: () => {
            const nodes = pathfinding.pathNodes; // array of nodes: {x: 4, y: 8}
            const edges = pathfinding.validPaths; // array of edges: {a: 0, b: 1, d: 428}

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
        },
        buildPath: (data) => {
            let nodesToTravel = [];
            let currentNode = data.length - 1;
            while (currentNode !== 0) {
                nodesToTravel.push(pathfinding.pathNodes[currentNode]);
                currentNode = data[currentNode][1];
            }
            nodesToTravel.push(pathfinding.pathNodes[0]);
            nodesToTravel.reverse();
            return nodesToTravel;
        }
    };

    screen.initialize();
    scene.initialize();
    character.initialize();
    pathfinding.initialize();
    scene.main();
})();

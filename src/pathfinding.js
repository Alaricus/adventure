class pathfinding {
    
    constructor(scene) {
        this.pathNodes = [];
        this.validPaths = [];
        this.allPolygons = scene.data.walkableAreas.polygons;
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

    // Dijkstra's algorithm. Not Sigismund Dijkstra
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

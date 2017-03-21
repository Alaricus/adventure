"use strict";

class action {

    // {"finite": true, "trigger": "time", "subject": "char-0", "type": "move", "destination": [{"x": 1000, "y": 474}]},

    constructor(actionInfo, sc, chars) {
        this.info = actionInfo;
        this.timesRan = 0;
        this.setSubject(sc, chars);
        this.build();    
    }

    setSubject(sc, chars) {
        if (this.info.subject.startsWith("char")) {
            this.subject = chars[this.info.subject.charAt(5)];
        }
        if (this.info.subject.startsWith("scene")) {
            this.subject = sc;
        }
    }

    build() {
        if (this.info.type === "move") {
            this.func = () => { this.subject.way = this.info.destination; };
        }
    }

    execute() {
        if (this.info.finite && this.timesRan === 0) {
            this.func();
            this.timesRan++;
        }
    }
}

module.exports = action;

import EventEmitter from "eventemitter3";

export default class Application extends EventEmitter {
    static get events() {
        return {
            READY: "ready",
        };
    }

    constructor() {
        super();
        this.emojis = [];
        this.banana = "🍌";
        this.emit(Application.events.READY);
    }
    setEmojis(emojis) {
        this.emojis = emojis;
        const div = document.getElementById("emojis");
        const p = document.createElement("p");
        p.textContent = this.addBananas().join(" ");
        div.appendChild(p);
    }

    addBananas() {
        return this.emojis.map(x => x + this.banana);
    }
}

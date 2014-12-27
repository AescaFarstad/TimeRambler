class DebugRenderer {

    constructor() {
    }

    private root: HTMLElement;
    private engine: Engine;

    public setRoot(root: HTMLElement): void {
        this.root = root;
    }

    public update(timeDelta: number): void {
        this.root.innerHTML = this.toTimeString(this.engine.time);
    }

    public load(root: HTMLElement, engine: Engine): void {
        this.root = root;
        this.engine = engine;
    }

    private toTimeString(time: number): string {
        var result: String = "";

        var hours: number = (Math.floor(time / (3600 * 1000)));
        var minutes: number = (Math.floor(time / (60 * 1000)) % 60);
        var secsInt: number = (Math.floor(time/ 1000) % 60);
        var hoursStr: String = hours.toString();
        if (hoursStr.length < 2)
            hoursStr = "0" + hours;
        var minutesStr: String = minutes.toString();
        if (minutesStr.length < 2)
            minutesStr = "0" + minutes;
        var secondsStr: String = secsInt.toString();
        if (secondsStr.length < 2)
            secondsStr = "0" + secondsStr;
        return hoursStr + ":" + minutesStr + ":" + secondsStr + "," + (time % 1000).toString();
    }
}   
class DebugRenderer {

    constructor() {
    }

    private root: HTMLElement;
    private engine: Engine;

    public setRoot(root: HTMLElement): void {
        this.root = root;
    }

    public update(timeDelta: number, visibilityData: VisibilityData): void {
        if (visibilityData.visibleTab == VisibilityData.TAB_ACTIONS)
            this.root.innerHTML = "Elapsed time: " + this.toTimeString(this.engine.time) + "<br>scale: " + (this.engine.timeScale/this.engine.stepScale).toFixed(1);
    }

    public load(root: HTMLElement, engine: Engine): void {
        this.root = root;
        this.engine = engine;
    }

    private toTimeString(time: number): string {
        var result: String = "";

        var hours: number = (Math.floor(time / (3600 * 1000)));
        var minutes: number = (Math.floor(time / (60 * 1000)) % 60);
        var seconds: number = (Math.floor(time/ 1000) % 60);
        var ms: number = Math.floor(time % 1000);
        var hoursStr: String = hours.toString();
        if (hoursStr.length < 2)
            hoursStr = "0" + hours;
        var minutesStr: String = minutes.toString();
        if (minutesStr.length < 2)
            minutesStr = "0" + minutes;
        var secondsStr: String = seconds.toString();
        if (secondsStr.length < 2)
            secondsStr = "0" + secondsStr;
        var msStr: String = ms.toString();
        if (msStr.length < 2)
            msStr = "00" + secondsStr;
        else if (msStr.length < 3)
            msStr = "0" + secondsStr;
        return hoursStr + ":" + minutesStr + ":" + secondsStr + "," + msStr;
    }
}   
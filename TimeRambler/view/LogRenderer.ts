class LogRenderer {

    constructor() {
    }

    private root: HTMLElement;
    private log: Array<string>;
    private renderedIndex: number = -1;

    public setRoot(root: HTMLElement): void {
        this.root = root;
    }

    public update(timeDelta: number, visibilityData: VisibilityData): void {
        while (this.log.length > this.renderedIndex + 1) {
            this.renderedIndex++;
            this.root.insertBefore(this.logToElement(this.log[this.renderedIndex]), this.root.firstChild);
        }
    }

    public load(root: HTMLElement, log: Array<string>): void {
        this.root = root;
        this.log = log;
    }

    private logToElement(entry:string): HTMLElement {
        return HelperHTML.element("div", "gameLogEntry", entry);
    }
}    
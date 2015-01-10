class ActionViewData {

    constructor() {
    }

    public element: HTMLElement;
    public headerElement: HTMLElement;
    public canvas: HTMLCanvasElement;
    public progressElement: HTMLElement;
    public isRendered: Boolean;
    public isStarted: Boolean;
    public isAvailable: Boolean;
    public isContentOpen: Boolean = false;

    public setRendered(action: Action, element: HTMLElement, engine:Engine): void {
        this.isRendered = true;
        this.isStarted = action.isStarted;
        this.element = element;
        this.canvas = <HTMLCanvasElement> element.getElementsByTagName("canvas")[0];
        this.progressElement = <HTMLCanvasElement> element.getElementsByClassName("actionHeaderProgress")[0];
        this.isAvailable = action.isAvailable(engine);
    }

    public isValid(action: Action, engine: Engine): boolean {
        return this.isStarted == action.isStarted && this.isAvailable == action.isAvailable(engine);
    }

}  
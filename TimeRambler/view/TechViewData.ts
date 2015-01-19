class TechViewData {

    constructor() {
    }

    public element: HTMLElement;
    public tooltip: HTMLElement;
    public isRendered: Boolean;
    public isAvailable: Boolean;
    public isFinished: Boolean;

    public setRendered(tech: Technology, element: HTMLElement, engine:Engine): void {
        this.isRendered = true;
        this.element = element;
        this.tooltip = <HTMLElement> element.getElementsByClassName("baseTooltip")[0];
        this.isAvailable = tech.isAvailable(engine);
    }

    public isValid(tech: Technology, engine: Engine): boolean {
        return this.isFinished == tech.isFinished && this.isAvailable == tech.isAvailable(engine);
    }

}   
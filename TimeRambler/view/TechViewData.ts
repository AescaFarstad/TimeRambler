class TechViewData {

    constructor() {
    }

    public element: HTMLElement;
    public tooltip: HTMLElement;
    public researchPrice: HTMLElement;
    public discount: HTMLElement;
    public isRendered: Boolean;
    public isAvailable: Boolean;
    public isFinished: Boolean;
    public scienceCost: number;

    public setRendered(tech: Technology, element: HTMLElement, engine:Engine): void {
        this.isRendered = true;
        this.element = element;
        this.tooltip = <HTMLElement> element.getElementsByClassName("techDescContainer")[0];
        this.isAvailable = tech.isAvailable(engine);
		this.isFinished = tech.isFinished;
		this.scienceCost = tech.scienceCost;

    }

    public isValid(tech: Technology, engine: Engine): boolean {
        return (!this.isRendered && !tech.isDiscovered) ||
			this.isRendered == tech.isDiscovered &&
			this.isFinished == tech.isFinished &&
			this.isAvailable == tech.isAvailable(engine) &&
			this.scienceCost == tech.scienceCost;
    }

}   
class Action {

    public id: string;
    public name: string;
    public pop: number;
    public time: number;
    private timeLeft: number;
    private _isStarted: boolean;
    public resources: ResourceRequirement;
    public outcomes: Array<ActionOutcome>;
    public viewData: ActionViewData;


    constructor(id: string, name: string, pop: number, time: number, resources: ResourceRequirement, outcomes: Array<ActionOutcome>) {
        this.id = id;
        this.name = name;
        this.pop = pop;
        this.time = time;
        this.resources = resources;
        this.outcomes = outcomes;
        this.viewData = new ActionViewData();
    }

    public isAvailable(engine:Engine): boolean{
        return engine.resourcesById["unemployed"].value >= this.pop && this.resources.isMet(engine);
    }

    public start(engine:Engine): void {
        this.timeLeft = this.time;
        this._isStarted = true;
        engine.resourcesById["unemployed"].modify(-this.pop);
        this.resources.subtractFrom(engine);
    }

    public update(timeDelta:number): void {
        this.timeLeft -= timeDelta;
    }

    public get isComplete(): boolean {
        return this.timeLeft <= 0;
    }

    public get isStarted(): boolean {
        return this._isStarted;
    }

    public cancel(engine: Engine): void {
        engine.resourcesById["unemployed"].modify(this.pop);
        this.resources.giveBack(engine);
        this._isStarted = false;
    }

    public apply(engine: Engine): void {
        this._isStarted = false;
        engine.resourcesById["unemployed"].modify(this.pop);
        var totalWeight: number = 0;
        for (var i: number = 0; i < this.outcomes.length; i++) {
            totalWeight += this.outcomes[i].weight;
        }
        var target: number = Math.random() * totalWeight;
        for (var i: number = 0; i < this.outcomes.length; i++) {
            target -= this.outcomes[i].weight;
            if (target <= 0) {
                console.log("action " + this.id + " outcome: " + this.outcomes[i].id);
                this.outcomes[i].exec(engine);
                break;
            }
        }
    }
}   
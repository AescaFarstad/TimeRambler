class Action {

    public id: string;
    public name: string;
    public pop: number;
    public time: number;
    private _timeLeft: number;
    private _isStarted: boolean;
    public resources: ResourceRequirement;
    public outcomes: Array<ActionOutcome>;
    public viewData: ActionViewData;
    private _lastOutcome: ActionOutcome;
    public isDiscovered: boolean;
    public isObsolete: boolean;


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
        return engine.resourcesById("unemployed").value >= this.pop && this.resources.isMet(engine);
    }

    public start(engine:Engine): void {
        this._timeLeft = this.time;
        this._isStarted = true;
        engine.resourcesById("unemployed").modify(-this.pop, engine);
        this.resources.subtractFrom(engine);
    }

    public update(timeDelta:number): void {
        this._timeLeft -= timeDelta;
    }

    public get isComplete(): boolean {
        return this._timeLeft <= 0;
    }

    public get isStarted(): boolean {
        return this._isStarted;
    }

    public get lastOutcome(): ActionOutcome {
        return this._lastOutcome;
    }

    public get progress(): number {
        return 1 - this._timeLeft / this.time;
    }

    public get timeLeft(): number {
        return this._timeLeft;
    }

    public outcomeById(outcomeId: string): ActionOutcome {
        for (var i: number = 0; i < this.outcomes.length; i++) {
            if (this.outcomes[i].id == outcomeId)
                return this.outcomes[i];
        }
        return null;
    }

    public cancel(engine: Engine): void {
        engine.resourcesById("unemployed").modify(this.pop, engine);
        this.resources.giveBack(engine);
        this._isStarted = false;
    }

    public apply(engine: Engine): void {
        this._isStarted = false;
        engine.resourcesById("unemployed").modify(this.pop, engine);
        var totalWeight: number = 0;
        for (var i: number = 0; i < this.outcomes.length; i++) {
            totalWeight += this.outcomes[i].weight;
        }
        var target: number = Math.random() * totalWeight;
        for (var i: number = 0; i < this.outcomes.length; i++) {
            target -= this.outcomes[i].weight;
            if (target <= 0) {
                this.execOutcome(this.outcomes[i], engine);
                break;
            }
        }
    }

    private execOutcome(outcome: ActionOutcome, engine:Engine, depth:number = 0): void {
        console.log("action " + this.id + " outcome: " + outcome.id);
        var redirectOutcome:ActionOutcome = outcome.exec(this, outcome, engine);
        if (redirectOutcome != null && depth < 10) {
            console.log("Action outcome redirected from " + outcome.id + " to " + redirectOutcome.id);
            this.execOutcome(redirectOutcome, engine, depth + 1);            
            return;
        }
        else if (depth >= 10) {
            console.log("WARNING: action outcomes redirection chain too long!", this.id);
        }
        else {
            outcome.count++;
            this._lastOutcome = outcome;
        }
    }
}   
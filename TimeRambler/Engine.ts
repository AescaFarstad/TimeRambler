class Engine {

    constructor() {
        this._resources = new Array<Stat>();
        this._resourcesById = Object();
        this._rules = new Array <Function>();
    }

    public timeScale: number = 1;
    public stepScale: number = 1;
    public numericScale: number = 0;

    private _time: number = 0;
    public get time():number{
        return this._time;
    }

    private _resources: Array<Stat>;
    public get resources(): Array<Stat> {
        return this._resources;
    }

    private _resourcesById: Object;
    public get resourcesById(): Object {
        return this._resourcesById;
    }

    private _rules: Array<Function>;
    public get rules(): Array<Function> {
        return this._rules;
    }

    public update(timeDelta:number):void {
        this._time += timeDelta;

        for (var i: number = 0; i < this._resources.length; i++) {
            this._resources[i].updateStart(timeDelta);
        }

        for (var i: number = 0; i < this._rules.length; i++) {
            this._rules[i](this);
        }

        for (var i: number = 0; i < this._resources.length; i++) {
            this._resources[i].updateEnd();
        }
    }

    public addResource(resource: Stat): void {
        this._resources.push(resource);
        this.resourcesById[resource.id] = resource;
    }

    public addRule(rule: Function): void {
        this._rules.push(rule);
    }
}  
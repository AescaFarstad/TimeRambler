class Engine {

    constructor() {
        this._resources = new Array<Stat>();
        this._resourcesById = Object();
    }

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

    public update(timeDelta:number):void {
        this._time += timeDelta;

        for (var i: number = 0; i < this._resources.length; i++) {
            this._resources[i].updateStart(timeDelta);
        }

        for (var i: number = 0; i < this._resources.length; i++) {
            this._resources[i].updateEnd();
        }
    }

    public addResource(resource: Stat): void {
        this._resources.push(resource);
        this.resourcesById[resource.id] = resource;
    }
}  
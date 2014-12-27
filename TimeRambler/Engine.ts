class Engine {

    constructor() {
    }

    private _time: number = 0;
    public get time():number{
        return this._time;
    }

    public update(timeDelta:number):void {
        this._time += timeDelta;
    }
}  
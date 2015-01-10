class Stat {

    private _value: number;
    private _cap: number;
    private _rateCache: number;
    private _capCache: number;

    public name: string;
    public id: string;
    public isDecimal: boolean = true;
    public hasCap: boolean = true;
    public isDiscovered: boolean;
    public isObsolete: boolean;


    private rateModifiers: Array<Modifier>;
    private capModifiers: Array<Modifier>;

    public onValueChanged: Function;

    constructor(id: string, name: string) {
        this.id = id;
        this.name = name;
        this._value = 0;
        this._rateCache = 0;
        this._capCache = 0;
        this.rateModifiers = new Array<Modifier>();
        this.capModifiers = new Array<Modifier>();
    }

    public updateStart(timeDelta): void {
        this._value += this._rateCache * timeDelta;
    }

    public updateEnd(engine:Engine): void {
        if (this.hasCap && this._value > this._capCache) {
            this._value = this._capCache;
            engine.playerData.limitOnResourcesWasHit = true;
        }
        else if (this._value < 0)
            this._value = 0;
    }

    //Insert
    public insertRateModifier(modifier: Modifier): void {
        this.rateModifiers.push(modifier);
        var add: number = 0;
        var multi: number = 0;
        for (var i: number = 0; i < this.rateModifiers.length; i++) {
            add += this.rateModifiers[i].add;
            multi += this.rateModifiers[i].multi;
        }
        this._rateCache = add * (multi + 1);
    }

    public insertCapModifier(modifier: Modifier): void {
        this.capModifiers.push(modifier);
        var add: number = 0;
        var multi: number = 0;
        for (var i: number = 0; i < this.capModifiers.length; i++) {
            add += this.capModifiers[i].add;
            multi += this.capModifiers[i].multi;
        }
        this._capCache = add * (multi + 1);
    }

     //Edit
    public editRateModifier(key:string, newAdd:number, newMulti:number): void {
        var add: number = 0;
        var multi: number = 0;
        for (var i: number = 0; i < this.rateModifiers.length; i++) {
            if (this.rateModifiers[i].key == key) {
                this.rateModifiers[i].add = newAdd;
                this.rateModifiers[i].multi = newMulti;
            }
            add += this.rateModifiers[i].add;
            multi += this.rateModifiers[i].multi;
        }
        this._rateCache = add * (multi + 1);
    }

    public editCapModifier(key: string, newAdd: number, newMulti: number): void {
        var add: number = 0;
        var multi: number = 0;
        for (var i: number = 0; i < this.capModifiers.length; i++) {
            if (this.capModifiers[i].key == key) {
                this.capModifiers[i].add = newAdd;
                this.capModifiers[i].multi = newMulti;
            }
            add += this.capModifiers[i].add;
            multi += this.capModifiers[i].multi;
        }
        this._capCache = add * (multi + 1);
    }

    public get value(): number {
        return this._value;
    }

    public get cap(): number {
        return this._capCache;
    }

    public get rate(): number {
        return this._rateCache;
    }

    public setValue(value: number, engine:Engine): void {
        if (this._value != value) {
            var delta: number = value - this._value;
            this._value = value;
            if (this.onValueChanged != null)
                this.onValueChanged(this, engine, delta);
        }

    }

    public modify(delta: number, engine: Engine): void {
        if (delta != 0) {
            this._value += delta;
            if (this.onValueChanged != null)
                this.onValueChanged(this, engine, delta);
        }

    }
} 
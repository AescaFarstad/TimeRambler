class ResourceRequirement {

    public resources: Array<string>;
    public quantaties: Array<number>;

    constructor(resources: Array<string>, quantaties: Array<number>) {
        this.resources = resources;
        this.quantaties = quantaties;
    }

    public isMet(engine: Engine): boolean {
        for (var i: number = 0; i < this.resources.length; i++) {
            if (engine.resourcesById[this.resources[i]].value < this.quantaties[i])
                return false; 
        }
        return true;
    }

    public subtractFrom(engine: Engine): void {
        for (var i: number = 0; i < this.resources.length; i++) {
            engine.resourcesById[this.resources[i]].modify(-this.quantaties[i]);
        }
    }

    public giveBack(engine: Engine): void {
        for (var i: number = 0; i < this.resources.length; i++) {
            engine.resourcesById[this.resources[i]].modify(this.quantaties[i]);
        }
    }

    public get isEmpty(): boolean {
        return this.resources.length == 0;
    }
    
}  
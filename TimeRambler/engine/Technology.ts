class Technology {

    public id: string;
    public name: string;
    public exec: Function;
    public scienceCost: number;
	public baseScienceCost: number;
	public scienceIncrement: number;
    public resources: ResourceRequirement;
    public description: string;
    public isDiscovered: boolean;
    public isObsolete: boolean;
    public isFinished: boolean;
	public x: number;
	public y: number;
	public viewData: TechViewData = new TechViewData();
	public numFinishedNeighbours: number = 0;

    constructor(id:string, name:string, x:number, y:number, exec:Function, baseScienceCost:number, scienceIncrement:number, resources:ResourceRequirement) {
        this.id = id;
		this.name = name;
		this.x = x;
		this.y = y;
        this.exec = exec;
        this.baseScienceCost = baseScienceCost;
        this.scienceIncrement = scienceIncrement;
        this.resources = resources;
    }

	public isAvailable(engine:Engine): boolean{
        return this.scienceCost <= engine.resourcesById("science").value && this.resources.isMet(engine) && this.isDiscovered && !this.isFinished;
    }

	public updateScienceCost(engine: Engine): void {
		if (this.isFinished)
			return;
		this.numFinishedNeighbours = 0;
		var neighbours = engine.hex.getNeighbours(this.x, this.y);
		for (var i: number = 0; i < neighbours.length; i++) {
			if (neighbours[i].isFinished)
				this.numFinishedNeighbours++;
		}
		var neighbourFactor: number = this.getNeighbourFactor(this.numFinishedNeighbours);
		this.scienceCost = neighbourFactor * (this.baseScienceCost + engine.playerData.numFinishedTechs * this.scienceIncrement);

	}

	public getNeighbourFactor(n: number): number {
		return GameSettings.NEIGHBOUR_TECH_MAX_DISCOUNT + (1 - GameSettings.NEIGHBOUR_TECH_MAX_DISCOUNT) * (1 - (n - 1) / 5);
	}
}  
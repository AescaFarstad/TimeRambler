class Technology {

    public id: string;
    public name: string;
    public exec: Function;
    public researchCost: number;
    public resources: ResourceRequirement;
    public description: string;
    public isDiscovered: boolean;
    public isObsolete: boolean;
    public isFinished: boolean;
	public x: number;
	public y: number;
	public viewData: TechViewData = new TechViewData();

    constructor(id:string, name:string, x:number, y:number, exec:Function, researchCost:number, resources:ResourceRequirement) {
        this.id = id;
		this.name = name;
		this.x = x;
		this.y = y;
        this.exec = exec;
        this.researchCost = researchCost;
        this.resources = resources;
    }

	public isAvailable(engine:Engine): boolean{
        return true && this.resources.isMet(engine) && this.isDiscovered && !this.isFinished;
    }
}  
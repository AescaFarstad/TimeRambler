class StatPrototype {
    public id: string;
    public name: string;
    public cpsFunction: Function;


    constructor(id: string, name: string, cpsFunction:Function) {
        this.id = id;
        this.name = name;
        this.cpsFunction = cpsFunction;
    }
} 
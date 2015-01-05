class ActionOutcome {

    public weight: number;
    public exec: Function;
    public id: string;

    constructor(id: string, weight: number, exec: Function) {
        this.weight = weight;
        this.exec = exec;
        this.id = id;
    }
}    
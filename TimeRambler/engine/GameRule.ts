class GameRule {

    constructor(id: string, exec: Function) {
        this.id = id;
        this.exec = exec;
    }

    public id: string;
    public exec: Function;
}   
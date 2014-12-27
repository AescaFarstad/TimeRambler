class Modifier {

    public add: number;
    public multi: number;
    public key: string;

    constructor(key: string, add: number, multi: number) {
        this.key = key;
        this.add = add;
        this.multi = multi;
    }
}  
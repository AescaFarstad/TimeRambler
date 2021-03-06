﻿class ActionOutcome {

    public weight: number;
    public exec: Function;
    public id: string;
    public historyEntry: string;
    public count: number = 0;

    constructor(id: string, weight: number, exec: Function, historyEntry: string) {
        this.weight = weight;
        this.exec = exec;
        this.id = id;
        this.historyEntry = historyEntry;
    }
}    
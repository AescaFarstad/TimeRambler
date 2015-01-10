class Engine {

    constructor() {
        this._resources = new Array<Stat>();
        this._resourcesById = Object();
        this._actions = new Array<Action>();
        this._actionsById = Object();
        this._rules = new Array<GameRule>();
        this.playerData = new PlayerData();
        this.ruleRemoveQueue = new Array<GameRule>();
    }

    public timeScale: number = 1;
    public stepScale: number = 1;
    public numericScale: number = 0;
    public playerData: PlayerData;
    private isUpdateInProgress: boolean;
    private ruleRemoveQueue: Array<GameRule>;

    private _time: number = 0;
    public get time():number{
        return this._time;
    }

    private _resources: Array<Stat>;
    public get resources(): Array<Stat> {
        return this._resources;
    }

    private _resourcesById: Object;
    public resourcesById(id:string): Stat {
        return this._resourcesById[id];
    }

    private _actions: Array<Action>;
    public get actions(): Array<Action> {
        return this._actions;
    }

    private _actionsById: Object;
    public actionsById(id: string): Action {
        return this._actionsById[id];
    }

    private _rules: Array<GameRule>;
    public get rules(): Array<GameRule> {
        return this._rules;
    }

    public update(timeDelta:number):void {
        this._time += timeDelta;

        this.isUpdateInProgress = true;
        for (var i: number = 0; i < this._resources.length; i++) {
            this._resources[i].updateStart(timeDelta);
        }

        for (var i: number = 0; i < this._actions.length; i++) {
            if (this._actions[i].isStarted) {

                this._actions[i].update(timeDelta);
                if (this._actions[i].isComplete)
                    this._actions[i].apply(this);
                }            
        }

        for (var i: number = 0; i < this._rules.length; i++) {
            this._rules[i].exec(this);
        }

        for (var i: number = 0; i < this._resources.length; i++) {
            this._resources[i].updateEnd(this);
        }
        this.isUpdateInProgress = false;
        if (this.ruleRemoveQueue.length > 0) {
            for (var i: number = 0; i < this.ruleRemoveQueue.length; i++) {
                this.removeRule(this.ruleRemoveQueue[i], true);
            }
            this.ruleRemoveQueue.length = 0;
        }        
    }

    public addResource(resource: Stat): void {
        this._resources.push(resource);
        this._resourcesById[resource.id] = resource;
    }

    public addAction(action: Action): void {
        this._actions.push(action);
        this._actionsById[action.id] = action;
    }

    public addRule(rule: GameRule): void {
        this._rules.push(rule);
    }

    public removeRule(rule: GameRule, isSilent: boolean = false): void {
        if (!isSilent) {
            logEngine("Removed rule " + rule.id);
        }
        if (this.isUpdateInProgress) {
            var indsexOf: number = this._rules.indexOf(rule);
            this.ruleRemoveQueue.push(rule);
            return;
        }
        var indexOf: number = this._rules.indexOf(rule);
        this._rules.splice(indexOf, 1);
    }
}  
class Input implements IInput{

    constructor() {
    }

    private engine: Engine;

    public load(engine: Engine): void {
        this.engine = engine;
    }

    public timeScaleDown() {
        this.engine.numericScale--;
        this.updateTimeScales();
    }
    public timeScaleNormal() {
        this.engine.numericScale = 0;
        this.updateTimeScales();
    }
    public timeScaleUp() {
        this.engine.numericScale++;
        this.updateTimeScales();
    }
    public timeScaleStop() {
        this.engine.timeScale = 0;
    }
    private updateTimeScales(): void {
        this.engine.timeScale = 1 + this.engine.numericScale / 5;
        this.engine.stepScale = Math.pow(0.9, this.engine.numericScale);
    }
    private activateAction(action: Action): void {
        if (action.isAvailable(this.engine))
            action.start(this.engine);
    }
}  
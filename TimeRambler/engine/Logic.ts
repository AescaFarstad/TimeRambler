﻿class Logic {

    private static UPDATE_PERIOD: number = 300;

    constructor() {
    }

    private engine: Engine;
    private renderer: Renderer;
    private timeStamp: number;
    private isActive: Boolean;

    public load(engine: Engine, renderer: Renderer): void {
        this.engine = engine;
        this.renderer = renderer;
    }

    public start(): void {
        this.timeStamp = new Date().getTime();
        this.isActive = true;
        setTimeout(() => this.update(), Logic.UPDATE_PERIOD);
    }

    private update(): void {
        if (!this.isActive)
            return;
        var newStamp: number = new Date().getTime();
        var delta: number = Math.min(newStamp - this.timeStamp, Logic.UPDATE_PERIOD * 1.5);
        delta *= this.engine.timeScale / this.engine.stepScale;
        this.timeStamp = newStamp;
        this.engine.update(delta);
        this.renderer.update(delta);
        setTimeout(() => this.update(), Logic.UPDATE_PERIOD * this.engine.stepScale);
    }
}  
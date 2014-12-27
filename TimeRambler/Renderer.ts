class Renderer {

    constructor() {
        this.debugRenderer = new DebugRenderer();

    }

    private root: HTMLElement;
    private engine: Engine;

    private debugRenderer: DebugRenderer;

    public load(root: HTMLElement, engine:Engine): void {
        this.root = root;
        this.engine = engine;
        this.debugRenderer.load(<HTMLElement> root.getElementsByClassName("debugPanel")[0], engine);
    }

    public update(timeDelta: number): void {
        this.debugRenderer.update(timeDelta);
    }
}  
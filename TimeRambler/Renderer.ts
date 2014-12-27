class Renderer {

    constructor() {
        this.debugRenderer = new DebugRenderer();
        this.resourcesRenderer = new ResourcesRenderer();

    }

    private root: HTMLElement;
    private engine: Engine;

    private debugRenderer: DebugRenderer;
    private resourcesRenderer: ResourcesRenderer;

    public load(root: HTMLElement, engine:Engine): void {
        this.root = root;
        this.engine = engine;
        this.debugRenderer.load(<HTMLElement> root.getElementsByClassName("debugPanel")[0], engine);
        this.resourcesRenderer.load(<HTMLElement> root.getElementsByClassName("resourcesPanel")[0], engine);
    }

    public update(timeDelta: number): void {
        this.debugRenderer.update(timeDelta);
        this.resourcesRenderer.update(timeDelta);
    }
}  
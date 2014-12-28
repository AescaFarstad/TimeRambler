class Renderer {

    constructor() {
        this.debugRenderer = new DebugRenderer();
        this.resourcesRenderer = new ResourcesRenderer();

    }

    private root: HTMLElement;
    private engine: Engine;

    private debugRenderer: DebugRenderer;
    private resourcesRenderer: ResourcesRenderer;

    private input: IInput;

    public load(root: HTMLElement, engine: Engine, input: IInput): void {
        this.root = root;
        this.engine = engine;
        this.input = input;
        this.debugRenderer.load(<HTMLElement> root.getElementsByClassName("debugPanel")[0], engine);
        this.resourcesRenderer.load(<HTMLElement> root.getElementsByClassName("resourcesPanel")[0], engine);

        if (input)
            document.onkeydown = (e) => {
                if (e.keyCode == 97) //num_1
                    this.input.timeScaleDown();
                if (e.keyCode == 100) //num_1
                    this.input.timeScaleNormal();
                if (e.keyCode == 103) //num_1
                    this.input.timeScaleUp();
                if (e.keyCode == 96) //num_1
                    this.input.timeScaleStop();
            }
    }

    public update(timeDelta: number): void {
        this.debugRenderer.update(timeDelta);
        this.resourcesRenderer.update(timeDelta);
    }
}  
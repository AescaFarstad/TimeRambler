class Renderer {

    constructor() {
        this.debugRenderer = new DebugRenderer();
        this.resourcesRenderer = new ResourcesRenderer();
        this.actionsRenderer = new ActionsRenderer();

    }

    private root: HTMLElement;
    private engine: Engine;

    private debugRenderer: DebugRenderer;
    private resourcesRenderer: ResourcesRenderer;
    private actionsRenderer: ActionsRenderer;

    private input: IInput;

    public load(root: HTMLElement, engine: Engine, input: IInput): void {

        this.root = root;
        this.engine = engine;
        this.input = input;
        this.debugRenderer.load(<HTMLElement> root.getElementsByClassName("debugPanel")[0], engine);
        this.resourcesRenderer.load(<HTMLElement> root.getElementsByClassName("resourcesPanel")[0], engine);
        this.actionsRenderer.load(<HTMLElement> root.getElementsByClassName("actionsPanel")[0], engine, input);

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
        this.actionsRenderer.update(timeDelta);
    }
}  
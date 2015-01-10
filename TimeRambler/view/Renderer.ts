class Renderer {

    constructor() {
        this.debugRenderer = new DebugRenderer();
        this.resourcesRenderer = new ResourcesRenderer();
        this.actionsRenderer = new ActionsRenderer();
        this.gameLogRenderer = new LogRenderer();
        this.debugLogRenderer = new LogRenderer();

    }

    private root: HTMLElement;
    private engine: Engine;

    private debugRenderer: DebugRenderer;
    private resourcesRenderer: ResourcesRenderer;
    private actionsRenderer: ActionsRenderer;
    private gameLogRenderer: LogRenderer;
    private debugLogRenderer: LogRenderer;

    private input: Input;

    public load(root: HTMLElement, engine: Engine, input: Input): void {

        this.root = root;
        this.engine = engine;
        this.input = input;
        this.debugRenderer.load(<HTMLElement> root.getElementsByClassName("debugInfoPanel")[0], engine);
        this.resourcesRenderer.load(<HTMLElement> root.getElementsByClassName("resourcesPanel")[0], engine);
        this.actionsRenderer.load(<HTMLElement> root.getElementsByClassName("actionsPanel")[0], engine, input);
        this.gameLogRenderer.load(<HTMLElement> root.getElementsByClassName("gameLog")[0], Logger.gameLog);
        this.debugLogRenderer.load(<HTMLElement> root.getElementsByClassName("debugLogPanel")[0], Logger.engineLog);

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
        this.gameLogRenderer.update(timeDelta);
        this.debugLogRenderer.update(timeDelta);
    }
}  
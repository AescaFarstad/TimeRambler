class Binder {

    constructor() {
    }

    private dataSource: DataSource;
    private engine: Engine;
    private renderer: Renderer;
    private input: Input;
    private logic: Logic;

    public create(rootElement:HTMLElement) {
        this.dataSource = new DataSource();
        this.engine = new Engine();
        this.renderer = new Renderer();
        this.input = new Input();
        this.logic = new Logic();

        this.input.load(this.engine);
        this.renderer.load(rootElement, this.engine, this.input);
        this.logic.load(this.engine, this.renderer);

        this.dataSource.initEngine(this.engine);
    }

    public start() {
        this.logic.start();
    }
} 
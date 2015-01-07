class ActionsRenderer {

    constructor() {
    }

    private root: HTMLElement;
    private engine: Engine;
    private input: IInput;
    private list: HTMLElement;
    private mapping: Object;

    public setRoot(root: HTMLElement): void {
        this.root = root;
    }

    public update(timeDelta: number): void {
        for (var i: number = 0; i < this.engine.actions.length; i++) {
            var isRemoved: boolean = false;
            if (!this.engine.actions[i].viewData.isValid(this.engine.actions[i], this.engine) && this.engine.actions[i].viewData.isRendered) {
                var nextSibling: HTMLElement = <HTMLElement> this.engine.actions[i].viewData.element.nextSibling;
                this.list.removeChild(this.engine.actions[i].viewData.element);
                isRemoved = true;
            }
            if (isRemoved || !this.engine.actions[i].viewData.isRendered) {
                var element: HTMLElement = this.actionToHtml(this.engine.actions[i], this.input);
                this.engine.actions[i].viewData.setRendered(this.engine.actions[i], element, this.engine);
                if (isRemoved && nextSibling) 
                    this.list.insertBefore(element, nextSibling);
                else
                    this.list.appendChild(element);
            }
            if (this.engine.actions[i].isStarted) {
                this.updateProgress(this.engine.actions[i]);
            }
        }
    }

    public load(root: HTMLElement, engine: Engine, input:IInput): void {
        this.root = root;
        this.engine = engine;
        this.input = input;
        this.list = <HTMLElement> root.getElementsByClassName("actionList")[0];
        this.mapping = {};
    }

    private updateProgress(action: Action): void {
        action.viewData.headerElement.innerText = [action.name, " ", (action.progress * 100).toFixed(0), "% ( ", RenderUtils.beautifyInt(action.timeLeft/1000), " sec.left)"].join("");
    }

    private actionToHtml(action: Action, input: IInput): HTMLElement {

        var outerElement: HTMLElement = HelperHTML.element("li", "action");
        if (action.isStarted) {
            var div: HTMLElement = HelperHTML.element("div", "actionHeader_Progress");
            var canvas: HTMLElement = HelperHTML.element("canvas", "actionCanvas");
            div.appendChild(canvas);
            //var text = [action.name, " ", (action.progress * 100).toFixed(0), " (", "sec.left)", RenderUtils.beautifyInt(action.timeLeft)];
            var span: HTMLElement = HelperHTML.element("span", "actionHeaderText_Progress");
            div.appendChild(span);
            action.viewData.headerElement = span;
            outerElement.appendChild(div);
        }
        else {
            var availability: string = action.isAvailable(this.engine) ? "Available" : "Unavailable";
            div = HelperHTML.element("div", "actionHeader_" + availability);
            span = HelperHTML.element("span", "actionHeaderText_" + availability, action.name);
            div.appendChild(span);
            outerElement.appendChild(div);
        }
        
        

        div = HelperHTML.element("div", "actionContent");
        div.appendChild(HelperHTML.element("div", "actionContentText", "Pop: " + action.pop));
        div.appendChild(HelperHTML.element("div", "actionContentText", "Time: " + Math.ceil(action.time / 1000) + " sec."));
        if (!action.resources.isEmpty) {
            var innerDiv: HTMLElement = HelperHTML.element("div", "actionContentText", "Requires:");
            for (var i: number = 0; i < action.resources.resources.length; i++) {
                var resource: Stat = this.engine.resourcesById(action.resources.resources[i]);
                innerDiv.appendChild(HelperHTML.element("div", "actionContent_Requirement", resource.name + ": " + action.resources.quantaties[i]));
            }
            div.appendChild(innerDiv);
        }
        var buttonDiv: HTMLElement = HelperHTML.element("div", "actionButtonContainer");
        var button: HTMLButtonElement = <HTMLButtonElement> HelperHTML.element("button", "actionButton", action.isStarted ? "Cancel" : "Start");
        if (input)
            button.onclick = action.isStarted ? () => input.cancelAction(action) : () => input.activateAction(action);
        buttonDiv.appendChild(button);
        div.appendChild(buttonDiv);
        outerElement.appendChild(div);

        return outerElement;
    }
} 
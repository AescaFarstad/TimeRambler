class ActionsRenderer {

    constructor() {
    }

    private root: HTMLElement;
    private engine: Engine;
    private input: IInput;

    public setRoot(root: HTMLElement): void {
        this.root = root;
    }

    public update(timeDelta: number): void {
        var parentNode: Node = this.root.parentNode;
        this.root.parentNode.removeChild(this.root);
        this.root.innerHTML = "";
        this.root.appendChild(HelperHTML.element("h3", "", "Actions:"));
        var list: HTMLOListElement = <HTMLOListElement> HelperHTML.element("ol", "actionList");
        for (var i: number = 0; i < this.engine.actions.length; i++) {
            list.appendChild(this.actionToHtml(this.engine.actions[i], this.input));
        }
        this.root.appendChild(list);
        parentNode.appendChild(this.root);
    }

    public load(root: HTMLElement, engine: Engine, input:IInput): void {
        this.root = root;
        this.engine = engine;
        this.input = input;
    }

    private actionToHtml(action: Action, input: IInput): HTMLElement {

        var outerElement: HTMLElement = HelperHTML.element("li", "action");
        var availability: string = action.isAvailable(this.engine) ? "Available" : "Unavailable";

        var div: HTMLElement = HelperHTML.element("div", "actionHeader_" + availability);
        var span: HTMLElement = HelperHTML.element("span", "actionHeaderText_" + availability, action.name);
        div.appendChild(span);
        outerElement.appendChild(div);

        div = HelperHTML.element("div", "actionContent");
        div.appendChild(HelperHTML.element("div", "actionContentText", "Pop: " + action.pop));
        div.appendChild(HelperHTML.element("div", "actionContentText", "Time: " + Math.ceil(action.time / 1000) + " sec."));
        if (!action.resources.isEmpty) {
            var innerDiv: HTMLElement = HelperHTML.element("div", "actionContentText", "Requires:");
            for (var i: number = 0; i < action.resources.resources.length; i++) {
                var resource: Stat = this.engine.resourcesById[action.resources.resources[i]];
                innerDiv.appendChild(HelperHTML.element("div", "actionContent_Requirement", resource.name + ": " + action.resources.quantaties[i]));
            }
            div.appendChild(innerDiv);
        }
        var buttonDiv: HTMLElement = HelperHTML.element("div", "actionButtonContainer");
        var button: HTMLButtonElement = <HTMLButtonElement> HelperHTML.element("button", "actionButton", "Start");
        if (input)
            button.onclick = () => input.activateAction(action);
        buttonDiv.appendChild(button);
        div.appendChild(buttonDiv);
        outerElement.appendChild(div);


        /*
        this.root.appendChild(document.createElement("div",

        var result: string = "<div class=\"actionHeader_" + availability + "\"><span class=\"actionHeaderText_" + availability + "\">" + 
                            action.name + "</span></div><div class=\"actionContent\">" +
                            "<div class=\"actionContentText\">Pop: " + action.pop + "</div> <div class=\"actionContentText\">Time: " + Math.ceil(action.time / 1000) + " sec.</div>";
        if (!action.resources.isEmpty) {
            result += "<div class=\"actionContentText\">Requires:</div>";
            for (var i: number = 0; i < action.resources.resources.length; i++) {
                var resource: Stat = this.engine.resourcesById[action.resources.resources[i]];
                result += "<div class=\"actionContent_Requirement\">" + resource.name + ": " + action.resources.quantaties[i] + "</div>";
            }
        }
        result += "<div class=\"actionButtonContainer\"><button class=\"actionButton\"> Start </button></div>";*/
        return outerElement;
    }
} 
class ActionsRenderer {

    constructor() {
    }

    private root: HTMLElement;
    private engine: Engine;
    private input: Input;
    private list: HTMLElement;

    public setRoot(root: HTMLElement): void {
        this.root = root;
    }

    public update(timeDelta: number): void {
        for (var i: number = 0; i < this.engine.actions.length; i++) {
            var isRemoved: boolean = false;
            if (this.engine.actions[i].viewData.isRendered &&
                (this.engine.actions[i].isObsolete ||
                !this.engine.actions[i].isDiscovered ||
                !this.engine.actions[i].viewData.isValid(this.engine.actions[i], this.engine))
                ) {
                var nextSibling: HTMLElement = <HTMLElement> this.engine.actions[i].viewData.element.nextSibling;
                this.list.removeChild(this.engine.actions[i].viewData.element);
                isRemoved = true;
            }
            if (isRemoved || !this.engine.actions[i].viewData.isRendered) {
                if (this.engine.actions[i].isObsolete || !this.engine.actions[i].isDiscovered) {
                    continue;
                }
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

    public load(root: HTMLElement, engine: Engine, input:Input): void {
        this.root = root;
        this.engine = engine;
        this.input = input;
        this.list = <HTMLElement> root.getElementsByClassName("actionList")[0];
    }

    private updateProgress(action: Action): void {
        //action.viewData.headerElement.innerText = [action.name, " ", (action.progress * 100).toFixed(0), "% ( ", RenderUtils.beautifyInt(action.timeLeft / 1000), " s. left)"].join("");
        action.viewData.progressElement.innerText = [(action.progress * 100).toFixed(0), "% \n( ", RenderUtils.beautifyInt(action.timeLeft / 1000), " s. left)"].join("");
        var context = action.viewData.canvas.getContext("2d");
        context.fillStyle = "#0000FF";
        context.fillRect(0, 0, action.viewData.canvas.width * action.progress, action.viewData.canvas.height);
    }

    private actionToHtml(action: Action, input: Input): HTMLElement {

        var outerElement: HTMLElement = HelperHTML.element("li", "action testTooltipable");
        if (action.isStarted) {
            var headerDiv: HTMLElement = HelperHTML.element("div", "actionHeader actionHeader_Progress");
            var canvas: HTMLElement = HelperHTML.element("canvas", "actionCanvas");
            var span: HTMLElement = HelperHTML.element("span", "actionHeaderText", action.name);
            var progressSpan: HTMLElement = HelperHTML.element("span", "actionHeaderProgress");
            headerDiv.appendChild(span);
            headerDiv.appendChild(canvas);
            headerDiv.appendChild(progressSpan);
            action.viewData.headerElement = span;
            outerElement.appendChild(headerDiv);
        }
        else {
            var availability: string = action.isAvailable(this.engine) ? "Available" : "Unavailable";
            headerDiv = HelperHTML.element("div", "actionHeader actionHeader_" + availability);
            span = HelperHTML.element("span", "actionHeaderText", action.name);
            headerDiv.appendChild(span);
            outerElement.appendChild(headerDiv);
        }
        
        

        var contentDiv: HTMLElement = HelperHTML.element("div", "actionContent");
        contentDiv.appendChild(HelperHTML.element("div", "actionContentText", "Pop: " + action.pop));
        contentDiv.appendChild(HelperHTML.element("div", "actionContentText", "Time: " + Math.ceil(action.time / 1000) + " sec."));
        if (!action.resources.isEmpty) {
            var innerDiv: HTMLElement = HelperHTML.element("div", "actionContentText", "Requires:");
            for (var i: number = 0; i < action.resources.resources.length; i++) {
                var resource: Stat = this.engine.resourcesById(action.resources.resources[i]);
                innerDiv.appendChild(HelperHTML.element("div", "actionContent_Requirement", resource.name + ": " + action.resources.quantaties[i]));
            }
            contentDiv.appendChild(innerDiv);
        }
        var buttonDiv: HTMLElement = HelperHTML.element("div", "actionButtonContainer");
        var button: HTMLButtonElement = <HTMLButtonElement> HelperHTML.element("button", "actionButton", action.isStarted ? "Cancel" : "Start");
        if (input)
            button.onclick = action.isStarted ? () => input.cancelAction(action) : () => input.activateAction(action);
        buttonDiv.appendChild(button);
        contentDiv.appendChild(buttonDiv);
        outerElement.appendChild(contentDiv);
        contentDiv.style.display = action.viewData.isContentOpen ? "block" : "none";

        headerDiv.onclick = () => {
            action.viewData.isContentOpen = !action.viewData.isContentOpen; contentDiv.style.display = action.viewData.isContentOpen ? "block" : "none";
        }

        if (action.outcomeHistory) {
            var tooptil: HTMLElement = HelperHTML.element("div", "testTooltip");
            var tHeaderText: HTMLElement = HelperHTML.element("span", "actionHeaderText", "Known possible outcomes"); 
            var tHeader: HTMLElement = HelperHTML.element("div", "actionHeader tooltipHeader");
            tHeader.appendChild(tHeaderText);
            var tContent: HTMLElement = HelperHTML.element("div", "tooltipContent");
            var tTable: HTMLTableElement = <HTMLTableElement> HelperHTML.element("table", "tooltipTable");
            tTable.cellSpacing = "15";
            for (var outcome in action.outcomeHistory) {
                var row: HTMLTableRowElement = <HTMLTableRowElement> tTable.insertRow();
                var cell: HTMLTableCellElement = <HTMLTableCellElement> row.insertCell();
                cell.innerHTML = action.outcomeHistory[outcome].count;
                cell = <HTMLTableCellElement> row.insertCell();
                cell.innerHTML = action.outcomeHistory[outcome].entry;
            }
            tContent.appendChild(tTable);
            tooptil.appendChild(tHeader);
            tooptil.appendChild(tContent);
            outerElement.appendChild(tooptil);
        }
        

        return outerElement;
    }
} 
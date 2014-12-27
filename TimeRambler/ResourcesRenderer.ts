class ResourcesRenderer {

    constructor() {
    }

    private root: HTMLElement;
    private engine: Engine;

    public setRoot(root: HTMLElement): void {
        this.root = root;
    }

    public update(timeDelta: number): void {
        var html: string = "<h4>Resources:</h4><table class=\"resourceTable\" cellspacing=\"5\">";

        for (var i: number = 0; i < this.engine.resources.length; i++) {
            html += "<tr><td>" + this.engine.resources[i].name + "</td><td>" +
                                this.engine.resources[i].value.toFixed(2) + "</td><td>/" +
                                this.engine.resources[i].cap + "</td><td>(" +
                                this.engine.resources[i].rate * 1000 + ")</td></tr>\n";
        }
        html += "</table>";
        this.root.innerHTML = html;
    }

    public load(root: HTMLElement, engine: Engine): void {
        this.root = root;
        this.engine = engine;
    }
}   
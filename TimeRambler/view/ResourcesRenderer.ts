class ResourcesRenderer {

    constructor() {
    }

    private root: HTMLElement;
    private engine: Engine;

    public setRoot(root: HTMLElement): void {
        this.root = root;
    }

    public update(timeDelta: number, visibilityData: VisibilityData): void {
        var html: string = "<table class=\"resourceTable\" cellspacing=\"5\">";

        for (var i: number = 0; i < this.engine.resources.length; i++) {
            var resource: Stat = this.engine.resources[i];
            if (resource.isObsolete || !resource.isDiscovered) {
                continue;
            }
            html += "<tr><td>" + resource.name + "</td><td>" +
            RenderUtils.beautifyFloat(resource.value)/*.toFixed(this.engine.resources[i].isDecimal ? 2 : 0)*/ + "</td><td>";
            if (resource.hasCap && this.engine.playerData.limitOnResourcesWasHit)
                html += "/ " + RenderUtils.beautifyFloat(resource.cap);
            html += "</td><td>";
            if (resource.rate != 0)
                html += "(" + RenderUtils.beautifyFloat(resource.rate * 1000) + ")";
            html += "</td></tr>\n";
        }
        html += "</table>";
        this.root.innerHTML = html;
    }

    public load(root: HTMLElement, engine: Engine): void {
        this.root = root;
        this.engine = engine;
    }
    
}   
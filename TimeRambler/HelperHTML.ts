class HelperHTML {

    public static element(type: string, cl: string = "", innerHTML:string = ""): HTMLElement {
        var elem: HTMLElement = document.createElement(type);
        if (cl != "") {
            elem.className = cl;
        }
        if (innerHTML != "") {
            elem.innerHTML = innerHTML;
        }
        return elem;
    }
} 
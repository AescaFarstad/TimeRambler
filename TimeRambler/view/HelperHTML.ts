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

	private static ejecties: Array<HTMLElement> = new Array<HTMLElement>();
	private static ejectParents: Array<HTMLElement> = new Array<HTMLElement>();
	public static eject(el: HTMLElement): void {
		HelperHTML.ejecties.push(el);
		HelperHTML.ejectParents.push(el.parentElement);
		el.parentElement.removeChild(el);
	}

	public static inject(el: HTMLElement): void {
		var index: number = HelperHTML.ejecties.indexOf(el);
		HelperHTML.ejectParents[index].appendChild(el);
		HelperHTML.ejecties.splice(index, 1);
		HelperHTML.ejectParents.splice(index, 1);
	}
} 
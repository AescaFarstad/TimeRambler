class TechRenderer {

    private root: HTMLElement;
    private engine: Engine;
	private input: Input;
	private hexGrid: HexGrid;
	private isGridRendered: boolean;
	private ui: HTMLElement;
	private hitArea: HTMLElement;
	private overlay: CanvasRenderingContext2D;
	private background: CanvasRenderingContext2D;
	private lastRenderedTech: Technology;


    public update(timeDelta: number, visibilityData: VisibilityData): void {
        if (visibilityData.visibleTab != VisibilityData.TAB_SOMETHING_ELSE) {
            return;
		}


		if (!this.isGridRendered) {
			this.isGridRendered = true;
			HelperHTML.eject(this.ui);
			this.hexGrid.render(this.engine.tech, this.engine);
			for (var i: number = 0; i < this.engine.tech.length; i++) {
				this.renderTechUI(this.engine.tech[i]);
			}
			HelperHTML.inject(this.ui);
		}
		else {
			for (var i: number = 0; i < this.engine.tech.length; i++) {
				var tech: Technology = this.engine.tech[i];
				if (!tech.viewData.isValid(tech, this.engine)){
					this.hexGrid.updateSingleTech(tech, this.engine);
					this.renderTechUI(tech);
					trace("not valid");
				}
			}
		}

    }

    public load(root: HTMLElement, engine: Engine, input:Input): void {
        this.root = root;
        this.engine = engine;
		this.input = input;
		this.hexGrid = new HexGrid();
		//var smth:HTMLElement = <HTMLElement>root.getElementsByClassName("mainTechCanvas")[0];
		this.hitArea = <HTMLElement>root.getElementsByClassName("techHitArea")[0];
		this.hexGrid.load(<HTMLCanvasElement>root.getElementsByClassName("mainTechCanvas")[0]);

		this.ui = <HTMLElement> root.getElementsByClassName("techUI")[0];
		
		this.hitArea.onmousemove = (e) => this.onMouseMove(e);
		this.hitArea.onmouseleave = () => this.onMouseLeave();
		this.hitArea.onclick = (e) => this.onMouseClick(e);


		this.overlay = (<HTMLCanvasElement>root.getElementsByClassName("overlayTechCanvas")[0]).getContext("2d");
		this.background = (<HTMLCanvasElement>root.getElementsByClassName("mainTechCanvas")[0]).getContext("2d");
		
	}

	private onMouseMove(event: MouseEvent): void{
		var position: any = Hacks.globalToLocal(event);
		var debugData: any = {};
		var tech: Technology = this.hexGrid.coordinatesToTech(position.x, position.y, this.engine.hex);
		if (this.lastRenderedTech != tech) {
			if (this.lastRenderedTech)
				this.lastRenderedTech.viewData.tooltip.style.display = "none";			
			this.lastRenderedTech = tech;
			this.hexGrid.renderOverlayHex((tech && tech.isDiscovered) ? tech : null, this.overlay);
			if (tech && tech.isDiscovered)
				tech.viewData.tooltip.style.display = "block";
		}
	}

	private onMouseClick(event: MouseEvent): void{
		var tech: Technology = this.hexGrid.coordinatesToTech(event.x, event.y, this.engine.hex);
		if (tech) {
			/*
			console.log(tech.id + " " + event.x.toFixed()  + " " +  event.y.toFixed());
		else
			console.log("nothing here " + event.x.toFixed() + " " + event.y.toFixed());*/
			this.input.onTechClick(tech);
			this.lastRenderedTech = null;
			this.onMouseMove(event);
			this.hexGrid.updateSingleTech(tech, this.engine);
			this.renderTechUI(tech);
		}
	}

	private onMouseLeave(): void{
		this.lastRenderedTech = null;
		this.hexGrid.renderOverlayHex(null, this.overlay);
	}

	private renderTechUI(tech: Technology): void{
		if (tech.viewData.element) {
			HelperHTML.eject(tech.viewData.element);

			this.fillTechUIData(tech);

			HelperHTML.inject(tech.viewData.element);
			tech.viewData.setRendered(tech, tech.viewData.element, this.engine);
			return;
		}

		var position: IPoint = this.hexGrid.hexCenter(tech);

		var f: DocumentFragment = document.createDocumentFragment();
		var containerDiv: HTMLElement = HelperHTML.element("div", "researchUI");
		var headerDiv:HTMLElement = HelperHTML.element("div", "");
		var header:HTMLElement = HelperHTML.element("span", "techHeader", tech.name);
		var tooltipDesc: HTMLElement = HelperHTML.element("div", "techDescContainer");
		var hintDiv: HTMLElement = HelperHTML.element("div", "techDesc");
		var descSpan:HTMLElement = HelperHTML.element("div", "", tech.description);
		var discountSpan: HTMLElement = HelperHTML.element("div", "techDiscount");
		tooltipDesc.style.display = "none";
		var reqsDiv: HTMLElement = HelperHTML.element("div");
		var researchReqDiv: HTMLElement = HelperHTML.element("div", "");
		//var tooltipResearch: HTMLElement = HelperHTML.element("div", "baseTooltip, techResearch", "TODO");
		var list: HTMLOListElement = <HTMLOListElement>HelperHTML.element("ol", "reseqrchReqList");
		if (tech.resources) {
			for (var i: number = 0; i < tech.resources.resources.length; i++) {
				var item: HTMLLIElement = <HTMLLIElement>HelperHTML.element("li", "reseqrchReqListItem",
						tech.resources.quantaties[i].toString() + "\t" + tech.resources.resources[i]);
				list.appendChild(item);
			}
		}
		f.appendChild(containerDiv);
		containerDiv.appendChild(headerDiv);
			headerDiv.appendChild(header);		
		containerDiv.appendChild(tooltipDesc);	
			tooltipDesc.appendChild(hintDiv);
			hintDiv.appendChild(descSpan);
			hintDiv.appendChild(discountSpan);
		containerDiv.appendChild(reqsDiv);
			reqsDiv.appendChild(researchReqDiv);
				//researchReqDiv.appendChild(tooltipResearch);
			researchReqDiv.appendChild(list);

		containerDiv.style.display = tech.isDiscovered ? "block" : "none";

		containerDiv.style.width = this.hexGrid.hexWidth * 0.9 + "px";
		headerDiv.style.width = this.hexGrid.hexWidth * 0.9 + "px";
		containerDiv.style.height = this.hexGrid.hexHeight * 0.9 + "px";
		containerDiv.style.left = (position.x - this.hexGrid.hexWidth * 0.9 / 2) + "px";
		containerDiv.style.top = (position.y - this.hexGrid.hexHeight * 0.9 / 4) + "px";

		tooltipDesc.style.height = this.hexGrid.hexHeight * 0.9 + "px";
		trace(tooltipDesc.style.height)
		tooltipDesc.style.left = this.hexGrid.hexWidth * 0.95 + "px";
		tooltipDesc.style.top = - this.hexGrid.hexHeight * 0.9 / 4 + "px";

		tech.viewData.element = containerDiv;
		tech.viewData.tooltip = tooltipDesc;
		tech.viewData.researchPrice = reqsDiv;
		tech.viewData.discount = discountSpan;

		this.fillTechUIData(tech);

		this.ui.appendChild(f);
	}

	private fillTechUIData(tech: Technology): void {
		
		tech.viewData.element.style.display = tech.isDiscovered ? "block" : "none";

		var researchPrice: HTMLElement = tech.viewData.researchPrice;
		if (!tech.isFinished) {
			var isAvailable: boolean = tech.isAvailable(this.engine);
			if (isAvailable)
				researchPrice.className = "reqsDiv availableTech";
			else
				researchPrice.className = "reqsDiv unavailableTech";
			researchPrice.innerHTML = tech.scienceCost.toFixed() + " science";
			if (tech.numFinishedNeighbours > 1) {
				tech.viewData.discount.innerText = "\n" + ((1 - tech.getNeighbourFactor(tech.numFinishedNeighbours)) * 100).toFixed() + " % discount due to finished neighbouring technologies.";
				tech.viewData.discount.style.display = "inline";
			}
			else
				tech.viewData.discount.style.display = "none";
		}
		else {
			researchPrice.style.display = "none";
			tech.viewData.discount.style.display = "none";
		}
	}
}   
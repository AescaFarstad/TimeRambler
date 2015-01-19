class HexGrid {
	private static MAX_GRID_SIZE: number = 100;
	private static PADDING: number = 4;
	private static SPACING: number = 4;

	public canvas: HTMLCanvasElement;
	public context: CanvasRenderingContext2D;
	public sqGrid: Object;
	private minX: number;
	private minY: number;

	private sideLength: number;

    constructor(){
    }

	public load(canvas:HTMLCanvasElement):void {
		this.canvas = canvas;
		this.context = canvas.getContext("2d");
	}

	public render(techList: Array<Technology>): void {
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

		this.sqGrid = {}
		var minX: number = Number.MAX_VALUE;
		var minY: number = Number.MAX_VALUE;
		var maxX: number = -Number.MAX_VALUE;
		var maxY: number = -Number.MAX_VALUE;

		for (var i: number = 0; i < techList.length; i++) {
			minX = Math.min(minX, techList[i].x);
			minY = Math.min(minY, techList[i].y);
			maxX = Math.max(maxX, techList[i].x);
			maxY = Math.max(maxY, techList[i].y);
			this.sqGrid[techList[i].x + techList[i].y * HexGrid.MAX_GRID_SIZE] = techList[i];
		}
		var maxWidth: number = (this.canvas.width - HexGrid.PADDING * 2) / (maxX - minX + 3 / 2);
		var maxHeight: number = (this.canvas.height - HexGrid.PADDING * 2) / ((maxY - minY) * 3 / 4 + 1);
		maxWidth = maxWidth / Math.sqrt(3);
		maxHeight = maxHeight / 2;
		this.sideLength = Math.min(maxHeight, maxWidth);

		for (i = 0; i < techList.length; i++) {
			var hasNeighbour: boolean = this.hasFinishedNeighbour(techList[i]);
			if (techList[i].isFinished || hasNeighbour || true) {
				this.drawHex(this.sideLength, techList[i].x - minX, techList[i].y - minY);
			}
		}
		this.minX = minX;
		this.minY = minY;
	}

	public renderOverlayHex(tech: Technology, context: CanvasRenderingContext2D, moreData: any = {}): void {
		context.clearRect(0, 0, this.canvas.width, this.canvas.height);
		if (tech) {
			this.drawHex(this.sideLength, tech.x - this.minX, tech.y - this.minY, "#8888aa", context);			
		}
	}

	private drawHex(sideLength: number, coordX: number, coordY: number, color:
			string = "#7777ff", context: CanvasRenderingContext2D = null): void {
		context = context || this.context;
		var centerX: number = this.getCenterX(sideLength, coordX, coordY);
		var centerY: number = this.getCenterY(sideLength, coordX, coordY);
		//console.log("hex " + label +": " + centerX.toFixed() + " " + centerY.toFixed());
		sideLength *= 0.97;
		context.fillStyle = color;
		context.strokeStyle = "#4444bb";
		context.beginPath();
		for (var i: number = 0; i < 6; i++) {
			var angle:number = Math.PI / 3 * (i + 0.5);
			var x:number = centerX + sideLength * Math.cos(angle);
			var y:number = centerY + sideLength * Math.sin(angle);
			if (i == 0)
				context.moveTo(x, y);
			else
				context.lineTo(x, y);
		}
		context.closePath();
		context.fill();
		context.stroke();
		context.fillStyle = "#000000";
	}

	private getCenterX(sideLength: number, coordX: number, coordY: number): number {
		return HexGrid.PADDING + sideLength * Math.sqrt(3) * (coordX + (coordY % 2 == 1 ? 0.5 : 1));
	} 

	private getCenterY(sideLength: number, coordX: number, coordY: number): number {
		return HexGrid.PADDING + sideLength * (coordY * 3 / 2 + 1);
	} 

	public hexCenter(tech:Technology): IPoint {
		return {x:this.getCenterX(this.sideLength, tech.x - this.minX, tech.y - this.minY), y:this.getCenterY(this.sideLength, tech.x - this.minX, tech.y - this.minY)};
	} 

	public get hexWidth(): number {
		return this.sideLength * Math.sqrt(3);
	}

	public get hexHeight(): number {
		return this.sideLength * 4 / Math.sqrt(3);
	}

	private techByPoint(x: number, y: number): Technology {
		return <Technology> this.sqGrid[x + y * HexGrid.MAX_GRID_SIZE];
	}

	private hasFinishedNeighbour(tech:Technology): boolean {
		var neighbours: Array<Technology> = this.getNeighbours(tech.x, tech.y);
		for (var i: number = 0; i < neighbours.length; i++) {
			if (neighbours[i].isFinished)
				return true;
		}
		return false;
	}

	private getNeighbours(x:number, y:number): Array<Technology> {
		var neighbours: Array<Technology> = new Array<Technology>();

		var neighbour: Technology = this.techByPoint(x - 1, y);
		if (neighbour)
			neighbours.push(neighbour);		
		neighbour = this.techByPoint(x, y - 1);
		if (neighbour)
			neighbours.push(neighbour);

		neighbour = this.techByPoint(x + 1, y);
		if (neighbour)
			neighbours.push(neighbour);

		neighbour = this.techByPoint(x, y + 1);
		if (neighbour)
			neighbours.push(neighbour);

		if (y % 2 == 0) {
			neighbour = this.techByPoint(x - 1, y - 1);
			if (neighbour)
				neighbours.push(neighbour);

			neighbour = this.techByPoint(x - 1, y + 1);
			if (neighbour)
				neighbours.push(neighbour);
		}
		else {
			neighbour = this.techByPoint(x + 1, y - 1);
			if (neighbour)
				neighbours.push(neighbour);

			neighbour = this.techByPoint(x + 1, y + 1);
			if (neighbour)
				neighbours.push(neighbour);
		}
		return neighbours;
	}

	public coordinatesToTech(x: number, y: number, debugData:any): Technology {
		var aprX: number = Math.floor((x - HexGrid.PADDING) / (this.sideLength * Math.sqrt(3))) + this.minX;
		var aprY: number = Math.floor((y - HexGrid.PADDING) / (this.sideLength * 3 / 2)) + this.minY;
		var aprTech: Technology = this.techByPoint(aprX, aprY);		
		var neighbours: Array<Technology> = this.getNeighbours(aprX, aprY);
		if (aprTech)
			neighbours.push(aprTech);
		var bestIndex: number = -1;
		var bestDistance: number = Number.POSITIVE_INFINITY; 
		for (var i: number = 0; i < neighbours.length; i++) {
			var centerX: number = this.getCenterX(this.sideLength, neighbours[i].x - this.minX, neighbours[i].y - this.minY);
			var centerY: number = this.getCenterY(this.sideLength, neighbours[i].x - this.minX, neighbours[i].y - this.minY);
		/*	if (debugData) {
				var ctx: CanvasRenderingContext2D = <CanvasRenderingContext2D>debugData;
				ctx.strokeStyle = "#222222";
				ctx.beginPath();
				ctx.moveTo(x, y);
				ctx.lineTo(centerX, centerY);
				ctx.stroke();
			}*/
			var distance: number = (x - centerX) * (x - centerX) + (y - centerY) * (y - centerY);
			if (distance < bestDistance) {
				bestIndex = i;
				bestDistance = distance;
			}
		}
		//trace("apr coordinates:", aprX, aprY, aprTech ? aprTech.id : "-", x.toFixed(), y.toFixed(), "distance:", Math.sqrt(bestDistance));
		//TODO: instead of this hack, getNeighbours should work with points instead of techs and always look through 6 neighbours
		if (Math.sqrt(bestDistance) < this.sideLength)
			return neighbours[bestIndex];
		else
			return null;
	}
}

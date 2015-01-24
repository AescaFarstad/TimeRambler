class HexGraph {
	private static MAX_GRID_SIZE: number = 100;
	
	public sqGrid: Object = {};

	public addTech(tech:Technology): void {
			this.sqGrid[tech.x + tech.y * HexGraph.MAX_GRID_SIZE] = tech;
	}
	
	public techByPoint(x: number, y: number): Technology {
		return <Technology> this.sqGrid[x + y * HexGraph.MAX_GRID_SIZE];
	}

	public getNeighbours(x:number, y:number): Array<Technology> {
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

	public getNeighbouringPoints(x:number, y:number): Array<IPoint> {
		var neighbours: Array<IPoint> = new Array<IPoint>();

		neighbours.push({ x: x - 1, y: y });
		neighbours.push({ x: x, y: y - 1 });
		neighbours.push({ x: x + 1, y: y });
		neighbours.push({ x: x, y: y + 1 });

		if (y % 2 == 0) {
			neighbours.push({ x: x - 1, y: y - 1 });
			neighbours.push({ x: x - 1, y: y + 1 });
		}
		else {
			neighbours.push({ x: x + 1, y: y - 1 });
			neighbours.push({ x: x + 1, y: y + 1 });
		}
		return neighbours;
	}
} 
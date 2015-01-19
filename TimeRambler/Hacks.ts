class Hacks {

	public static globalToLocal(e: MouseEvent): any {
		var element: HTMLElement = <HTMLElement> e.currentTarget;
		var xPosition:number =  - (document.documentElement.scrollLeft || document.body.scrollLeft);
		var yPosition:number = - (document.documentElement.scrollTop || document.body.scrollTop);
      
		while (element) {
			xPosition += (element.offsetLeft + element.clientLeft);
			yPosition += (element.offsetTop  + element.clientTop);
			element = <HTMLElement> element.offsetParent;
		}

		xPosition = e.clientX - xPosition;
		yPosition = e.clientY - yPosition;
		return { x: xPosition, y: yPosition };
	}
}

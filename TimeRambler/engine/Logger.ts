class Logger {
    public static gameLog: Array<string> = new Array<string>();
    public static engineLog: Array<string> = new Array<string>();        
}
function logGame(content: string): void {
    Logger.gameLog.push(content);
}

function logEngine(content: string): void {
    Logger.engineLog.push(content);
}

function trace(...args): void {
	console.log(args.join(" "));
}
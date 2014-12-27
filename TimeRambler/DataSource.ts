class DataSource {

    constructor() {
    }

    public static foorPerPop: number = 0.1;

    public initEngine(engine:Engine): void {
        var popResource: Stat = new Stat("pop", "pop");
        
        popResource.insertCapModifier(new Modifier("init", 10, 0));
        engine.addResource(popResource);

        var foodResource: Stat = new Stat("food", "food");
        foodResource.setValue(50, engine);
        foodResource.insertCapModifier(new Modifier("init", 50, 0));
        foodResource.insertRateModifier(new Modifier("pop", 0, 0));
        engine.addResource(foodResource);

        popResource.onValueChanged = (stat: Stat, engine: Engine) => engine.resourcesById["food"].editRateModifier("pop", -stat.value * DataSource.foorPerPop / 1000, 0);
        popResource.setValue(5, engine);


    }

}  
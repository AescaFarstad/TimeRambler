class DataSource {

    constructor() {
    }

    public static foorPerPop: number = 0.1;
    public static canibalicFood: number = 20;

    public initEngine(engine:Engine): void {
        var popResource: Stat = new Stat("pop", "pop");
        
        popResource.insertCapModifier(new Modifier("init", 10, 0));
        popResource.isDecimal = false;
        engine.addResource(popResource);

        var foodResource: Stat = new Stat("food", "food");
        foodResource.setValue(50, engine);
        foodResource.insertCapModifier(new Modifier("init", 50, 0));
        foodResource.insertRateModifier(new Modifier("pop", 0, 0));
        engine.addResource(foodResource);

        popResource.onValueChanged = (stat: Stat, engine: Engine) => engine.resourcesById["food"].editRateModifier("pop", -stat.value * DataSource.foorPerPop / 1000, 0);
        popResource.setValue(5, engine);

        engine.addRule(this.foodRule);


    }

    private foodRule(engine: Engine): void{
        var food: Stat = engine.resourcesById["food"];
        var pop: Stat = engine.resourcesById["pop"];
        var popVal: number = pop.value;
        while (food.value < 0 && popVal > 0) {
            food.setValue(food.value + DataSource.canibalicFood, engine);
            popVal -= 1;
        }
        pop.setValue(popVal, engine);
    }


}  
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

        var unemployedResource: Stat = new Stat("unemployed", "unemployed");

        
        unemployedResource.isDecimal = false;
        unemployedResource.hasCap = false;
        engine.addResource(unemployedResource);

        var foodResource: Stat = new Stat("food", "food");
        foodResource.setValue(50, engine);
        foodResource.insertCapModifier(new Modifier("init", 50, 0));
        foodResource.insertRateModifier(new Modifier("pop", 0, 0));
        engine.addResource(foodResource);

        popResource.onValueChanged = this.popRule;
        popResource.setValue(5, engine);

        engine.addRule(this.foodRule);

        var growFailOutcome: ActionOutcome = new ActionOutcome("fail", 45, this.growFailExec);
        var growSuccessOutcome: ActionOutcome = new ActionOutcome("success", 55, this.growSuccessExec);

        var growAction: Action = new Action("grow", "Grow", 2, 2 * 1000, new ResourceRequirement(["food"], [20]), [growFailOutcome, growSuccessOutcome]);
        engine.addAction(growAction);

    }

    private popRule(stat: Stat, engine: Engine, delta:number): void {
        engine.resourcesById["food"].editRateModifier("pop", -stat.value * DataSource.foorPerPop / 1000, 0);
        engine.resourcesById["unemployed"].setValue(engine.resourcesById["unemployed"].value + delta);
    }

    //if there are not enough workers some actions must be canceled
    private unemployedRule(stat: Stat, engine: Engine, delta: number): void {
        if (stat.value < 0) {
            for (var i: number = 0; i < engine.actions.length; i++) {
                if (engine.actions[i].isStarted && engine.actions[i].pop > 0)
                    engine.actions[i].cancel(engine);
            }
        }
    }

    //if there is not enough food people must die
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

    private growFailExec(engine: Engine): void {
        engine.resourcesById["pop"].modify(-1, engine);
    }

    private growSuccessExec(engine: Engine): void {
        engine.resourcesById["pop"].modify(1, engine);
    }

}  
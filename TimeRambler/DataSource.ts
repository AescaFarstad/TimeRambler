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

        unemployedResource.onValueChanged = this.unemployedRule;
        unemployedResource.isDecimal = false;
        unemployedResource.hasCap = false;
        engine.addResource(unemployedResource);

        var foodResource: Stat = new Stat("food", "food");
        foodResource.setValue(15, engine);
        foodResource.insertCapModifier(new Modifier("init", 20, 0));
        foodResource.insertCapModifier(new Modifier("pop", 0, 0));
        foodResource.insertRateModifier(new Modifier("pop", 0, 0));
        engine.addResource(foodResource);

        popResource.onValueChanged = this.popRule;
        popResource.setValue(3, engine);

        engine.addRule(this.foodRule);

        var woodResource: Stat = new Stat("wood", "wood");
        woodResource.insertCapModifier(new Modifier("init", 50, 0));
        engine.addResource(woodResource);

        //Grow
        var growFailOutcome: ActionOutcome = new ActionOutcome("fail", 35, ActionOutcomes.growFailExec, ActionOutcomes.growFailHistoryEntry);
        var growSuccessOutcome: ActionOutcome = new ActionOutcome("success", 65, ActionOutcomes.growSuccessExec, ActionOutcomes.growSuccessHistoryEntry);

        var growAction: Action = new Action("grow", "Grow", 2, 10 * 1000, new ResourceRequirement(["food"], [10]), [growFailOutcome, growSuccessOutcome]);
        engine.addAction(growAction);

        //Small hunt
        var smallHuntFailOutcome: ActionOutcome = new ActionOutcome("fail", 15, ActionOutcomes.smallHuntFailExec, ActionOutcomes.smallHuntFailHistoryEntry);
        var smallHuntMinorSuccess1Outcome: ActionOutcome = new ActionOutcome("minorSuccess1", 10, ActionOutcomes.smallHuntMinorSuccess1Exec, ActionOutcomes.smallHuntMinorSuccess1HistoryEntry);
        var smallHuntMinorSuccess2Outcome: ActionOutcome = new ActionOutcome("minorSuccess2", 10, ActionOutcomes.smallHuntMinorSuccess2Exec, ActionOutcomes.smallHuntMinorSuccess2HistoryEntry);
        var smallHuntMinorSuccess3Outcome: ActionOutcome = new ActionOutcome("minorSuccess3", 10, ActionOutcomes.smallHuntMinorSuccess3Exec, ActionOutcomes.smallHuntMinorSuccess3HistoryEntry);
        var smallHuntMajorSuccess1Outcome: ActionOutcome = new ActionOutcome("majoruccess1", 15, ActionOutcomes.smallHuntMajorSuccess1Exec, ActionOutcomes.smallHuntMajorSuccess1HistoryEntry);
        var smallHuntMajorSuccess2Outcome: ActionOutcome = new ActionOutcome("majoruccess2", 15, ActionOutcomes.smallHuntMajorSuccess2Exec, ActionOutcomes.smallHuntMajorSuccess2HistoryEntry);

        var smallHuntAction: Action = new Action("smallHunt", "Hunt", 3, 7 * 1000, new ResourceRequirement([], []), [smallHuntFailOutcome,
            smallHuntMinorSuccess1Outcome, smallHuntMinorSuccess2Outcome, smallHuntMinorSuccess3Outcome, smallHuntMajorSuccess1Outcome, smallHuntMajorSuccess2Outcome]);
        engine.addAction(smallHuntAction);

        //Great hunt
        var greatHuntOutcome: ActionOutcome = new ActionOutcome("success", 1, ActionOutcomes.greatHunt, ActionOutcomes.greatHuntHistoryEntry);

        var greatHuntAction: Action = new Action("greatHunt", "Great Hunt", 6, 30 * 1000, new ResourceRequirement(["wood"], [10]), [greatHuntOutcome]);
        engine.addAction(greatHuntAction);

        engine.addRule(this.huntingRule);

    }

    private popRule(stat: Stat, engine: Engine, delta:number): void {
        engine.resourcesById("food").editRateModifier("pop", -stat.value * DataSource.foorPerPop / 1000, 0);
        engine.resourcesById("unemployed").setValue(engine.resourcesById("unemployed").value + delta, engine);
        engine.resourcesById("food").editCapModifier("pop", stat.value * 10, 0);
    }

    //if there are not enough workers some actions must be canceled
    private unemployedRule(stat: Stat, engine: Engine, delta: number): void {
        if (stat.value < 0) {
            for (var i: number = 0; i < engine.actions.length; i++) {
                if (engine.actions[i].isStarted && engine.actions[i].pop > 0) {
                    logGame("The recent decrease in the number of available workers has made it impossible to finish " + engine.actions[i].name);
                    engine.actions[i].cancel(engine);
                    return;
                }
            }
        }
    }

    //if there is not enough food people must die
    private foodRule(engine: Engine): void{
        var food: Stat = engine.resourcesById("food");
        var pop: Stat = engine.resourcesById("pop");
        var popVal: number = pop.value;
        while (food.value < 0 && popVal > 0) {
            logGame("Starvation has claimed a villager! <b>Population decreased by 1.</b>")
            food.setValue(food.value + DataSource.canibalicFood, engine);
            popVal -= 1;
        }
        pop.setValue(popVal, engine);
    }

    //if food is low - hunt
    private huntingRule(engine: Engine): void {
        var food: Stat = engine.resourcesById("food");
        if (food.value < 10) {
            var smallHunt: Action = engine.actionsById("smallHunt");
            if (!smallHunt.isStarted && smallHunt.isAvailable(engine)) {
                logGame("The villagers have noticed the shortage of food and decided to go hunting.");
                smallHunt.start(engine);
            }
        }
    }

    

}  
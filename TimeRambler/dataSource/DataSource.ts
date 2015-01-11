class DataSource {

    constructor() {
    }

    public static foorPerPop: number = 0.1;
    public static canibalicFood: number = 20;

    public initEngine(engine: Engine): void {
        GameRules.init();

        var popResource: Stat = new Stat("pop", "pop");
        
        popResource.insertCapModifier(new Modifier("init", 10, 0));
        popResource.isDecimal = false;
        engine.addResource(popResource);
        popResource.isDiscovered = true;

        var unemployedResource: Stat = new Stat("unemployed", "unemployed");

        unemployedResource.onValueChanged = this.unemployedRule;
        unemployedResource.isDecimal = false;
        unemployedResource.hasCap = false;
        unemployedResource.isDiscovered = true;
        engine.addResource(unemployedResource);

        var foodResource: Stat = new Stat("food", "food");
        foodResource.setValue(15, engine);
        foodResource.insertCapModifier(new Modifier("init", 20, 0));
        foodResource.insertCapModifier(new Modifier("pop", 0, 0));
        foodResource.insertRateModifier(new Modifier("pop", 0, 0));
        foodResource.isDiscovered = true;
        engine.addResource(foodResource);

        popResource.onValueChanged = this.popRule;
        popResource.setValue(3, engine);

        engine.addRule(GameRules.foodRule);

        var woodResource: Stat = new Stat("wood", "wood");
        woodResource.insertCapModifier(new Modifier("init", 50, 0));
        engine.addResource(woodResource);

        //Grow
        var growFailOutcome: ActionOutcome = new ActionOutcome("fail", 30, ActionOutcomes.growFailExec, ActionOutcomes.growFailHistoryEntry);
        var growSuccessOutcome: ActionOutcome = new ActionOutcome("success", 90, ActionOutcomes.growSuccessExec, ActionOutcomes.growSuccessHistoryEntry);

        var growAction: Action = new Action("grow", "Raise a child", 2, 10 * 1000, new ResourceRequirement(["food"], [10]), [growFailOutcome, growSuccessOutcome]);
        engine.addAction(growAction);

        //Small hunt
        var smallHuntFailOutcome: ActionOutcome = new ActionOutcome("fail", 10, ActionOutcomes.smallHuntFailExec, ActionOutcomes.smallHuntFailHistoryEntry);
        var smallHuntMinorSuccess1Outcome: ActionOutcome = new ActionOutcome("minorSuccess1", 5, ActionOutcomes.smallHuntMinorSuccess1Exec, ActionOutcomes.smallHuntMinorSuccess1HistoryEntry);
        var smallHuntMinorSuccess2Outcome: ActionOutcome = new ActionOutcome("minorSuccess2", 10, ActionOutcomes.smallHuntMinorSuccess2Exec, ActionOutcomes.smallHuntMinorSuccess2HistoryEntry);
        var smallHuntMinorSuccess3Outcome: ActionOutcome = new ActionOutcome("minorSuccess3", 10, ActionOutcomes.smallHuntMinorSuccess3Exec, ActionOutcomes.smallHuntMinorSuccess3HistoryEntry);
        var smallHuntMajorSuccess1Outcome: ActionOutcome = new ActionOutcome("majoruccess1", 25, ActionOutcomes.smallHuntMajorSuccess1Exec, ActionOutcomes.smallHuntMajorSuccess1HistoryEntry);
        var smallHuntMajorSuccess2Outcome: ActionOutcome = new ActionOutcome("majoruccess2", 25, ActionOutcomes.smallHuntMajorSuccess2Exec, ActionOutcomes.smallHuntMajorSuccess2HistoryEntry);

        var smallHuntAction: Action = new Action("smallHunt", "Hunt", 3, 3 * 1000, new ResourceRequirement([], []), [smallHuntFailOutcome,
            smallHuntMinorSuccess1Outcome, smallHuntMinorSuccess2Outcome, smallHuntMinorSuccess3Outcome, smallHuntMajorSuccess1Outcome, smallHuntMajorSuccess2Outcome]);
        engine.addAction(smallHuntAction);

        smallHuntAction.isDiscovered = true;
        smallHuntAction.viewData.isContentOpen = true;

        //Great hunt
        var greatHuntOutcome: ActionOutcome = new ActionOutcome("success", 1, ActionOutcomes.greatHunt, ActionOutcomes.greatHuntHistoryEntry);

        var greatHuntAction: Action = new Action("greatHunt", "Great Hunt", 6, 30 * 1000, new ResourceRequirement(["wood"], [10]), [greatHuntOutcome]);
        engine.addAction(greatHuntAction);

        engine.addRule(GameRules.huntingRule);
        engine.addRule(GameRules.unlockGrowRule);
        engine.addRule(GameRules.unlockGreatHuntRule);
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

    

    

}  
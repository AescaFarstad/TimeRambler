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

        var researchResource: Stat = new Stat("research", "research");
        researchResource.insertCapModifier(new Modifier("init", 50, 0));
        engine.addResource(researchResource);

        var cultureResource: Stat = new Stat("culture", "culture");
        cultureResource.hasCap = false;
        engine.addResource(cultureResource);

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

        this.addResearch(engine);
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

    private addResearch(engine: Engine): void {
		var humanity: Technology = new Technology("humanity", "Humanity", 0, 0, null, 0, new ResourceRequirement());
		humanity.description = "Makes people human";
        humanity.isDiscovered = true;
        humanity.isFinished = true;
		engine.addTech(humanity);

		var stoneTools: Technology = new Technology("stoneTools", "Stone Tools", -1, -1, Technologies.stoneToolsExec, 5, new ResourceRequirement());
		stoneTools.description = Technologies.stoneToolsDescription;
		stoneTools.isDiscovered = true;
		engine.addTech(stoneTools);

		var gathering: Technology = new Technology("gathering", "Gathering", -1, 0, Technologies.stoneToolsExec, 5, new ResourceRequirement());
		gathering.description = Technologies.stoneToolsDescription;
		gathering.isDiscovered = true;
		engine.addTech(gathering);

		var language: Technology = new Technology("language", "Language", 0, 1, Technologies.stoneToolsExec, 5, new ResourceRequirement());
		language.description = Technologies.stoneToolsDescription;
		language.isDiscovered = true;
		engine.addTech(language);

		var tamingFire: Technology = new Technology("tamingFire", "Taming Fire", 0, -1, Technologies.stoneToolsExec, 5, new ResourceRequirement());
		tamingFire.description = Technologies.stoneToolsDescription;
		tamingFire.isDiscovered = true;
		engine.addTech(tamingFire);
		
		var mining: Technology = new Technology("mining", "Mining", -1, -2, Technologies.stoneToolsExec, 5, new ResourceRequirement());
		mining.description = Technologies.stoneToolsDescription;
		mining.isDiscovered = true;
		engine.addTech(mining);

		var socialHierarchy: Technology = new Technology("socialHierarchy", "Social Hierarchy", 1, 1, Technologies.stoneToolsExec, 5, new ResourceRequirement());
		socialHierarchy.description = Technologies.stoneToolsDescription;
		socialHierarchy.isDiscovered = true;
		engine.addTech(socialHierarchy);

		var agriculture: Technology = new Technology("agriculture", "Agriculture", -2, -1, Technologies.stoneToolsExec, 5, new ResourceRequirement());
		agriculture.description = Technologies.stoneToolsDescription;
		agriculture.isDiscovered = true;
		engine.addTech(agriculture);

		var stoneNBone: Technology = new Technology("stoneNBone", "Stone and bone weapons", -2, -3, Technologies.stoneToolsExec, 5, new ResourceRequirement());
		stoneNBone.description = Technologies.stoneToolsDescription;
		stoneNBone.isDiscovered = true;
		engine.addTech(stoneNBone);

		var irrigation: Technology = new Technology("irrigation", "Irrigation", -2, -2, Technologies.stoneToolsExec, 5, new ResourceRequirement());
		irrigation.description = Technologies.stoneToolsDescription;
		irrigation.isDiscovered = true;
		engine.addTech(irrigation);

		var hunting: Technology = new Technology("hunting", "Hunting", 0, -2, Technologies.stoneToolsExec, 5, new ResourceRequirement());
		hunting.description = Technologies.stoneToolsDescription;
		hunting.isDiscovered = true;
		engine.addTech(hunting);

		var painting: Technology = new Technology("painting", "Painting", 2, 2, Technologies.stoneToolsExec, 5, new ResourceRequirement());
		painting.description = Technologies.stoneToolsDescription;
		painting.isDiscovered = true;
		engine.addTech(painting);

		var monuments: Technology = new Technology("monuments", "Monuments", 2, 0, Technologies.stoneToolsExec, 5, new ResourceRequirement());
		monuments.description = Technologies.stoneToolsDescription;
		monuments.isDiscovered = true;
		engine.addTech(monuments);

    }

    

}  
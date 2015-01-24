class GameRules {

    public static init(): void {
        GameRules.foodRule = new GameRule("foodRule", GameRules.foodRuleExec);
        GameRules.huntingRule = new GameRule("huntingRule", GameRules.huntingRuleExec);
        GameRules.unlockGrowRule = new GameRule("unlockGrowRule", GameRules.unlockGrowRuleExec);
        GameRules.unlockGreatHuntRule = new GameRule("unlockGreatHuntRule", GameRules.unlockGreatHuntRuleExec);
        GameRules.dicoverScienceRule = new GameRule("dicoverScienceRule", GameRules.dicoverScienceRuleExec);
    }

    //if there is not enough food people must die
    public static foodRule: GameRule;
    public static foodRuleExec(engine: Engine): void {
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
    public static huntingRule: GameRule;
    public static huntingRuleExec(engine: Engine): void {
        var food: Stat = engine.resourcesById("food");
        if (food.value < 10) {
            var smallHunt: Action = engine.actionsById("smallHunt");
            if (!smallHunt.isStarted && smallHunt.isAvailable(engine)) {
                logGame("The villagers have noticed the shortage of food and decided to go hunting.");
                smallHunt.start(engine);
            }
        }
    }

    //if hunted more than twice - unlock procreation
    public static unlockGrowRule: GameRule;
    public static unlockGrowRuleExec(engine: Engine): void {
        if (engine.playerData.numberOfSmallHunts > 2) {
            engine.actionsById("grow").isDiscovered = true;
            engine.removeRule(GameRules.unlockGrowRule);
        }
    }

    //if hunted more than 4 times and grew more than once - unlock the great hunt
    public static unlockGreatHuntRule: GameRule;
    public static unlockGreatHuntRuleExec(engine: Engine): void {
        if (engine.playerData.numberOfSmallHunts > 2 && engine.playerData.numberOfGrows > 1) {
            engine.actionsById("greatHunt").isDiscovered = true;
            engine.removeRule(GameRules.unlockGreatHuntRule);
        }
    }

	//discover science when you get 3
    public static dicoverScienceRule: GameRule;
    public static dicoverScienceRuleExec(engine: Engine): void {
        if (engine.resourcesById("science").value >= 3) {
            engine.resourcesById("science").isDiscovered = true;
			engine.removeRule(GameRules.dicoverScienceRule);
        }
    }
    
}  
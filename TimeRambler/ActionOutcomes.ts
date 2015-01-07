class ActionOutcomes {

    //grow
    public static growFailExec(action: Action, outcome: ActionOutcome, engine: Engine): ActionOutcome {
        if (action.lastOutcome == outcome) { //cannot fail two times in a row
            logEngine("grow redirected to success because lastOutcome == outcome");
            return action.outcomeById("success");
        }
        if (engine.resourcesById("pop").value > 3) {
            engine.resourcesById("pop").modify(-1, engine);
            logGame("Mother has died during the childbirth. No one could feed the child and he died too. <b>Population decreased by 1.</b>");
        }
        else {
            logGame("The child died young.");
            logEngine("pop on small hunt didn't die because population is too low");
        }
        return null;
    }

    public static growSuccessExec(action: Action, outcome: ActionOutcome, engine: Engine): void {
        logGame("Family grows. <b>Population increased by 1.</b>");
        engine.resourcesById("pop").modify(1, engine);
    }

    //small hunt
    public static smallHuntFailExec(action: Action, outcome: ActionOutcome, engine: Engine): ActionOutcome {
        if (action.lastOutcome == outcome) { //cannot fail two times in a row
            logEngine("small hunt redirected to success because lastOutcome == outcome");
            return action.outcomeById("minorSuccess3");
        }
        if (engine.resourcesById("pop").value > 3) {
            engine.resourcesById("pop").modify(-1, engine);
            logGame("The hunter became the prey. <b>Population decreased by 1.</b>");
        }
        else {
            logGame("The hunters returned empty-handed.");
            logEngine("pop on small hunt didn't die because population is too low");
        }
        return null
    }

    public static smallHuntMinorSuccess1Exec(action: Action, outcome: ActionOutcome, engine: Engine): void {
        if (engine.resourcesById("pop").value > 3) {
            logGame("The hunt was a dubious success. <b>Food +20; Wood + 1. Population decreased by 1.</b>");
            engine.resourcesById("pop").modify(-1, engine);
        }
        else {
            logGame("The hunt was a minor success. <b>Food +20; Wood + 1.</b>");
            logEngine("pop on small hunt didn't die because population is too low");
        }
        engine.resourcesById("food").modify(20, engine);
        engine.resourcesById("wood").modify(1, engine);
    }

    public static smallHuntMinorSuccess2Exec(action: Action, outcome: ActionOutcome, engine: Engine): void {
        if (engine.resourcesById("pop").value > 3) {
            logGame("The hunt was a dubious success. <b>Food +30. Population decreased by 1.</b>");
            engine.resourcesById("pop").modify(-1, engine);
        }
        else {
            logGame("The hunt was a minor success. <b>Food +30;</b>");
            logEngine("pop on small hunt didn't die because population is too low");
        }
        engine.resourcesById("food").modify(30, engine);
    }

    public static smallHuntMinorSuccess3Exec(action: Action, outcome: ActionOutcome, engine: Engine): void {
        if (engine.resourcesById("pop").value > 3) {
            logGame("The hunt was a dubious success. <b>Food +40. Population decreased by 1.</b>");
            engine.resourcesById("pop").modify(-1, engine);
        }
        else {
            logGame("The hunt was a minor success. <b>Food +40.</b>");
            logEngine("pop on small hunt didn't die because population is too low");
        }
        engine.resourcesById("food").modify(40, engine);
    }

    public static smallHuntMajorSuccess1Exec(action: Action, outcome: ActionOutcome, engine: Engine): void {
        logGame("The hunt was a major success! <b>Food +40; Wood +3.</b> And the best thing - everyone returned home uninjured!");
        engine.resourcesById("food").modify(40, engine);
        engine.resourcesById("wood").modify(3, engine);
    }

    public static smallHuntMajorSuccess2Exec(action: Action, outcome: ActionOutcome, engine: Engine): void {
        logGame("The hunt was a major success! <b>Food +50; Wood +1.</b> And the best thing - everyone returned home uninjured!");
        engine.resourcesById("food").modify(50, engine);
        engine.resourcesById("wood").modify(1, engine);
    }

    //great hunt
    public static greatHunt(action: Action, outcome: ActionOutcome, engine: Engine): void {
        logGame("The Great Hunt was almost failed due to coordination issues. It takes both great courage and strength to combat such large animals. You have played the key part here and everybody recognizes your contribution. <b>Food +150; Wood +25</b>");
        engine.resourcesById("food").modify(150, engine);
        engine.resourcesById("wood").modify(25, engine);
    }
} 
class ActionOutcomes {

    //grow
    public static growFailHistoryEntry: string = "Birth complications. Don't ask.";
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
        engine.playerData.numberOfGrows++;
        return null;
    }

    public static growSuccessHistoryEntry: string = "The wonder of life has happened in it's full glory.";
    public static growSuccessExec(action: Action, outcome: ActionOutcome, engine: Engine): void {
        logGame("Family grows. <b>Population increased by 1.</b>");
        engine.resourcesById("pop").modify(1, engine);
        engine.playerData.numberOfGrows++;
    }

    //small hunt
    public static smallHuntFailHistoryEntry: string = "Total failure.";
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
        engine.playerData.numberOfSmallHunts++;
        return null
    }

    public static smallHuntMinorSuccess1HistoryEntry: string = "Minor success. Hunters sustained injuries. <b>Food +20; Wood + 1.</b>";
    public static smallHuntMinorSuccess1Exec(action: Action, outcome: ActionOutcome, engine: Engine): void {
        if (engine.resourcesById("pop").value > 3) {
            logGame("The hunt was a dubious success. <b>Food +20; Wood + 1. Population decreased by 1.</b>");
            engine.resourcesById("pop").modify(-1, engine);
        }
        else {
            logGame("The hunt was a minor success. <b>Food +20; Wood + 1.</b> The hunters are injured but overall fine.");
            logEngine("pop on small hunt didn't die because population is too low");
        }
        engine.resourcesById("food").modify(20, engine);
        engine.resourcesById("wood").modify(1, engine);
        engine.resourcesById("wood").isDiscovered = true;
        engine.playerData.numberOfSmallHunts++;
    }

    public static smallHuntMinorSuccess2HistoryEntry: string = "Minor success. Hunters sustained injuries. <b>Food +30.</b>";
    public static smallHuntMinorSuccess2Exec(action: Action, outcome: ActionOutcome, engine: Engine): void {
        if (engine.resourcesById("pop").value > 3) {
            logGame("The hunt was a dubious success. <b>Food +30. Population decreased by 1.</b>");
            engine.resourcesById("pop").modify(-1, engine);
        }
        else {
            logGame("The hunt was a minor success. <b>Food +30.</b> The hunters are injured but overall fine.");
            logEngine("pop on small hunt didn't die because population is too low");
        }
        engine.resourcesById("food").modify(30, engine);
        engine.playerData.numberOfSmallHunts++;
    }

    public static smallHuntMinorSuccess3HistoryEntry: string = "Minor success. Hunters sustained injuries. <b>Food +40.</b>";
    public static smallHuntMinorSuccess3Exec(action: Action, outcome: ActionOutcome, engine: Engine): void {
        if (engine.resourcesById("pop").value > 3) {
            logGame("The hunt was a dubious success. <b>Food +40. Population decreased by 1.</b>");
            engine.resourcesById("pop").modify(-1, engine);
        }
        else {
            logGame("The hunt was a minor success. <b>Food +40.</b> The hunters are injured but overall fine.");
            logEngine("pop on small hunt didn't die because population is too low");
        }
        engine.resourcesById("food").modify(40, engine);
        engine.playerData.numberOfSmallHunts++;
    }

    public static smallHuntMajorSuccess1HistoryEntry: string = "Success! <b>Food +40; Wood +3.</b>";
    public static smallHuntMajorSuccess1Exec(action: Action, outcome: ActionOutcome, engine: Engine): void {
        logGame("The hunt was a major success! <b>Food +40; Wood +3.</b> And the best thing - everyone returned home uninjured!");
        engine.resourcesById("food").modify(40, engine);
        engine.resourcesById("wood").modify(3, engine);
        engine.resourcesById("wood").isDiscovered = true;
        engine.playerData.numberOfSmallHunts++;
    }

    public static smallHuntMajorSuccess2HistoryEntry: string = "Success! <b>Food +50; Wood +1.</b>";
    public static smallHuntMajorSuccess2Exec(action: Action, outcome: ActionOutcome, engine: Engine): void {
        logGame("The hunt was a major success! <b>Food +50; Wood +1.</b> And the best thing - everyone returned home uninjured!");
        engine.resourcesById("food").modify(50, engine);
        engine.resourcesById("wood").modify(1, engine);
        engine.resourcesById("wood").isDiscovered = true;
        engine.playerData.numberOfSmallHunts++;
    }

    //great hunt
    public static greatHuntHistoryEntry: string = "You are not supposed to ever read this. Unsee now!";
    public static greatHunt(action: Action, outcome: ActionOutcome, engine: Engine): void {
        logGame("The Great Hunt had almost failed due to coordination issues. " +
            "Truly unprecedented is the courage and strength it took to combat such large animals. " + 
            "It was most brave of you to take the matters in your own hands and unite the frightened villagers. " +
            "Songs and ballads would be made about this event. Unfortunately <b >Acoustics</b> and <b>Drama'n'Poetry</b> still aren't researched." +
            "So for now you will have to settle on the fact that everybody recognizes your contribution in prose.<b> Food + 150; Wood + 25 </b> ");
        engine.resourcesById("food").modify(150, engine);
        engine.resourcesById("wood").modify(25, engine);
        action.isObsolete = true;
    }
} 
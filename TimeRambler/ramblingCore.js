var GameRules = (function () {
    function GameRules() {
    }
    GameRules.init = function () {
        GameRules.foodRule = new GameRule("foodRule", GameRules.foodRuleExec);
        GameRules.huntingRule = new GameRule("huntingRule", GameRules.huntingRuleExec);
        GameRules.unlockGrowRule = new GameRule("unlockGrowRule", GameRules.unlockGrowRuleExec);
        GameRules.unlockGreatHuntRule = new GameRule("unlockGreatHuntRule", GameRules.unlockGreatHuntRuleExec);
    };
    GameRules.foodRuleExec = function (engine) {
        var food = engine.resourcesById("food");
        var pop = engine.resourcesById("pop");
        var popVal = pop.value;
        while (food.value < 0 && popVal > 0) {
            logGame("Starvation has claimed a villager! <b>Population decreased by 1.</b>");
            food.setValue(food.value + DataSource.canibalicFood, engine);
            popVal -= 1;
        }
        pop.setValue(popVal, engine);
    };
    GameRules.huntingRuleExec = function (engine) {
        var food = engine.resourcesById("food");
        if (food.value < 10) {
            var smallHunt = engine.actionsById("smallHunt");
            if (!smallHunt.isStarted && smallHunt.isAvailable(engine)) {
                logGame("The villagers have noticed the shortage of food and decided to go hunting.");
                smallHunt.start(engine);
            }
        }
    };
    GameRules.unlockGrowRuleExec = function (engine) {
        if (engine.playerData.numberOfSmallHunts > 2) {
            engine.actionsById("grow").isDiscovered = true;
            engine.removeRule(GameRules.unlockGrowRule);
        }
    };
    GameRules.unlockGreatHuntRuleExec = function (engine) {
        if (engine.playerData.numberOfSmallHunts > 2 && engine.playerData.numberOfGrows > 1) {
            engine.actionsById("greatHunt").isDiscovered = true;
            engine.removeRule(GameRules.unlockGreatHuntRule);
        }
    };
    return GameRules;
})();
var Action = (function () {
    function Action(id, name, pop, time, resources, outcomes) {
        this.id = id;
        this.name = name;
        this.pop = pop;
        this.time = time;
        this.resources = resources;
        this.outcomes = outcomes;
        this.viewData = new ActionViewData();
    }
    Action.prototype.isAvailable = function (engine) {
        return engine.resourcesById("unemployed").value >= this.pop && this.resources.isMet(engine);
    };
    Action.prototype.start = function (engine) {
        this._timeLeft = this.time;
        this._isStarted = true;
        engine.resourcesById("unemployed").modify(-this.pop, engine);
        this.resources.subtractFrom(engine);
    };
    Action.prototype.update = function (timeDelta) {
        this._timeLeft -= timeDelta;
    };
    Object.defineProperty(Action.prototype, "isComplete", {
        get: function () {
            return this._timeLeft <= 0;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Action.prototype, "isStarted", {
        get: function () {
            return this._isStarted;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Action.prototype, "lastOutcome", {
        get: function () {
            return this._lastOutcome;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Action.prototype, "progress", {
        get: function () {
            return 1 - this._timeLeft / this.time;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Action.prototype, "timeLeft", {
        get: function () {
            return this._timeLeft;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Action.prototype, "outcomeHistory", {
        get: function () {
            return this._outcomeHistory;
        },
        enumerable: true,
        configurable: true
    });
    Action.prototype.outcomeById = function (outcomeId) {
        for (var i = 0; i < this.outcomes.length; i++) {
            if (this.outcomes[i].id == outcomeId)
                return this.outcomes[i];
        }
        return null;
    };
    Action.prototype.cancel = function (engine) {
        engine.resourcesById("unemployed").modify(this.pop, engine);
        this.resources.giveBack(engine);
        this._isStarted = false;
    };
    Action.prototype.apply = function (engine) {
        this._isStarted = false;
        engine.resourcesById("unemployed").modify(this.pop, engine);
        var totalWeight = 0;
        for (var i = 0; i < this.outcomes.length; i++) {
            totalWeight += this.outcomes[i].weight;
        }
        var target = Math.random() * totalWeight;
        for (var i = 0; i < this.outcomes.length; i++) {
            target -= this.outcomes[i].weight;
            if (target <= 0) {
                this.execOutcome(this.outcomes[i], engine);
                break;
            }
        }
    };
    Action.prototype.execOutcome = function (outcome, engine, depth) {
        if (depth === void 0) { depth = 0; }
        console.log("action " + this.id + " outcome: " + outcome.id);
        var redirectOutcome = outcome.exec(this, outcome, engine);
        if (redirectOutcome != null && depth < 10) {
            console.log("Action outcome redirected from " + outcome.id + " to " + redirectOutcome.id);
            this.execOutcome(redirectOutcome, engine, depth + 1);
            return;
        }
        else if (depth >= 10) {
            console.log("WARNING: action outcomes redirection chain too long!", this.id);
        }
        else {
            if (this._outcomeHistory == null) {
                this._outcomeHistory = {};
            }
            if (this._outcomeHistory[outcome.id] != null)
                this._outcomeHistory[outcome.id].count++;
            else
                this._outcomeHistory[outcome.id] = { count: 1, entry: outcome.historyEntry };
            this._lastOutcome = outcome;
        }
    };
    return Action;
})();
var ActionOutcome = (function () {
    function ActionOutcome(id, weight, exec, historyEntry) {
        this.weight = weight;
        this.exec = exec;
        this.id = id;
        this.historyEntry = historyEntry;
    }
    return ActionOutcome;
})();
var ActionOutcomes = (function () {
    function ActionOutcomes() {
    }
    ActionOutcomes.growFailExec = function (action, outcome, engine) {
        if (action.lastOutcome == outcome) {
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
    };
    ActionOutcomes.growSuccessExec = function (action, outcome, engine) {
        logGame("Family grows. <b>Population increased by 1.</b>");
        engine.resourcesById("pop").modify(1, engine);
        engine.playerData.numberOfGrows++;
    };
    ActionOutcomes.smallHuntFailExec = function (action, outcome, engine) {
        if (action.lastOutcome == outcome) {
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
        return null;
    };
    ActionOutcomes.smallHuntMinorSuccess1Exec = function (action, outcome, engine) {
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
    };
    ActionOutcomes.smallHuntMinorSuccess2Exec = function (action, outcome, engine) {
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
    };
    ActionOutcomes.smallHuntMinorSuccess3Exec = function (action, outcome, engine) {
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
    };
    ActionOutcomes.smallHuntMajorSuccess1Exec = function (action, outcome, engine) {
        logGame("The hunt was a major success! <b>Food +40; Wood +3.</b> And the best thing - everyone returned home uninjured!");
        engine.resourcesById("food").modify(40, engine);
        engine.resourcesById("wood").modify(3, engine);
        engine.resourcesById("wood").isDiscovered = true;
        engine.playerData.numberOfSmallHunts++;
    };
    ActionOutcomes.smallHuntMajorSuccess2Exec = function (action, outcome, engine) {
        logGame("The hunt was a major success! <b>Food +50; Wood +1.</b> And the best thing - everyone returned home uninjured!");
        engine.resourcesById("food").modify(50, engine);
        engine.resourcesById("wood").modify(1, engine);
        engine.resourcesById("wood").isDiscovered = true;
        engine.playerData.numberOfSmallHunts++;
    };
    ActionOutcomes.greatHunt = function (action, outcome, engine) {
        logGame("The Great Hunt was almost failed due to coordination issues. It takes both great courage and strength to combat such large animals. You have played the key part here and everybody recognizes your contribution. <b>Food +150; Wood +25</b>");
        engine.resourcesById("food").modify(150, engine);
        engine.resourcesById("wood").modify(25, engine);
        action.isObsolete = true;
    };
    //grow
    ActionOutcomes.growFailHistoryEntry = "Birth complications. Don't ask.";
    ActionOutcomes.growSuccessHistoryEntry = "The wonder of life has happened in it's full glory.";
    //small hunt
    ActionOutcomes.smallHuntFailHistoryEntry = "Total failure.";
    ActionOutcomes.smallHuntMinorSuccess1HistoryEntry = "Minor success. Hunters sustained injuries. <b>Food +20; Wood + 1.</b>";
    ActionOutcomes.smallHuntMinorSuccess2HistoryEntry = "Minor success. Hunters sustained injuries. <b>Food +30.</b>";
    ActionOutcomes.smallHuntMinorSuccess3HistoryEntry = "Minor success. Hunters sustained injuries. <b>Food +40.</b>";
    ActionOutcomes.smallHuntMajorSuccess1HistoryEntry = "Success! <b>Food +40; Wood +3.</b>";
    ActionOutcomes.smallHuntMajorSuccess2HistoryEntry = "Success! <b>Food +50; Wood +1.</b>";
    //great hunt
    ActionOutcomes.greatHuntHistoryEntry = "You are not supposed to ever read this. Unsee now!";
    return ActionOutcomes;
})();
var GameRule = (function () {
    function GameRule(id, exec) {
        this.id = id;
        this.exec = exec;
    }
    return GameRule;
})();
var PlayerData = (function () {
    function PlayerData() {
        this.numberOfSmallHunts = 0;
        this.numberOfGrows = 0;
    }
    return PlayerData;
})();
var ActionsRenderer = (function () {
    function ActionsRenderer() {
    }
    ActionsRenderer.prototype.setRoot = function (root) {
        this.root = root;
    };
    ActionsRenderer.prototype.update = function (timeDelta) {
        for (var i = 0; i < this.engine.actions.length; i++) {
            var isRemoved = false;
            if (this.engine.actions[i].viewData.isRendered && (this.engine.actions[i].isObsolete || !this.engine.actions[i].isDiscovered || !this.engine.actions[i].viewData.isValid(this.engine.actions[i], this.engine))) {
                var nextSibling = this.engine.actions[i].viewData.element.nextSibling;
                this.list.removeChild(this.engine.actions[i].viewData.element);
                isRemoved = true;
            }
            if (isRemoved || !this.engine.actions[i].viewData.isRendered) {
                if (this.engine.actions[i].isObsolete || !this.engine.actions[i].isDiscovered) {
                    continue;
                }
                var element = this.actionToHtml(this.engine.actions[i], this.input);
                this.engine.actions[i].viewData.setRendered(this.engine.actions[i], element, this.engine);
                if (isRemoved && nextSibling)
                    this.list.insertBefore(element, nextSibling);
                else
                    this.list.appendChild(element);
            }
            if (this.engine.actions[i].isStarted) {
                this.updateProgress(this.engine.actions[i]);
            }
        }
    };
    ActionsRenderer.prototype.load = function (root, engine, input) {
        this.root = root;
        this.engine = engine;
        this.input = input;
        this.list = root.getElementsByClassName("actionList")[0];
    };
    ActionsRenderer.prototype.updateProgress = function (action) {
        //action.viewData.headerElement.innerText = [action.name, " ", (action.progress * 100).toFixed(0), "% ( ", RenderUtils.beautifyInt(action.timeLeft / 1000), " s. left)"].join("");
        action.viewData.progressElement.innerText = [(action.progress * 100).toFixed(0), "% \n( ", RenderUtils.beautifyInt(action.timeLeft / 1000), " s. left)"].join("");
        var context = action.viewData.canvas.getContext("2d");
        context.fillStyle = "#0000FF";
        context.fillRect(0, 0, action.viewData.canvas.width * action.progress, action.viewData.canvas.height);
    };
    ActionsRenderer.prototype.actionToHtml = function (action, input) {
        var outerElement = HelperHTML.element("li", "action testTooltipable");
        if (action.isStarted) {
            var headerDiv = HelperHTML.element("div", "actionHeader actionHeader_Progress");
            var canvas = HelperHTML.element("canvas", "actionCanvas");
            var span = HelperHTML.element("span", "actionHeaderText", action.name);
            var progressSpan = HelperHTML.element("span", "actionHeaderProgress");
            headerDiv.appendChild(span);
            headerDiv.appendChild(canvas);
            headerDiv.appendChild(progressSpan);
            action.viewData.headerElement = span;
            outerElement.appendChild(headerDiv);
        }
        else {
            var availability = action.isAvailable(this.engine) ? "Available" : "Unavailable";
            headerDiv = HelperHTML.element("div", "actionHeader actionHeader_" + availability);
            span = HelperHTML.element("span", "actionHeaderText", action.name);
            headerDiv.appendChild(span);
            outerElement.appendChild(headerDiv);
        }
        var contentDiv = HelperHTML.element("div", "actionContent");
        contentDiv.appendChild(HelperHTML.element("div", "actionContentText", "Pop: " + action.pop));
        contentDiv.appendChild(HelperHTML.element("div", "actionContentText", "Time: " + Math.ceil(action.time / 1000) + " sec."));
        if (!action.resources.isEmpty) {
            var innerDiv = HelperHTML.element("div", "actionContentText", "Requires:");
            for (var i = 0; i < action.resources.resources.length; i++) {
                var resource = this.engine.resourcesById(action.resources.resources[i]);
                innerDiv.appendChild(HelperHTML.element("div", "actionContent_Requirement", resource.name + ": " + action.resources.quantaties[i]));
            }
            contentDiv.appendChild(innerDiv);
        }
        var buttonDiv = HelperHTML.element("div", "actionButtonContainer");
        var button = HelperHTML.element("button", "actionButton", action.isStarted ? "Cancel" : "Start");
        if (input)
            button.onclick = action.isStarted ? function () { return input.cancelAction(action); } : function () { return input.activateAction(action); };
        buttonDiv.appendChild(button);
        contentDiv.appendChild(buttonDiv);
        outerElement.appendChild(contentDiv);
        contentDiv.style.display = action.viewData.isContentOpen ? "block" : "none";
        headerDiv.onclick = function () {
            action.viewData.isContentOpen = !action.viewData.isContentOpen;
            contentDiv.style.display = action.viewData.isContentOpen ? "block" : "none";
        };
        if (action.outcomeHistory) {
            var tooptil = HelperHTML.element("div", "testTooltip");
            var tHeaderText = HelperHTML.element("span", "actionHeaderText", "Known possible outcomes");
            var tHeader = HelperHTML.element("div", "actionHeader tooltipHeader");
            tHeader.appendChild(tHeaderText);
            var tContent = HelperHTML.element("div", "tooltipContent");
            var tTable = HelperHTML.element("table", "tooltipTable");
            tTable.cellSpacing = "15";
            for (var outcome in action.outcomeHistory) {
                var row = tTable.insertRow();
                var cell = row.insertCell();
                cell.innerHTML = action.outcomeHistory[outcome].count;
                cell = row.insertCell();
                cell.innerHTML = action.outcomeHistory[outcome].entry;
            }
            tContent.appendChild(tTable);
            tooptil.appendChild(tHeader);
            tooptil.appendChild(tContent);
            outerElement.appendChild(tooptil);
        }
        return outerElement;
    };
    return ActionsRenderer;
})();
var ActionViewData = (function () {
    function ActionViewData() {
        this.isContentOpen = false;
    }
    ActionViewData.prototype.setRendered = function (action, element, engine) {
        this.isRendered = true;
        this.isStarted = action.isStarted;
        this.element = element;
        this.canvas = element.getElementsByTagName("canvas")[0];
        this.progressElement = element.getElementsByClassName("actionHeaderProgress")[0];
        this.isAvailable = action.isAvailable(engine);
    };
    ActionViewData.prototype.isValid = function (action, engine) {
        return this.isStarted == action.isStarted && this.isAvailable == action.isAvailable(engine);
    };
    return ActionViewData;
})();
window.onload = function () {
    var el = document.getElementById('content');
    var binder = new Binder();
    binder.create(el);
    binder.start();
};
var Binder = (function () {
    function Binder() {
    }
    Binder.prototype.create = function (rootElement) {
        this.dataSource = new DataSource();
        this.engine = new Engine();
        this.renderer = new Renderer();
        this.input = new Input();
        this.logic = new Logic();
        this.input.load(this.engine);
        this.renderer.load(rootElement, this.engine, this.input);
        this.logic.load(this.engine, this.renderer);
        this.dataSource.initEngine(this.engine);
    };
    Binder.prototype.start = function () {
        this.logic.start();
    };
    return Binder;
})();
var DataSource = (function () {
    function DataSource() {
    }
    DataSource.prototype.initEngine = function (engine) {
        GameRules.init();
        var popResource = new Stat("pop", "pop");
        popResource.insertCapModifier(new Modifier("init", 10, 0));
        popResource.isDecimal = false;
        engine.addResource(popResource);
        popResource.isDiscovered = true;
        var unemployedResource = new Stat("unemployed", "unemployed");
        unemployedResource.onValueChanged = this.unemployedRule;
        unemployedResource.isDecimal = false;
        unemployedResource.hasCap = false;
        unemployedResource.isDiscovered = true;
        engine.addResource(unemployedResource);
        var foodResource = new Stat("food", "food");
        foodResource.setValue(15, engine);
        foodResource.insertCapModifier(new Modifier("init", 20, 0));
        foodResource.insertCapModifier(new Modifier("pop", 0, 0));
        foodResource.insertRateModifier(new Modifier("pop", 0, 0));
        foodResource.isDiscovered = true;
        engine.addResource(foodResource);
        popResource.onValueChanged = this.popRule;
        popResource.setValue(3, engine);
        engine.addRule(GameRules.foodRule);
        var woodResource = new Stat("wood", "wood");
        woodResource.insertCapModifier(new Modifier("init", 50, 0));
        engine.addResource(woodResource);
        //Grow
        var growFailOutcome = new ActionOutcome("fail", 35, ActionOutcomes.growFailExec, ActionOutcomes.growFailHistoryEntry);
        var growSuccessOutcome = new ActionOutcome("success", 65, ActionOutcomes.growSuccessExec, ActionOutcomes.growSuccessHistoryEntry);
        var growAction = new Action("grow", "Raise a child", 2, 10 * 1000, new ResourceRequirement(["food"], [10]), [growFailOutcome, growSuccessOutcome]);
        engine.addAction(growAction);
        //Small hunt
        var smallHuntFailOutcome = new ActionOutcome("fail", 15, ActionOutcomes.smallHuntFailExec, ActionOutcomes.smallHuntFailHistoryEntry);
        var smallHuntMinorSuccess1Outcome = new ActionOutcome("minorSuccess1", 10, ActionOutcomes.smallHuntMinorSuccess1Exec, ActionOutcomes.smallHuntMinorSuccess1HistoryEntry);
        var smallHuntMinorSuccess2Outcome = new ActionOutcome("minorSuccess2", 10, ActionOutcomes.smallHuntMinorSuccess2Exec, ActionOutcomes.smallHuntMinorSuccess2HistoryEntry);
        var smallHuntMinorSuccess3Outcome = new ActionOutcome("minorSuccess3", 10, ActionOutcomes.smallHuntMinorSuccess3Exec, ActionOutcomes.smallHuntMinorSuccess3HistoryEntry);
        var smallHuntMajorSuccess1Outcome = new ActionOutcome("majoruccess1", 15, ActionOutcomes.smallHuntMajorSuccess1Exec, ActionOutcomes.smallHuntMajorSuccess1HistoryEntry);
        var smallHuntMajorSuccess2Outcome = new ActionOutcome("majoruccess2", 15, ActionOutcomes.smallHuntMajorSuccess2Exec, ActionOutcomes.smallHuntMajorSuccess2HistoryEntry);
        var smallHuntAction = new Action("smallHunt", "Hunt", 3, 1 * 1000, new ResourceRequirement([], []), [smallHuntFailOutcome, smallHuntMinorSuccess1Outcome, smallHuntMinorSuccess2Outcome, smallHuntMinorSuccess3Outcome, smallHuntMajorSuccess1Outcome, smallHuntMajorSuccess2Outcome]);
        engine.addAction(smallHuntAction);
        smallHuntAction.isDiscovered = true;
        smallHuntAction.viewData.isContentOpen = true;
        //Great hunt
        var greatHuntOutcome = new ActionOutcome("success", 1, ActionOutcomes.greatHunt, ActionOutcomes.greatHuntHistoryEntry);
        var greatHuntAction = new Action("greatHunt", "Great Hunt", 6, 30 * 1000, new ResourceRequirement(["wood"], [10]), [greatHuntOutcome]);
        engine.addAction(greatHuntAction);
        engine.addRule(GameRules.huntingRule);
        engine.addRule(GameRules.unlockGrowRule);
        engine.addRule(GameRules.unlockGreatHuntRule);
    };
    DataSource.prototype.popRule = function (stat, engine, delta) {
        engine.resourcesById("food").editRateModifier("pop", -stat.value * DataSource.foorPerPop / 1000, 0);
        engine.resourcesById("unemployed").setValue(engine.resourcesById("unemployed").value + delta, engine);
        engine.resourcesById("food").editCapModifier("pop", stat.value * 10, 0);
    };
    //if there are not enough workers some actions must be canceled
    DataSource.prototype.unemployedRule = function (stat, engine, delta) {
        if (stat.value < 0) {
            for (var i = 0; i < engine.actions.length; i++) {
                if (engine.actions[i].isStarted && engine.actions[i].pop > 0) {
                    logGame("The recent decrease in the number of available workers has made it impossible to finish " + engine.actions[i].name);
                    engine.actions[i].cancel(engine);
                    return;
                }
            }
        }
    };
    DataSource.foorPerPop = 0.1;
    DataSource.canibalicFood = 20;
    return DataSource;
})();
var DebugRenderer = (function () {
    function DebugRenderer() {
    }
    DebugRenderer.prototype.setRoot = function (root) {
        this.root = root;
    };
    DebugRenderer.prototype.update = function (timeDelta) {
        this.root.innerHTML = "Elapsed time: " + this.toTimeString(this.engine.time) + "<br>scale: " + (this.engine.timeScale / this.engine.stepScale).toFixed(1);
    };
    DebugRenderer.prototype.load = function (root, engine) {
        this.root = root;
        this.engine = engine;
    };
    DebugRenderer.prototype.toTimeString = function (time) {
        var result = "";
        var hours = (Math.floor(time / (3600 * 1000)));
        var minutes = (Math.floor(time / (60 * 1000)) % 60);
        var seconds = (Math.floor(time / 1000) % 60);
        var ms = Math.floor(time % 1000);
        var hoursStr = hours.toString();
        if (hoursStr.length < 2)
            hoursStr = "0" + hours;
        var minutesStr = minutes.toString();
        if (minutesStr.length < 2)
            minutesStr = "0" + minutes;
        var secondsStr = seconds.toString();
        if (secondsStr.length < 2)
            secondsStr = "0" + secondsStr;
        var msStr = ms.toString();
        if (msStr.length < 2)
            msStr = "00" + secondsStr;
        else if (msStr.length < 3)
            msStr = "0" + secondsStr;
        return hoursStr + ":" + minutesStr + ":" + secondsStr + "," + msStr;
    };
    return DebugRenderer;
})();
var Engine = (function () {
    function Engine() {
        this.timeScale = 1;
        this.stepScale = 1;
        this.numericScale = 0;
        this._time = 0;
        this._resources = new Array();
        this._resourcesById = Object();
        this._actions = new Array();
        this._actionsById = Object();
        this._rules = new Array();
        this.playerData = new PlayerData();
        this.ruleRemoveQueue = new Array();
    }
    Object.defineProperty(Engine.prototype, "time", {
        get: function () {
            return this._time;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Engine.prototype, "resources", {
        get: function () {
            return this._resources;
        },
        enumerable: true,
        configurable: true
    });
    Engine.prototype.resourcesById = function (id) {
        return this._resourcesById[id];
    };
    Object.defineProperty(Engine.prototype, "actions", {
        get: function () {
            return this._actions;
        },
        enumerable: true,
        configurable: true
    });
    Engine.prototype.actionsById = function (id) {
        return this._actionsById[id];
    };
    Object.defineProperty(Engine.prototype, "rules", {
        get: function () {
            return this._rules;
        },
        enumerable: true,
        configurable: true
    });
    Engine.prototype.update = function (timeDelta) {
        this._time += timeDelta;
        this.isUpdateInProgress = true;
        for (var i = 0; i < this._resources.length; i++) {
            this._resources[i].updateStart(timeDelta);
        }
        for (var i = 0; i < this._actions.length; i++) {
            if (this._actions[i].isStarted) {
                this._actions[i].update(timeDelta);
                if (this._actions[i].isComplete)
                    this._actions[i].apply(this);
            }
        }
        for (var i = 0; i < this._rules.length; i++) {
            this._rules[i].exec(this);
        }
        for (var i = 0; i < this._resources.length; i++) {
            this._resources[i].updateEnd(this);
        }
        this.isUpdateInProgress = false;
        if (this.ruleRemoveQueue.length > 0) {
            for (var i = 0; i < this.ruleRemoveQueue.length; i++) {
                this.removeRule(this.ruleRemoveQueue[i], true);
            }
            this.ruleRemoveQueue.length = 0;
        }
    };
    Engine.prototype.addResource = function (resource) {
        this._resources.push(resource);
        this._resourcesById[resource.id] = resource;
    };
    Engine.prototype.addAction = function (action) {
        this._actions.push(action);
        this._actionsById[action.id] = action;
    };
    Engine.prototype.addRule = function (rule) {
        this._rules.push(rule);
    };
    Engine.prototype.removeRule = function (rule, isSilent) {
        if (isSilent === void 0) { isSilent = false; }
        if (!isSilent) {
            logEngine("Removed rule " + rule.id);
        }
        if (this.isUpdateInProgress) {
            var indsexOf = this._rules.indexOf(rule);
            this.ruleRemoveQueue.push(rule);
            return;
        }
        var indexOf = this._rules.indexOf(rule);
        this._rules.splice(indexOf, 1);
    };
    return Engine;
})();
var HelperHTML = (function () {
    function HelperHTML() {
    }
    HelperHTML.element = function (type, cl, innerHTML) {
        if (cl === void 0) { cl = ""; }
        if (innerHTML === void 0) { innerHTML = ""; }
        var elem = document.createElement(type);
        if (cl != "") {
            elem.className = cl;
        }
        if (innerHTML != "") {
            elem.innerHTML = innerHTML;
        }
        return elem;
    };
    return HelperHTML;
})();
var Input = (function () {
    function Input() {
    }
    Input.prototype.load = function (engine) {
        this.engine = engine;
    };
    Input.prototype.timeScaleDown = function () {
        this.engine.numericScale--;
        this.updateTimeScales();
    };
    Input.prototype.timeScaleNormal = function () {
        this.engine.numericScale = 0;
        this.updateTimeScales();
    };
    Input.prototype.timeScaleUp = function () {
        this.engine.numericScale++;
        this.updateTimeScales();
    };
    Input.prototype.timeScaleStop = function () {
        this.engine.timeScale = 0;
    };
    Input.prototype.updateTimeScales = function () {
        this.engine.timeScale = 1 + this.engine.numericScale / 5;
        this.engine.stepScale = Math.pow(0.9, this.engine.numericScale);
    };
    Input.prototype.activateAction = function (action) {
        if (action.isAvailable(this.engine))
            action.start(this.engine);
    };
    Input.prototype.cancelAction = function (action) {
        if (action.isStarted)
            action.cancel(this.engine);
    };
    return Input;
})();
var Logger = (function () {
    function Logger() {
    }
    Logger.gameLog = new Array();
    Logger.engineLog = new Array();
    return Logger;
})();
function logGame(content) {
    Logger.gameLog.push(content);
}
function logEngine(content) {
    Logger.engineLog.push(content);
}
var Logic = (function () {
    function Logic() {
    }
    Logic.prototype.load = function (engine, renderer) {
        this.engine = engine;
        this.renderer = renderer;
    };
    Logic.prototype.start = function () {
        var _this = this;
        this.timeStamp = new Date().getTime();
        this.isActive = true;
        setTimeout(function () { return _this.update(); }, Logic.UPDATE_PERIOD);
    };
    Logic.prototype.update = function () {
        var _this = this;
        if (!this.isActive)
            return;
        var newStamp = new Date().getTime();
        var delta = Math.min(newStamp - this.timeStamp, Logic.UPDATE_PERIOD * 1.5);
        delta *= this.engine.timeScale / this.engine.stepScale;
        this.timeStamp = newStamp;
        this.engine.update(delta);
        this.renderer.update(delta);
        setTimeout(function () { return _this.update(); }, Logic.UPDATE_PERIOD * this.engine.stepScale);
    };
    Logic.UPDATE_PERIOD = 300;
    return Logic;
})();
var LogRenderer = (function () {
    function LogRenderer() {
        this.renderedIndex = -1;
    }
    LogRenderer.prototype.setRoot = function (root) {
        this.root = root;
    };
    LogRenderer.prototype.update = function (timeDelta) {
        while (this.log.length > this.renderedIndex + 1) {
            this.renderedIndex++;
            this.root.insertBefore(this.logToElement(this.log[this.renderedIndex]), this.root.firstChild);
        }
    };
    LogRenderer.prototype.load = function (root, log) {
        this.root = root;
        this.log = log;
    };
    LogRenderer.prototype.logToElement = function (entry) {
        return HelperHTML.element("div", "gameLogEntry", entry);
    };
    return LogRenderer;
})();
var Modifier = (function () {
    function Modifier(key, add, multi) {
        this.key = key;
        this.add = add;
        this.multi = multi;
    }
    return Modifier;
})();
var Renderer = (function () {
    function Renderer() {
        this.debugRenderer = new DebugRenderer();
        this.resourcesRenderer = new ResourcesRenderer();
        this.actionsRenderer = new ActionsRenderer();
        this.gameLogRenderer = new LogRenderer();
        this.debugLogRenderer = new LogRenderer();
    }
    Renderer.prototype.load = function (root, engine, input) {
        var _this = this;
        this.root = root;
        this.engine = engine;
        this.input = input;
        this.debugRenderer.load(root.getElementsByClassName("debugInfoPanel")[0], engine);
        this.resourcesRenderer.load(root.getElementsByClassName("resourcesPanel")[0], engine);
        this.actionsRenderer.load(root.getElementsByClassName("actionsPanel")[0], engine, input);
        this.gameLogRenderer.load(root.getElementsByClassName("gameLog")[0], Logger.gameLog);
        this.debugLogRenderer.load(root.getElementsByClassName("debugLogPanel")[0], Logger.engineLog);
        if (input)
            document.onkeydown = function (e) {
                if (e.keyCode == 97)
                    _this.input.timeScaleDown();
                if (e.keyCode == 100)
                    _this.input.timeScaleNormal();
                if (e.keyCode == 103)
                    _this.input.timeScaleUp();
                if (e.keyCode == 96)
                    _this.input.timeScaleStop();
            };
    };
    Renderer.prototype.update = function (timeDelta) {
        this.debugRenderer.update(timeDelta);
        this.resourcesRenderer.update(timeDelta);
        this.actionsRenderer.update(timeDelta);
        this.gameLogRenderer.update(timeDelta);
        this.debugLogRenderer.update(timeDelta);
    };
    return Renderer;
})();
var RenderUtils = (function () {
    function RenderUtils() {
    }
    RenderUtils.beautifyFloat = function (num) {
        var absVal = Math.abs(num);
        if (absVal < 1)
            return num.toFixed(3);
        if (absVal < 10)
            return num.toFixed(2);
        if (absVal < 100)
            return num.toFixed(1);
        if (absVal < 10000)
            return num.toFixed(0);
        if (absVal < 100000)
            return Math.floor(num / 1000).toFixed(1) + "K";
        if (absVal < 1000000)
            return Math.floor(num / 1000).toFixed(0) + "K";
        if (absVal < 10000000)
            return Math.floor(num / 1000000).toFixed(1) + "M";
        return Math.floor(num / 1000000).toFixed(1) + "M";
    };
    RenderUtils.beautifyInt = function (num) {
        var absVal = Math.abs(num);
        if (absVal < 1000)
            return num.toFixed(0);
        if (absVal < 1000000)
            return Math.floor(num / 1000).toFixed(0) + "K";
        return Math.floor(num / 1000000).toFixed(0) + "M";
    };
    return RenderUtils;
})();
var ResourceRequirement = (function () {
    function ResourceRequirement(resources, quantaties) {
        this.resources = resources;
        this.quantaties = quantaties;
    }
    ResourceRequirement.prototype.isMet = function (engine) {
        for (var i = 0; i < this.resources.length; i++) {
            if (engine.resourcesById(this.resources[i]).value < this.quantaties[i])
                return false;
        }
        return true;
    };
    ResourceRequirement.prototype.subtractFrom = function (engine) {
        for (var i = 0; i < this.resources.length; i++) {
            engine.resourcesById(this.resources[i]).modify(-this.quantaties[i], engine);
        }
    };
    ResourceRequirement.prototype.giveBack = function (engine) {
        for (var i = 0; i < this.resources.length; i++) {
            engine.resourcesById(this.resources[i]).modify(this.quantaties[i], engine);
        }
    };
    Object.defineProperty(ResourceRequirement.prototype, "isEmpty", {
        get: function () {
            return this.resources.length == 0;
        },
        enumerable: true,
        configurable: true
    });
    return ResourceRequirement;
})();
var ResourcesRenderer = (function () {
    function ResourcesRenderer() {
    }
    ResourcesRenderer.prototype.setRoot = function (root) {
        this.root = root;
    };
    ResourcesRenderer.prototype.update = function (timeDelta) {
        var html = "<table class=\"resourceTable\" cellspacing=\"5\">";
        for (var i = 0; i < this.engine.resources.length; i++) {
            var resource = this.engine.resources[i];
            if (resource.isObsolete || !resource.isDiscovered) {
                continue;
            }
            html += "<tr><td>" + resource.name + "</td><td>" + resource.value.toFixed(this.engine.resources[i].isDecimal ? 2 : 0) + "</td><td>";
            if (resource.hasCap && this.engine.playerData.limitOnResourcesWasHit)
                html += "/ " + resource.cap;
            html += "</td><td>";
            if (resource.rate != 0)
                html += "(" + RenderUtils.beautifyFloat(resource.rate * 1000) + ")";
            html += "</td></tr>\n";
        }
        html += "</table>";
        this.root.innerHTML = html;
    };
    ResourcesRenderer.prototype.load = function (root, engine) {
        this.root = root;
        this.engine = engine;
    };
    return ResourcesRenderer;
})();
var Stat = (function () {
    function Stat(id, name) {
        this.isDecimal = true;
        this.hasCap = true;
        this.id = id;
        this.name = name;
        this._value = 0;
        this._rateCache = 0;
        this._capCache = 0;
        this.rateModifiers = new Array();
        this.capModifiers = new Array();
    }
    Stat.prototype.updateStart = function (timeDelta) {
        this._value += this._rateCache * timeDelta;
    };
    Stat.prototype.updateEnd = function (engine) {
        if (this.hasCap && this._value > this._capCache) {
            this._value = this._capCache;
            engine.playerData.limitOnResourcesWasHit = true;
        }
        else if (this._value < 0)
            this._value = 0;
    };
    //Insert
    Stat.prototype.insertRateModifier = function (modifier) {
        this.rateModifiers.push(modifier);
        var add = 0;
        var multi = 0;
        for (var i = 0; i < this.rateModifiers.length; i++) {
            add += this.rateModifiers[i].add;
            multi += this.rateModifiers[i].multi;
        }
        this._rateCache = add * (multi + 1);
    };
    Stat.prototype.insertCapModifier = function (modifier) {
        this.capModifiers.push(modifier);
        var add = 0;
        var multi = 0;
        for (var i = 0; i < this.capModifiers.length; i++) {
            add += this.capModifiers[i].add;
            multi += this.capModifiers[i].multi;
        }
        this._capCache = add * (multi + 1);
    };
    //Edit
    Stat.prototype.editRateModifier = function (key, newAdd, newMulti) {
        var add = 0;
        var multi = 0;
        for (var i = 0; i < this.rateModifiers.length; i++) {
            if (this.rateModifiers[i].key == key) {
                this.rateModifiers[i].add = newAdd;
                this.rateModifiers[i].multi = newMulti;
            }
            add += this.rateModifiers[i].add;
            multi += this.rateModifiers[i].multi;
        }
        this._rateCache = add * (multi + 1);
    };
    Stat.prototype.editCapModifier = function (key, newAdd, newMulti) {
        var add = 0;
        var multi = 0;
        for (var i = 0; i < this.capModifiers.length; i++) {
            if (this.capModifiers[i].key == key) {
                this.capModifiers[i].add = newAdd;
                this.capModifiers[i].multi = newMulti;
            }
            add += this.capModifiers[i].add;
            multi += this.capModifiers[i].multi;
        }
        this._capCache = add * (multi + 1);
    };
    Object.defineProperty(Stat.prototype, "value", {
        get: function () {
            return this._value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Stat.prototype, "cap", {
        get: function () {
            return this._capCache;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Stat.prototype, "rate", {
        get: function () {
            return this._rateCache;
        },
        enumerable: true,
        configurable: true
    });
    Stat.prototype.setValue = function (value, engine) {
        if (this._value != value) {
            var delta = value - this._value;
            this._value = value;
            if (this.onValueChanged != null)
                this.onValueChanged(this, engine, delta);
        }
    };
    Stat.prototype.modify = function (delta, engine) {
        if (delta != 0) {
            this._value += delta;
            if (this.onValueChanged != null)
                this.onValueChanged(this, engine, delta);
        }
    };
    return Stat;
})();
var StatPrototype = (function () {
    function StatPrototype(id, name, cpsFunction) {
        this.id = id;
        this.name = name;
        this.cpsFunction = cpsFunction;
    }
    return StatPrototype;
})();
//# sourceMappingURL=ramblingCore.js.map
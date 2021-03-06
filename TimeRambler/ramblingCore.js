var GameRules = (function () {
    function GameRules() {
    }
    GameRules.init = function () {
        GameRules.foodRule = new GameRule("foodRule", GameRules.foodRuleExec);
        GameRules.huntingRule = new GameRule("huntingRule", GameRules.huntingRuleExec);
        GameRules.unlockGrowRule = new GameRule("unlockGrowRule", GameRules.unlockGrowRuleExec);
        GameRules.unlockGreatHuntRule = new GameRule("unlockGreatHuntRule", GameRules.unlockGreatHuntRuleExec);
        GameRules.dicoverScienceRule = new GameRule("dicoverScienceRule", GameRules.dicoverScienceRuleExec);
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
    GameRules.dicoverScienceRuleExec = function (engine) {
        if (engine.resourcesById("science").value >= 3) {
            engine.resourcesById("science").isDiscovered = true;
            engine.removeRule(GameRules.dicoverScienceRule);
        }
    };
    return GameRules;
})();
var Technologies = (function () {
    function Technologies() {
    }
    Technologies.stoneToolsExec = function (technology, engine) {
        logGame("discovered <b>" + technology.name + "</b>");
    };
    //stoneTools
    Technologies.stoneToolsDescription = "The true meaning will become clear later.";
    return Technologies;
})();
var Action = (function () {
    function Action(id, name, pop, time, science, scienceFactor, resources, outcomes) {
        this.id = id;
        this.name = name;
        this.pop = pop;
        this.time = time;
        this.science = science;
        this.scienceFactor = scienceFactor;
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
        if (this.science) {
            engine.resourcesById("science").modify(this.science, engine);
            this.science *= this.scienceFactor;
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
            outcome.count++;
            this._lastOutcome = outcome;
        }
    };
    return Action;
})();
var ActionOutcome = (function () {
    function ActionOutcome(id, weight, exec, historyEntry) {
        this.count = 0;
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
        logGame("The Great Hunt had almost failed due to coordination issues. " + "Truly unprecedented is the courage and strength it took to combat such large animals. " + "It was most brave of you to take the matters in your own hands and unite the frightened villagers. " + "Songs and ballads would be made about this event. Unfortunately <b >Acoustics</b> and <b>Drama'n'Poetry</b> still aren't researched." + "So for now you will have to settle on the fact that everybody recognizes your contribution in prose.<b> Food + 150; Wood + 25 </b> ");
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
var GameSettings = (function () {
    function GameSettings() {
    }
    GameSettings.NEIGHBOUR_TECH_MAX_DISCOUNT = 1 / 4;
    return GameSettings;
})();
var HexGraph = (function () {
    function HexGraph() {
        this.sqGrid = {};
    }
    HexGraph.prototype.addTech = function (tech) {
        this.sqGrid[tech.x + tech.y * HexGraph.MAX_GRID_SIZE] = tech;
    };
    HexGraph.prototype.techByPoint = function (x, y) {
        return this.sqGrid[x + y * HexGraph.MAX_GRID_SIZE];
    };
    HexGraph.prototype.getNeighbours = function (x, y) {
        var neighbours = new Array();
        var neighbour = this.techByPoint(x - 1, y);
        if (neighbour)
            neighbours.push(neighbour);
        neighbour = this.techByPoint(x, y - 1);
        if (neighbour)
            neighbours.push(neighbour);
        neighbour = this.techByPoint(x + 1, y);
        if (neighbour)
            neighbours.push(neighbour);
        neighbour = this.techByPoint(x, y + 1);
        if (neighbour)
            neighbours.push(neighbour);
        if (y % 2 == 0) {
            neighbour = this.techByPoint(x - 1, y - 1);
            if (neighbour)
                neighbours.push(neighbour);
            neighbour = this.techByPoint(x - 1, y + 1);
            if (neighbour)
                neighbours.push(neighbour);
        }
        else {
            neighbour = this.techByPoint(x + 1, y - 1);
            if (neighbour)
                neighbours.push(neighbour);
            neighbour = this.techByPoint(x + 1, y + 1);
            if (neighbour)
                neighbours.push(neighbour);
        }
        return neighbours;
    };
    HexGraph.prototype.getNeighbouringPoints = function (x, y) {
        var neighbours = new Array();
        neighbours.push({ x: x - 1, y: y });
        neighbours.push({ x: x, y: y - 1 });
        neighbours.push({ x: x + 1, y: y });
        neighbours.push({ x: x, y: y + 1 });
        if (y % 2 == 0) {
            neighbours.push({ x: x - 1, y: y - 1 });
            neighbours.push({ x: x - 1, y: y + 1 });
        }
        else {
            neighbours.push({ x: x + 1, y: y - 1 });
            neighbours.push({ x: x + 1, y: y + 1 });
        }
        return neighbours;
    };
    HexGraph.MAX_GRID_SIZE = 100;
    return HexGraph;
})();
var PlayerData = (function () {
    function PlayerData() {
        this.numberOfSmallHunts = 0;
        this.numberOfGrows = 0;
        this.numFinishedTechs = 0;
    }
    return PlayerData;
})();
var Technology = (function () {
    function Technology(id, name, x, y, exec, baseScienceCost, scienceIncrement, resources) {
        this.viewData = new TechViewData();
        this.numFinishedNeighbours = 0;
        this.id = id;
        this.name = name;
        this.x = x;
        this.y = y;
        this.exec = exec;
        this.baseScienceCost = baseScienceCost;
        this.scienceIncrement = scienceIncrement;
        this.resources = resources;
    }
    Technology.prototype.isAvailable = function (engine) {
        return this.scienceCost <= engine.resourcesById("science").value && this.resources.isMet(engine) && this.isDiscovered && !this.isFinished;
    };
    Technology.prototype.updateScienceCost = function (engine) {
        if (this.isFinished)
            return;
        this.numFinishedNeighbours = 0;
        var neighbours = engine.hex.getNeighbours(this.x, this.y);
        for (var i = 0; i < neighbours.length; i++) {
            if (neighbours[i].isFinished)
                this.numFinishedNeighbours++;
        }
        var neighbourFactor = this.getNeighbourFactor(this.numFinishedNeighbours);
        this.scienceCost = neighbourFactor * (this.baseScienceCost + engine.playerData.numFinishedTechs * this.scienceIncrement);
    };
    Technology.prototype.getNeighbourFactor = function (n) {
        return GameSettings.NEIGHBOUR_TECH_MAX_DISCOUNT + (1 - GameSettings.NEIGHBOUR_TECH_MAX_DISCOUNT) * (1 - (n - 1) / 5);
    };
    return Technology;
})();
var Hacks = (function () {
    function Hacks() {
    }
    Hacks.globalToLocal = function (e) {
        var element = e.currentTarget;
        var xPosition = -(document.documentElement.scrollLeft || document.body.scrollLeft);
        var yPosition = -(document.documentElement.scrollTop || document.body.scrollTop);
        while (element) {
            xPosition += (element.offsetLeft + element.clientLeft);
            yPosition += (element.offsetTop + element.clientTop);
            element = element.offsetParent;
        }
        xPosition = e.clientX - xPosition;
        yPosition = e.clientY - yPosition;
        return { x: xPosition, y: yPosition };
    };
    return Hacks;
})();
var ActionsRenderer = (function () {
    function ActionsRenderer() {
    }
    ActionsRenderer.prototype.setRoot = function (root) {
        this.root = root;
    };
    ActionsRenderer.prototype.update = function (timeDelta, visibilityData) {
        if (visibilityData.visibleTab != VisibilityData.TAB_ACTIONS) {
            return;
        }
        for (var i = 0; i < this.engine.actions.length; i++) {
            var isRemoved = false;
            if (this.engine.actions[i].viewData.isRendered && (this.engine.actions[i].isObsolete || !this.engine.actions[i].isDiscovered || !this.engine.actions[i].viewData.isValid(this.engine.actions[i], this.engine))) {
                var nextSibling = this.engine.actions[i].viewData.element.nextSibling;
                this.list.removeChild(this.engine.actions[i].viewData.element);
                this.engine.actions[i].viewData.isRendered = false;
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
        action.viewData.progressElement.innerText = [(action.progress * 100).toFixed(0), "% \n( ", (action.timeLeft / 1000).toFixed(), " s. left)"].join("");
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
        contentDiv.appendChild(HelperHTML.element("div", "actionContentText", "Employs workers: " + action.pop));
        contentDiv.appendChild(HelperHTML.element("div", "actionContentText", "Duration: " + Math.ceil(action.time / 1000) + " sec."));
        if (!action.resources.isEmpty) {
            var innerDiv = HelperHTML.element("div", "actionContentText", "Consumes");
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
        if (action.lastOutcome) {
            var tooptil = HelperHTML.element("div", "testTooltip");
            var tHeaderText = HelperHTML.element("span", "actionHeaderText", "Known possible outcomes");
            var tHeader = HelperHTML.element("div", "actionHeader tooltipHeader");
            tHeader.appendChild(tHeaderText);
            var tContent = HelperHTML.element("div", "actionTooltipContent");
            var tTable = HelperHTML.element("table", "tooltipTable");
            tTable.cellSpacing = "15";
            for (var i = 0; i < action.outcomes.length; i++) {
                if (action.outcomes[i].count == 0) {
                    continue;
                }
                var row = tTable.insertRow();
                var cell = row.insertCell();
                cell.innerHTML = action.outcomes[i].count.toString();
                cell = row.insertCell();
                cell.innerHTML = action.outcomes[i].historyEntry;
                if (action.lastOutcome === action.outcomes[i]) {
                    row.className = "tooltipLastOutcome";
                }
            }
            if (this.engine.resourcesById("science").isDiscovered) {
                var researchBlock = HelperHTML.element("div", "actionResearchTooltipContent", "+" + RenderUtils.beautifyFloat(action.science) + " science");
            }
            tContent.appendChild(tTable);
            tooptil.appendChild(tHeader);
            tooptil.appendChild(tContent);
            if (researchBlock)
                tooptil.appendChild(researchBlock);
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
        var researchResource = new Stat("science", "science");
        researchResource.insertCapModifier(new Modifier("init", 120, 0));
        researchResource.isDiscovered = true;
        engine.addResource(researchResource);
        var cultureResource = new Stat("culture", "culture");
        cultureResource.hasCap = false;
        engine.addResource(cultureResource);
        //Grow
        var growFailOutcome = new ActionOutcome("fail", 30, ActionOutcomes.growFailExec, ActionOutcomes.growFailHistoryEntry);
        var growSuccessOutcome = new ActionOutcome("success", 90, ActionOutcomes.growSuccessExec, ActionOutcomes.growSuccessHistoryEntry);
        var growAction = new Action("grow", "Raise a child", 2, 10 * 1000, 1, 1, new ResourceRequirement(["food"], [10]), [growFailOutcome, growSuccessOutcome]);
        engine.addAction(growAction);
        //Small hunt
        var smallHuntFailOutcome = new ActionOutcome("fail", 10, ActionOutcomes.smallHuntFailExec, ActionOutcomes.smallHuntFailHistoryEntry);
        var smallHuntMinorSuccess1Outcome = new ActionOutcome("minorSuccess1", 5, ActionOutcomes.smallHuntMinorSuccess1Exec, ActionOutcomes.smallHuntMinorSuccess1HistoryEntry);
        var smallHuntMinorSuccess2Outcome = new ActionOutcome("minorSuccess2", 10, ActionOutcomes.smallHuntMinorSuccess2Exec, ActionOutcomes.smallHuntMinorSuccess2HistoryEntry);
        var smallHuntMinorSuccess3Outcome = new ActionOutcome("minorSuccess3", 10, ActionOutcomes.smallHuntMinorSuccess3Exec, ActionOutcomes.smallHuntMinorSuccess3HistoryEntry);
        var smallHuntMajorSuccess1Outcome = new ActionOutcome("majoruccess1", 25, ActionOutcomes.smallHuntMajorSuccess1Exec, ActionOutcomes.smallHuntMajorSuccess1HistoryEntry);
        var smallHuntMajorSuccess2Outcome = new ActionOutcome("majoruccess2", 25, ActionOutcomes.smallHuntMajorSuccess2Exec, ActionOutcomes.smallHuntMajorSuccess2HistoryEntry);
        var smallHuntAction = new Action("smallHunt", "Hunt", 3, 3 * 1000, 1, 1, new ResourceRequirement([], []), [smallHuntFailOutcome, smallHuntMinorSuccess1Outcome, smallHuntMinorSuccess2Outcome, smallHuntMinorSuccess3Outcome, smallHuntMajorSuccess1Outcome, smallHuntMajorSuccess2Outcome]);
        engine.addAction(smallHuntAction);
        smallHuntAction.isDiscovered = true;
        smallHuntAction.viewData.isContentOpen = true;
        //Great hunt
        var greatHuntOutcome = new ActionOutcome("success", 1, ActionOutcomes.greatHunt, ActionOutcomes.greatHuntHistoryEntry);
        var greatHuntAction = new Action("greatHunt", "Great Hunt", 6, 30 * 1000, 10, 1, new ResourceRequirement(["wood"], [10]), [greatHuntOutcome]);
        engine.addAction(greatHuntAction);
        engine.addRule(GameRules.huntingRule);
        engine.addRule(GameRules.unlockGrowRule);
        engine.addRule(GameRules.unlockGreatHuntRule);
        engine.addRule(GameRules.dicoverScienceRule);
        this.addResearch(engine);
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
    DataSource.prototype.addResearch = function (engine) {
        var humanity = new Technology("humanity", "Humanity", 0, 0, function () {
        }, 0, 0, new ResourceRequirement());
        humanity.description = "Makes people human";
        humanity.isDiscovered = true;
        engine.addTech(humanity);
        var stoneTools = new Technology("stoneTools", "Stone Tools", -1, -1, Technologies.stoneToolsExec, 5, 2, new ResourceRequirement());
        stoneTools.description = Technologies.stoneToolsDescription;
        stoneTools.isDiscovered = true;
        engine.addTech(stoneTools);
        var gathering = new Technology("gathering", "Gathering", -1, 0, Technologies.stoneToolsExec, 5, 2, new ResourceRequirement());
        gathering.description = Technologies.stoneToolsDescription;
        gathering.isDiscovered = true;
        engine.addTech(gathering);
        var language = new Technology("language", "Language", 0, 1, Technologies.stoneToolsExec, 5, 2, new ResourceRequirement());
        language.description = Technologies.stoneToolsDescription;
        language.isDiscovered = true;
        engine.addTech(language);
        var tamingFire = new Technology("tamingFire", "Taming Fire", 0, -1, Technologies.stoneToolsExec, 5, 2, new ResourceRequirement());
        tamingFire.description = Technologies.stoneToolsDescription;
        tamingFire.isDiscovered = true;
        engine.addTech(tamingFire);
        var mining = new Technology("mining", "Mining", -1, -2, Technologies.stoneToolsExec, 10, 5, new ResourceRequirement());
        mining.description = Technologies.stoneToolsDescription;
        //mining.isDiscovered = true;
        engine.addTech(mining);
        var socialHierarchy = new Technology("socialHierarchy", "Social Hierarchy", 1, 1, Technologies.stoneToolsExec, 15, 5, new ResourceRequirement());
        socialHierarchy.description = Technologies.stoneToolsDescription;
        //socialHierarchy.isDiscovered = true;
        engine.addTech(socialHierarchy);
        var agriculture = new Technology("agriculture", "Agriculture", -2, -1, Technologies.stoneToolsExec, 15, 3, new ResourceRequirement());
        agriculture.description = Technologies.stoneToolsDescription;
        //agriculture.isDiscovered = true;
        engine.addTech(agriculture);
        var stoneNBone = new Technology("stoneNBone", "Stone and bone weapons", -2, -3, Technologies.stoneToolsExec, 25, 3, new ResourceRequirement());
        stoneNBone.description = Technologies.stoneToolsDescription;
        //stoneNBone.isDiscovered = true;
        engine.addTech(stoneNBone);
        var irrigation = new Technology("irrigation", "Irrigation", -2, -2, Technologies.stoneToolsExec, 15, 5, new ResourceRequirement());
        irrigation.description = Technologies.stoneToolsDescription;
        //irrigation.isDiscovered = true;
        engine.addTech(irrigation);
        var hunting = new Technology("hunting", "Hunting", 0, -2, Technologies.stoneToolsExec, 10, 2, new ResourceRequirement());
        hunting.description = Technologies.stoneToolsDescription;
        //hunting.isDiscovered = true;
        engine.addTech(hunting);
        var painting = new Technology("painting", "Painting", 2, 2, Technologies.stoneToolsExec, 10, 3, new ResourceRequirement());
        painting.description = Technologies.stoneToolsDescription;
        //painting.isDiscovered = true;
        engine.addTech(painting);
        var monuments = new Technology("monuments", "Monuments", 2, 0, Technologies.stoneToolsExec, 15, 2, new ResourceRequirement());
        monuments.description = Technologies.stoneToolsDescription;
        //monuments.isDiscovered = true;
        engine.addTech(monuments);
        engine.finishTech(humanity);
    };
    DataSource.foorPerPop = 0.1;
    DataSource.canibalicFood = 20;
    return DataSource;
})();
var DebugRenderer = (function () {
    function DebugRenderer() {
    }
    DebugRenderer.prototype.update = function (timeDelta, visibilityData) {
        if (visibilityData.visibleTab == VisibilityData.TAB_ACTIONS)
            this.panel.innerHTML = "Elapsed time: " + this.toTimeString(this.engine.time) + "<br>scale: " + (this.engine.timeScale / this.engine.stepScale).toFixed(1);
    };
    DebugRenderer.prototype.load = function (root, engine) {
        var _this = this;
        this.root = root;
        this.engine = engine;
        this.cheatPanel = HelperHTML.element("div");
        var btn1 = HelperHTML.element("button", "", "+10 science");
        btn1.onclick = function () {
            _this.engine.resourcesById("science").modify(10, _this.engine);
        };
        this.cheatPanel.appendChild(btn1);
        this.root.appendChild(this.cheatPanel);
        this.panel = HelperHTML.element("div");
        this.root.appendChild(this.panel);
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
        this._tech = new Array();
        this._hex = new HexGraph();
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
    Object.defineProperty(Engine.prototype, "hex", {
        get: function () {
            return this._hex;
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
    Object.defineProperty(Engine.prototype, "tech", {
        get: function () {
            return this._tech;
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
    Engine.prototype.addTech = function (tech) {
        this._tech.push(tech);
        this._hex.addTech(tech);
        tech.updateScienceCost(this);
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
    Engine.prototype.finishTech = function (tech) {
        tech.resources.subtractFrom(this);
        this.resourcesById("science").modify(-Math.floor(tech.scienceCost), this);
        tech.exec(tech, this);
        tech.isFinished = true;
        this.playerData.numFinishedTechs++;
        var neighbours = this._hex.getNeighbours(tech.x, tech.y);
        for (var i = 0; i < neighbours.length; i++) {
            neighbours[i].isDiscovered = true;
        }
        for (var i = 0; i < this._tech.length; i++) {
            this._tech[i].updateScienceCost(this);
        }
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
    HelperHTML.eject = function (el) {
        HelperHTML.ejecties.push(el);
        HelperHTML.ejectParents.push(el.parentElement);
        el.parentElement.removeChild(el);
    };
    HelperHTML.inject = function (el) {
        var index = HelperHTML.ejecties.indexOf(el);
        HelperHTML.ejectParents[index].appendChild(el);
        HelperHTML.ejecties.splice(index, 1);
        HelperHTML.ejectParents.splice(index, 1);
    };
    HelperHTML.ejecties = new Array();
    HelperHTML.ejectParents = new Array();
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
    Input.prototype.onTechClick = function (tech) {
        if (tech.isAvailable(this.engine))
            this.engine.finishTech(tech);
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
function trace() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i - 0] = arguments[_i];
    }
    console.log(args.join(" "));
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
var HexGrid = (function () {
    function HexGrid() {
    }
    HexGrid.prototype.load = function (canvas) {
        this.canvas = canvas;
        this.context = canvas.getContext("2d");
    };
    HexGrid.prototype.render = function (techList, engine) {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        var minX = Number.MAX_VALUE;
        var minY = Number.MAX_VALUE;
        var maxX = -Number.MAX_VALUE;
        var maxY = -Number.MAX_VALUE;
        for (var i = 0; i < techList.length; i++) {
            minX = Math.min(minX, techList[i].x);
            minY = Math.min(minY, techList[i].y);
            maxX = Math.max(maxX, techList[i].x);
            maxY = Math.max(maxY, techList[i].y);
        }
        var maxWidth = (this.canvas.width - HexGrid.PADDING * 2) / (maxX - minX + 3 / 2);
        var maxHeight = (this.canvas.height - HexGrid.PADDING * 2) / ((maxY - minY) * 3 / 4 + 1);
        maxWidth = maxWidth / Math.sqrt(3);
        maxHeight = maxHeight / 2;
        this.sideLength = Math.min(maxHeight, maxWidth);
        for (i = 0; i < techList.length; i++) {
            if (techList[i].isFinished || techList[i].isDiscovered) {
                this.updateSingleTech(techList[i], engine); /*
                var color: string = techList[i].isFinished ? HexGrid.finishedColor : HexGrid.normalColor;
                var borderColor: string = techList[i].isFinished ? HexGrid.finishedBorderColor : (techList[i].isAvailable(engine) ? HexGrid.normalBorderColor : HexGrid.unavailableBorderColor);
                this.drawHex(this.sideLength, techList[i].x - minX, techList[i].y - minY, color, borderColor);*/
            }
        }
        this.minX = minX;
        this.minY = minY;
    };
    HexGrid.prototype.updateSingleTech = function (tech, engine) {
        var color = tech.isFinished ? HexGrid.finishedColor : HexGrid.normalColor;
        var borderColor = tech.isFinished ? HexGrid.finishedBorderColor : (tech.isAvailable(engine) ? HexGrid.normalBorderColor : HexGrid.unavailableBorderColor);
        this.drawHex(this.sideLength, tech.x - this.minX, tech.y - this.minY, color, borderColor);
    };
    HexGrid.prototype.renderOverlayHex = function (tech, context, moreData) {
        if (moreData === void 0) { moreData = {}; }
        context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        if (tech) {
            this.drawHex(this.sideLength, tech.x - this.minX, tech.y - this.minY, tech.isFinished ? HexGrid.finishedOverlayColor : HexGrid.overlayColor, HexGrid.normalBorderColor, context);
        }
    };
    HexGrid.prototype.drawHex = function (sideLength, coordX, coordY, color, borderColor, context) {
        if (context === void 0) { context = null; }
        context = context || this.context;
        var centerX = this.getCenterX(sideLength, coordX, coordY);
        var centerY = this.getCenterY(sideLength, coordX, coordY);
        //console.log("hex " + label +": " + centerX.toFixed() + " " + centerY.toFixed());
        sideLength *= 0.97;
        context.fillStyle = color;
        context.strokeStyle = borderColor;
        context.beginPath();
        for (var i = 0; i < 6; i++) {
            var angle = Math.PI / 3 * (i + 0.5);
            var x = centerX + sideLength * Math.cos(angle);
            var y = centerY + sideLength * Math.sin(angle);
            if (i == 0)
                context.moveTo(x, y);
            else
                context.lineTo(x, y);
        }
        context.closePath();
        context.fill();
        context.stroke();
    };
    HexGrid.prototype.getCenterX = function (sideLength, coordX, coordY) {
        return HexGrid.PADDING + sideLength * Math.sqrt(3) * (coordX + (coordY % 2 == 1 ? 0.5 : 1));
    };
    HexGrid.prototype.getCenterY = function (sideLength, coordX, coordY) {
        return HexGrid.PADDING + sideLength * (coordY * 3 / 2 + 1);
    };
    HexGrid.prototype.hexCenter = function (tech) {
        return { x: this.getCenterX(this.sideLength, tech.x - this.minX, tech.y - this.minY), y: this.getCenterY(this.sideLength, tech.x - this.minX, tech.y - this.minY) };
    };
    Object.defineProperty(HexGrid.prototype, "hexWidth", {
        get: function () {
            return this.sideLength * Math.sqrt(3);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(HexGrid.prototype, "hexHeight", {
        get: function () {
            return this.sideLength * 4 / Math.sqrt(3);
        },
        enumerable: true,
        configurable: true
    });
    /*
    private hasFinishedNeighbour(tech:Technology, hex:HexGraph): boolean {
        var neighbours: Array<Technology> = hex.getNeighbours(tech.x, tech.y);
        for (var i: number = 0; i < neighbours.length; i++) {
            if (neighbours[i].isFinished)
                return true;
        }
        return false;
    }*/
    HexGrid.prototype.coordinatesToTech = function (x, y, hex) {
        var aprX = Math.floor((x - HexGrid.PADDING) / (this.sideLength * Math.sqrt(3))) + this.minX;
        var aprY = Math.floor((y - HexGrid.PADDING) / (this.sideLength * 3 / 2)) + this.minY;
        var aprTech = hex.techByPoint(aprX, aprY);
        var neighbours = hex.getNeighbours(aprX, aprY);
        if (aprTech)
            neighbours.push(aprTech);
        var bestIndex = -1;
        var bestDistance = Number.POSITIVE_INFINITY;
        for (var i = 0; i < neighbours.length; i++) {
            var centerX = this.getCenterX(this.sideLength, neighbours[i].x - this.minX, neighbours[i].y - this.minY);
            var centerY = this.getCenterY(this.sideLength, neighbours[i].x - this.minX, neighbours[i].y - this.minY);
            var distance = (x - centerX) * (x - centerX) + (y - centerY) * (y - centerY);
            if (distance < bestDistance) {
                bestIndex = i;
                bestDistance = distance;
            }
        }
        //trace("apr coordinates:", aprX, aprY, aprTech ? aprTech.id : "-", x.toFixed(), y.toFixed(), "distance:", Math.sqrt(bestDistance));
        //TODO: instead of this hack, getNeighbours should work with points instead of techs and always look through 6 neighbours
        if (Math.sqrt(bestDistance) < this.sideLength)
            return neighbours[bestIndex];
        else
            return null;
    };
    HexGrid.PADDING = 4;
    HexGrid.SPACING = 4;
    HexGrid.finishedColor = "#44bb44";
    HexGrid.normalColor = "#7777ff";
    HexGrid.overlayColor = "#8888aa";
    HexGrid.finishedOverlayColor = "#66dd66";
    HexGrid.unavailableBorderColor = "#4444bb";
    HexGrid.normalBorderColor = "#4444bb";
    HexGrid.finishedBorderColor = "#4444bb";
    return HexGrid;
})();
var LogRenderer = (function () {
    function LogRenderer() {
        this.renderedIndex = -1;
    }
    LogRenderer.prototype.setRoot = function (root) {
        this.root = root;
    };
    LogRenderer.prototype.update = function (timeDelta, visibilityData) {
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
        this.techRenderer = new TechRenderer();
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
        this.techRenderer.load(root.getElementsByClassName("techPanel")[0], engine, input);
        this.visibilityData = new VisibilityData();
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
        this.tabbedElements = [document.getElementById("navActions"), document.getElementById("navSomethingElse")];
        document.getElementById("navActionsButton").onclick = function () {
            _this.switchTo("navActions");
        };
        document.getElementById("navSomethingElseButton").onclick = function () {
            _this.switchTo("navSomethingElse");
        };
        this.switchTo("navActions");
    };
    Renderer.prototype.update = function (timeDelta) {
        this.debugRenderer.update(timeDelta, this.visibilityData);
        this.resourcesRenderer.update(timeDelta, this.visibilityData);
        this.actionsRenderer.update(timeDelta, this.visibilityData);
        this.gameLogRenderer.update(timeDelta, this.visibilityData);
        this.debugLogRenderer.update(timeDelta, this.visibilityData);
        this.techRenderer.update(timeDelta, this.visibilityData);
    };
    Renderer.prototype.switchTo = function (elementId) {
        var element = document.getElementById(elementId);
        for (var i = 0; i < this.tabbedElements.length; i++) {
            this.tabbedElements[i].style.display = this.tabbedElements[i] == element ? "block" : "none";
        }
        this.visibilityData.visibleTab = elementId;
        this.update(0);
    };
    return Renderer;
})();
var RenderUtils = (function () {
    function RenderUtils() {
    }
    RenderUtils.beautifyFloat = function (num) {
        if (!num) {
            return "0";
        }
        var len = RenderUtils.postfixes.length;
        for (var i = 0; i < len; i++) {
            var p = RenderUtils.postfixes[i];
            if (num >= p.limit) {
                return RenderUtils.beautifySimpleFloat(num / p.divisor) + p.postfix[0];
            }
        }
        return RenderUtils.beautifySimpleFloat(num);
    };
    RenderUtils.beautifySimpleFloat = function (num) {
        if (Math.floor(num) == num)
            return num.toFixed();
        else
            return num.toFixed(RenderUtils.precision);
    };
    /*
    public static beautifyFloat(num: number): string {
        var absVal: number = Math.abs(num);
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
    }

    public static beautifyInt(num: number): string {
        var absVal: number = Math.abs(num);
        if (absVal < 1000)
            return num.toFixed(0);
        if (absVal < 1000000)
            return Math.floor(num / 1000).toFixed(0) + "K";
        return Math.floor(num / 1000000).toFixed(0) + "M";
    }*/
    /**
     * Converts raw resource value (e.g. 12345.67890) to a formatted representation (i.e. 12.34K)
     * Shamelessly copied from kittens game where the core of it was in turn copied from Sandcastle Builder
     */
    RenderUtils.postfixes = [
        { limit: 1e6, divisor: 1e6, postfix: ['M', ' Mega'] },
        { limit: 9e3, divisor: 1e3, postfix: ['K', ' Kilo'] },
    ];
    RenderUtils.precision = 2;
    return RenderUtils;
})();
var ResourceRequirement = (function () {
    function ResourceRequirement(resources, quantaties) {
        if (resources === void 0) { resources = []; }
        if (quantaties === void 0) { quantaties = []; }
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
    ResourcesRenderer.prototype.update = function (timeDelta, visibilityData) {
        var html = "<table class=\"resourceTable\" cellspacing=\"5\">";
        for (var i = 0; i < this.engine.resources.length; i++) {
            var resource = this.engine.resources[i];
            if (resource.isObsolete || !resource.isDiscovered) {
                continue;
            }
            html += "<tr><td>" + resource.name + "</td><td>" + RenderUtils.beautifyFloat(resource.value) + "</td><td>";
            if (resource.hasCap && this.engine.playerData.limitOnResourcesWasHit)
                html += "/ " + RenderUtils.beautifyFloat(resource.cap);
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
var TechRenderer = (function () {
    function TechRenderer() {
    }
    TechRenderer.prototype.update = function (timeDelta, visibilityData) {
        if (visibilityData.visibleTab != VisibilityData.TAB_SOMETHING_ELSE) {
            return;
        }
        if (!this.isGridRendered) {
            this.isGridRendered = true;
            HelperHTML.eject(this.ui);
            this.hexGrid.render(this.engine.tech, this.engine);
            for (var i = 0; i < this.engine.tech.length; i++) {
                this.renderTechUI(this.engine.tech[i]);
            }
            HelperHTML.inject(this.ui);
        }
        else {
            for (var i = 0; i < this.engine.tech.length; i++) {
                var tech = this.engine.tech[i];
                if (!tech.viewData.isValid(tech, this.engine)) {
                    this.hexGrid.updateSingleTech(tech, this.engine);
                    this.renderTechUI(tech);
                    trace("not valid");
                }
            }
        }
    };
    TechRenderer.prototype.load = function (root, engine, input) {
        var _this = this;
        this.root = root;
        this.engine = engine;
        this.input = input;
        this.hexGrid = new HexGrid();
        //var smth:HTMLElement = <HTMLElement>root.getElementsByClassName("mainTechCanvas")[0];
        this.hitArea = root.getElementsByClassName("techHitArea")[0];
        this.hexGrid.load(root.getElementsByClassName("mainTechCanvas")[0]);
        this.ui = root.getElementsByClassName("techUI")[0];
        this.hitArea.onmousemove = function (e) { return _this.onMouseMove(e); };
        this.hitArea.onmouseleave = function () { return _this.onMouseLeave(); };
        this.hitArea.onclick = function (e) { return _this.onMouseClick(e); };
        this.overlay = root.getElementsByClassName("overlayTechCanvas")[0].getContext("2d");
        this.background = root.getElementsByClassName("mainTechCanvas")[0].getContext("2d");
    };
    TechRenderer.prototype.onMouseMove = function (event) {
        var position = Hacks.globalToLocal(event);
        var debugData = {};
        var tech = this.hexGrid.coordinatesToTech(position.x, position.y, this.engine.hex);
        if (this.lastRenderedTech != tech) {
            if (this.lastRenderedTech)
                this.lastRenderedTech.viewData.tooltip.style.display = "none";
            this.lastRenderedTech = tech;
            this.hexGrid.renderOverlayHex((tech && tech.isDiscovered) ? tech : null, this.overlay);
            if (tech && tech.isDiscovered)
                tech.viewData.tooltip.style.display = "block";
        }
    };
    TechRenderer.prototype.onMouseClick = function (event) {
        var tech = this.hexGrid.coordinatesToTech(event.x, event.y, this.engine.hex);
        if (tech) {
            /*
            console.log(tech.id + " " + event.x.toFixed()  + " " +  event.y.toFixed());
        else
            console.log("nothing here " + event.x.toFixed() + " " + event.y.toFixed());*/
            this.input.onTechClick(tech);
            this.lastRenderedTech = null;
            this.onMouseMove(event);
            this.hexGrid.updateSingleTech(tech, this.engine);
            this.renderTechUI(tech);
        }
    };
    TechRenderer.prototype.onMouseLeave = function () {
        this.lastRenderedTech = null;
        this.hexGrid.renderOverlayHex(null, this.overlay);
    };
    TechRenderer.prototype.renderTechUI = function (tech) {
        if (tech.viewData.element) {
            HelperHTML.eject(tech.viewData.element);
            this.fillTechUIData(tech);
            HelperHTML.inject(tech.viewData.element);
            tech.viewData.setRendered(tech, tech.viewData.element, this.engine);
            return;
        }
        var position = this.hexGrid.hexCenter(tech);
        var f = document.createDocumentFragment();
        var containerDiv = HelperHTML.element("div", "researchUI");
        var headerDiv = HelperHTML.element("div", "");
        var header = HelperHTML.element("span", "techHeader", tech.name);
        var tooltipDesc = HelperHTML.element("div", "techDescContainer");
        var hintDiv = HelperHTML.element("div", "techDesc");
        var descSpan = HelperHTML.element("div", "", tech.description);
        var discountSpan = HelperHTML.element("div", "techDiscount");
        tooltipDesc.style.display = "none";
        var reqsDiv = HelperHTML.element("div");
        var researchReqDiv = HelperHTML.element("div", "");
        //var tooltipResearch: HTMLElement = HelperHTML.element("div", "baseTooltip, techResearch", "TODO");
        var list = HelperHTML.element("ol", "reseqrchReqList");
        if (tech.resources) {
            for (var i = 0; i < tech.resources.resources.length; i++) {
                var item = HelperHTML.element("li", "reseqrchReqListItem", tech.resources.quantaties[i].toString() + "\t" + tech.resources.resources[i]);
                list.appendChild(item);
            }
        }
        f.appendChild(containerDiv);
        containerDiv.appendChild(headerDiv);
        headerDiv.appendChild(header);
        containerDiv.appendChild(tooltipDesc);
        tooltipDesc.appendChild(hintDiv);
        hintDiv.appendChild(descSpan);
        hintDiv.appendChild(discountSpan);
        containerDiv.appendChild(reqsDiv);
        reqsDiv.appendChild(researchReqDiv);
        //researchReqDiv.appendChild(tooltipResearch);
        researchReqDiv.appendChild(list);
        containerDiv.style.display = tech.isDiscovered ? "block" : "none";
        containerDiv.style.width = this.hexGrid.hexWidth * 0.9 + "px";
        headerDiv.style.width = this.hexGrid.hexWidth * 0.9 + "px";
        containerDiv.style.height = this.hexGrid.hexHeight * 0.9 + "px";
        containerDiv.style.left = (position.x - this.hexGrid.hexWidth * 0.9 / 2) + "px";
        containerDiv.style.top = (position.y - this.hexGrid.hexHeight * 0.9 / 4) + "px";
        tooltipDesc.style.height = this.hexGrid.hexHeight * 0.9 + "px";
        trace(tooltipDesc.style.height);
        tooltipDesc.style.left = this.hexGrid.hexWidth * 0.95 + "px";
        tooltipDesc.style.top = -this.hexGrid.hexHeight * 0.9 / 4 + "px";
        tech.viewData.element = containerDiv;
        tech.viewData.tooltip = tooltipDesc;
        tech.viewData.researchPrice = reqsDiv;
        tech.viewData.discount = discountSpan;
        this.fillTechUIData(tech);
        this.ui.appendChild(f);
    };
    TechRenderer.prototype.fillTechUIData = function (tech) {
        tech.viewData.element.style.display = tech.isDiscovered ? "block" : "none";
        var researchPrice = tech.viewData.researchPrice;
        if (!tech.isFinished) {
            var isAvailable = tech.isAvailable(this.engine);
            if (isAvailable)
                researchPrice.className = "reqsDiv availableTech";
            else
                researchPrice.className = "reqsDiv unavailableTech";
            researchPrice.innerHTML = tech.scienceCost.toFixed() + " science";
            if (tech.numFinishedNeighbours > 1) {
                tech.viewData.discount.innerText = "\n" + ((1 - tech.getNeighbourFactor(tech.numFinishedNeighbours)) * 100).toFixed() + " % discount due to finished neighbouring technologies.";
                tech.viewData.discount.style.display = "inline";
            }
            else
                tech.viewData.discount.style.display = "none";
        }
        else {
            researchPrice.style.display = "none";
            tech.viewData.discount.style.display = "none";
        }
    };
    return TechRenderer;
})();
var TechViewData = (function () {
    function TechViewData() {
    }
    TechViewData.prototype.setRendered = function (tech, element, engine) {
        this.isRendered = true;
        this.element = element;
        this.tooltip = element.getElementsByClassName("techDescContainer")[0];
        this.isAvailable = tech.isAvailable(engine);
        this.isFinished = tech.isFinished;
        this.scienceCost = tech.scienceCost;
    };
    TechViewData.prototype.isValid = function (tech, engine) {
        return (!this.isRendered && !tech.isDiscovered) || this.isRendered == tech.isDiscovered && this.isFinished == tech.isFinished && this.isAvailable == tech.isAvailable(engine) && this.scienceCost == tech.scienceCost;
    };
    return TechViewData;
})();
var VisibilityData = (function () {
    function VisibilityData() {
    }
    VisibilityData.TAB_ACTIONS = "navActions";
    VisibilityData.TAB_SOMETHING_ELSE = "navSomethingElse";
    return VisibilityData;
})();
//# sourceMappingURL=ramblingCore.js.map
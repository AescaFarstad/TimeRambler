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
        return engine.resourcesById["unemployed"].value >= this.pop && this.resources.isMet(engine);
    };
    Action.prototype.start = function (engine) {
        this.timeLeft = this.time;
        this._isStarted = true;
        engine.resourcesById["unemployed"].modify(-this.pop);
        this.resources.subtractFrom(engine);
    };
    Action.prototype.update = function (timeDelta) {
        this.timeLeft -= timeDelta;
    };
    Object.defineProperty(Action.prototype, "isComplete", {
        get: function () {
            return this.timeLeft <= 0;
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
    Action.prototype.cancel = function (engine) {
        engine.resourcesById["unemployed"].modify(this.pop);
        this.resources.giveBack(engine);
        this._isStarted = false;
    };
    Action.prototype.apply = function (engine) {
        this._isStarted = false;
        engine.resourcesById["unemployed"].modify(this.pop);
        var totalWeight = 0;
        for (var i = 0; i < this.outcomes.length; i++) {
            totalWeight += this.outcomes[i].weight;
        }
        var target = Math.random() * totalWeight;
        for (var i = 0; i < this.outcomes.length; i++) {
            target -= this.outcomes[i].weight;
            if (target <= 0) {
                console.log("action " + this.id + " outcome: " + this.outcomes[i].id);
                this.outcomes[i].exec(engine);
                break;
            }
        }
    };
    return Action;
})();
var ActionOutcome = (function () {
    function ActionOutcome(id, weight, exec) {
        this.weight = weight;
        this.exec = exec;
        this.id = id;
    }
    return ActionOutcome;
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
            if (!this.engine.actions[i].viewData.isValid(this.engine.actions[i], this.engine) && this.engine.actions[i].viewData.isRendered) {
                this.list.removeChild(this.engine.actions[i].viewData.element);
                isRemoved = true;
            }
            if (isRemoved || !this.engine.actions[i].viewData.isRendered) {
                var element = this.actionToHtml(this.engine.actions[i], this.input);
                this.engine.actions[i].viewData.setRendered(this.engine.actions[i], element, this.engine);
                this.list.appendChild(element);
            }
        }
    };
    ActionsRenderer.prototype.load = function (root, engine, input) {
        this.root = root;
        this.engine = engine;
        this.input = input;
        this.list = root.getElementsByClassName("actionList")[0];
        this.mapping = {};
    };
    ActionsRenderer.prototype.actionToHtml = function (action, input) {
        var outerElement = HelperHTML.element("li", "action");
        var availability = action.isAvailable(this.engine) ? "Available" : "Unavailable";
        var div = HelperHTML.element("div", "actionHeader_" + availability);
        var span = HelperHTML.element("span", "actionHeaderText_" + availability, action.name);
        div.appendChild(span);
        outerElement.appendChild(div);
        div = HelperHTML.element("div", "actionContent");
        div.appendChild(HelperHTML.element("div", "actionContentText", "Pop: " + action.pop));
        div.appendChild(HelperHTML.element("div", "actionContentText", "Time: " + Math.ceil(action.time / 1000) + " sec."));
        if (!action.resources.isEmpty) {
            var innerDiv = HelperHTML.element("div", "actionContentText", "Requires:");
            for (var i = 0; i < action.resources.resources.length; i++) {
                var resource = this.engine.resourcesById[action.resources.resources[i]];
                innerDiv.appendChild(HelperHTML.element("div", "actionContent_Requirement", resource.name + ": " + action.resources.quantaties[i]));
            }
            div.appendChild(innerDiv);
        }
        var buttonDiv = HelperHTML.element("div", "actionButtonContainer");
        var button = HelperHTML.element("button", "actionButton", action.isStarted ? "Cancel" : "Start");
        if (input)
            button.onclick = action.isStarted ? function () { return input.cancelAction(action); } : function () { return input.activateAction(action); };
        buttonDiv.appendChild(button);
        div.appendChild(buttonDiv);
        outerElement.appendChild(div);
        return outerElement;
    };
    return ActionsRenderer;
})();
var ActionViewData = (function () {
    function ActionViewData() {
    }
    ActionViewData.prototype.setRendered = function (action, element, engine) {
        this.isRendered = true;
        this.isStarted = action.isStarted;
        this.element = element;
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
        var popResource = new Stat("pop", "pop");
        popResource.insertCapModifier(new Modifier("init", 10, 0));
        popResource.isDecimal = false;
        engine.addResource(popResource);
        var unemployedResource = new Stat("unemployed", "unemployed");
        unemployedResource.isDecimal = false;
        unemployedResource.hasCap = false;
        engine.addResource(unemployedResource);
        var foodResource = new Stat("food", "food");
        foodResource.setValue(50, engine);
        foodResource.insertCapModifier(new Modifier("init", 50, 0));
        foodResource.insertRateModifier(new Modifier("pop", 0, 0));
        engine.addResource(foodResource);
        popResource.onValueChanged = this.popRule;
        popResource.setValue(5, engine);
        engine.addRule(this.foodRule);
        var growFailOutcome = new ActionOutcome("fail", 45, this.growFailExec);
        var growSuccessOutcome = new ActionOutcome("success", 55, this.growSuccessExec);
        var growAction = new Action("grow", "Grow", 2, 5 * 1000, new ResourceRequirement(["food"], [10]), [growFailOutcome, growSuccessOutcome]);
        engine.addAction(growAction);
    };
    DataSource.prototype.popRule = function (stat, engine, delta) {
        engine.resourcesById["food"].editRateModifier("pop", -stat.value * DataSource.foorPerPop / 1000, 0);
        engine.resourcesById["unemployed"].setValue(engine.resourcesById["unemployed"].value + delta);
    };
    //if there are not enough workers some actions must be canceled
    DataSource.prototype.unemployedRule = function (stat, engine, delta) {
        if (stat.value < 0) {
            for (var i = 0; i < engine.actions.length; i++) {
                if (engine.actions[i].isStarted && engine.actions[i].pop > 0)
                    engine.actions[i].cancel(engine);
            }
        }
    };
    //if there is not enough food people must die
    DataSource.prototype.foodRule = function (engine) {
        var food = engine.resourcesById["food"];
        var pop = engine.resourcesById["pop"];
        var popVal = pop.value;
        while (food.value < 0 && popVal > 0) {
            food.setValue(food.value + DataSource.canibalicFood, engine);
            popVal -= 1;
        }
        pop.setValue(popVal, engine);
    };
    DataSource.prototype.growFailExec = function (engine) {
        engine.resourcesById["pop"].modify(-1, engine);
    };
    DataSource.prototype.growSuccessExec = function (engine) {
        engine.resourcesById["pop"].modify(1, engine);
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
    Object.defineProperty(Engine.prototype, "resourcesById", {
        get: function () {
            return this._resourcesById;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Engine.prototype, "actions", {
        get: function () {
            return this._actions;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Engine.prototype, "actionsById", {
        get: function () {
            return this._actionsById;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Engine.prototype, "rules", {
        get: function () {
            return this._rules;
        },
        enumerable: true,
        configurable: true
    });
    Engine.prototype.update = function (timeDelta) {
        this._time += timeDelta;
        for (var i = 0; i < this._resources.length; i++) {
            this._resources[i].updateStart(timeDelta);
        }
        for (var i = 0; i < this._rules.length; i++) {
            if (this._actions[i].isStarted) {
                this._actions[i].update(timeDelta);
                if (this._actions[i].isComplete)
                    this._actions[i].apply(this);
            }
        }
        for (var i = 0; i < this._rules.length; i++) {
            this._rules[i](this);
        }
        for (var i = 0; i < this._resources.length; i++) {
            this._resources[i].updateEnd();
        }
    };
    Engine.prototype.addResource = function (resource) {
        this._resources.push(resource);
        this.resourcesById[resource.id] = resource;
    };
    Engine.prototype.addAction = function (action) {
        this._actions.push(action);
        this._actionsById[action.id] = action;
    };
    Engine.prototype.addRule = function (rule) {
        this._rules.push(rule);
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
        var delta = newStamp - this.timeStamp;
        delta *= this.engine.timeScale / this.engine.stepScale;
        this.timeStamp = newStamp;
        this.engine.update(delta);
        this.renderer.update(delta);
        setTimeout(function () { return _this.update(); }, Logic.UPDATE_PERIOD * this.engine.stepScale);
    };
    Logic.UPDATE_PERIOD = 300;
    return Logic;
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
    }
    Renderer.prototype.load = function (root, engine, input) {
        var _this = this;
        this.root = root;
        this.engine = engine;
        this.input = input;
        this.debugRenderer.load(root.getElementsByClassName("debugPanel")[0], engine);
        this.resourcesRenderer.load(root.getElementsByClassName("resourcesPanel")[0], engine);
        this.actionsRenderer.load(root.getElementsByClassName("actionsPanel")[0], engine, input);
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
    return RenderUtils;
})();
var ResourceRequirement = (function () {
    function ResourceRequirement(resources, quantaties) {
        this.resources = resources;
        this.quantaties = quantaties;
    }
    ResourceRequirement.prototype.isMet = function (engine) {
        for (var i = 0; i < this.resources.length; i++) {
            if (engine.resourcesById[this.resources[i]].value < this.quantaties[i])
                return false;
        }
        return true;
    };
    ResourceRequirement.prototype.subtractFrom = function (engine) {
        for (var i = 0; i < this.resources.length; i++) {
            engine.resourcesById[this.resources[i]].modify(-this.quantaties[i]);
        }
    };
    ResourceRequirement.prototype.giveBack = function (engine) {
        for (var i = 0; i < this.resources.length; i++) {
            engine.resourcesById[this.resources[i]].modify(this.quantaties[i]);
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
        var html = "<h4>Resources:</h4><table class=\"resourceTable\" cellspacing=\"5\">";
        for (var i = 0; i < this.engine.resources.length; i++) {
            html += "<tr><td>" + this.engine.resources[i].name + "</td><td>" + this.engine.resources[i].value.toFixed(this.engine.resources[i].isDecimal ? 2 : 0) + "</td><td>";
            if (this.engine.resources[i].hasCap)
                html += "/" + this.engine.resources[i].cap;
            html += "</td><td>";
            if (this.engine.resources[i].rate != 0)
                html += "(" + RenderUtils.beautifyFloat(this.engine.resources[i].rate * 1000) + ")";
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
    Stat.prototype.updateEnd = function () {
        if (this.hasCap && this._value > this._capCache)
            this._value = this._capCache;
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
    Stat.prototype.editCapModifier = function (key, add, multi) {
        var add = 0;
        var multi = 0;
        for (var i = 0; i < this.capModifiers.length; i++) {
            if (this.capModifiers[i].key == key) {
                this.capModifiers[i].add = add;
                this.capModifiers[i].multi = multi;
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
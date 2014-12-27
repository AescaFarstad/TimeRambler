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
        this.renderer.load(rootElement, this.engine);
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
        engine.addResource(popResource);
        var foodResource = new Stat("food", "food");
        foodResource.setValue(50, engine);
        foodResource.insertCapModifier(new Modifier("init", 50, 0));
        foodResource.insertRateModifier(new Modifier("pop", 0, 0));
        engine.addResource(foodResource);
        popResource.onValueChanged = function (stat, engine) { return engine.resourcesById["food"].editRateModifier("pop", -stat.value * DataSource.foorPerPop / 1000, 0); };
        popResource.setValue(5, engine);
    };
    DataSource.foorPerPop = 0.1;
    return DataSource;
})();
var DebugRenderer = (function () {
    function DebugRenderer() {
    }
    DebugRenderer.prototype.setRoot = function (root) {
        this.root = root;
    };
    DebugRenderer.prototype.update = function (timeDelta) {
        this.root.innerHTML = "Elapsed time: " + this.toTimeString(this.engine.time);
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
        var ms = (time % 1000);
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
        this._time = 0;
        this._resources = new Array();
        this._resourcesById = Object();
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
    Engine.prototype.update = function (timeDelta) {
        this._time += timeDelta;
        for (var i = 0; i < this._resources.length; i++) {
            this._resources[i].updateStart(timeDelta);
        }
        for (var i = 0; i < this._resources.length; i++) {
            this._resources[i].updateEnd();
        }
    };
    Engine.prototype.addResource = function (resource) {
        this._resources.push(resource);
        this.resourcesById[resource.id] = resource;
    };
    return Engine;
})();
var Input = (function () {
    function Input() {
    }
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
        this.timeStamp = newStamp;
        this.engine.update(delta);
        this.renderer.update(delta);
        setTimeout(function () { return _this.update(); }, Logic.UPDATE_PERIOD);
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
    }
    Renderer.prototype.load = function (root, engine) {
        this.root = root;
        this.engine = engine;
        this.debugRenderer.load(root.getElementsByClassName("debugPanel")[0], engine);
        this.resourcesRenderer.load(root.getElementsByClassName("resourcesPanel")[0], engine);
    };
    Renderer.prototype.update = function (timeDelta) {
        this.debugRenderer.update(timeDelta);
        this.resourcesRenderer.update(timeDelta);
    };
    return Renderer;
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
            html += "<tr><td>" + this.engine.resources[i].name + "</td><td>" + this.engine.resources[i].value.toFixed(2) + "</td><td>/" + this.engine.resources[i].cap + "</td><td>(" + this.engine.resources[i].rate * 1000 + ")</td></tr>\n";
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
        if (this._value > this._capCache)
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
            this._value = value;
            if (this.onValueChanged != null)
                this.onValueChanged(this, engine);
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
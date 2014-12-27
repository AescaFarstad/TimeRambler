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
    };
    Binder.prototype.start = function () {
        this.logic.start();
    };
    return Binder;
})();
var DataSource = (function () {
    function DataSource() {
    }
    return DataSource;
})();
var DebugRenderer = (function () {
    function DebugRenderer() {
    }
    DebugRenderer.prototype.setRoot = function (root) {
        this.root = root;
    };
    DebugRenderer.prototype.update = function (timeDelta) {
        this.root.innerHTML = this.toTimeString(this.engine.time);
    };
    DebugRenderer.prototype.load = function (root, engine) {
        this.root = root;
        this.engine = engine;
    };
    DebugRenderer.prototype.toTimeString = function (time) {
        var result = "";
        var hours = (Math.floor(time / (3600 * 1000)));
        var minutes = (Math.floor(time / (60 * 1000)) % 60);
        var secsInt = (Math.floor(time / 1000) % 60);
        var hoursStr = hours.toString();
        if (hoursStr.length < 2)
            hoursStr = "0" + hours;
        var minutesStr = minutes.toString();
        if (minutesStr.length < 2)
            minutesStr = "0" + minutes;
        var secondsStr = secsInt.toString();
        if (secondsStr.length < 2)
            secondsStr = "0" + secondsStr;
        return hoursStr + ":" + minutesStr + ":" + secondsStr + "," + (time % 1000).toString();
    };
    return DebugRenderer;
})();
var Engine = (function () {
    function Engine() {
        this._time = 0;
    }
    Object.defineProperty(Engine.prototype, "time", {
        get: function () {
            return this._time;
        },
        enumerable: true,
        configurable: true
    });
    Engine.prototype.update = function (timeDelta) {
        this._time += timeDelta;
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
    Logic.UPDATE_PERIOD = 100;
    return Logic;
})();
var Renderer = (function () {
    function Renderer() {
        this.debugRenderer = new DebugRenderer();
    }
    Renderer.prototype.load = function (root, engine) {
        this.root = root;
        this.engine = engine;
        this.debugRenderer.load(root.getElementsByClassName("debugPanel")[0], engine);
    };
    Renderer.prototype.update = function (timeDelta) {
        this.debugRenderer.update(timeDelta);
    };
    return Renderer;
})();
//# sourceMappingURL=ramblingCore.js.map
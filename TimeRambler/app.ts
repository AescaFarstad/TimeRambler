window.onload = () => {
    var el = document.getElementById('content');
    var binder = new Binder();
    binder.create(el);
    binder.start();
};
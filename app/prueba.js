function filter(col, pred) {
    return _.filter(col, pred);
}
var result = filter(_.range(0, 10, 1), function (x) {
    return x % 2 !== 0;
});
function reducePolygon(points) {
    return _.reduce(points, function (acum, point) {
        return {
            x: acum.x + point.x,
            y: acum.y + point.y
        };
    });
}
reducePolygon([
    {
        x: 2,
        y: 3
    }, 
    {
        x: 3,
        y: 2
    }
]);
var Greeter = (function () {
    function Greeter(p) {
        this.someone = p;
    }
    Greeter.prototype.greet = function () {
        return Greeter.greet(this.someone);
    };
    Greeter.greet = function greet(person) {
        return "Hello, " + person.firstname + " " + person.lastname;
    };
    return Greeter;
})();
var g = new Greeter({
    firstname: "Fernando",
    lastname: "Olcoz"
});
//@ sourceMappingURL=prueba.js.map

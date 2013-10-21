// ambient declaration for lodash
declare var _;

// function types (pred in the example)
function filter(col: number[], pred: (n: number) => bool): number[] {
    return _.filter(col, pred);
}

var result = filter(_.range(0, 10, 1), x => x % 2 !== 0);

// object types
function reducePolygon(points: {x: number; y: number;}[]): {x: number; y: number;} {
    return _.reduce(points, (acum, point) => {return {x: acum.x + point.x, y: acum.y + point.y};});
}

reducePolygon([{x: 2, y: 3}, {x: 3, y: 2}]);

// named object type == interface
interface Person {
    firstname: string;
    lastname: string;
}

class Greeter {
    someone: Person;

    constructor(p: Person) {
        this.someone = p;
    }

    greet():string {
        //return "Hello, " + this.someone.firstname + " " + this.someone.lastname;
        return Greeter.greet(this.someone);
    }

    static greet(person: Person): string {
        //return new Greeter(person).greet();
        return "Hello, " + person.firstname + " " + person.lastname;
    }
}

var g = new Greeter({firstname:"Fernando", lastname:"Olcoz"});
//window.alert(g.greet());

function el(e) {
    return document.getElementById(e);
}

var main = el("main")

const GRID_SIZE = 3;

//document.onload = function() {
    //el("main")
//}

const Dice = {
    Blank: -1,
    Normal: 0,
    Red: 1,
    Blue: 2
}

const DICE_COLORS = ['red', 'blue']

const Direction = {
    Up: 0,
    Down: 1,
    Left: 2,
    Right: 3
}

class Die {

    /*
    left
    up
    right

    you can do this up to three times to randomize the die
    */

    constructor(number = 1, type = Dice.Normal, rand = 0) {
        this.top = 1;
        this.bottom = 6;
        this.front = 4;
        this.back = 3;
        this.left = 5;
        this.right = 2;
        this.type = type;

        switch (number) {
            // 1 is the default
            case 2:
                this.mv_left();
                break;
            case 3:
                this.mv_down();
                break;
            case 4:
                this.mv_up();
                break;
            case 5:
                this.mv_right();
                break;
            case 6:
                this.mv_up();
                this.mv_up();
                break;
        }

        if (rand) {
            var times = rand;
            if (rand >= 4) {
                times = Math.floor(Math.random() * 4);
            }
            for (let i = 0; i < times; i++) {
                this.mv_left();
                this.mv_up();
                this.mv_right();
            }
        }
    }

    get create_obj() {
        // Useful for storing the old die state as the actual die is rotating
        return {
            top: this.top,
            bottom: this.bottom,
            front: this.front,
            back: this.back,
            left: this.left,
            right: this.right
        };
    };

    mv_down() {
        let old = this.create_obj;
        this.top = old.back;
        this.front = old.top;
        this.bottom = old.front;
        this.back = old.bottom;
    };

    mv_up() {
        let old = this.create_obj;
        this.top = old.front;
        this.front = old.bottom;
        this.bottom = old.back;
        this.back = old.top;
    };

    mv_left() {
        let old = this.create_obj;
        this.top = old.right;
        this.right = old.bottom;
        this.bottom = old.left;
        this.left = old.top;
    };

    mv_right() {
        let old = this.create_obj;
        this.top = old.left;
        this.right = old.top;
        this.bottom = old.right;
        this.left = old.bottom;
    };

    toString() {
        return this.top.toString();
    };

    tooltip() {
        return `  ${this.back}  
    ${this.left} ${this.top} ${this.right}
      ${this.front}  `;
    };
        
}


class BlankDie extends Die {
    constructor() {
        super();
        this.type = Dice.Blank;
    }
}

// 0 is the empty space
// 1-6 is a normal die
// 7-12 is the red die (minus 6 obviously)
grid_template = [
    [3,1,6],
    [0,7,4],
    [2,6,13]
]
grid = []

for (let i of grid_template) {
    class_arr = []
    for (let j of i) {
        if (j > 6) {
            class_arr.push(new Die(((j-1)%6)+1, Math.floor(j / 6)))
            console.log(`push ${j-6} dice.red`)
            console.log(class_arr)
        } else if (j > 0) {
            class_arr.push(new Die(j, Dice.Normal))
            console.log(`push ${j} dice.normal`)
            console.log(class_arr)
        } else if (j == 0) {
            class_arr.push(new Die(1, Dice.Blank))
            console.log(`push ${1} dice.blank`)
            console.log(class_arr)
        } else {
            console.log("Something happened")
        }
    }
    grid.push(class_arr)
    
}

function clone(orig) {
    return Object.assign(Object.create(Object.getPrototypeOf(orig)), orig)
}

function randint(min, max) {
    var num = Math.floor((Math.random() * max) + min);
    return num;
  }

function pieceClick(e) {
    //console.log(e)
    coords = e.target.getAttribute("coords").split(",")
    move(parseInt(coords[1]), parseInt(coords[0]))
}

function render() {
    main.innerHTML = ""
    for (let i = 0; i < GRID_SIZE; i++) {
        let tr = document.createElement("tr")
        tr.setAttribute("id", "row" + i)
        main.appendChild(tr)
        for (let j = 0; j < GRID_SIZE; j++) {
            td = document.createElement("td")
            //td.setAttribute("id","pc " + i + " " + j);
            td.setAttribute("coords", `${i},${j}`)
            // Color of space
            let cls = "piece ";
            let txt = ""

            piece = grid[i][j]

            if (piece.type >= Dice.Red) {
                cls += DICE_COLORS[Math.floor(piece.type - 1)]
                txt = piece.top
            } else if (piece.type == Dice.Normal) {
                cls += "normal"
                txt = piece.top
            } else {
                cls += "blank"
            }
            td.setAttribute("class",cls)
            td.onclick = pieceClick;
            if (piece.type != Dice.Blank) {
                td.innerHTML = `
                <div class="small label" coords="${i},${j}">${piece.back}</div>
                <div class="label" coords="${i},${j}">
                    <span class="label small side" coords="${i},${j}">${piece.left}</span>
                    ${txt}
                    <span class="label small side" coords="${i},${j}">${piece.right}</span>
                </div>
                <div class="small label" coords="${i},${j}">${piece.front}</div>`
            } else {
                td.innerHTML = ""
            }

            tr.appendChild(td)
        }
    }
}


function move(x,y) {

    var valid = function(x, y) {
        // checks to see if any given position is valid
        //console.log(`Checking (${x},${y})`)
        if (y >= 0 && y < GRID_SIZE && 
            x >= 0 && x < GRID_SIZE) {
                return grid[y][x].type == Dice.Blank;
            }
        return false;
    }

    var die = grid[y][x];
    var dir;
    
    if (die.type == Dice.Blank) {
        return;
    }

    //decide direction
    // Up
    if (valid(x,y-1)) {
        die.mv_up();
        grid[y-1][x] = die;
        grid[y][x] = new BlankDie();
    } 
    // Down
    else if (valid(x, y + 1)) {
        die.mv_down();
        grid[y + 1][x] = die;
        grid[y][x] = new BlankDie();
    }
    // Left
    else if (valid(x - 1, y)) {
        die.mv_left();
        grid[y][x - 1] = die;
        grid[y][x] = new BlankDie();
    }
    // Right
    else if (valid(x + 1, y)) {
        die.mv_right();
        grid[y][x + 1] = die;
        grid[y][x] = new BlankDie();
    }

    render()

}

render()

const KEY_LOCS = [
    [0,2],
    [1,2],
    [2,2],
    [0,1],
    [1,1],
    [2,1],
    [0,0],
    [1,0],
    [2,0]
]

document.onkeydown = function(e) {
    console.log(e.code)
    if (e.code.split("Numpad")[1].length == 1) {
        let loc = parseInt(e.code.split("Numpad")[1]) - 1
        console.log(loc)
        if (loc >= 0 && loc <= 8) {
            move(KEY_LOCS[loc][0], KEY_LOCS[loc][1])
        }
    }
}

var d = new Die(1, false)
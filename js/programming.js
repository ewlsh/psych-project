/* global variables to interact with melonjs */
var move_x = 0;
var move_y = 0;
var edible = false;
var poisoned = false;
var isagate = false;
var eating = false;
var openagate = false;
var opened = false;
var moving = false;
var moving_params = [];
var trashit = false;
var level = 1;

let goutput = "";
let functions = {};

function err(str) {
    log('error: ' + str);
}

function parse(input) {
    let lines = input.split("\n");
    let component_lines = [];

    for (let line of lines) {
        let components = [];
        let component = "";

        if (typeof line !== 'string' || line === null || line == '' || line.length == 0)
            continue;

        line = line.trim();
        line = line.toLowerCase();

        let args = false;

        for (let w = 0; w < line.length; w++) {
            let char = line[w];

            if (char === '(') {
                if (component != "") {
                    components.push(component);
                    component = "";
                }
                let index = w + line.substring(w).indexOf(')');
                components.push(parse_args(line.substring(w + 1, index)));
                w = index;
            } else if (char !== ' ') {
                component += char;
            } else if (component != "") {
                components.push(component);
                component = "";
            }
        }
        if (component != "") {
            components.push(component);
            component = "";
        }


        if (components.length > 0) {
            component_lines.push(components);
        }
    }

    return component_lines;
}

function parse_args(args) {
    let output = [];
    let components = args.split(",");

    for (let component of components) {
        let arg = component.trim();

        if (!isNaN(arg)) {
            output.push(Number.parseFloat(arg));
        } else {
            output.push(arg);
        }
    }

    return output;
}

function resume_run(component_lines, defined_variables, iter, iffy, iffy_skip, return_value) {
    for (let j = iter; j < component_lines.length; j++) {
        let line = component_lines[j];

        console.log('[DEBUG] resume \\ line running: ' + JSON.stringify(line));

        if (iffy && iffy_skip && line[0] != 'if') {
            console.log('skipping for if...');
            continue;
        }

        if (line[0] == 'if') {
            if (!iffy) {
                if (line[1] == 'end')
                    err("Syntax error in if statement");
                iffy = true;

                if (line[2] == '=') {
                    if (line.length == 4) {
                        if (exec_var(line[1], defined_variables) == exec_var(line[3], defined_variables)) {
                            iffy_skip = false;
                        }
                    } else {
                        err("Invalid if statement");
                    }
                } else {
                    err("What iffy?");
                }
            } else if (iffy) {
                if (line[1] !== 'end')
                    err("Syntax error in if end");
                iffy_skip = true;
                iffy = false;
            }
            /* } else if (line[0] == 'loop') {
                 let func_name = line[1];
                 let func_args = [];
     
                 if (line.indexOf('for') > 2) {
                     func_args = line[line.indexOf('for') - 1];
                 }
     
                 let amount = line[line.indexOf('for') + 1];
     
                 amount = exec_var(amount, defined_variables);
     
                 console.log('amount of looping: ' + amount);
     
                 if (isNaN(amount))
                     err("Invalid looping, not a number");
     
                 for (let i = 0; i < amount; i++) {
                     call_function(func_name, defined_variables, exec_args(func_args, defined_variables));
                 }*/
        } else if (line[0] == 'set') {
            defined_variables[line[1]] = line[3];
        } else if (line[0] == 'return') {
            return_value = exec_args([line[1]], defined_variables)[0];
        } else {
            if (line.length > 1) {
                let val = call_function(line[0], defined_variables, exec_args(line[1], defined_variables));
                if (val == -1) {
                    moving_params = [component_lines, defined_variables, j + 1, iffy, iffy_skip, return_value];
                    moving = true;
                    return;
                } else if (val == -2) {
                    return;
                }
            } else {
                let val = call_function(line[0], defined_variables);
                if (val == -1) {
                    moving_params = [component_lines, defined_variables, j + 1, iffy, iffy_skip, return_value];
                    moving = true;
                    return;
                } else if (val == -2) {
                    return;
                }
            }
        }
    }

    return return_value;
}

function run(component_lines, defined_variables = {}) {
    let iffy = false;

    let return_value;

    let iffy_skip = true;

    for (let j = 0; j < component_lines.length; j++) {
        let line = component_lines[j];

        console.log('[DEBUG] line running: ' + JSON.stringify(line));

        if (iffy && iffy_skip && line[0] != 'if')
            continue;

        if (line[0] == 'if') {
            if (!iffy) {
                if (line[1] == 'end')
                    err("Syntax error in if statement");
                iffy = true;

                if (line[2] == '=') {
                    if (line.length == 4) {
                        if (exec_var(line[1], defined_variables) == exec_var(line[3], defined_variables)) {
                            iffy_skip = false;
                        }
                    } else {
                        err("Invalid if statement");
                    }
                } else {
                    err("What iffy?");
                }
            } else if (iffy) {
                if (line[1] !== 'end')
                    err("Syntax error in if end");
                iffy_skip = true;
                iffy = false;
            }
            /* } else if (line[0] == 'loop') {
                 let func_name = line[1];
                 let func_args = [];
     
                 if (line.indexOf('for') > 2) {
                     func_args = line[line.indexOf('for') - 1];
                 }
     
                 let amount = line[line.indexOf('for') + 1];
     
                 amount = exec_var(amount, defined_variables);
     
                 console.log('amount of looping: ' + amount);
     
                 if (isNaN(amount))
                     err("Invalid looping, not a number");
     
                 for (let i = 0; i < amount; i++) {
                     call_function(func_name, defined_variables, exec_args(func_args, defined_variables));
                 }*/
        } else if (line[0] == 'set') {
            defined_variables[line[1]] = line[3];
        } else if (line[0] == 'return') {
            return_value = exec_args([line[1]], defined_variables)[0];
        } else {
            if (line.length > 1) {
                let val = call_function(line[0], defined_variables, exec_args(line[1], defined_variables));
                if (val == -1) {
                    moving_params = [component_lines, defined_variables, j + 1, iffy, iffy_skip, return_value];
                    moving = true;
                    return;
                } else if (val == -2) {
                    return;
                }
            } else {
                let val = call_function(line[0], defined_variables);
                if (val == -1) {
                    moving_params = [component_lines, defined_variables, j + 1, iffy, iffy_skip, return_value];
                    moving = true;
                    return;
                } else if (val == -2) {
                    return;
                }
            }
        }
    }

    return return_value;
}

function define_functions(component_lines) {
    let output_lines = [];
    let func = false;
    let func_name = "";
    let func_args = [];
    let function_lines = [];
    for (let line of component_lines) {
        if (!func && line[0] == 'function') {
            if (line[1] == 'end')
                err(line.toString() + "Syntax error");
            func_name = line[1];
            if (line.length > 2) {
                func_args = line[2];
            }
            func = true;
        } else if (func && line[0] == 'function') {
            if (line[1] !== 'end')
                err("Syntax error");
            func = false;
            functions[func_name] = { code: function_lines, variables: func_args };
            function_lines = [];
        } else if (func) {
            function_lines.push(line);
        } else if (!func) {
            output_lines.push(line);
        }
    }
    return output_lines;
}

function exec_var(variable, input = {}) {
    return exec_args([variable], input)[0];
}

function exec_args(args, input = {}) {
    let output = [];

    for (let arg of args) {
        switch (arg) {
            case 'edible':
                output.push(edible);
                break;
            case 'isagate':
                output.push(isagate);
                break;
            default:
                if (typeof arg == 'string' && Object.keys(input).indexOf(arg) !== -1) {
                    let value = input[Object.keys(input)[Object.keys(input).indexOf(arg)]];
                    output.push(value);
                } else if (!isNaN(arg)) {
                    output.push(parseFloat(arg));
                } else if (typeof arg == 'string') {
                    output.push(arg.replace('~', ''));
                } else {
                    output.push(arg);
                }
        }
    }

    return output;
}

function call_function(func_name, input, func_args = []) {

    // special function. no way to write this inside the language.
    switch (func_name) {
        case 'log':
            log('learning log: ' + func_args);
            document.getElementById('output').value = goutput;
            return 0;
        case 'move':
            if (func_args.length < 2)
                err('not enough coords');

            edible = false;
            poisoned = false;
            isagate = false;

            move_x += func_args[0] * 3;
            move_y += func_args[1] * 3;
            return -1;
        case 'eat':
            if (edible && !poisoned) {
                // NOTE: This is where max level is defined per now.
                if (level < 2) {
                    move_x = 0;
                    move_y = 0;
                    edible = false;
                    poisoned = false;
                    isagate = false;
                    eating = false;
                    openagate = false;
                    opened = false;
                    moving = false;
                    moving_params = [];

                    goutput = "";
                    functions = {};

                    me.levelDirector.loadLevel("map" + ++level);

                    return -2;
                }// else
                alert('Good job! You\'ve passed all available levels. You can reload the page.');
                edible = false;
                return -2;
            } else if (poisoned) {

                // alert('You\'ve been poisoned!');
            } else {
                if (level > 1) {
                    move_x = 0;
                    move_y = 0;
                    edible = false;
                    poisoned = false;
                    isagate = false;
                    eating = false;
                    openagate = false;
                    opened = false;
                    moving = false;
                    moving_params = [];
                    level = 1;

                    goutput = "";
                    functions = {};

                    me.levelDirector.loadLevel("map1");

                    return -2;
                }
            }

            return 0;
        case 'open':
            openagate = true;

            return -1;
        case 'trash':
            if (poisoned || edible) {
                trashit = true;
            }
            return 0;
        case 'tree':
            move_x = 0;
            move_y = 0;
            edible = false;
            poisoned = false;
            isagate = false;
            eating = false;
            openagate = false;
            opened = false;
            moving = false;
            moving_params = [];

            goutput = "";
            functions = {};

            me.levelDirector.loadLevel("map3")
            return 0;
        default: break;
    }

    let func = functions[func_name];
    let var_map = {};

    if (func.variables.length < func_args.length) {
        err("not enough arguments!");
    }

    if (func.variables.length > 0) {
        for (let i = 0; i < func.variables.length; i++) {
            var_map[func.variables[i]] = func_args[i];
        }
    }

    return run(func.code, Object.assign({}, input, var_map));
}

function exec(code) {
    goutput = "";

    move_x = 0;
    move_y = 0;

    console.log(code);
    let component_lines = parse(code);
    //component_lines = define_functions(component_lines);

    run(component_lines);


}

function log(str) {
    goutput += str + "\n";
}

//exec("function hello (x)\nif x = 5 \nlog (hello, x)\n if end \n loop log (hell) for 10 \nfunction end\nhello (5)");

/*exec("set z = 21\n" + "function hello (x)\n" +
    "if x = 5 \n" +
    "  log (x is equal to five!)\n" +
    "if end \n" +
    "loop log (hellooo!) for z times\n" +
    "function end\n" +
    "hello (3)");*/
// This file is released under the MIT license.
// See LICENSE.md.

lit_to_atom = {};
model_found = false;

var log = "";
var logElement = document.getElementById('log');
var decisions = Array();

function get_atom_from_lit(lit) {
  if (lit > 0) {
    atom = lit_to_atom[lit];
  }
  else {
    atom = lit_to_atom[-lit];
    if (atom != null) {
      atom = "-" + atom;
    }
  }
  if (atom == null) {
    if (lit > 0) {
      atom = "aux(" + lit +")";
    } else {
      atom = "-aux(" + -lit + ")";
    }
  }
  return atom;
}

function interface_register_watch(lit, atom) {
  lit_to_atom[lit] = atom;
  console.log("Interface: registered watch " + atom + " (" + lit + ")");
}

function interface_propagate(lit) {
  if (!need_to_update_graphics()) {
    return;
  }
  atom = get_atom_from_lit(lit);
  index = decisions.findIndex(elem => (elem.type == "decision") && (elem.lit == -lit));
  if (index > -1) {
    decisions.length = index;
    write_decisions_to_log();
  }
  console.log("Interface: propagate " + atom + " (" + lit + ")");
  atom_obj = parse_binary_atom(atom);
  if (atom_obj != null && atom_obj.positive) {
    binary_set_cell_value(atom_obj.i, atom_obj.j, atom_obj.val);
  }
  binary_render_board();
}

function interface_undo(lit) {
  if (!need_to_update_graphics()) {
    return;
  }
  atom = get_atom_from_lit(lit);
  var index = decisions.findIndex(elem => (elem.type == "decision") && (elem.lit == lit));
  if (index > -1) {
    decisions.length = index;
    write_decisions_to_log();
  }
  console.log("Interface: undo " + atom + " (" + lit + ")");
  atom_obj = parse_binary_atom(atom);
  if (atom_obj != null && atom_obj.positive) {
    binary_set_cell_value(atom_obj.i, atom_obj.j, null);
  }
  binary_render_board();
}

function interface_decide(lit) {
  atom = get_atom_from_lit(lit);
  decision_obj = {
    type: "decision",
    lit: lit,
  }
  decisions.push(decision_obj);
  write_decisions_to_log();
  console.log("Interface: decide " + atom + " (" + lit + ")");
}

function interface_check(model) {
  atoms = Array();
  for (let index = 0; index < model.length; ++index) {
    atom = get_atom_from_lit(model[index]);
    if (atom != null) {
      atom_obj = parse_binary_atom(atom);
      if (atom_obj != null && !atom_obj.auxiliary && atom_obj.positive) {
        binary_set_cell_value(atom_obj.i, atom_obj.j, atom_obj.val);
      }
      if (atom.startsWith("solution(" || atom.startsWith("-solution("))) {
        atoms.push(atom);
      }
    }
  }
  binary_render_board();
  console.log("Interface: check " + atoms);
  model_found = true;
  updateOutput();
  if (need_to_update_graphics() && document.getElementById("pause-on-model").checked) {
    do_pause();
  }
}

function interface_on_model() {
  console.log("Interface: on_model");
}

// function interface_on_unsat() {
//   console.log("Interface: on_unsat");
// }
// function interface_on_finish() {
//   console.log("Interface: on_finish");
// }

function interface_before_start() {
  console.log("Interface: before start");
  model_found = false;
  binary_render_board();
  hidden_program = "";
  hidden_program += "#const board_size=" + board_size + ".\n"
  for (var i=0; i < board_size; i++) {
    for (var j=0; j < board_size; j++) {
      val = binary_get_cell_value(i,j);
      if (val != null) {
        hidden_program += "solution("+(i+1)+","+(j+1)+","+val+").\n"
      }
    }
  }
  decisions = Array();
  write_decisions_to_log();
}

function watched_predicates() {
  return "solution";
}

function interface_start() {
  console.log("Interface: start");
  document.getElementById("run").disabled = true;
  document.getElementById("pause").disabled = false;
  board_blocked = true;
  do_resume();
}

function interface_finish() {
  console.log("Interface: finish");
  document.getElementById("run").disabled = false;
  document.getElementById("pause").disabled = true;
  document.getElementById("resume").disabled = true;
  board_blocked = false;
  updateOutput();
  speed_factor = document.getElementById("speed").value;
  setTimeout(function() {
    updateOutput();
  }, speed_factor*500);
  setTimeout(function() {
    updateOutput();
  }, speed_factor*1000);
}

function interface_wait_time_propagate() {
  if (!need_to_update_graphics()) {
    return 0;
  }
  speed_factor = document.getElementById("speed").value;
  return speed_factor*1000;
}
function interface_wait_time_undo() {
  if (!need_to_update_graphics()) {
    return 0;
  }
  speed_factor = document.getElementById("speed").value;
  return speed_factor*1000;
}
function interface_wait_time_check() {
  if (!need_to_update_graphics()) {
    return 0;
  }
  speed_factor = document.getElementById("speed").value;
  return speed_factor*2000;
}
function interface_wait_time_on_model() {
  if (!need_to_update_graphics()) {
    return 0;
  }
  speed_factor = document.getElementById("speed").value;
  return speed_factor*0;
}
function interface_wait_time_decide() {
  if (!need_to_update_graphics()) {
    return 0;
  }
  speed_factor = document.getElementById("speed").value;
  return speed_factor*500;
}

function parse_binary_atom(atom) {
  parts = atom.split(/,|\(|\)/)
  if (atom.startsWith("solution(")) {
    i = parseInt(parts[1]);
    j = parseInt(parts[2]);
    v = parseInt(parts[3]);
    return {
      i: i-1,
      j: j-1,
      val: v,
      positive: true,
      auxiliary: false,
    }
  } else if (atom.startsWith("-solution(")) {
    i = parseInt(parts[1]);
    j = parseInt(parts[2]);
    v = parseInt(parts[3]);
    return {
      i: i-1,
      j: j-1,
      val: v,
      positive: false,
      auxiliary: false,
    }
  } else if (atom.startsWith("aux(")) {
    v = parseInt(parts[1]);
    return {
      v: v,
      positive: true,
      auxiliary: true,
    }
  } else if (atom.startsWith("-aux(")) {
    v = parseInt(parts[1]);
    return {
      v: v,
      positive: false,
      auxiliary: true,
    }
  } else {
    return null;
  }
}

function load_binary() {
  if (!board_blocked) {
    binary_initialize_board();
    binary_input = document.getElementById("binary-input").value;
    binary_load_from_string(board_size, binary_input);
    binary_render_board();
  }
}

function clear_binary() {
  if (!board_blocked) {
    binary_initialize_board();
    binary_render_board();
  }
}

function load_example_binary() {
  if (!board_blocked) {
    binary_initialize_board();
    var input_string = document.getElementById("example-puzzles").value;
    var input_array = JSON.parse(input_string);
    binary_load_from_string(input_array[0], input_array[1]);
    binary_render_board();
  }
}

function change_board_size() {
  if (!board_blocked) {
  	var board_size_elem = document.getElementById('board-size');
  	board_size = parseInt(board_size_elem.value);
  	binary_initialize_board();
  	binary_render_board();
  }
}

function binary_load_from_string(size, binary_as_string) {
	board_size = size;
	var board_size_elem = document.getElementById('board-size');
	board_size_elem.value = size;
	binary_initialize_board();
	binary_clear_board();
	for (var i=0; i < board_size*board_size && i < binary_as_string.length; i++){
		if (binary_as_string[i] >= '0' && binary_as_string[i] <= '1') {
			binary_set_cell_value(i,binary_as_string[i]);
		}
	}
}

Module.can_resume = true;
function do_pause() {
  document.getElementById("pause").disabled = true;
  document.getElementById("resume").disabled = false;
  Module.can_resume = false;
}
function do_resume() {
  document.getElementById("pause").disabled = false;
  document.getElementById("resume").disabled = true;
  Module.can_resume = true;
}

function clearLog() {
  log = "";
  updateLog();
}

function addToLog(text) {
  log = text + "\n" + log;
  updateLog();
}

function updateLog() {
  if (logElement) {
    logElement.textContent = log;
    // logElement.scrollTop = logElement.scrollHeight; // focus on bottom
  }
}

function decision_to_text(atom) {
  atom_obj = parse_binary_atom(atom);
  if (atom_obj != null) {
    if (!atom_obj.auxiliary && atom_obj.positive) {
      return "- Branched by putting value " + atom_obj.val + " in cell R" + (atom_obj.i+1) + "C" + (atom_obj.j+1);
    } else if (!atom_obj.auxiliary && !atom_obj.positive) {
      return "- Branched by ruling out value " + atom_obj.val + " for cell R" + (atom_obj.i+1) + "C" + (atom_obj.j+1);
    } else if (atom_obj.auxiliary && atom_obj.positive) {
      return "- Branched by setting auxiliary variable " + atom_obj.v + " to true";
    } else if (atom_obj.auxiliary && !atom_obj.positive) {
      return "- Branched by setting auxiliary variable " + atom_obj.v + " to false";
    }
  }
}

function write_decisions_to_log() {
  if (!need_to_update_graphics()) {
    return;
  }
  log = "";
  if (decisions.length == 0) {
    log = "(None..)";
  }
  for (let index = 0; index < decisions.length; ++index) {
    decision = decisions[index];
    if (decision.type == "decision") {
      log = decision_to_text(get_atom_from_lit(decision.lit)) + "..\n" + log;
    }
  }
  updateLog();
}

function need_to_update_graphics() {
  var index = document.getElementById("mode").selectedIndex;
  if (index == 0 && model_found == true) {
    return false;
  }
  return true;
}

clearLog();
write_decisions_to_log();

board_size = 6
binary_initialize_board();
binary_render_board();
board_blocked = false;
load_example_from_path("examples/asp1.lp");

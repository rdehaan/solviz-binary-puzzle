// This file is released under the MIT license.
// See LICENSE.md.

function interface_register_watch(lit, atom) {
  console.log("Interface: registered watch " + atom + " (" + lit + ")");
}

function interface_propagate(lit, atom) {
  console.log("Interface: propagate " + atom + " (" + lit + ")");
  atom_obj = parse_binary_atom(atom);
  if (atom_obj != null && atom_obj.positive) {
    binary_set_cell_value(atom_obj.i, atom_obj.j, atom_obj.val);
  }
  binary_render_board();
}

function interface_undo(lit, atom) {
  console.log("Interface: undo " + atom + " (" + lit + ")");
  atom_obj = parse_binary_atom(atom);
  if (atom_obj != null && atom_obj.positive) {
    binary_set_cell_value(atom_obj.i, atom_obj.j, null);
  }
  binary_render_board();
}

function interface_decide() {
  console.log("Interface: decide");
}

function interface_check(model) {
  console.log("Interface: check " + model);
  updateOutput();
  if (document.getElementById("pause-on-model").checked) {
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
  speed_factor = document.getElementById("speed").value;
  return speed_factor*1000;
}
function interface_wait_time_undo() {
  speed_factor = document.getElementById("speed").value;
  return speed_factor*1000;
}
function interface_wait_time_check() {
  speed_factor = document.getElementById("speed").value;
  return speed_factor*2000;
}
function interface_wait_time_on_model() {
  speed_factor = document.getElementById("speed").value;
  return speed_factor*0;
}
function interface_wait_time_decide() {
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
    }
  } else {
    return null;
  }
}

function load_binary() {
  if (!board_blocked) {
    binary_initialize_board();
    binary_input = document.getElementById("binary-input").value;
    binary_load_from_string(binary_input);
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

board_size = 6
binary_initialize_board();
binary_render_board();
board_blocked = false;
load_example_from_path("examples/simple1.lp");

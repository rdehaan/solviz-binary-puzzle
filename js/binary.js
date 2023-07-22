// This file is released under the MIT license.
// See LICENSE.md.
//
// The code in this file was inspired by:
// https://github.com/pocketjoso/sudokuJS

function binary_initialize_board() {
	board = Array()
	rendered_board = ""
	for(var j=0; j < board_size*board_size ; j++){
		board[j] = {
			val: null
		};
	}
};

function binary_render_cell(cell, id){
	var val = (cell.val === null) ? "" : cell.val;
	return "<div class='binary-board-cell'>" +
				"<input type='text' pattern='\\d*' novalidate id='input-"+id+"' value='"+val+"' disabled>" +
				"</div>";
};

function binary_render_board() {
	var htmlString = "";
	for(var i=0; i < board_size*board_size; i++){
		htmlString += binary_render_cell(board[i], i);
		if((i+1) % board_size === 0) {
			htmlString += "<br>";
		}
	}
	var board_elem = document.getElementById('binary');
	board_elem.innerHTML = htmlString;
}

function binary_set_cell_value() {
	if (arguments.length == 2) {
		cell = arguments[0];
		val = arguments[1];
	} else if (arguments.length == 3) {
		cell = arguments[0]*board_size + arguments[1];
		val = arguments[2];
	}
	board[cell].val = val;
}

function binary_get_cell_value() {
	if (arguments.length == 1) {
		cell = arguments[0];
	} else if (arguments.length == 2) {
		cell = arguments[0]*board_size + arguments[1];
	}
	return board[cell].val;
}

function binary_clear_board() {
	for(var i=0; i < board_size*board_size; i++){
		binary_set_cell_value(i,null);
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

index(1..board_size).
value(0;1).

cell(R,C) :- index(R), index(C).

% Declare variables
{ solution(R,C,V) : value(V) } :- cell(R,C).

% Each cell must contain exactly one value
:- cell(R,C), not solution(R,C,V) : value(V).
:- cell(R,C), solution(R,C,V1), solution(R,C,V2), value(V1), value(V2), V1 < V2.

% No three identical values may appear in a row
three_in_a_row(R,C,R+1,C,R+2,C) :- index(R), index(R+2), index(C).
three_in_a_row(R,C,R,C+1,R,C+2) :- index(R), index(C), index(C+2).
:- three_in_a_row(R1,C1,R2,C2,R3,C3),
    solution(R1,C1,V), solution(R2,C2,V), solution(R3,C3,V).

% Every row contains an equal number of 0's and 1's
count_index(0..board_size/2+1).
{ at_least_num_zeroes_in_row(1..board_size,0..board_size,0..board_size/2+1) }.
:- index(R), not at_least_num_zeroes_in_row(R,0,0).
:- index(R), count_index(N), N > 0, at_least_num_zeroes_in_row(R,0,N).
:- index(R), index(C), count_index(N),
    at_least_num_zeroes_in_row(R,C-1,N),
    not at_least_num_zeroes_in_row(R,C,N).
:- index(R), index(C), count_index(N), count_index(N+1),
    at_least_num_zeroes_in_row(R,C-1,N), solution(R,C,0),
    not at_least_num_zeroes_in_row(R,C,N+1).
:- index(R), index(C), count_index(N), count_index(N+1),
    not at_least_num_zeroes_in_row(R,C-1,N),
    at_least_num_zeroes_in_row(R,C,N+1).
:- index(R), index(C), count_index(N), count_index(N+1),
    at_least_num_zeroes_in_row(R,C-1,N), solution(R,C,1),
    not at_least_num_zeroes_in_row(R,C-1,N+1),
    at_least_num_zeroes_in_row(R,C,N+1).
:- index(R), index(C), count_index(N), count_index(N+1),
    not at_least_num_zeroes_in_row(R,C,N),
    at_least_num_zeroes_in_row(R,C,N+1).
:- index(R), not at_least_num_zeroes_in_row(R,board_size,board_size/2).
:- index(R), at_least_num_zeroes_in_row(R,board_size,board_size/2+1).

% Every column contains an equal number of 0's and 1's
{ at_least_num_zeroes_in_col(1..board_size,0..board_size,0..board_size/2+1) }.
:- index(C), not at_least_num_zeroes_in_col(C,0,0).
:- index(C), count_index(N), N > 0, at_least_num_zeroes_in_col(C,0,N).
:- index(C), index(R), count_index(N),
    at_least_num_zeroes_in_col(C,R-1,N),
    not at_least_num_zeroes_in_col(C,R,N).
:- index(C), index(R), count_index(N), count_index(N+1),
    at_least_num_zeroes_in_col(C,R-1,N), solution(R,C,0),
    not at_least_num_zeroes_in_col(C,R,N+1).
:- index(C), index(R), count_index(N), count_index(N+1),
    not at_least_num_zeroes_in_row(C,R-1,N),
    at_least_num_zeroes_in_row(C,R,N+1).
:- index(C), index(R), count_index(N), count_index(N+1),
    at_least_num_zeroes_in_col(C,R-1,N), solution(R,C,1),
    not at_least_num_zeroes_in_col(C,R-1,N+1),
    at_least_num_zeroes_in_col(C,R,N+1).
:- index(C), index(R), count_index(N), count_index(N+1),
    not at_least_num_zeroes_in_row(C,R,N),
    at_least_num_zeroes_in_row(C,R,N+1).
:- index(C), not at_least_num_zeroes_in_col(C,board_size,board_size/2).
:- index(C), at_least_num_zeroes_in_col(C,board_size,board_size/2+1).

% No two rows may be identical
{ rows_differ_on(R1,R2,C) : index(R1), index(R2), R1 < R2, index(C) }.
:- index(R1), index(R2), R1 < R2,
    not rows_differ_on(R1,R2,C) : index(C).
:- index(R1), index(R2), R1 < R2, value(V),
    rows_differ_on(R1,R2,C), solution(R1,C,V), solution(R2,C,V).
:- index(R1), index(R2), R1 < R2, value(V1), value(V2), V1 != V2,
    solution(R1,C,V1), solution(R2,C,V2), not rows_differ_on(R1,R2,C).

% No two columns may be identical
{ cols_differ_on(C1,C2,R) : index(C1), index(C2), C1 < C2, index(R) }.
:- index(C1), index(C2), C1 < C2,
    not cols_differ_on(C1,C2,R) : index(R).
:- index(C1), index(C2), C1 < C2, value(V),
    cols_differ_on(C1,C2,R), solution(R,C1,V), solution(R,C2,V).
:- index(C1), index(C2), C1 < C2, value(V1), value(V2), V1 != V2,
    solution(R,C1,V1), solution(R,C2,V2), not cols_differ_on(C1,C2,R).

#show solution/3.

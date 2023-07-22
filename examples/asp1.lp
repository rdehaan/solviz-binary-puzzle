index(1..board_size).
value(0;1).

cell(R,C) :- index(R), index(C).

% Each cell contains either a 0 or a 1
1 { solution(R,C,V) : value(V) } 1 :- cell(R,C).

% No three identical values may appear in a row
three_in_a_row(R,C,R+1,C,R+2,C) :- index(R), index(R+2), index(C).
three_in_a_row(R,C,R,C+1,R,C+2) :- index(R), index(C), index(C+2).
:- three_in_a_row(R1,C1,R2,C2,R3,C3),
    solution(R1,C1,V), solution(R2,C2,V), solution(R3,C3,V).

% Every row contains an equal number of 0's and 1's
:- index(R), #count { C : solution(R,C,0) } != board_size/2.

% Every column contains an equal number of 0's and 1's
:- index(C), #count { R : solution(R,C,0) } != board_size/2.

% No two rows may be identical
rows_diff(R1,R2) :- index(R1), index(R2), R1 < R2,
    index(C), solution(R1,C,V1), solution(R2,C,V2), V1 != V2.
:- index(R1), index(R2), R1 < R2, not rows_diff(R1,R2).

% No two columns may be identical
cols_diff(C1,C2) :- index(C1), index(C2), C1 < C2,
    index(R), solution(R,C1,V1), solution(R,C2,V2), V1 != V2.
:- index(C1), index(C2), C1 < C2, not cols_diff(C1,C2).

#show solution/3.

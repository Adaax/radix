/* description: Parses end executes mathematical statements. */

/* lexical grammar */
%lex
%%

(\r?\n)+                return 'NEWLINE'
\s+                   /* skip whitespace */
\t+                     return ''

"org"                   return 'ORG'

"lda"                   return 'LDA'
"sta"                   return 'STA'

"ldy"                   return 'LDY'
"sty"                   return 'STY'

"ldx"                   return 'LDX'
"stx"                   return 'STX'

"dey"                   return 'DEY'
"dex"                   return 'DEX'

"inx"                   return 'INX'
"iny"                   return 'INY'

"cmp"                   return 'CMP'

"jmp"                   return 'JMP'

"bne"                   return 'BNE'
"beq"                   return 'BEQ'

"bpl"                   return 'BPL'
"bmi"                   return 'BMI'

"bcc"                   return 'BCC'
"bcs"                   return 'BCS'

"jsr"                   return 'JSR'
"rts"                   return 'RTS'

"clc"                   return 'CLC'
"sec"                   return 'SEC'
"adc"                   return 'ADC'
"sbc"                   return 'SBC'
"and"                   return 'AND'
"eor"                   return 'EOR'

"asl"                   return 'ASL'
"lsr"                   return 'LSR'

"sed"                   return 'SED'
"cld"                   return 'CLD'

"equ"                   return 'EQU'
"byte"                  return 'BYTE'

"ldr"                   return 'LDR'

"x"                     return 'X'
"y"                     return 'Y'

"#"                     return '#'
"$"                     return '$'
"%"                     return '%'
":"                     return ':'
","                     return ','
"."                     return '.'

"("                     return '('
")"                     return ')'

<<EOF>>                 return 'EOF'

[\;][A-Za-z0-9_\-+=!\"\'\/(){}:;*<>&,\.\\[\]\| ]*  return 'COMMENT'
[A-Za-z0-9][\A-Za-z0-9_]* return 'VARIABLE'
[\"][A-Za-z0-9_\-+=!\/(){}\:;!#|*<>&?,\'\.\\[\] ]*[\"]   return 'STRING'
[\'][A-Za-z0-9_\-+=!\/(){}\:;!#|*<>&?,\"\.\\[\] ]*[\']   return 'STRING'

/lex

%start commands

%% /* language grammar */

commands
    : command
    | commands command
    ;

command
    : statement
        {$$ = doStatementCommand($1);}
    ;

statements
    : statement
    | statements statement
        {$$ = doCollateStatements($1, $2);}
    ;

statement
    : ORG '$'VARIABLE endline
        {$$ = orgAddress($3);}

    | LDA '#''$'VARIABLE endline
        {$$ = ldaValue($4);}
    | LDA '$'VARIABLE endline
        {$$ = ldaAddress($3);}
    | LDA '$'VARIABLE',' X endline
        {$$ = ldaAddressX($3);}
    | LDA '$'VARIABLE',' Y endline
        {$$ = ldaAddressY($3);}
    | LDA '(''$'VARIABLE')'',' Y endline
        {$$ = ldaIndirectY($4);}
    | LDA VARIABLE endline
        {$$ = ldaLabel($2);}
    | LDA VARIABLE',' Y endline
        {$$ = ldaLabelY($2);}
    | LDA '('VARIABLE')'',' Y endline
        {$$ = ldaIndirectYLabel($3);}

    | STA '$'VARIABLE endline
        {$$ = staAddress($3);}
    | STA '$'VARIABLE',' X endline
        {$$ = staAddressX($3);}
    | STA '$'VARIABLE',' Y endline
        {$$ = staAddressY($3);}
    | STA '(''$'VARIABLE')'',' Y endline
        {$$ = staIndirectY($4);}
    | STA VARIABLE endline
        {$$ = staLabel($2);}
    | STA VARIABLE',' Y endline
        {$$ = staLabelY($2);}
    | STA VARIABLE',' X endline
        {$$ = staLabelX($2);}
    | STA '('VARIABLE')'',' Y endline
        {$$ = staIndirectYLabel($3);}

    | LDY '#''$'VARIABLE endline
        {$$ = ldyValue($4);}
    | LDY '$'VARIABLE endline
        {$$ = ldyAddress($3);}
    | LDY VARIABLE endline
        {$$ = ldyLabel($2);}

    | STY '$'VARIABLE endline
        {$$ = styAddress($3);}
    | STY VARIABLE endline
        {$$ = styLabel($2);}

    | LDX '#''$'VARIABLE endline
        {$$ = ldxValue($4);}
    | LDX '$'VARIABLE endline
        {$$ = ldxAddress($3);}
    | LDX VARIABLE endline
        {$$ = ldxLabel($2);}

    | STX '$'VARIABLE endline
        {$$ = stxAddress($3);}

    | DEY endline
        {$$ = dey();}
    | DEX endline
        {$$ = dex();}

    | INY endline
        {$$ = iny();}
    | INX endline
        {$$ = inx();}

    | CMP '$'VARIABLE endline
        {$$ = cmpAddress($3);}
    | CMP '#''$'VARIABLE endline
        {$$ = cmpValue($4);}

    | JMP VARIABLE endline
        {$$ = jmpLabel($2);}

    | BNE VARIABLE endline
        {$$ = bneLabel($2);}
    | BEQ VARIABLE endline
        {$$ = beqLabel($2);}

    | BPL VARIABLE endline
        {$$ = bplLabel($2);}
    | BMI VARIABLE endline
        {$$ = bmiLabel($2);}

    | BCC VARIABLE endline
        {$$ = bccLabel($2);}
    | BCS VARIABLE endline
        {$$ = bcsLabel($2);}

    | JSR VARIABLE endline
        {$$ = jsrLabel($2);}
    | RTS endline
        {$$ = rts();}

    | CLC endline
        {$$ = clc();}
    | SEC endline
        {$$ = sec();}

    | ADC '$'VARIABLE endline
        {$$ = adcAddress($3);}
    | ADC '#''$'VARIABLE endline
        {$$ = adcValue($4);}
    | ADC VARIABLE endline
        {$$ = adcLabel($2);}

    | SBC '$'VARIABLE endline
        {$$ = sbcAddress($3);}
    | SBC '#''$'VARIABLE endline
        {$$ = sbcValue($4);}
    | SBC VARIABLE endline
        {$$ = sbcLabel($2);}

    | AND '$'VARIABLE endline
        {$$ = andAddress($3);}
    | AND '#''$'VARIABLE endline
        {$$ = andValue($4);}

    | EOR '$'VARIABLE endline
        {$$ = eorAddress($3);}
    | EOR '#''$'VARIABLE endline
        {$$ = eorValue($4);}

    | LSR endline
        {$$ = lsrA();}
    | ASL
        {$$ = aslA();}

    | SED endline
        {$$ = sed();}
    | CLD endline
        {$$ = cld();}

    | LDR endline
        {$$ = ldr();}


    | VARIABLE
        {$$ = defineLabel($1);}

    | VARIABLE EQU '$'VARIABLE
        {$$ = equAddress($1,$4);}

    | '.'BYTE bytes
        {$$ = byteDefines($3);}

    | endline
        {$$ = "";}
    ;

bytes
    : byte
        {$$ = byte($1);}
    | byte ',' bytes
        {$$ = doCollateBytes($1, $3);}
    ;

byte
    : '$'VARIABLE
        {$$ = regularByte($2);}
    | '%'VARIABLE
        {$$ = binaryByte($2);}
    ;

endline
    : NEWLINE
    | COMMENT NEWLINE
    | EOF
    | COMMENT EOF
    ;

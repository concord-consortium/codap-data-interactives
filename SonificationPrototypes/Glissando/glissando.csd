<CsoundSynthesizer>
<CsOptions>
-odac -d
</CsOptions>
<CsInstruments>
sr = 44100
; ksmps = 100
nchnls = 2
0dbfs = 1.0

instr 1
igain = 0.05
ipitchTable = 1

; Note: table opcode does not renew with the table update
kfreq = 440 * pow(2, scale:k(tab:k(p4, ipitchTable), 5, 0))
printk2 tab:k(p4, ipitchTable)
asig = oscil(igain, kfreq);
outs(asig, asig)
endin

</CsInstruments>
<CsScore>
</CsScore>
</CsoundSynthesizer>
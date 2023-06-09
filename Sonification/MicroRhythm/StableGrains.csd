<CsoundSynthesizer>
<CsOptions>
-odac -d
</CsOptions>
<CsInstruments>
sr = 44100
ksmps = 200   ; control rate in samples per second
nchnls = 2    ; number or channels
0dbfs = 1.0

zakinit 1, 1
gimixch = 1
turnon "MIX"

gkfreq init 1
gktrig init 0

gisaw ftgen 1, 0, 16384, 7, -1, 16384, 1

; The MASTER Instrument sets up the metronome and phasor
instr 1, MASTER
kfreq chnget "playbackSpeed" ; playbackSpeed is set by app and is a number between 0 and 1.
gkfreq = expcurve(kfreq, 50)
gkfreq = expcurve(gkfreq, 50)
gkfreq = scale(gkfreq, 5, 0.05) ; scales gkfreq to be within .05 and 5

kphase phasor gkfreq, p4
chnset kphase, "phase"

gktrig = metro(gkfreq, p4) ; generates a pulse at an interval: 0 0 0 0 1 0 0 0 0 0 1
gkclick chnget "click" ; click is set by app and is either 0 or 1
if gkclick == 1 then
    schedkwhen gktrig, 0, 0, "CLICK", 0, 0.05
endif
endin

; The SOFT Instrument actually creates sounds
instr 2, SOFT
iatk = 0.002
igain = p5 * 0.075
aenv = madsr:a(iatk, p3-iatk, 0, 0) * igain
asig oscil aenv, cpsmidinn(scale(p4,110,55))
zawm asig, gimixch
endin

instr 3, HARD
iatk = 0.002
igain = p5 * 0.025
aenv = madsr:a(iatk, p3-iatk, 0, 0) * igain
asig oscil aenv, cpsmidinn(scale(p4,110,55)), 1
zawm asig, gimixch
endin

; The CLICK instrument creates a click event every time the metronome triggers
; a restart
instr 4, CLICK
aenv = expseg(0.2, p3, 0.001)
asig noise aenv, 0
outs asig, asig
endin

; The MIX channel aggregates and limits the output volume.
instr +MIX
asig zar gimixch
zacl 0, gimixch

asig limit asig, -1, 1
outs asig, asig
endin

</CsInstruments>
<CsScore>
f0 36000
</CsScore>
</CsoundSynthesizer>

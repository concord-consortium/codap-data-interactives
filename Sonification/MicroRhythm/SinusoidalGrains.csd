<CsoundSynthesizer>
<CsOptions>
-odac -d
</CsOptions>
<CsInstruments>
sr = 44100
ksmps = 200   ; samples per second
nchnls = 2    ; number or channels
0dbfs = 1.0

zakinit 2, 1
giverbchL = 1
giverbchR = 2
turnon "VERB"

gkfreq init 1
gktrig init 0
turnon "MASTER"

; The MASTER Instrument sets up the metronome, which, in turn causes the
; continuous repeat
instr MASTER
kfreq chnget "playbackSpeed" ; playbackSpeed is set by app and is a number between 0 and 1.
gkfreq = expcurve(kfreq, 50)
gkfreq = expcurve(gkfreq, 50)
gkfreq = scale(gkfreq, 5, 0.05) ; scales gkfreq to be within .05 and 5
gktrig = metro(gkfreq) ; generates a pulse at an interval: 0 0 0 0 1 0 0 0 0 0 1

gkclick chnget "click" ; click is set by app and is either 0 or 1
if gkclick == 1 then
    schedkwhen gktrig, 0, 0, "CLICK", 0, 0.05
endif
endin

; The TRIG Instrument schedules GRAIN instrument events.
instr 1, TRIG
kdelay = p4 * 1/gkfreq
kdur = scale(p5, 0.5, 0.02)
kpitch = p6
kgain = logcurve(p7, 10)
kpan = p8
schedkwhen gktrig, 0, 0, "GRAIN", kdelay, kdur, kpitch, kgain, kpan
endin

; Unknown invocation
instr 2, KILL
turnoff2 "GRAIN", 0, 1

endin

; The GRAIN Instrument actually creates sounds
instr 3, GRAIN
iatk = 0.002
igain = p5 * 0.075
ipan = p6
aenv = madsr:a(iatk, p3-iatk, 0, p3-iatk) * igain
asig oscil aenv, cpsmidinn(scale(p4,110,55))
asigL, asigR pan2 asig, ipan
outs asigL, asigR

iverbsend = 0.1
zawm asigL * iverbsend, giverbchL
zawm asigR * iverbsend, giverbchR
endin

; The CLICK instrument creates a click event every time the metronome triggers
; a restart
instr 4, CLICK
aenv = expseg(0.2, p3, 0.001)
asig noise aenv, 0
outs asig, asig
endin

; The VERB instrument creates a bit of reverb
instr +VERB
asigL zar giverbchL
asigR zar giverbchR
zacl giverbchL, giverbchR

denorm asigL, asigR
asigL, asigR reverbsc asigL, asigR, .8, sr/2

outs asigL, asigR
endin

</CsInstruments>
<CsScore>
</CsScore>
</CsoundSynthesizer>

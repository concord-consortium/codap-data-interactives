<CsoundSynthesizer>
<CsOptions>
-odac -d
</CsOptions>
<CsInstruments>
sr = 44100
ksmps = 200
nchnls = 2
0dbfs = 1.0

zakinit 2, 1
giverbchL = 1
giverbchR = 2
turnon "VERB"

gkfreq init 0
gktrig init 0
turnon "MASTER"

instr MASTER
kfreq chnget "playbackSpeed"
gkfreq = expcurve(kfreq, 50)
gkfreq = expcurve(gkfreq, 50)
gkfreq = scale(gkfreq, 25, 0.1)
gktrig = metro(gkfreq)

gkclick chnget "click"
if gkclick == 1 then
    schedkwhen gktrig, 0, 0, "CLICK", 0, 0.05
endif
endin

instr 1, TRIG
kdelay = p4 * 1/gkfreq
kdur = scale(p5, 0.5, 0.02)
kpitch = p6
kgain = logcurve(p7, 10)
kpan = p8
schedkwhen gktrig, 0, 0, "GRAIN", kdelay, kdur, kpitch, kgain, kpan
endin

instr 2, KILL
turnoff2 "GRAIN", 0, 1
endin

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

instr 4, CLICK
aenv = expseg(0.2, p3, 0.001)
asig noise aenv, 0
outs asig, asig
endin

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
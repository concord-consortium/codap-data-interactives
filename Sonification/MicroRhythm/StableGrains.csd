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

kclick chnget "click" ; The click instrument is enabled by the app and is either 0 or 1.
iphasesubdiv = 3 ; A playback cycle is equally divided into 3 phase "regions."
ktrig = trigger((kphase * iphasesubdiv) % 1, 0.5, 1) ; Trigger the click 3 times per cycle.
knumclicks = floor(kphase * iphasesubdiv) + 1 ; Each time triggered, the click may quickly repeat N times.

if kclick == 1 && (ktrig == 1 || kphase == 0) then
    kidx = 0
    loop: ; A for-loop that plays the click 1, 2, or 3 times depending on the current phase region.
        koffset = kidx * 0.125
        event "i", "CLICK", koffset, 0.05
    loop_lt kidx, 1, knumclicks, loop
endif
endin

; The SOFT Instrument actually creates sounds
instr 2, SOFT
iatk = 0.002
knotenum = scale(p4, 110, 55)
ilowboost = (110 - i(knotenum)) / 55 * 0.5
igain = (p5 + ilowboost) * 0.075
aenv = madsr:a(iatk, p3-iatk, 0, 0) * igain
asig oscil aenv, cpsmidinn(knotenum)
zawm asig, gimixch
endin

instr 3, HARD
iatk = 0.002
knotenum = scale(p4, 110, 55)
ilowboost = (110 - i(knotenum)) / 55 * 0.5
igain = (p5 + ilowboost) * 0.025
aenv = madsr:a(iatk, p3-iatk, 0, 0) * igain
asig oscil aenv, cpsmidinn(knotenum), 1
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

<CsoundSynthesizer>
<CsOptions>
-odac -d
</CsOptions>
<CsInstruments>
sr = 44100
ksmps = 100
nchnls = 2
0dbfs = 1.0

turnon "MASTER"

instr MASTER
kfreq chnget "playbackSpeed"
gkfreq = expcurve(kfreq, 50)
gkfreq = expcurve(gkfreq, 50)
gkfreq = scale(gkfreq, 25, 0.1)
gktrig = metro(gkfreq)
endin

opcode KICK, a, 0
iDecay = 0.1
iGain = random:i(0.8,1)
aAmp = madsr:a(0.02,iDecay,0,iDecay) * iGain
kFreq = expseg:k(3000,iDecay*0.5,100)
asig = oscil(aAmp,kFreq)
xout asig
endop

opcode HAT, a, k
kcof xin
iGain = random:i(0.8,1)
iDecay = 0.1
aAmp = madsr:a(0.001,iDecay,0,iDecay) * iGain
asig = reson(noise(aAmp, 0), scale(kcof, 10000, 50), 1000)
xout asig
endop

instr 1, TRIG
; ..., name, delay, duration, pitch, gain
schedkwhen gktrig, 0, 0, "GRAIN", p4 * 1/gkfreq, 0.1, p5, logcurve(p6, 30)
endin

instr GRAIN
imod = p4
kcross = expcurve(p4,20)
igain = p5 * 0.075
asig = (KICK() * (1-kcross) + HAT(imod) * kcross) * igain
outs(asig,asig)
endin

</CsInstruments>
<CsScore>
</CsScore>
</CsoundSynthesizer>
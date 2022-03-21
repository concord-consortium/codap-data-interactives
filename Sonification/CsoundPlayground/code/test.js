cs.compile(`
zakinit 4, 1
gidelchL = 1
gidelchR = 2
giverbchL = 3
giverbchR = 4

gift ftgen 1,0,8192,10,1,0,1,0,1,0,1

maxalloc 1, 500

instr 1
kfreq = scale(p4,20,1)
knn = scale(p5,110,60)
kpan = p6
kgain = p7
schedkwhen metro(kfreq),0,0,2,0,1/kfreq,knn,kpan,kgain
endin

instr 2
igain = 0.5 * p6
knn = p4
asig oscil igain * madsr(0.001, p3/2, 0, 0), cpsmidinn(knn), gift
asigL, asigR pan2 asig, p5
outs asigL, asigR

iverbsend = .5
zawm asigL * iverbsend, giverbchL
zawm asigR * iverbsend, giverbchR
endin

turnon "VERB"
instr +VERB
asigL zar giverbchL
asigR zar giverbchR
zacl giverbchL, giverbchR

denorm asigL, asigR
asigL, asigR reverbsc asigL, asigR, .8, sr/2

outs asigL, asigR
endin
`);

CsInterface.selectionCallback = ()=> {
  cs.halt(null,'VERB').then(()=>{
    let values = data.getNormalizedSelectedValues()
    values.forEach((v, i) => {
      let speed = v[2];
      let pitch = v[1];
      let pan = v[0];
      let start = Math.random()/10;
      cs.event(`i1.${i} ${start} -1 ${speed} ${pitch} ${pan} ${1/Math.sqrt(values.length)}`)
    })
  })
}
# CODAP Csound Playground
On Mac: 
- `CMD + Enter` to evaluate.
- `CMD + .` to stop all sounds.

On PC:
Untested yet (sorry!)

## API
The smallest audio example that does not utilize CODAP data may look like this:
```javascript
// Orchestra definitions
cs.compile(`
instr 1
asig oscil 0.3, scale(p4, 880, 440)
outs asig, asig
endin
`);

// Score statements
cs.event(`
i1 0 3 ${Math.random()}
`);
```

```javascript
cs.table(tableNum, float32Array).then(_ => { console.log('table ready'); });
```

```javascript
cs.halt().then(_ => { // Do something. });
```

You can use the following keywords: `selection`, `select`, or `sel`.
```javascript
codap.on('selection', items => {
    items.forEach(item => {
        cs.event(`i1 0 3 ${item['attrName']}`)
    });
});
```

```javascript
codap.on('change', document => {

});
```

```javascript
print(someVariable);
```
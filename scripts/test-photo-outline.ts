import assert from 'node:assert/strict'
import { photoOutline } from '../src/lib/photo-outline'
const width=16, height=16
const pixels=new Uint8ClampedArray(width*height*4).fill(255)
for(let y=4;y<12;y++) for(let x=4;x<12;x++) {
  const i=(y*width+x)*4
  pixels[i]=pixels[i+1]=pixels[i+2]=0
}
const result=photoOutline(pixels,width,height)
let black=0,white=0
for(let i=0;i<result.length;i+=4) {
  assert.ok(result[i]===0||result[i]===255)
  assert.equal(result[i],result[i+1]);assert.equal(result[i+1],result[i+2]);assert.equal(result[i+3],255)
  if(result[i]===0)black++;else white++
}
assert.ok(black>0&&white>black)
assert.equal(result[(8*width+8)*4],255,'Solid subject interior stays open for coloring')
assert.throws(()=>photoOutline(new Uint8ClampedArray(3),1,1))
console.log(`photo outline PASS: ${black} edge pixels; ${white} white pixels; no network calls`)

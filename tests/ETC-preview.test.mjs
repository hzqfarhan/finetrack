import {test} from 'node:test';
import assert from 'node:assert/strict';
import {presentationPreviews} from '../app/presentation-preview.mjs';
const slides=[{label:'Intro',heading:'FineTrack Duo',text:'Welcome',scene:'welcome'},{label:'Demo',scene:'room'},{label:'Benefits',scene:'single'}];
const steps=[['Ready','',{line:'Where are my keys?',setting:'home'}],['Found','',{line:'Found them',setting:'home'}]];
test('preview follows demo moments before advancing to another slide',()=>{
 let view=presentationPreviews(slides,1,steps,0);
 assert.equal(view.current.moment,1);assert.equal(view.next.number,2);assert.equal(view.next.moment,2);assert.equal(view.next.dialogue,'Found them');
 view=presentationPreviews(slides,1,steps,1);assert.equal(view.next.number,3);assert.equal(view.next.moment,undefined);
 view=presentationPreviews(slides,2,steps);assert.equal(view.next.number,1);assert.equal(view.next.heading,'FineTrack Duo');
});

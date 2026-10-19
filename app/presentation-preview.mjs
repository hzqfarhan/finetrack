export function previewForSlide(slide,index,demoSteps,phase=0){
 const story=slide.scene==='room'?demoSteps[phase]:null;
 return {number:index+1,label:slide.label,heading:slide.heading,text:slide.text,scene:slide.scene||'single',colour:slide.colour||'Graphite',benefits:slide.benefits||null,detail:slide.detail||null,...(story?{moment:phase+1,momentTitle:story[0],dialogue:story[2].line,setting:story[2].setting}:{} )};
}
export function presentationPreviews(slides,index,demoSteps,phase=0){
 const current=previewForSlide(slides[index],index,demoSteps,phase);
 const next=slides[index].scene==='room'&&phase<demoSteps.length-1
  ?previewForSlide(slides[index],index,demoSteps,phase+1)
  :previewForSlide(slides[(index+1)%slides.length],(index+1)%slides.length,demoSteps);
 return {current,next};
}

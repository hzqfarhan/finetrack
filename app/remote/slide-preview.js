'use client';
export default function SlidePreview({slide,effect,part}){
 if(!slide)return <div className="slide-preview preview-empty">Waiting for the screen…</div>;
 const image=slide.scene==='qr'?'/join-qr.png':slide.scene==='ios'?'/find-my.png':slide.scene==='android'?'/find-hub.png':'/product.png';
 const photo=!['qr','ios','android','room','map','thanks'].includes(slide.scene);
 return <figure className={`slide-preview preview-${slide.scene}`} aria-label={`Slide ${slide.number}: ${slide.label}`}>
  <div className="preview-brand">UGREEN <span>FineTrack Duo</span></div>
  <h3>{slide.heading||slide.label}</h3>
  <p className="preview-copy">{slide.text}</p>
  {slide.scene==='room'?<div className="preview-story"><span>{slide.setting==='home'?'HOME · KEYS':slide.setting==='cafe'?'CAFÉ · BAG':'TERMINAL · LUGGAGE'}</span><strong>{slide.momentTitle}</strong><p>“{slide.dialogue}”</p><small>Moment {slide.moment} / 16</small></div>
  :slide.scene==='map'?<div className="preview-map"><span>⌖</span><strong>Sample location map</strong><small>Location illustration</small></div>
  :slide.scene==='thanks'?<div className="preview-thanks">Thank you.</div>
  :<img src={image} alt={photo?'FineTrack product reference':slide.scene==='qr'?'Audience QR code':`${slide.label} app icon`} loading="lazy"/>}
  {slide.benefits&&<ul>{slide.benefits.map(([label])=><li key={label}>{label}</li>)}</ul>}
  {part&&<span className="preview-part">Highlight: {part}</span>}
  {photo&&<small className="preview-reference">Product reference{slide.colour!=='Graphite'?` · ${slide.colour} concept on stage`: ''}</small>}
  {effect?.spotlight&&<div className="preview-dim"/>}
  {effect?.question&&<div className="preview-cover">Questions?<small>What would you attach yours to?</small></div>}
  {effect?.curtain&&<div className="preview-cover preview-curtain">Curtain closed</div>}
  {effect?.blank&&<div className="preview-cover preview-blank">Screen blanked</div>}
  <figcaption>{String(slide.number).padStart(2,'0')} · {slide.label}</figcaption>
 </figure>
}

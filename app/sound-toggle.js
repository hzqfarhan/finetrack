 'use client';
export default function SoundToggle({muted,onToggle,disabled=false}){
 return <button type="button" className="sound-toggle" role="switch" aria-label="Presentation sound" aria-checked={!muted} disabled={disabled} onClick={onToggle}><span>Sound</span><span className="sound-toggle-track" aria-hidden="true"><span/></span><span className="sound-toggle-state" aria-hidden="true">{muted?'Off':'On'}</span></button>
}

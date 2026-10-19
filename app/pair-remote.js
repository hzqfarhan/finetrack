'use client';
import {useEffect,useState} from 'react';
import QRCode from 'qrcode';
export default function PairRemote({remote,onClose,onStop}){
 const [qr,setQr]=useState(''),[url,setUrl]=useState(''),[copied,setCopied]=useState(false);
 useEffect(()=>{if(!remote.pair)return;const base=process.env.NEXT_PUBLIC_ETC_REMOTE_URL||(location.protocol==='http:'?`${location.origin}/remote/`:'https://etcremote.seladevs.my/');const link=new URL(base);link.hash=new URLSearchParams({room:remote.pair.room,key:remote.pair.key}).toString();setUrl(link.href);let active=true;QRCode.toDataURL(link.href,{width:300,margin:2}).then(data=>{if(active)setQr(data)});return()=>{active=false}},[remote.pair]);
 return <div className="pair-backdrop"><section className="pair-panel" role="dialog" aria-modal="true" aria-labelledby="pair-title">
  <button className="pair-close" onClick={onClose} aria-label="Close remote pairing">✕</button><p className="remote-eyebrow">PRESENTER ACCESS</p><h2 id="pair-title">Your phone is the remote.</h2>
  <p>Scan this private link with your phone. Keep this pairing screen off the audience display.</p>
  {remote.status==='connected'&&qr?<><img src={qr} width="260" height="260" alt="Scan to pair your phone remote"/><p>{remote.count?`${remote.count} remote connected`:'Waiting for your phone…'}</p><button onClick={async()=>{try{await navigator.clipboard.writeText(url);setCopied(true)}catch{setCopied(false)}}}>{copied?'Copied':'Copy private remote link'}</button><a className="remote-open-link" href={url} target="_blank" rel="noreferrer">Open remote on this device ↗</a>{location.hostname==='127.0.0.1'||location.hostname==='localhost'?<small>For a physical phone, open the presentation using this computer’s Wi-Fi address first. Localhost only works on this computer.</small>:null}</>:<p role="status">{remote.status==='connecting'?'Connecting to Supabase…':remote.error||'Starting remote session…'}</p>}
  {remote.error&&<p role="alert">{remote.error}</p>}<div className="pair-actions"><button onClick={onClose}>Back to presentation</button><button onClick={onStop}>End remote session</button></div>
 </section></div>
}

'use client'
import { useAuth } from '@payloadcms/ui'
import { useEffect, useState } from 'react'
const labels: Record<string,string> = {
  disabled:'Website publishing is not connected yet.', idle:'Ready for the first website update.',
  queued:'Waiting for a website update…', building:'Building the website. The previous version stays available.',
  failed:'Website update failed. The previous version is still available.',
  restored:'Website restored to an earlier version. Automatic publishing is paused.',
  published:'The website is up to date.', preview:'Local website preview is ready. The public website has not changed.',
}
export function PublicationStatus() {
  const {user}=useAuth()
  const [state,setState]=useState<{status:string;websiteURL?:string;updatedAt?:string}|null>(null)
  const [busy,setBusy]=useState(false)
  const [error,setError]=useState('')
  const load=async()=>{try{const r=await fetch('/api/website-publication',{credentials:'same-origin'});if(r.ok)setState(await r.json())}catch{}}
  useEffect(()=>{void load();const id=setInterval(()=>{if(!document.hidden)void load()},5000);return()=>clearInterval(id)},[])
  return <section className="publication-status" aria-label="Website publication">
    <h2>Website publication</h2>{error && <p role="alert">{error}</p>}<p role="status">{state ? labels[state.status] || 'Checking publication status…' : 'Checking publication status…'}</p>
    {state?.updatedAt && <p>Last website update: {new Date(state.updatedAt).toLocaleString()}</p>}
    {['published','preview','restored'].includes(state?.status||'') && state?.websiteURL && <a href={state.websiteURL+'/blog'} target="_blank" rel="noreferrer">Open website ↗</a>}
    {['publisher','admin'].includes(user?.role||'') && ['failed','idle'].includes(state?.status||'') &&
      <button type="button" disabled={busy} onClick={async()=>{setBusy(true);setError('');try{const response=await fetch('/api/website-publication/retry',{method:'POST'});if(!response.ok)throw new Error();await load()}catch{setError('The update could not be queued. Please try again.')}finally{setBusy(false)}}}>{busy?'Requesting…':'Retry website update'}</button>}
  </section>
}

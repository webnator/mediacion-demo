import { marked } from 'marked';
import sanitize from 'sanitize-html';
export function renderBody(body:string){return sanitize(marked.parse(body,{async:false}),{allowedTags:sanitize.defaults.allowedTags.concat(['img']),allowedAttributes:{...sanitize.defaults.allowedAttributes,img:['src','alt','width','height','loading']},allowedSchemes:['https','http','mailto']});}
export function embedUrl(value:string):string|null {
 try { const u=new URL(value); if(u.protocol!=='https:')return null;
 let id=''; if(u.hostname==='youtu.be')id=u.pathname.slice(1);
 if(['youtube.com','www.youtube.com'].includes(u.hostname)) id=u.searchParams.get('v') || (/^\/(embed|shorts)\//.test(u.pathname)?u.pathname.split('/')[2]:'');
 if(/^[\w-]{11}$/.test(id))return `https://www.youtube-nocookie.com/embed/${id}`;
 if(u.hostname==='open.spotify.com' && /^\/(episode|show)\/[a-zA-Z0-9]+\/?$/.test(u.pathname))return `https://open.spotify.com/embed${u.pathname}`;
 return null;
 } catch{return null;}
}

function sha256(ascii){
  const enc=new TextEncoder();
  return crypto.subtle.digest('SHA-256',enc.encode(ascii)).then(buf=>{
    return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');
  });
}
async function login(user,pass){
  const hp=await sha256(pass);
  const r=await fetch(GAS_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'login',username:user,passwordHash:hp})});
  const j=await r.json();
  if(j.ok){localStorage.setItem('token',j.token);localStorage.setItem('user',JSON.stringify(j.user));return true}
  return false;
}
function logout(){localStorage.removeItem('token');localStorage.removeItem('user');location.href='login.html'}
function getUser(){try{return JSON.parse(localStorage.getItem('user')||'null')}catch(e){return null}}
function requireAuth(){const u=getUser();if(!u)location.href='login.html';return u}

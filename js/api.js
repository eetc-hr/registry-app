async function api(action,payload={}){
  const token=localStorage.getItem('token');
  const r=await fetch(GAS_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...payload,action,token})});
  return r.json();
}

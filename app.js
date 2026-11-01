const ATTRIBUTE_NAMES = ['Físico', 'Mente', 'Emoção', 'Sorte', 'Conhecimento', 'Percepção'];
const SKILL_NAMES = ['Acrobacia','Atletismo','Luta','Pontaria','Furtividade','Crime','Vigor','Investigação','História','Medicina','Ocultismo','Sobrevivência','Natureza','Intuição','Persuasão','Enganação','Intimidação','Disciplina','Empatia','Animais','Ofício','Inspecionar'];
const STORAGE_KEY = 'threshold-character-archive-v1';
let currentPortrait = '';
let currentCharacter = null;
let attributes = Object.fromEntries(ATTRIBUTE_NAMES.map(n => [n, 0]));

const $ = (selector, root=document) => root.querySelector(selector);
const $$ = (selector, root=document) => [...root.querySelectorAll(selector)];

function renderAttributes(){
  const container = $('#attributes');
  container.innerHTML = ATTRIBUTE_NAMES.map((name, i) => `<div class="attribute-row"><span>${name}</span><button type="button" aria-label="Diminuir ${name}" data-attr="${i}" data-delta="-1">−</button><output id="attr-${i}">${attributes[name]}</output><button type="button" aria-label="Aumentar ${name}" data-attr="${i}" data-delta="1">＋</button></div>`).join('');
  updatePoints();
}
function updatePoints(){
  const total = Object.values(attributes).reduce((sum, value) => sum + value, 0);
  $('#pointsLeft').textContent = 6 - total;
  $('#pointsLeft').classList.toggle('over-limit', total > 6);
  $$('#attributes button[data-delta="1"]').forEach(button => button.disabled = total >= 6 || attributes[ATTRIBUTE_NAMES[button.dataset.attr]] >= 6);
  $$('#attributes button[data-delta="-1"]').forEach(button => button.disabled = attributes[ATTRIBUTE_NAMES[button.dataset.attr]] <= 0);
}
function renderSkills(){
  $('#skills').innerHTML = SKILL_NAMES.map(skill => `<label><input type="checkbox" name="skills" value="${skill}"> ${skill}</label>`).join('');
}
function getFormData(){
  const form = $('#characterForm');
  const data = Object.fromEntries(new FormData(form).entries());
  data.skills = $$('input[name="skills"]:checked', form).map(input => input.value);
  data.attributes = {...attributes};
  data.portrait = currentPortrait;
  data.villageStatus = $('input[name="villageStatus"]:checked', form)?.value || 'resident';
  data.createdAt = new Date().toISOString();
  data.id = currentCharacter?.id || crypto.randomUUID?.() || String(Date.now());
  return data;
}
function validatePoints(){ return Object.values(attributes).reduce((sum,v)=>sum+v,0) === 6; }
function escapeHTML(value=''){return String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));}
function makeRenderedSheet(data){
  const portrait = data.portrait ? `<img src="${data.portrait}" alt="Retrato">` : `<div class="card-no-image">✦</div>`;
  const attrs = ATTRIBUTE_NAMES.map(name => `<div class="render-stat">${escapeHTML(name)}<b>${Number(data.attributes?.[name]||0)}</b></div>`).join('');
  const skills = (data.skills?.length ? data.skills : ['Nenhuma perícia selecionada']).map(escapeHTML).join('<br>');
  const village = data.villageStatus === 'newcomer' ? `Chegando recentemente${data.arrivalReason ? ': '+escapeHTML(data.arrivalReason) : ''}` : `Morador${data.villageRole ? ' — '+escapeHTML(data.villageRole) : ''}${data.villageNote ? '<br>'+escapeHTML(data.villageNote) : ''}`;
  return `<div class="rendered-sheet" id="exportSheet"><div class="render-head">${portrait}<div><h2>${escapeHTML(data.name||'Personagem sem nome')}</h2><div class="render-sub">${escapeHTML(data.title||'')} · Nível ${escapeHTML(data.level||'1')}</div><p>Jogador(a): ${escapeHTML(data.player||'—')}<br>Origem: ${escapeHTML(data.origin||'—')} · Ocupação: ${escapeHTML(data.occupation||'—')}</p></div></div><div class="render-columns"><section class="render-box"><h3>Atributos</h3><div class="render-stats">${attrs}</div></section><section class="render-box"><h3>Perícias</h3><div class="render-skills">${skills}</div></section><section class="render-box"><h3>História e conceito</h3><p>${escapeHTML(data.backstory||'Ainda não informado.')}</p></section><section class="render-box"><h3>Equipamentos</h3><p>${escapeHTML(data.equipment||'Ainda não informado.')}</p></section><section class="render-box"><h3>Características especiais</h3><p>${escapeHTML(data.traits||'Nenhuma característica especial informada.')}</p></section><section class="render-box"><h3>Vida e determinação</h3><p>Vida: ${escapeHTML(data.health||'0')} · Determinação: ${escapeHTML(data.resolve||'0')}</p><p>Arma principal: ${escapeHTML(data.weapon||'—')}<br>Arma secundária: ${escapeHTML(data.weapon2||'—')}</p></section><section class="render-box"><h3>Vínculo com a vila</h3><p>${village}</p></section></div><div class="render-footer">THE THRESHOLD · Ficha de personagem</div></div>`;
}
function showPreview(data){
  $('#sheetPreview').innerHTML = makeRenderedSheet(data);
  $('#previewDialog').showModal();
}
function getArchive(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]')}catch{return []}}
function saveArchive(items){localStorage.setItem(STORAGE_KEY,JSON.stringify(items));}
function showToast(message){const toast=document.createElement('div');toast.className='toast';toast.textContent=message;document.body.append(toast);setTimeout(()=>toast.remove(),2600)}
function renderArchive(){
  const query = ($('#searchCharacters').value||'').toLowerCase().trim();
  const items = getArchive().filter(item => [item.name,item.player,item.occupation,item.title].join(' ').toLowerCase().includes(query));
  $('#characterArchive').innerHTML = items.map(item => `<article class="character-card">${item.portrait?`<img src="${item.portrait}" alt="Retrato de ${escapeHTML(item.name)}">`:`<div class="card-no-image">✦</div>`}<div class="card-body"><h3>${escapeHTML(item.name||'Sem nome')}</h3><p>${escapeHTML(item.title||item.occupation||'Personagem')}</p><p>Nível ${escapeHTML(item.level||'1')} · ${escapeHTML(item.player||'Jogador não informado')}</p><div class="card-actions"><button class="btn secondary" data-open="${item.id}">Ver ficha</button><button class="btn secondary" data-delete="${item.id}">Excluir</button></div></div></article>`).join('');
  $('#emptyArchive').hidden = items.length > 0;
}
function resetForm(){
  currentPortrait='';currentCharacter=null;attributes=Object.fromEntries(ATTRIBUTE_NAMES.map(n=>[n,0]));
  $('#portraitPreview').hidden=true;$('#portraitPreview').src='';$('#portraitPlaceholder').hidden=false;
  renderAttributes();$('#villageDetails').hidden=false;$('#arrivalDetails').hidden=true;
}

$('#attributes').addEventListener('click',event=>{
  const button=event.target.closest('button[data-attr]');if(!button)return;
  const name=ATTRIBUTE_NAMES[Number(button.dataset.attr)];const next=attributes[name]+Number(button.dataset.delta);
  if(next<0||next>6)return;
  const total=Object.values(attributes).reduce((sum,v)=>sum+v,0);
  if(button.dataset.delta==='1'&&total>=6)return;
  attributes[name]=next;$('#attr-'+button.dataset.attr).textContent=next;updatePoints();
});
$('#portraitInput').addEventListener('change',event=>{
  const file=event.target.files?.[0];if(!file)return;
  if(!file.type.startsWith('image/')){showToast('Escolha um arquivo de imagem.');return;}
  const reader=new FileReader();reader.onload=()=>{currentPortrait=reader.result;$('#portraitPreview').src=currentPortrait;$('#portraitPreview').hidden=false;$('#portraitPlaceholder').hidden=true;};reader.readAsDataURL(file);
});
$$('input[name="villageStatus"]').forEach(radio=>radio.addEventListener('change',()=>{
  const newcomer=radio.value==='newcomer'&&radio.checked;$('#villageDetails').hidden=newcomer;$('#arrivalDetails').hidden=!newcomer;
}));
$('#characterForm').addEventListener('submit',event=>{
  event.preventDefault();if(!validatePoints()){showToast('Distribua exatamente os 6 pontos de atributo antes de continuar.');return;}
  currentCharacter=getFormData();showPreview(currentCharacter);
});
$('#characterForm').addEventListener('reset',()=>setTimeout(resetForm,0));
$('#closePreview').addEventListener('click',()=>$('#previewDialog').close());
$('#downloadPng').addEventListener('click',async()=>{
  const sheet=$('#exportSheet');if(!sheet)return;
  try{
    const canvas=await htmlToCanvas(sheet);const link=document.createElement('a');link.download=`ficha-${(currentCharacter?.name||'personagem').toLowerCase().replace(/[^a-z0-9]+/g,'-')}.png`;link.href=canvas.toDataURL('image/png');link.click();
  }catch(error){console.error(error);showToast('Não foi possível gerar a imagem. Tente novamente.');}
});
$('#publishCharacter').addEventListener('click',()=>{
  if(!currentCharacter)return;const archive=getArchive();const index=archive.findIndex(item=>item.id===currentCharacter.id);if(index>=0)archive[index]=currentCharacter;else archive.unshift(currentCharacter);saveArchive(archive);renderArchive();$('#previewDialog').close();showView('archive');showToast('Ficha salva no arquivo deste navegador.');
});
$('#searchCharacters').addEventListener('input',renderArchive);
$('#characterArchive').addEventListener('click',event=>{
  const open=event.target.closest('[data-open]');const del=event.target.closest('[data-delete]');
  if(open){const item=getArchive().find(x=>x.id===open.dataset.open);if(item){currentCharacter=item;showPreview(item);}}
  if(del&&confirm('Excluir esta ficha do arquivo deste navegador?')){saveArchive(getArchive().filter(x=>x.id!==del.dataset.delete));renderArchive();showToast('Ficha excluída.');}
});
function showView(view){
  $$('.view').forEach(section=>section.hidden=true);$('#'+view+'View').hidden=false;
  $$('.nav-btn').forEach(button=>button.classList.toggle('active',button.dataset.view===view));if(view==='archive')renderArchive();window.scrollTo({top:0,behavior:'smooth'});
}
$$('.nav-btn').forEach(button=>button.addEventListener('click',()=>showView(button.dataset.view)));
$('#newCharacter').addEventListener('click',()=>showView('create'));

// Lightweight DOM-to-canvas renderer for the generated character sheet (no third-party dependency).
async function htmlToCanvas(element){
  const clone=element.cloneNode(true);clone.style.width='820px';clone.style.position='fixed';clone.style.left='-10000px';clone.style.top='0';clone.style.background='#f8f0df';document.body.append(clone);
  const width=clone.scrollWidth,height=clone.scrollHeight;const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><foreignObject width="100%" height="100%">${new XMLSerializer().serializeToString(clone)}</foreignObject></svg>`;
  const blob=new Blob([svg],{type:'image/svg+xml;charset=utf-8'});const url=URL.createObjectURL(blob);const img=new Image();
  try{await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=reject;img.src=url;});const canvas=document.createElement('canvas');canvas.width=width*2;canvas.height=height*2;const ctx=canvas.getContext('2d');ctx.scale(2,2);ctx.fillStyle='#f8f0df';ctx.fillRect(0,0,width,height);ctx.drawImage(img,0,0,width,height);return canvas;}finally{URL.revokeObjectURL(url);clone.remove();}
}
renderAttributes();renderSkills();renderArchive();

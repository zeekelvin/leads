// ══════════════════════════════════════════════════════
// STATE
// ══════════════════════════════════════════════════════
let state = {
  leads: [],
  selectedLead: null,
  workingLead: null,
  currentView: 'leads',
  filters: {},
  activity: {}, // leadId -> {stages:{stageId:{value,note,timestamp}}, history:[], visitedAt, lastVisitedAt, visitCount}
  settings: {name:'',email:'',phone:'',company:'ZagaPrime'},
  savedSearches: [], // [{id,name,desc,filters,timestamp}]
  searchHistory: [], // [{query,filters,resultCount,timestamp}]
  activeQuickFilter: null, // 'all'|'hot'|'worked'|'inprogress'|'won'
  findResults: [],
  findSearchMeta: null
};

// ══════════════════════════════════════════════════════
// STORAGE
// ══════════════════════════════════════════════════════
function saveToLS(){
  try{
    localStorage.setItem('zp_leads',JSON.stringify(state.leads));
    localStorage.setItem('zp_activity',JSON.stringify(state.activity));
    localStorage.setItem('zp_settings',JSON.stringify(state.settings));
    localStorage.setItem('zp_saved_searches',JSON.stringify(state.savedSearches));
    localStorage.setItem('zp_search_history',JSON.stringify(state.searchHistory.slice(0,100)));
  }catch(e){console.warn('Storage error',e);}
}
function loadFromLS(){
  try{
    const l=localStorage.getItem('zp_leads');
    const a=localStorage.getItem('zp_activity');
    const s=localStorage.getItem('zp_settings');
    const ss=localStorage.getItem('zp_saved_searches');
    const sh=localStorage.getItem('zp_search_history');
    if(l) state.leads=JSON.parse(l);
    else state.leads=[...INITIAL_LEADS];
    if(a) state.activity=JSON.parse(a);
    if(s) state.settings=JSON.parse(s);
    if(ss) state.savedSearches=JSON.parse(ss);
    if(sh) state.searchHistory=JSON.parse(sh);
  }catch(e){state.leads=[...INITIAL_LEADS];}
}

// ══════════════════════════════════════════════════════
// RENDER LEADS
// ══════════════════════════════════════════════════════
function getFilteredLeads(){
  const s=document.getElementById('f-search').value.toLowerCase();
  const st=document.getElementById('f-state').value;
  const co=document.getElementById('f-county').value;
  const ci=document.getElementById('f-city').value;
  const ca=document.getElementById('f-category').value;
  const ti=document.getElementById('f-tier').value;
  const ws=document.getElementById('f-web').value;
  const qf=state.activeQuickFilter;
  return state.leads.filter(l=>{
    // Quick filter takes priority
    if(qf&&qf!=='all'){
      const act=state.activity[l.id]||{};
      const stages=act.stages||{};
      const worked=Object.keys(stages).length>0;
      const won=stages.decision&&stages.decision.value==='won';
      const inProgress=worked&&stages.first_call&&!won;
      if(qf==='hot'&&l.tier!==1)return false;
      if(qf==='worked'&&!worked)return false;
      if(qf==='inprogress'&&!inProgress)return false;
      if(qf==='won'&&!won)return false;
    }
    if(s&&!(l.name+l.category+l.city+l.pitchAngle+l.notes+'').toLowerCase().includes(s))return false;
    if(st&&l.state!==st)return false;
    if(co&&l.county!==co)return false;
    if(ci&&l.city!==ci)return false;
    if(ca&&l.category!==ca)return false;
    if(ti&&String(l.tier)!==ti)return false;
    if(ws&&l.websiteStatus!==ws)return false;
    return true;
  });
}

function renderLeads(){
  const leads=getFilteredLeads();
  document.getElementById('filter-count').textContent=`${leads.length} lead${leads.length!==1?'s':''}`;
  document.getElementById('nav-leads-count').textContent=leads.length;
  const grid=document.getElementById('leads-grid');
  if(!leads.length){grid.innerHTML=`<div class="empty" style="grid-column:1/-1"><div class="empty-icon">🔍</div><div class="empty-text">No leads match your filters</div></div>`;return;}
  grid.innerHTML=leads.map(l=>{
    const act=state.activity[l.id]||{};
    const stages=act.stages||{};
    const stagesDots=STAGES_DEF.map(s=>{
      const sv=stages[s.id];
      let cls='stage-dot';
      if(sv){const opt=s.options.find(o=>o.v===sv.value);if(opt){if(opt.t==='success')cls+=' done';else if(opt.t==='fail')cls+=' fail';else cls+=' active-s';}}
      return `<div class="${cls}" title="${s.label}"></div>`;
    }).join('');
    const worked=Object.keys(stages).length>0;
    const visited=(act.visitCount||0)>0;
    const wsMap={none:'b-red No Website',broken:'b-red Broken Site',outdated:'b-amber Outdated',has_site:'b-green Has Site'};
    const wsParts=(wsMap[l.websiteStatus]||'b-gray Unknown').split(' ');
    const wsClass=wsParts[0];const wsLabel=wsParts.slice(1).join(' ');
    const tierColors=['','b-red','b-amber','b-blue'];
    const tierLabels=['','T1 Hot','T2 Warm','T3 Long'];
    // Determine highlight state
    const decisionStage=stages.decision;
    const isWon=decisionStage&&decisionStage.value==='won';
    const isInProgress=worked&&!isWon&&stages.first_call;
    const isNewWorked=worked&&!isInProgress&&!isWon;
    const isNew=!worked;
    let highlightClass='';
    if(isWon) highlightClass=' won-card';
    else if(isInProgress) highlightClass=' in-progress';
    else if(isNewWorked) highlightClass=' worked-card';
    else if(visited) highlightClass=' visited-card';
    else if(isNew) highlightClass=' new-card';
    const visitLabel=visited?`<span class="badge b-gray" title="Viewed ${act.visitCount} time${act.visitCount!==1?'s':''}">${act.visitCount}x viewed</span>`:'<span class="badge b-gray">New</span>';
    const statusBadge=isWon?'<span class="badge b-green">Won</span>':isInProgress?'<span class="badge b-amber">In Progress</span>':worked?'<span class="badge b-cyan">Worked</span>':visitLabel;
    return `<div class="lead-card t${l.tier}${state.selectedLead===l.id?' selected':''}${highlightClass}" onclick="selectLead('${l.id}')">
      <div class="card-priority">${l.priority}</div>
      <div class="card-top">
        <div>
          <div class="card-name">${l.name}</div>
          ${l.owner?`<div class="card-owner">👤 ${l.owner}</div>`:''}
        </div>
      </div>
      <div class="badges">
        <span class="badge ${wsClass}">${wsLabel}</span>
        <span class="badge ${tierColors[l.tier]}">${tierLabels[l.tier]}</span>
        ${statusBadge}
      </div>
      <div class="card-cat">${l.category} · ${l.city}, ${l.state}</div>
      ${l.phone?`<div class="card-phone">${l.phone}</div>`:'<div class="card-phone" style="color:var(--dim)">No phone listed</div>'}
      <div class="card-pitch">${l.pitchAngle}</div>
      <div class="card-stages">${stagesDots}</div>
    </div>`;
  }).join('');
  updateStats();
}

function updateStats(){
  document.getElementById('stat-total').textContent=state.leads.length;
  document.getElementById('stat-hot').textContent=state.leads.filter(l=>l.tier===1).length;
  const workedIds=Object.keys(state.activity).filter(id=>Object.keys(state.activity[id].stages||{}).length>0);
  document.getElementById('stat-worked').textContent=workedIds.length;
  const wonIds=Object.values(state.activity).filter(a=>a.stages&&a.stages.decision&&a.stages.decision.value==='won');
  document.getElementById('stat-won').textContent=wonIds.length;
  // In progress = worked but not won and first_call exists
  const inProgress=Object.entries(state.activity).filter(([id,a])=>{
    const s=a.stages||{};
    return Object.keys(s).length>0 && s.first_call && (!s.decision||s.decision.value!=='won');
  });
  const ipEl=document.getElementById('stat-inprogress');
  if(ipEl) ipEl.textContent=inProgress.length;
  // Highlight active quick filter button
  ['all','hot','worked','inprogress','won'].forEach(f=>{
    const el=document.getElementById('sf-'+f);
    if(el) el.classList.toggle('active-filter',state.activeQuickFilter===f);
  });
  // Update saved searches count
  const ssEl=document.getElementById('nav-searches-count');
  if(ssEl) ssEl.textContent=state.savedSearches.length;
}

// ══════════════════════════════════════════════════════
// LEAD DETAIL PANEL
// ══════════════════════════════════════════════════════
function selectLead(id,trackVisit=true){
  state.selectedLead=id;
  const l=state.leads.find(x=>x.id===id);
  if(!l)return;
  if(!state.activity[id])state.activity[id]={stages:{},history:[]};
  if(trackVisit){
    const now=new Date().toISOString();
    if(!state.activity[id].visitedAt)state.activity[id].visitedAt=now;
    state.activity[id].lastVisitedAt=now;
    state.activity[id].visitCount=(state.activity[id].visitCount||0)+1;
    state.activity[id].history=state.activity[id].history||[];
    const lastHistory=state.activity[id].history[state.activity[id].history.length-1];
    const shouldLogVisit=!lastHistory||lastHistory.stage!=='visited'||(new Date(now)-new Date(lastHistory.timestamp))>300000;
    if(shouldLogVisit){
      state.activity[id].history.push({stage:'visited',value:'opened',timestamp:now});
    }
    saveToLS();
  }
  renderLeads();
  const panel=document.getElementById('lead-panel');
  panel.classList.add('open');
  document.getElementById('panel-biz-name').textContent=l.name;
  document.getElementById('panel-biz-cat').textContent=`${l.category} · ${l.city}, ${l.state}`;
  const act=state.activity[l.id]||{};
  const stages=act.stages||{};
  const visitCount=act.visitCount||0;
  const worked=Object.keys(stages).length>0;
  const isWon=stages.decision&&stages.decision.value==='won';
  const isInProgress=worked&&stages.first_call&&!isWon;
  const leadStatus=isWon?'Won':isInProgress?'In Progress':worked?'Worked':visitCount>0?'Visited':'New';
  const wsMap={none:'<span class="badge b-red">No Website</span>',broken:'<span class="badge b-red">Broken / Wrong Site</span>',outdated:'<span class="badge b-amber">Outdated</span>',has_site:'<span class="badge b-green">Has Site</span>'};
  const tierMap={1:'<span class="badge b-red">🔴 Tier 1 — Hot</span>',2:'<span class="badge b-amber">🟡 Tier 2 — Warm</span>',3:'<span class="badge b-blue">🔵 Tier 3 — Long</span>'};
  // Stage summary
  const stageIcons=['🔬','📞','✉️','🤝','📄','🔁','🏁'];
  const stageSummary=STAGES_DEF.map((s,i)=>{
    const sv=stages[s.id];
    let icon='⬜';let statusLabel='—';
    if(sv){const opt=s.options.find(o=>o.v===sv.value);if(opt){icon=opt.t==='success'?'✅':opt.t==='fail'?'❌':'🟡';statusLabel=opt.l;}}
    return `<div class="ss-item"><div class="ss-icon">${icon}</div><div class="ss-lbl">${s.label.substring(0,10)}</div></div>`;
  }).join('');
  document.getElementById('panel-body').innerHTML=`
    <div class="info-section">
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px;">${wsMap[l.websiteStatus]||''}${tierMap[l.tier]||''}<span class="badge b-gray">Priority #${l.priority}</span></div>
      ${stageIcons.length?`<div class="stage-summary">${stageSummary}</div>`:''}
    </div>
    <div class="info-section">
      <div class="info-label">Lead Tracking</div>
      ${infoRow('Status',leadStatus)}
      ${infoRow('Views',`${visitCount} time${visitCount!==1?'s':''}`)}
      ${act.visitedAt?infoRow('First viewed',new Date(act.visitedAt).toLocaleString()):''}
      ${act.lastVisitedAt?infoRow('Last viewed',new Date(act.lastVisitedAt).toLocaleString()):''}
    </div>
    <div class="pitch-box"><div class="pitch-label">💡 Pitch Angle</div>${l.pitchAngle}</div>
    <div class="info-section">
      <div class="info-label">Contact Info</div>
      ${infoRow('Name',l.name)}
      ${l.owner?infoRow('Owner',l.owner):''}
      ${infoRow('Phone',l.phone?`<a href="tel:${l.phone}">${l.phone}</a>`:'<span style="color:var(--dim)">Not listed</span>')}
      ${l.email?infoRow('Email',`<a href="mailto:${l.email}">${l.email}</a>`):''}
    </div>
    <div class="info-section">
      <div class="info-label">Location</div>
      ${infoRow('Address',l.address)}
      ${infoRow('City',l.city)}
      ${infoRow('County',l.county)}
      ${infoRow('State',l.state+' '+l.zip)}
    </div>
    <div class="info-section">
      <div class="info-label">Online Presence</div>
      ${infoRow('Website',l.websiteStatus==='none'?'<span class="badge b-red">No Website</span>':l.websiteStatus==='broken'?'<span class="badge b-red">Broken/Wrong Site</span>':l.websiteStatus==='outdated'?'<span class="badge b-amber">Outdated Site</span>':'<span class="badge b-green">Has Site</span>')}
      ${infoRow('Current Online',l.onlinePresence||'Unknown')}
      ${l.yearsInBusiness?infoRow('Est.',l.yearsInBusiness+' years in business'):''}
    </div>
    ${l.notes?`<div class="notes-box"><div class="notes-label">📝 Research Notes</div>${l.notes}</div>`:''}
    ${act.stages&&Object.keys(act.stages).length?renderStageSummaryPanel(act.stages):''}
  `;
}

function infoRow(k,v){return`<div class="info-row"><div class="info-key">${k}</div><div class="info-val">${v||'—'}</div></div>`;}

function renderStageSummaryPanel(stages){
  const rows=STAGES_DEF.filter(s=>stages[s.id]).map(s=>{
    const sv=stages[s.id];
    const opt=s.options.find(o=>o.v===sv.value);
    const icon=opt?opt.t==='success'?'✅':opt.t==='fail'?'❌':'🟡':'○';
    const ts=sv.timestamp?new Date(sv.timestamp).toLocaleDateString():'';
    return`<div class="info-row"><div class="info-key">${s.label}</div><div class="info-val">${icon} ${opt?opt.l:'—'}${sv.note?` · <em style="color:var(--muted)">${sv.note}</em>`:''}${ts?` <span style="color:var(--dim);font-size:11px;">${ts}</span>`:''}</div></div>`;
  }).join('');
  return`<div class="info-section"><div class="info-label">Stage History</div>${rows}</div>`;
}

function closePanel(){
  document.getElementById('lead-panel').classList.remove('open');
  document.querySelectorAll('.lead-card').forEach(c=>c.classList.remove('selected'));
  state.selectedLead=null;
}

// ══════════════════════════════════════════════════════
// SALES MODE
// ══════════════════════════════════════════════════════
function openSalesMode(){
  if(!state.selectedLead)return;
  const l=state.leads.find(x=>x.id===state.selectedLead);
  if(!l)return;
  state.workingLead=l.id;
  if(!state.activity[l.id])state.activity[l.id]={stages:{},history:[]};
  document.getElementById('sm-biz-name').textContent=l.name;
  document.getElementById('sm-biz-meta').textContent=`${l.category} · ${l.city}, ${l.state}`;
  const wsMap={none:'<span class="badge b-red">No Website</span>',broken:'<span class="badge b-red">Broken Site</span>',outdated:'<span class="badge b-amber">Outdated</span>'};
  const tierMap={1:'<span class="badge b-red">Tier 1</span>',2:'<span class="badge b-amber">Tier 2</span>',3:'<span class="badge b-blue">Tier 3</span>'};
  document.getElementById('sm-badges').innerHTML=(wsMap[l.websiteStatus]||'')+(tierMap[l.tier]||'');
  document.getElementById('sales-mode').classList.add('open');
  renderSalesScripts('opener');
  renderStageChecklist();
  updateSMProgress();
}

function closeSalesMode(){
  document.getElementById('sales-mode').classList.remove('open');
  state.workingLead=null;
}

function fillScript(text){
  const l=state.workingLead?state.leads.find(x=>x.id===state.workingLead):{};
  const me=state.settings.name||'Kelvin';
  const company=state.settings.company||'ZagaPrime';
  const email=state.settings.email||'[your-email]';
  const phone=state.settings.phone||'[your-phone]';
  return text
    .replace(/{BIZ}/g,l.name||'[Business]')
    .replace(/{CITY}/g,l.city||'[City]')
    .replace(/{COUNTY}/g,l.county||'[County]')
    .replace(/{STATE}/g,l.state||'NJ')
    .replace(/{CATEGORY}/g,l.category||'[Category]')
    .replace(/{PITCH_ANGLE}/g,l.pitchAngle||'')
    .replace(/{ME}/g,me)
    .replace(/{COMPANY}/g,company)
    .replace(/{EMAIL}/g,email)
    .replace(/{PHONE}/g,phone)
    .replace(/\[owner\]/g,l.owner||'the owner');
}

function highlightBiz(text){
  const l=state.workingLead?state.leads.find(x=>x.id===state.workingLead):{};
  if(!l||!l.name)return text;
  return text.replace(new RegExp(escapeRE(l.name),'g'),`<span class="sb-biz">${l.name}</span>`);
}
function escapeRE(s){return s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');}

function scriptBlock(title,type,body,note,isBroken){
  const filled=fillScript(body);
  const highlighted=highlightBiz(filled);
  return`<div class="script-block${isBroken?' highlight':''}">
    <button class="copy-btn" onclick="copyScript(this)">Copy</button>
    <div class="sb-type">${type}</div>
    <div class="sb-title">${title}</div>
    <div class="sb-body">${highlighted}</div>
    ${note?`<div class="sb-note">💡 ${note}</div>`:''}
  </div>`;
}

function renderSalesScripts(tab){
  const l=state.workingLead?state.leads.find(x=>x.id===state.workingLead):null;
  const ws=l?l.websiteStatus:'none';
  let html='';
  if(tab==='opener'){
    html=scriptBlock(SCRIPTS.opener.standard.title,'📞 Cold Call Opener',SCRIPTS.opener.standard.body,SCRIPTS.opener.standard.note,false);
    if(ws==='broken')html=scriptBlock('URGENT Opener — Broken Website','📞 Urgent Opener',`Hey, is this the owner of {BIZ}?\n\nHey — my name is {ME} from {COMPANY}. I'm calling because I was doing research on local {CITY} businesses and I came across something about {BIZ} that you probably don't know about — and it's actively hurting your business. Got 60 seconds?`,'This opener creates instant intrigue — they will always say yes.',true)+html;
  }else if(tab==='hook'){
    const hookKey=ws==='broken'?'broken':ws==='outdated'?'outdated':l&&l.hookType==='competitor'?'competitor':ws==='weak_seo'?'weak_seo':'none';
    const h=SCRIPTS.hooks[hookKey]||SCRIPTS.hooks.none;
    html=scriptBlock(h.title,'🎯 Hook',h.body,h.note,ws==='broken'||ws==='outdated');
    if(hookKey!=='none')html+=scriptBlock(SCRIPTS.hooks.none.title,'🎯 Alternative Hook',SCRIPTS.hooks.none.body,SCRIPTS.hooks.none.note,false);
  }else if(tab==='offer'){
    html=scriptBlock(SCRIPTS.offer.full.title,'📦 The Offer',SCRIPTS.offer.full.body,SCRIPTS.offer.full.note,false);
  }else if(tab==='email'){
    const useUrgent=ws==='broken';
    if(useUrgent)html=scriptBlock(SCRIPTS.email.broken.title,'✉️ PRIORITY EMAIL — send first',SCRIPTS.email.broken.body.replace('Subject: {BIZ}','').replace(/{BIZ} — /,''),null,true);
    html+=scriptBlock(SCRIPTS.email.standard.title,'✉️ Standard Follow-up Email',SCRIPTS.email.standard.body,SCRIPTS.email.standard.note,false);
  }else if(tab==='voicemail'){
    const useUrgent=ws==='broken';
    if(useUrgent)html=scriptBlock(SCRIPTS.voicemail.urgent.title,'🎤 Urgent Voicemail',SCRIPTS.voicemail.urgent.body,SCRIPTS.voicemail.urgent.note,true);
    html+=scriptBlock(SCRIPTS.voicemail.standard.title,'🎤 Standard Voicemail',SCRIPTS.voicemail.standard.body,SCRIPTS.voicemail.standard.note,false);
  }else if(tab==='objections'){
    html=SCRIPTS.objections.map(o=>scriptBlock(o.q,'🛡️ Objection Handler',o.a,null,false)).join('');
  }
  document.getElementById('script-content').innerHTML=html||'<div class="empty"><div class="empty-text">No scripts for this tab</div></div>';
}

function switchScriptTab(tab,el){
  document.querySelectorAll('.st').forEach(t=>t.classList.remove('active'));
  el.classList.add('active');
  renderSalesScripts(tab);
}

function copyScript(btn){
  const box=btn.closest('.script-block').querySelector('.sb-body');
  const text=box.innerText;
  navigator.clipboard.writeText(text).then(()=>{btn.textContent='Copied!';setTimeout(()=>btn.textContent='Copy',1500);});
}

// ══════════════════════════════════════════════════════
// STAGE CHECKLIST
// ══════════════════════════════════════════════════════
function renderStageChecklist(){
  if(!state.workingLead)return;
  const act=state.activity[state.workingLead];
  const stages=act.stages||{};
  const html=STAGES_DEF.map((s,i)=>{
    const current=stages[s.id];
    const isDoneOk=current&&s.options.find(o=>o.v===current.value&&o.t==='success');
    const isDoneFail=current&&s.options.find(o=>o.v===current.value&&o.t==='fail');
    const cls=isDoneOk?'done-ok':isDoneFail?'done-fail':'';
    const statusLabel=current?s.options.find(o=>o.v===current.value)?.l:'Pending';
    const statusCls=current?(isDoneOk?'success':isDoneFail?'fail':'skip'):'pending';
    const opts=s.options.map(o=>{
      const selCls=current&&current.value===o.v?`selected ${o.t}`:'';
      return`<button class="sc-opt ${selCls}" onclick="selectStageOpt('${s.id}','${o.v}','${o.t}')">${o.l}</button>`;
    }).join('');
    return`<div class="stage-card ${cls}" id="sc-${s.id}">
      <div class="sc-header">
        <div class="sc-num">${i+1}</div>
        <div class="sc-title">${s.label}</div>
        <div class="sc-status ${statusCls}">${statusLabel||'Pending'}</div>
      </div>
      <div class="sc-options">${opts}</div>
      ${s.note?`<div class="sc-note"><input type="text" id="sc-note-${s.id}" placeholder="Add a note..." value="${(current&&current.note)||''}" onchange="updateStageNote('${s.id}',this.value)"></div>`:''}
    </div>`;
  }).join('');
  document.getElementById('stage-checklist').innerHTML=html;
  updateSMProgress();
}

function selectStageOpt(stageId,value,type){
  if(!state.workingLead)return;
  if(!state.activity[state.workingLead])state.activity[state.workingLead]={stages:{},history:[]};
  const existing=state.activity[state.workingLead].stages[stageId];
  const noteEl=document.getElementById('sc-note-'+stageId);
  const note=noteEl?noteEl.value:'';
  state.activity[state.workingLead].stages[stageId]={value,note,timestamp:new Date().toISOString()};
  state.activity[state.workingLead].history=state.activity[state.workingLead].history||[];
  state.activity[state.workingLead].history.push({stage:stageId,value,timestamp:new Date().toISOString()});
  renderStageChecklist();
}

function updateStageNote(stageId,note){
  if(!state.workingLead)return;
  if(state.activity[state.workingLead]&&state.activity[state.workingLead].stages[stageId]){
    state.activity[state.workingLead].stages[stageId].note=note;
  }
}

function updateSMProgress(){
  if(!state.workingLead)return;
  const act=state.activity[state.workingLead]||{};
  const done=Object.keys(act.stages||{}).length;
  const total=STAGES_DEF.length;
  document.getElementById('sm-progress-text').textContent=`${done}/${total} stages logged`;
}

function saveSalesData(){
  if(!state.workingLead)return;
  // Sync any open note fields
  STAGES_DEF.forEach(s=>{
    const el=document.getElementById('sc-note-'+s.id);
    if(el&&state.activity[state.workingLead]&&state.activity[state.workingLead].stages[s.id]){
      state.activity[state.workingLead].stages[s.id].note=el.value;
    }
  });
  state.activity[state.workingLead].lastSaved=new Date().toISOString();
  saveToLS();
  showToast('Progress saved!');
  document.getElementById('save-time-label').textContent='Saved '+new Date().toLocaleTimeString();
  renderLeads();
  closeSalesMode();
  // Re-select lead to update panel
  if(state.selectedLead)selectLead(state.selectedLead,false);
}

// ══════════════════════════════════════════════════════
// ANALYTICS
// ══════════════════════════════════════════════════════
function renderAnalytics(){
  const acts=state.activity;
  const workedIds=Object.keys(acts).filter(id=>Object.keys(acts[id].stages||{}).length>0);
  const total=state.leads.length;
  const worked=workedIds.length;
  const contacted=workedIds.filter(id=>acts[id].stages.first_call).length;
  const discovery=workedIds.filter(id=>acts[id].stages.discovery_call&&acts[id].stages.discovery_call.value==='completed').length;
  const proposals=workedIds.filter(id=>acts[id].stages.proposal_sent&&acts[id].stages.proposal_sent.value==='sent').length;
  const won=workedIds.filter(id=>acts[id].stages.decision&&acts[id].stages.decision.value==='won').length;
  const contactRate=worked?Math.round(contacted/worked*100):0;
  const closeRate=proposals?Math.round(won/proposals*100):0;

  document.getElementById('analytics-metrics').innerHTML=[
    {n:total,l:'Total Leads',s:'in pipeline',c:'var(--text)'},
    {n:worked,l:'Leads Worked',s:'outreach started',c:'var(--accent)'},
    {n:`${contactRate}%`,l:'Contact Rate',s:`${contacted}/${worked} connected`,c:'var(--cyan)'},
    {n:proposals,l:'Proposals Sent',s:'ready to close',c:'var(--amber)'},
    {n:won,l:'Closed Won',s:closeRate+'% close rate',c:'var(--green)'},
    {n:workedIds.filter(id=>acts[id].stages.decision&&acts[id].stages.decision.value.startsWith('lost')).length,l:'Closed Lost',s:'learn from these',c:'var(--red)'}
  ].map(m=>`<div class="metric-card"><div class="mc-num" style="color:${m.c}">${m.n}</div><div class="mc-lbl">${m.l}</div><div class="mc-sub">${m.s}</div></div>`).join('');

  // Funnel
  const funnelData=[
    {l:'Total Leads',n:total,c:'#4f7ef8'},
    {l:'Outreach Started',n:worked,c:'#06b6d4'},
    {l:'First Contact Made',n:contacted,c:'#a78bfa'},
    {l:'Discovery Call Done',n:discovery,c:'#f59e0b'},
    {l:'Proposal Sent',n:proposals,c:'#10b981'},
    {l:'Closed Won',n:won,c:'#22c55e'}
  ];
  document.getElementById('funnel-chart').innerHTML=funnelData.map(f=>`
    <div class="funnel-bar">
      <div class="fb-label">${f.l}</div>
      <div class="fb-track"><div class="fb-fill" style="width:${total?Math.round(f.n/total*100):0}%;background:${f.c}">${f.n>0?Math.round(f.n/total*100)+'%':''}</div></div>
      <div class="fb-count">${f.n}</div>
    </div>`).join('');

  // Category breakdown
  const catCounts={};
  state.leads.forEach(l=>{catCounts[l.category]=(catCounts[l.category]||0)+1;});
  const maxCat=Math.max(...Object.values(catCounts));
  document.getElementById('cat-chart').innerHTML=Object.entries(catCounts).sort((a,b)=>b[1]-a[1]).map(([cat,n])=>`
    <div class="cat-row">
      <div class="cat-name">${cat}</div>
      <div class="cat-bar"><div class="cat-fill" style="width:${Math.round(n/maxCat*100)}%"></div></div>
      <div class="cat-num">${n}</div>
    </div>`).join('');

  // Stage performance
  const stageCounts={};
  STAGES_DEF.forEach(s=>{
    let success=0,fail=0,total=0;
    workedIds.forEach(id=>{if(acts[id].stages[s.id]){total++;const opt=s.options.find(o=>o.v===acts[id].stages[s.id].value);if(opt&&opt.t==='success')success++;if(opt&&opt.t==='fail')fail++;}});
    stageCounts[s.label]={success,fail,total};
  });
  document.getElementById('stage-perf').innerHTML=Object.entries(stageCounts).map(([stage,d])=>`
    <div class="funnel-bar">
      <div class="fb-label" style="font-size:11px">${stage}</div>
      <div class="fb-track" style="height:18px">
        ${d.success>0?`<div class="fb-fill" style="width:${d.total?Math.round(d.success/d.total*100):0}%;background:var(--green);display:inline-flex;">${d.success}</div>`:''}
        ${d.fail>0?`<div class="fb-fill" style="width:${d.total?Math.round(d.fail/d.total*100):0}%;background:var(--red);display:inline-flex;">${d.fail}</div>`:''}
      </div>
      <div class="fb-count">${d.total}</div>
    </div>`).join('')||'<div class="empty"><div class="empty-text">No stage data yet. Start working leads to see performance.</div></div>';

  // Activity feed
  const allHistory=[];
  workedIds.forEach(id=>{
    const l=state.leads.find(x=>x.id===id);
    const act=acts[id];
    if(act.history)act.history.forEach(h=>{allHistory.push({...h,biz:l?l.name:'Unknown',leadId:id});});
    // Also add saved timestamps
    if(act.lastSaved)allHistory.push({timestamp:act.lastSaved,stage:'saved',value:'saved',biz:l?l.name:'Unknown'});
  });
  allHistory.sort((a,b)=>new Date(b.timestamp)-new Date(a.timestamp));
  document.getElementById('activity-feed').innerHTML=allHistory.slice(0,20).map(h=>{
    const stageInfo=STAGES_DEF.find(s=>s.id===h.stage);
    const optInfo=stageInfo?stageInfo.options.find(o=>o.v===h.value):null;
    const dotCls=optInfo?(optInfo.t==='success'?'green':optInfo.t==='fail'?'red':'amber'):'blue';
    const action=h.stage==='saved'?'progress saved':h.stage==='visited'?'lead viewed':stageInfo?`${stageInfo.label}: ${optInfo?optInfo.l:h.value}`:`${h.stage}: ${h.value}`;
    const ts=new Date(h.timestamp).toLocaleDateString();
    return`<div class="af-item"><div class="af-dot ${dotCls}"></div><div><div class="af-biz">${h.biz}</div><div class="af-action">${action}</div></div><div class="af-time">${ts}</div></div>`;
  }).join('')||'<div class="empty"><div class="empty-text">No activity yet</div></div>';
}

// ══════════════════════════════════════════════════════
// FILTERS
// ══════════════════════════════════════════════════════
function populateFilters(){
  const states=[...new Set(state.leads.map(l=>l.state).filter(Boolean))].sort();
  const counties=[...new Set(state.leads.map(l=>l.county).filter(Boolean))].sort();
  const cities=[...new Set(state.leads.map(l=>l.city).filter(Boolean))].sort();
  const cats=[...new Set(state.leads.map(l=>l.category).filter(Boolean))].sort();
  const sel=(id,vals)=>{const el=document.getElementById(id);const cur=el.value;el.innerHTML=`<option value="">${el.options[0].text}</option>`+vals.map(v=>`<option value="${v}">${v}</option>`).join('');el.value=cur;};
  sel('f-state',states);sel('f-county',counties);sel('f-city',cities);sel('f-category',cats);
}
function applyFilters(){
  // Log to search history when there's something to search
  const q=document.getElementById('f-search').value.trim();
  const hasFilters=q||document.getElementById('f-state').value||document.getElementById('f-county').value||
    document.getElementById('f-city').value||document.getElementById('f-category').value||
    document.getElementById('f-tier').value||document.getElementById('f-web').value;
  if(hasFilters){
    const filters=captureCurrentFilters();
    // Only add to history if different from last entry
    const last=state.searchHistory[0];
    if(!last||JSON.stringify(last.filters)!==JSON.stringify(filters)){
      state.searchHistory.unshift({id:Date.now(),filters,query:q||buildFilterDesc(filters),timestamp:new Date().toISOString(),resultCount:0});
      if(state.searchHistory.length>100)state.searchHistory.pop();
    }
  }
  state.activeQuickFilter=hasFilters?null:state.activeQuickFilter;
  renderLeads();
  // Update result count in history
  if(state.searchHistory.length>0){
    state.searchHistory[0].resultCount=getFilteredLeads().length;
    saveToLS();
  }
  // Show/hide active filter bar
  updateFilterBar();
}
function captureCurrentFilters(){
  return{
    search:document.getElementById('f-search').value,
    state:document.getElementById('f-state').value,
    county:document.getElementById('f-county').value,
    city:document.getElementById('f-city').value,
    category:document.getElementById('f-category').value,
    tier:document.getElementById('f-tier').value,
    web:document.getElementById('f-web').value
  };
}
function buildFilterDesc(f){
  const parts=[];
  if(f.search)parts.push('"'+f.search+'"');
  if(f.tier)parts.push(['','Tier 1 Hot','Tier 2 Warm','Tier 3 Long'][f.tier]||'Tier '+f.tier);
  if(f.city)parts.push(f.city);
  if(f.county)parts.push(f.county);
  if(f.state)parts.push(f.state);
  if(f.category)parts.push(f.category);
  if(f.web)parts.push({none:'No Website',broken:'Broken Site',outdated:'Outdated'}[f.web]||f.web);
  return parts.join(' · ')||'All leads';
}
function applyFiltersFromObj(f){
  document.getElementById('f-search').value=f.search||'';
  document.getElementById('f-state').value=f.state||'';
  document.getElementById('f-county').value=f.county||'';
  document.getElementById('f-city').value=f.city||'';
  document.getElementById('f-category').value=f.category||'';
  document.getElementById('f-tier').value=f.tier||'';
  document.getElementById('f-web').value=f.web||'';
  state.activeQuickFilter=null;
  // Switch to leads view
  showView('leads',document.querySelector('[data-view=leads]'));
  renderLeads();
  updateFilterBar();
}
function updateFilterBar(){
  const bar=document.getElementById('filter-active-bar');
  const lbl=document.getElementById('filter-active-label');
  if(!bar)return;
  const f=captureCurrentFilters();
  const hasAny=Object.values(f).some(v=>v);
  const qf=state.activeQuickFilter;
  if(hasAny||qf){
    bar.style.display='flex';
    const count=getFilteredLeads().length;
    const desc=qf?{all:'All leads',hot:'Tier 1 Hot leads',worked:'Leads with activity',inprogress:'In-progress leads',won:'Closed Won leads'}[qf]:buildFilterDesc(f);
    lbl.textContent='Showing '+count+' lead'+(count!==1?'s':'')+': '+desc;
  }else{
    bar.style.display='none';
  }
}
function clearFilters(){
  ['f-search','f-state','f-county','f-city','f-category','f-tier','f-web'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  state.activeQuickFilter=null;
  document.querySelectorAll('.ts-btn').forEach(b=>b.classList.remove('active-filter'));
  const bar=document.getElementById('filter-active-bar');
  if(bar)bar.style.display='none';
  renderLeads();
}

// ══════════════════════════════════════════════════════
// NAVIGATION
// ══════════════════════════════════════════════════════
function showView(view,navEl){
  state.currentView=view;
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
  if(navEl)navEl.classList.add('active');
  const main=document.querySelector('.main');
  Array.from(main.children).forEach(v=>{
    if(v.classList.contains('view')||v.classList.contains('view-split')){
      v.classList.remove('active');
      v.style.display='none';
    }
  });
  if(view==='leads'){
    const vs=document.getElementById('view-leads');
    vs.classList.add('active');
    vs.style.display='flex';
    const leadsPane=vs.querySelector('.view');
    if(leadsPane){
      leadsPane.classList.add('active');
      leadsPane.style.display='block';
    }
  }else{
    const vEl=document.getElementById('view-'+view);
    if(vEl){vEl.classList.add('active');vEl.style.display='block';}
  }
  if(view==='analytics')renderAnalytics();
  if(view==='settings')loadSettingsUI();
  if(view==='searches')renderSavedSearches();
  if(view==='history')renderSearchHistory();
  updateStorageInfo();
}

function openFindLeads(){showView('find',document.querySelector('[data-view=find]'));}

// ══════════════════════════════════════════════════════
// ADD / IMPORT LEADS
// ══════════════════════════════════════════════════════
function addManualLead(){
  const name=document.getElementById('add-name').value.trim();
  const cat=document.getElementById('add-cat').value.trim();
  const city=document.getElementById('add-city').value.trim();
  if(!name||!cat||!city){showToast('Name, Category and City are required');return;}
  const id='L'+String(Date.now()).slice(-6);
  const newLead={id,name,owner:document.getElementById('add-owner').value.trim()||null,category:cat,address:'',city,county:document.getElementById('add-county').value.trim()||'',state:document.getElementById('add-state').value.trim()||'NJ',zip:'',phone:document.getElementById('add-phone').value.trim()||null,email:null,websiteStatus:document.getElementById('add-wstatus').value,onlinePresence:'',pitchAngle:document.getElementById('add-pitch').value.trim()||'',hookType:'none',tier:parseInt(document.getElementById('add-tier').value)||1,priority:state.leads.length+1,yearsInBusiness:null,googleRating:null,notes:document.getElementById('add-notes').value.trim()};
  state.leads.push(newLead);
  saveToLS();
  populateFilters();
  renderLeads();
  showToast(`${name} added!`);
  ['add-name','add-owner','add-cat','add-phone','add-city','add-county','add-pitch','add-notes'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
}

function getFindSearchParams(){
  return {
    state:document.getElementById('new-state').value.trim(),
    county:document.getElementById('new-county').value.trim(),
    city:document.getElementById('new-city').value.trim(),
    category:document.getElementById('new-cat-search').value.trim()
  };
}

function buildFindSearchLabel(params){
  return [params.category||'Businesses',params.city,params.county,params.state].filter(Boolean).join(' in ');
}

function setFindSearchStatus(message,tone='info'){
  const el=document.getElementById('find-search-status');
  if(!el)return;
  const colorMap={info:'var(--muted)',success:'var(--green)',warn:'var(--amber)',error:'var(--red)'};
  el.textContent=message;
  el.style.color=colorMap[tone]||colorMap.info;
}

function normalizeLeadKey(value){
  return String(value||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
}

function findExistingLeadForProspect(prospect){
  const prospectName=normalizeLeadKey(prospect.name);
  const prospectCity=normalizeLeadKey(prospect.city);
  const prospectAddress=normalizeLeadKey(prospect.address);
  return state.leads.find((lead)=>{
    const nameMatch=normalizeLeadKey(lead.name)===prospectName;
    const cityMatch=!prospectCity||normalizeLeadKey(lead.city)===prospectCity;
    const addressMatch=prospectAddress&&normalizeLeadKey(lead.address)===prospectAddress;
    return nameMatch&&(addressMatch||cityMatch);
  })||null;
}

function getLeadPipelineStatus(lead){
  if(!lead)return 'New';
  const activity=state.activity[lead.id]||{};
  const stages=activity.stages||{};
  const worked=Object.keys(stages).length>0;
  const won=stages.decision&&stages.decision.value==='won';
  const inProgress=worked&&stages.first_call&&!won;
  if(won)return 'Won';
  if(inProgress)return 'In Progress';
  if(worked)return 'Worked';
  if((activity.visitCount||0)>0)return 'Visited';
  return 'In Pipeline';
}

function createLeadFromProspect(prospect){
  return {
    id:'EXT'+String(Date.now()).slice(-6)+Math.floor(Math.random()*1000),
    name:prospect.name,
    owner:null,
    category:prospect.category||'Other',
    address:prospect.address||'',
    city:prospect.city||'',
    county:prospect.county||'',
    state:prospect.state||'NJ',
    zip:prospect.zip||'',
    phone:prospect.phone||null,
    email:null,
    websiteStatus:'none',
    onlinePresence:prospect.mapsUrl?'Google Maps profile found':'Business listing found',
    pitchAngle:prospect.pitchAngle||`No website found. Offer a simple site, lead capture, and mobile-first contact flow for ${prospect.name}.`,
    hookType:'none',
    tier:prospect.tier||1,
    priority:state.leads.length+1,
    yearsInBusiness:null,
    googleRating:null,
    notes:prospect.notes||'Found by live no-website lead search.'
  };
}

function importFoundLead(externalId){
  const prospect=state.findResults.find((item)=>String(item.externalId)===String(externalId));
  if(!prospect){showToast('Lead search result not found');return;}
  const existing=findExistingLeadForProspect(prospect);
  if(existing){
    showToast(`${existing.name} is already in your pipeline`);
    return;
  }
  const lead=createLeadFromProspect(prospect);
  state.leads.push(lead);
  saveToLS();
  populateFilters();
  renderLeads();
  renderFindResults();
  showToast(`${lead.name} added to pipeline`);
}

function importAllFoundLeads(){
  if(!state.findResults.length){showToast('Run a lead search first');return;}
  let added=0;
  let skipped=0;
  state.findResults.forEach((prospect)=>{
    if(findExistingLeadForProspect(prospect)){skipped++;return;}
    state.leads.push(createLeadFromProspect(prospect));
    added++;
  });
  if(!added&&!skipped){showToast('No results to import');return;}
  saveToLS();
  populateFilters();
  renderLeads();
  renderFindResults();
  showToast(`${added} added, ${skipped} already in pipeline`);
}

function viewLeadFromProspect(externalId){
  const prospect=state.findResults.find((item)=>String(item.externalId)===String(externalId));
  if(!prospect)return;
  const existing=findExistingLeadForProspect(prospect);
  if(!existing){showToast('This lead is not in your pipeline yet');return;}
  showView('leads',document.querySelector('[data-view=leads]'));
  selectLead(existing.id);
}

function renderFindResults(){
  const summaryEl=document.getElementById('find-results-summary');
  const listEl=document.getElementById('find-results-list');
  if(!summaryEl||!listEl)return;
  if(!state.findResults.length){
    summaryEl.textContent='No live results yet. Search for a city, county, or category to find businesses with no website listed.';
    listEl.innerHTML='<div class="empty" style="padding:32px 20px;"><div class="empty-text">No live search results yet.</div></div>';
    return;
  }
  const meta=state.findSearchMeta||{};
  summaryEl.textContent=`${state.findResults.length} no-website matches found for ${meta.label||'your search'}.`;
  listEl.innerHTML=state.findResults.map((prospect)=>{
    const existing=findExistingLeadForProspect(prospect);
    const status=existing?getLeadPipelineStatus(existing):'New Prospect';
    const existingBadge=existing?`<span class="badge b-blue">${status}</span>`:'<span class="badge b-red">No Website</span>';
    const phoneLabel=prospect.phone||'No phone found';
    const actionButton=existing
      ? `<button class="btn btn-ghost btn-sm" onclick="viewLeadFromProspect('${prospect.externalId}')">View Existing</button>`
      : `<button class="btn btn-primary btn-sm" onclick="importFoundLead('${prospect.externalId}')">Add to Pipeline</button>`;
    return `<div class="find-result-card${existing?' existing':''}">
      <div class="find-result-head">
        <div>
          <div class="find-result-name">${prospect.name}</div>
          <div class="find-result-meta">${prospect.category||'Business'} · ${prospect.city||'Unknown city'}, ${prospect.state||''}</div>
        </div>
        <div class="badges">
          ${existingBadge}
          <span class="badge b-gray">Tier ${prospect.tier||1}</span>
        </div>
      </div>
      <div class="find-result-address">${prospect.address||'Address unavailable'}</div>
      <div class="find-result-phone">${phoneLabel}</div>
      <div class="find-result-note">${prospect.notes||'Found by live search and filtered to businesses with no website listed.'}</div>
      <div class="find-result-actions">
        ${actionButton}
        ${prospect.mapsUrl?`<a class="btn btn-ghost btn-sm" href="${prospect.mapsUrl}" target="_blank" rel="noreferrer">Open Maps</a>`:''}
      </div>
    </div>`;
  }).join('');
}

function applyAreaFilters(){
  const params=getFindSearchParams();
  ['f-state','f-county','f-city','f-category'].forEach((fid,i)=>{
    const val=[params.state,params.county,params.city,params.category][i];
    const el=document.getElementById(fid);
    if(el)el.value=val||'';
  });
  showView('leads',document.querySelector('[data-view=leads]'));
  applyFilters();
}

async function searchArea(){
  const params=getFindSearchParams();
  if(!params.state&&!params.city&&!params.county&&!params.category){
    setFindSearchStatus('Add at least a state, city, county, or category before searching.', 'warn');
    showToast('Enter an area or category first');
    return;
  }
  const queryLabel=buildFindSearchLabel(params);
  setFindSearchStatus(`Searching live listings for ${queryLabel}...`, 'info');
  document.getElementById('find-results-summary').textContent='Searching for businesses with no website listed...';
  document.getElementById('find-results-list').innerHTML='<div class="empty" style="padding:32px 20px;"><div class="empty-text">Searching live business data...</div></div>';
  try{
    const query=new URLSearchParams(params);
    const response=await fetch(`/api/search-leads?${query.toString()}`);
    const data=await response.json();
    if(!response.ok||!data.ok){
      throw new Error(data.error||'Live lead search failed');
    }
    state.findResults=data.results||[];
    state.findSearchMeta={
      label:queryLabel,
      query:data.query||queryLabel,
      searchedAt:new Date().toISOString()
    };
    renderFindResults();
    if(state.findResults.length){
      setFindSearchStatus(`Found ${state.findResults.length} businesses without websites for ${queryLabel}.`, 'success');
      showToast(`${state.findResults.length} new lead matches found`);
    }else{
      setFindSearchStatus(`No no-website matches were found for ${queryLabel}. Try a broader city or category.`, 'warn');
      showToast('No no-website matches found');
    }
  }catch(err){
    state.findResults=[];
    state.findSearchMeta={label:queryLabel,error:err.message};
    renderFindResults();
    setFindSearchStatus(err.message, 'error');
    showToast('Live lead search is not configured yet');
  }
}

function importCSV(){
  const csv=document.getElementById('csv-import').value.trim();
  if(!csv){showToast('Paste CSV content first');return;}
  const rows=parseCSVText(csv);
  if(rows.length<2){showToast('Need at least a header row + 1 data row');return;}
  const headers=rows[0].map(h=>h.trim().toLowerCase().replace(/\s+/g,'_').replace(/[^a-z0-9_]/g,''));
  let added=0;
  let updated=0;
  for(let i=1;i<rows.length;i++){
    const vals=rows[i];
    const row={};headers.forEach((h,j)=>row[h]=(vals[j]||'').trim());
    const businessName=(row.business_name||row.name||'').trim();
    if(!businessName)continue;
    const existing=state.leads.find(l=>l.name.toLowerCase()===businessName.toLowerCase());
    const leadData={
      id:existing?existing.id:'IMP'+String(Date.now()).slice(-6)+i,
      name:businessName,
      owner:row.owner_name||row.owner||null,
      category:row.category||'Other',
      address:row.address||'',
      city:row.city||'',
      county:row.county||'',
      state:row.state||'NJ',
      zip:row.zip||'',
      phone:row.phone||null,
      email:row.email||null,
      websiteStatus:row.website_status||'none',
      onlinePresence:row.online_presence||'',
      pitchAngle:row.pitch_angle||row.pitch||'',
      hookType:row.hook_type||'none',
      tier:parseInt(row.tier)||1,
      priority:existing?existing.priority:state.leads.length+1,
      yearsInBusiness:row.years_in_business||null,
      googleRating:row.google_rating||null,
      notes:row.notes||''
    };
    if(existing){
      Object.assign(existing,leadData);
      updated++;
    }else{
      state.leads.push(leadData);
      added++;
    }
  }
  saveToLS();populateFilters();renderLeads();
  showToast(`${added} added, ${updated} updated from CSV`);
  document.getElementById('csv-import').value='';
}

function downloadTemplate(){
  const header='business_name,owner_name,category,phone,address,city,county,state,zip,website_status,pitch_angle,tier,notes';
  const ex='Example Shop,John Smith,Auto Repair,(973)555-0100,123 Main St,Newton,Sussex County,NJ,07860,none,No website found,1,Checked Google - no site exists';
  const blob=new Blob([header+'\n'+ex],{type:'text/csv'});
  const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='zagaprime-leads-template.csv';a.click();
}

// ══════════════════════════════════════════════════════
// GOOGLE SHEETS
// ══════════════════════════════════════════════════════
function connectGoogleSheet(){
  const url=document.getElementById('gs-url').value.trim();
  if(!url){showToast('Paste your Google Sheets CSV URL first');return;}
  // Validate it looks like a Google Sheets pub URL
  if(!url.includes('docs.google.com')&&!url.includes('spreadsheets')){
    showToast('URL must be a Google Sheets published link');return;
  }
  localStorage.setItem('zp_gs_url',url);
  fetchGoogleSheet(url);
}

// Parse CSV text handling quoted fields with commas inside
function parseCSVText(csv){
  const lines=[];
  const rows=csv.split('\n');
  for(const row of rows){
    if(!row.trim())continue;
    const fields=[];let cur='';let inQ=false;
    for(let i=0;i<row.length;i++){
      const c=row[i];
      if(c==='"'){if(inQ&&row[i+1]==='"'){cur+='"';i++;}else inQ=!inQ;}
      else if(c===','&&!inQ){fields.push(cur.trim());cur='';}
      else cur+=c;
    }
    fields.push(cur.trim());
    lines.push(fields);
  }
  return lines;
}

async function fetchGoogleSheet(url){
  const statusEl=document.getElementById('gs-status');
  const setStatus=(ok,msg)=>{
    statusEl.innerHTML=`<div class="gs-dot" style="background:${ok?'var(--green)':'var(--red)'}"></div>${msg}`;
    statusEl.className=ok?'gs-connected':'gs-disconnected';
  };
  setStatus(false,'Connecting...');

  // Ensure URL ends with ?output=csv or &output=csv
  let csvUrl=url;
  if(!csvUrl.includes('output=csv')){
    csvUrl+=(csvUrl.includes('?')?'&':'?')+'output=csv';
  }

  // Try methods in order: direct, then CORS proxies
  const proxies=[
    u=>u, // direct
    u=>`https://corsproxy.io/?${encodeURIComponent(u)}`,
    u=>`https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
    u=>`https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(u)}`
  ];

  let csv=null;
  let lastError='';
  for(const proxyFn of proxies){
    const tryUrl=proxyFn(csvUrl);
    try{
      const r=await fetch(tryUrl,{signal:AbortSignal.timeout(8000)});
      if(!r.ok)throw new Error(`HTTP ${r.status}`);
      const text=await r.text();
      // Make sure we got actual CSV (not an HTML error page)
      if(text.trim().startsWith('<'))throw new Error('Got HTML, not CSV');
      if(text.length<10)throw new Error('Response too short');
      csv=text;break;
    }catch(e){lastError=e.message;}
  }

  if(!csv){
    setStatus(false,'Sheets: Error');
    showGSError(lastError,csvUrl);
    return;
  }

  // Parse the CSV
  const rows=parseCSVText(csv);
  if(rows.length<2){setStatus(false,'Sheets: Empty sheet');showToast('Sheet appears empty — make sure you have data rows');return;}

  const headers=rows[0].map(h=>h.toLowerCase().replace(/\s+/g,'_').replace(/[^a-z0-9_]/g,''));
  let added=0,updated=0;
  for(let i=1;i<rows.length;i++){
    const vals=rows[i];
    const row={};headers.forEach((h,j)=>row[h]=vals[j]||'');
    const bizName=(row.business_name||row.name||'').trim();
    if(!bizName)continue;
    // Check if lead already exists (by name)
    const existing=state.leads.find(l=>l.name.toLowerCase()===bizName.toLowerCase());
    const leadData={
      id:existing?existing.id:'GS'+String(Date.now()).slice(-6)+i,
      name:bizName,
      owner:(row.owner_name||row.owner||'').trim()||null,
      category:(row.category||'').trim()||'Other',
      phone:(row.phone||'').trim()||null,
      email:(row.email||'').trim()||null,
      address:(row.address||'').trim()||'',
      city:(row.city||'').trim()||'',
      county:(row.county||'').trim()||'',
      state:(row.state||'NJ').trim(),
      zip:(row.zip||'').trim()||'',
      websiteStatus:(row.website_status||row.websitestatus||'none').trim()||'none',
      onlinePresence:(row.online_presence||row.onlinepresence||'').trim()||'',
      pitchAngle:(row.pitch_angle||row.pitchangle||row.pitch||'').trim()||'',
      hookType:(row.hook_type||row.hooktype||'none').trim()||'none',
      tier:parseInt(row.tier)||1,
      priority:existing?existing.priority:state.leads.length+i,
      yearsInBusiness:(row.years_in_business||row.years||'').trim()||null,
      googleRating:(row.google_rating||'').trim()||null,
      notes:(row.notes||row.note||'').trim()||''
    };
    if(existing){Object.assign(existing,leadData);updated++;}
    else{state.leads.push(leadData);added++;}
  }

  saveToLS();
  populateFilters();
  renderLeads();
  setStatus(true,`Sheets: Live (${rows.length-1} rows)`);
  showToast(`✓ ${added} added, ${updated} updated from Google Sheets!`);
  // Also show the connection time
  localStorage.setItem('zp_gs_last_sync',new Date().toLocaleString());
  updateStorageInfo();
}

function showGSError(errMsg,url){
  // Show a helpful modal-style error
  const msg=`Google Sheets connection failed.\n\nError: ${errMsg}\n\nChecklist:\n1. Open your Google Sheet\n2. File → Share → Publish to web\n3. Select your sheet tab\n4. Format: CSV (not web page)\n5. Click Publish\n6. Copy the link — it should look like:\nhttps://docs.google.com/spreadsheets/d/e/2PACX.../pub?output=csv\n\nYour URL: ${url}`;
  alert(msg);
}

let autoSyncInterval=null;
function autoSyncSheet(){
  if(autoSyncInterval){clearInterval(autoSyncInterval);autoSyncInterval=null;showToast('Auto-sync stopped');document.getElementById('gs-sync-status').textContent='';return;}
  const url=document.getElementById('gs-url').value.trim();
  if(!url){showToast('Paste URL first');return;}
  connectGoogleSheet();
  autoSyncInterval=setInterval(()=>{fetchGoogleSheet(url);document.getElementById('gs-sync-status').textContent='Last sync: '+new Date().toLocaleTimeString();},5*60*1000);
  document.getElementById('gs-sync-status').textContent='Auto-sync active — updates every 5 minutes';
  showToast('Auto-sync enabled!');
}

function testGoogleSheet(){
  const url=document.getElementById('gs-url').value.trim();
  if(!url){showToast('Paste URL first');return;}
  // Open both the raw CSV and the sheet view
  let csvUrl=url;
  if(!csvUrl.includes('output=csv'))csvUrl+=(csvUrl.includes('?')?'&':'?')+'output=csv';
  window.open(csvUrl,'_blank');
  showToast('Opened CSV in new tab — you should see raw comma-separated data');
}

// ══════════════════════════════════════════════════════
// EXPORT
// ══════════════════════════════════════════════════════
function exportCSV(){
  const headers=['id','name','owner','category','phone','address','city','county','state','zip','websiteStatus','pitchAngle','tier','priority','notes'];
  const rows=state.leads.map(l=>headers.map(h=>`"${(l[h]||'').toString().replace(/"/g,'""')}"`).join(','));
  const csv=headers.join(',')+'\n'+rows.join('\n');
  const blob=new Blob([csv],{type:'text/csv'});
  const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='zagaprime-leads-'+new Date().toISOString().split('T')[0]+'.csv';a.click();
  showToast('Leads exported!');
}

function exportAnalytics(){
  const headers=['leadId','businessName','stageId','stageLabel','value','note','timestamp'];
  const rows=[];
  Object.entries(state.activity).forEach(([id,act])=>{
    const l=state.leads.find(x=>x.id===id);
    Object.entries(act.stages||{}).forEach(([stageId,sv])=>{
      const stageInfo=STAGES_DEF.find(s=>s.id===stageId);
      rows.push([id,l?l.name:'',stageId,stageInfo?stageInfo.label:'',sv.value,sv.note||'',sv.timestamp||''].map(v=>`"${v}"`).join(','));
    });
  });
  const csv=headers.join(',')+'\n'+rows.join('\n');
  const blob=new Blob([csv],{type:'text/csv'});
  const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='zagaprime-analytics-'+new Date().toISOString().split('T')[0]+'.csv';a.click();
  showToast('Analytics exported!');
}

function clearAnalytics(){
  if(!confirm('Clear all activity data? This cannot be undone.'))return;
  state.activity={};saveToLS();renderLeads();renderAnalytics();showToast('Activity data cleared');
}

// ══════════════════════════════════════════════════════
// SETTINGS
// ══════════════════════════════════════════════════════
function loadSettingsUI(){
  const s=state.settings;
  document.getElementById('set-name').value=s.name||'';
  document.getElementById('set-email').value=s.email||'';
  document.getElementById('set-phone').value=s.phone||'';
  document.getElementById('set-company').value=s.company||'';
  const gsUrl=localStorage.getItem('zp_gs_url')||'';
  document.getElementById('gs-url').value=gsUrl;
  updateStorageInfo();
}
function saveSettings(){
  state.settings={name:document.getElementById('set-name').value,email:document.getElementById('set-email').value,phone:document.getElementById('set-phone').value,company:document.getElementById('set-company').value};
  saveToLS();
}
function updateStorageInfo(){
  const el=document.getElementById('storage-info');
  if(!el)return;
  const leadsSize=JSON.stringify(state.leads).length;
  const actSize=JSON.stringify(state.activity).length;
  el.textContent=`Leads: ${state.leads.length} records (${Math.round(leadsSize/1024)}KB) · Activity: ${Object.keys(state.activity).length} logs (${Math.round(actSize/1024)}KB) · Stored locally in your browser`;
}

// ══════════════════════════════════════════════════════
// TOAST
// ══════════════════════════════════════════════════════
function showToast(msg){
  const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'),2500);
}

// ══════════════════════════════════════════════════════
// QUICK FILTER — CLICKABLE STAT CARDS
// ══════════════════════════════════════════════════════

function quickFilter(type){
  if(type==='all'){
    state.activeQuickFilter=state.activeQuickFilter==='all'?null:'all';
  }else if(state.activeQuickFilter===type){
    state.activeQuickFilter=null;
  }else{
    state.activeQuickFilter=type;
  }
  if(!state.activeQuickFilter){
    document.querySelectorAll('.ts-btn').forEach(b=>b.classList.remove('active-filter'));
    const bar=document.getElementById('filter-active-bar');
    if(bar)bar.style.display='none';
  }
  // Make sure we're on leads view
  const leadsNavEl=document.querySelector('[data-view=leads]');
  showView('leads',leadsNavEl);
  renderLeads();
  updateFilterBar();
  updateStats();
}

// ══════════════════════════════════════════════════════
// SAVED SEARCHES
// ══════════════════════════════════════════════════════

function saveCurrentSearch(){
  const filters=captureCurrentFilters();
  const qf=state.activeQuickFilter;
  const hasContent=Object.values(filters).some(v=>v)||qf;
  if(!hasContent){showToast('Apply some filters first, then save');return;}
  const desc=qf?{all:'All leads',hot:'Tier 1 Hot leads',worked:'Leads with activity',inprogress:'In-progress leads',won:'Closed Won leads'}[qf]:buildFilterDesc(filters);
  const name=prompt('Name this saved search:',desc);
  if(!name)return;
  const count=getFilteredLeads().length;
  state.savedSearches.unshift({
    id:Date.now(),
    name,
    desc: count+' lead'+(count!==1?'s':''),
    filters,
    quickFilter:qf,
    timestamp:new Date().toISOString()
  });
  saveToLS();
  updateStats();
  showToast('Search saved: '+name);
  if(state.currentView==='searches')renderSavedSearches();
}

function applySavedSearch(id){
  const ss=state.savedSearches.find(s=>s.id===id);
  if(!ss)return;
  if(ss.quickFilter){
    state.activeQuickFilter=ss.quickFilter;
    // Clear text filters
    ['f-search','f-state','f-county','f-city','f-category','f-tier','f-web'].forEach(fid=>{const el=document.getElementById(fid);if(el)el.value='';});
  }else{
    state.activeQuickFilter=null;
    applyFiltersFromObj(ss.filters);
  }
  showView('leads',document.querySelector('[data-view=leads]'));
  renderLeads();
  updateFilterBar();
  updateStats();
  showToast('Applied: '+ss.name);
}

function deleteSavedSearch(id,event){
  event.stopPropagation();
  state.savedSearches=state.savedSearches.filter(s=>s.id!==id);
  saveToLS();
  updateStats();
  renderSavedSearches();
  showToast('Search deleted');
}

function clearAllSavedSearches(){
  if(!confirm('Clear all saved searches?'))return;
  state.savedSearches=[];
  saveToLS();
  updateStats();
  renderSavedSearches();
}

function renderSavedSearches(){
  const container=document.getElementById('saved-searches-list');
  if(!container)return;
  if(!state.savedSearches.length){
    container.innerHTML='<div class="empty"><div class="empty-icon">🔖</div><div class="empty-text">No saved searches yet — apply filters on the leads view and click "Save Current Filters"</div></div>';
    return;
  }
  container.innerHTML=state.savedSearches.map(ss=>{
    const ts=new Date(ss.timestamp).toLocaleDateString();
    return`<div class="saved-search-item" onclick="applySavedSearch(${ss.id})">
      <div style="font-size:20px">🔖</div>
      <div style="flex:1">
        <div class="ss-name">${ss.name}</div>
        <div class="ss-desc">${ss.desc} · Saved ${ts}</div>
      </div>
      <div class="ss-actions">
        <button class="btn btn-primary btn-sm" onclick="applySavedSearch(${ss.id});event.stopPropagation()">Apply</button>
        <button class="btn btn-red btn-sm" onclick="deleteSavedSearch(${ss.id},event)">Delete</button>
      </div>
    </div>`;
  }).join('');
}

// ══════════════════════════════════════════════════════
// SEARCH HISTORY
// ══════════════════════════════════════════════════════

function renderSearchHistory(){
  const container=document.getElementById('search-history-list');
  if(!container)return;
  if(!state.searchHistory.length){
    container.innerHTML='<div class="empty" style="padding:32px"><div class="empty-text">No search history yet — start filtering leads to build history</div></div>';
    return;
  }
  container.innerHTML=state.searchHistory.slice(0,50).map(h=>{
    const ts=new Date(h.timestamp).toLocaleString();
    const desc=h.query||buildFilterDesc(h.filters||{});
    return`<div class="history-item" onclick="applyHistorySearch('${h.id}')">
      <span style="font-size:14px;opacity:0.6">🕐</span>
      <span class="hi-query">${desc}</span>
      <span class="hi-count">${h.resultCount} result${h.resultCount!==1?'s':''}</span>
      <span class="hi-time">${ts}</span>
      <button onclick="saveHistorySearch(${h.id},event)" style="background:transparent;border:1px solid var(--border);color:var(--muted);border-radius:6px;padding:2px 8px;font-size:10px;cursor:pointer;margin-left:4px;" title="Save this search">🔖</button>
    </div>`;
  }).join('');
}

function applyHistorySearch(id){
  const h=state.searchHistory.find(s=>String(s.id)===String(id));
  if(!h)return;
  applyFiltersFromObj(h.filters||{});
}

function saveHistorySearch(id,event){
  event.stopPropagation();
  const h=state.searchHistory.find(s=>String(s.id)===String(id));
  if(!h)return;
  const desc=h.query||buildFilterDesc(h.filters||{});
  const name=prompt('Name this saved search:',desc);
  if(!name)return;
  state.savedSearches.unshift({id:Date.now(),name,desc:h.resultCount+' results',filters:h.filters||{},quickFilter:null,timestamp:new Date().toISOString()});
  saveToLS();
  updateStats();
  showToast('Saved: '+name);
}

function clearSearchHistory(){
  if(!confirm('Clear all search history?'))return;
  state.searchHistory=[];
  saveToLS();
  renderSearchHistory();
  showToast('History cleared');
}

// ══════════════════════════════════════════════════════
// GOOGLE SHEETS SYNC — PUSH DATA OUT
// ══════════════════════════════════════════════════════

function saveWebAppUrl() {
  const url = document.getElementById('gs-webapp-url').value.trim();
  if (url) localStorage.setItem('zp_webapp_url', url);
}

function loadWebAppUrl() {
  const url = localStorage.getItem('zp_webapp_url') || '';
  const el = document.getElementById('gs-webapp-url');
  if (el) el.value = url;
  return url;
}

function copyAppsScript() {
  const el = document.getElementById('apps-script-code');
  if (!el) return;
  // Decode HTML entities for copying
  const tmp = document.createElement('textarea');
  tmp.innerHTML = el.innerText;
  navigator.clipboard.writeText(el.innerText).then(() => {
    showToast('Apps Script code copied!');
  });
}

async function syncToSheets() {
  const webAppUrl = localStorage.getItem('zp_webapp_url') || '';
  const btn = document.getElementById('sync-btn');
  
  if (!webAppUrl) {
    // No web app configured — fall back to CSV download
    showToast('No web app URL set — downloading CSV instead...');
    setTimeout(() => {
      exportFullSyncCSV();
    }, 500);
    return;
  }
  
  if (btn) { btn.textContent = '⏳ Syncing...'; btn.disabled = true; }
  
  // Build the full sync payload — leads + activity merged
  const leadsWithStages = state.leads.map(l => {
    const act = state.activity[l.id] || {};
    return { ...l, _stages: act.stages || {} };
  });
  
  const payload = {
    type: 'full_sync',
    leads: leadsWithStages,
    activity: state.activity,
    synced_at: new Date().toISOString()
  };
  
  // Try direct POST, then CORS proxies
  const proxies = [
    url => url,
    url => `https://corsproxy.io/?${encodeURIComponent(url)}`,
    url => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`
  ];
  
  let success = false;
  for (const proxyFn of proxies) {
    try {
      const r = await fetch(proxyFn(webAppUrl), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(10000)
      });
      const result = await r.json();
      if (result.success) {
        success = true;
        const syncTime = new Date().toLocaleString();
        localStorage.setItem('zp_last_sync', syncTime);
        document.getElementById('gs-sync-status').textContent = '✅ Synced to Google Sheets at ' + syncTime;
        if (document.getElementById('gs-status')) {
          document.getElementById('gs-status').innerHTML = '<div class="gs-dot" style="background:var(--green)"></div>Sheets: Synced ' + new Date().toLocaleTimeString();
          document.getElementById('gs-status').className = 'gs-connected';
        }
        showToast('✅ ' + state.leads.length + ' leads synced to Google Sheets!');
        break;
      }
    } catch(e) { /* try next proxy */ }
  }
  
  if (!success) {
    // All methods failed — export CSV as fallback
    showToast('Web app unreachable — downloading CSV backup...');
    exportFullSyncCSV();
    document.getElementById('gs-sync-status').textContent = '⚠️ Direct sync failed — CSV downloaded as backup';
  }
  
  if (btn) { btn.textContent = '☁ Sync to Sheets'; btn.disabled = false; }
}

function exportFullSyncCSV() {
  // Full export including all stage data — ready to paste into Google Sheets
  const headers = ['priority','business_name','owner_name','category','phone',
    'address','city','county','state','zip','website_status','online_presence',
    'pitch_angle','tier','years_in_business','notes',
    'stage_research','stage_first_call','stage_email_sent','stage_discovery_call',
    'stage_proposal_sent','stage_follow_up','stage_decision','stage_notes',
    'deal_value','last_contacted','next_action','next_action_date','assigned_to','date_added'];
  
  const rows = state.leads.map(l => {
    const act = state.activity[l.id] || {};
    const stages = act.stages || {};
    const stageNote = Object.values(stages).map(s=>s.note).filter(Boolean).join(' | ');
    return headers.map(h => {
      if (h === 'stage_research') return stages.research?.value || '';
      if (h === 'stage_first_call') return stages.first_call?.value || '';
      if (h === 'stage_email_sent') return stages.email_sent?.value || '';
      if (h === 'stage_discovery_call') return stages.discovery_call?.value || '';
      if (h === 'stage_proposal_sent') return stages.proposal_sent?.value || '';
      if (h === 'stage_follow_up') return stages.follow_up?.value || '';
      if (h === 'stage_decision') return stages.decision?.value || '';
      if (h === 'stage_notes') return stageNote;
      return `"${String(l[h]||'').replace(/"/g,'""')}"`;
    }).join(',');
  });
  
  const csv = headers.join(',') + '\n' + rows.join('\n');
  const blob = new Blob([csv], {type:'text/csv'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'LeadFunnel-sync-' + new Date().toISOString().split('T')[0] + '.csv';
  a.click();
}

function testWebApp() {
  const url = document.getElementById('gs-webapp-url').value.trim();
  if (!url) { showToast('Paste your web app URL first'); return; }
  saveWebAppUrl();
  fetch(url).then(r => r.json()).then(d => {
    if (d.status) { showToast('✅ Connected: ' + d.status); document.getElementById('gs-sync-status').textContent = '✅ Web app is live and responding'; }
    else showToast('⚠️ Got response but unexpected format');
  }).catch(e => {
    // Try via proxy
    fetch(`https://corsproxy.io/?${encodeURIComponent(url)}`).then(r=>r.json()).then(d=>{
      showToast('✅ Connected via proxy');
    }).catch(() => showToast('❌ Could not reach web app — check the URL'));
  });
}

let autoSyncTimer = null;
function toggleAutoSync() {
  if (autoSyncTimer) {
    clearInterval(autoSyncTimer);
    autoSyncTimer = null;
    showToast('Auto-sync stopped');
    document.getElementById('gs-sync-status').textContent = 'Auto-sync disabled';
  } else {
    syncToSheets();
    autoSyncTimer = setInterval(syncToSheets, 5 * 60 * 1000);
    showToast('Auto-sync every 5 min enabled');
    document.getElementById('gs-sync-status').textContent = 'Auto-sync active — syncing every 5 minutes';
  }
}

// ══════════════════════════════════════════════════════
// INIT
// ══════════════════════════════════════════════════════
function init(){
  loadFromLS();
  populateFilters();
  renderLeads();
  renderFindResults();
  setFindSearchStatus('Live no-website search uses the Vercel /api/search-leads endpoint. Claude is not required.', 'info');
  // Load web app URL into settings field
  const webUrl = localStorage.getItem('zp_webapp_url')||'';
  const webEl = document.getElementById('gs-webapp-url');
  if(webEl && webUrl) webEl.value = webUrl;
  // Render saved searches count in nav
  updateStats();
  // Show last sync time
  const lastSync = localStorage.getItem('zp_last_sync');
  const statusEl = document.getElementById('gs-sync-status');
  if(lastSync && statusEl) statusEl.textContent = 'Last synced: '+lastSync;
  // Update sidebar status dot
  const gsStatus = document.getElementById('gs-status');
  if(gsStatus){
    if(webUrl){
      gsStatus.innerHTML='<div class="gs-dot" style="background:var(--green)"></div>Sheets: Configured';
      gsStatus.className='gs-connected';
    } else {
      gsStatus.innerHTML='<div class="gs-dot" style="background:var(--amber)"></div>Sheets: Setup needed';
      gsStatus.className='gs-disconnected';
    }
  }
}
init();

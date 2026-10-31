'use strict';
const REPO='https://github.com/boxwrench/Explainable-Industrial-Cyberattack-Detection';
const $=s=>document.querySelector(s);
const names={full_lstm:'Full LSTM',selected_lstm:'Selected LSTM',neurosymbolic_core:'NS CORE',neurosymbolic_extended:'NS Extended'};
const inputs={full_lstm:'51 raw · 0 symbolic',selected_lstm:'25 raw · 0 symbolic',neurosymbolic_core:'25 raw · 6 symbolic',neurosymbolic_extended:'25 raw · 16 symbolic'};
const labels={CORE:'CORE',RETAIN_WITH_CAVEAT:'With caveats',LIMITED:'Limited',REJECT:'Rejected'};
const classes={CORE:'core',RETAIN_WITH_CAVEAT:'caveat',LIMITED:'limited',REJECT:'reject'};
let data,selectedRule='S1-R1',metric='MCC',selectedCell='';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
document.querySelectorAll('[data-source]').forEach(a=>{a.href=REPO+'/blob/main/'+a.dataset.source;});
function renderRules(){
 const q=$('#search').value.trim().toLowerCase(),st=$('#stage').value,status=$('#status').value;
 const list=data.rules.filter(r=>(st==='all'||r.stage===st)&&(status==='all'||r.status===status)&&[r.id,r.relationship,r.tags,r.reason].join(' ').toLowerCase().includes(q));
 $('#rule-count').textContent=list.length+' of 27';
 if(list.length&&!list.some(r=>r.id===selectedRule))selectedRule=list[0].id;
 $('#rules').innerHTML=list.length?list.map(r=>`<button class="rule-row" data-rule="${esc(r.id)}" aria-pressed="${r.id===selectedRule}"><strong>${esc(r.id)}</strong><span class="rel">${esc(r.relationship.replace(/<->/g,'↔').replace(/->/g,'→'))}</span><span class="status-label"><i class="${classes[r.status]}"></i>${labels[r.status]}</span></button>`).join(''):'<p class="empty">No relationships match. Try another filter.</p>';
 if(list.length)renderDetail(data.rules.find(r=>r.id===selectedRule));else $('#rule-detail').innerHTML='<h3>No matching relationships</h3><p>Reset the filters to browse all 27 candidates.</p>';
 $('#rules').querySelectorAll('button').forEach(b=>b.onclick=()=>{selectedRule=b.dataset.rule;renderRules();});
}
function renderDetail(r){
 const clean=r.evidence.replace(/np\.(?:float64|int64)\(([^()]*)\)/g,'$1');
 $('#rule-detail').style.borderTopColor=getComputedStyle(document.documentElement).getPropertyValue('--'+classes[r.status]);
 $('#rule-detail').innerHTML=`<p class="eyebrow">${esc(r.stage)} / ${esc(r.id)}</p><span class="status-label"><i class="${classes[r.status]}"></i>${labels[r.status]}</span><h3>${esc(r.relationship.replace(/<->/g,'↔').replace(/->/g,'→'))}</h3><h4>Audit decision</h4><p>${esc(r.reason)}</p><h4>Validation coverage</h4><p class="coverage">${esc(/^\d+(\.\d+)?$/.test(r.coverage)?Number(r.coverage).toFixed(2)+'%':r.coverage)}</p><h4>Limitations</h4><p>${esc(r.limitation)}</p><details><summary>Inspect the recorded evidence</summary><h4>Training evidence</h4><p class="raw">${esc(clean)}</p><h4>Distribution shift</h4><p>${esc(r.shift)}</p><h4>Redundancy / lag</h4><p>${esc(r.redundancy)}. ${esc(r.lag)}</p></details>`;
}
function renderMetrics(){
 const aggregation=$('#seed').value;const isMean=aggregation==='Mean';
 let html='';
 Object.keys(names).forEach(model=>{
  const row=data.metrics.find(r=>r.Model===model&&r.Metric===metric);const value=Number(row[aggregation]),sd=Number(row.Std);const max=1;
  const left=Math.max(0,value-sd)*100/max,right=Math.min(max,value+sd)*100/max;
  html+=`<div class="metric-row ${model==='neurosymbolic_core'?'is-core':''}"><div class="metric-name">${names[model]}<small>${inputs[model]}</small></div><div class="bar-track" role="img" aria-label="${names[model]}: ${metric} ${value.toFixed(3)}${isMean?', standard deviation '+sd.toFixed(3):''}"><div class="bar-fill" style="width:${Math.max(0,value)*100}%"></div>${isMean?`<div class="error-line" style="left:${left}%;width:${right-left}%"></div>`:''}</div><div class="metric-val">${value.toFixed(3)}${isMean?` <small>± ${sd.toFixed(3)}</small>`:''}</div></div>`;
 });
 $('#metric-chart').innerHTML=html+'<div class="axis-labels"><span>0.0</span><span>0.25</span><span>0.50</span><span>0.75</span><span>1.0</span></div>';
 const description={MCC:'Matthews correlation coefficient summarizes binary classification across all confusion-matrix outcomes. Its full range is −1 to 1; all displayed runs are nonnegative, so the view shows 0 to 1.',F1:'F1 is the harmonic mean of precision and recall. Higher values indicate a better balance between finding attack observations and avoiding false detections.',ROC_AUC:'ROC-AUC measures ranking across classification thresholds. Higher is better. Stronger thresholded MCC does not imply stronger AUC.',Recall:'Recall is the fraction of attack observations detected. These test values expose how many attack observations the models miss.'};
 $('#metric-description').textContent=description[metric]+' Values come from the frozen final TEST results table.';
}
function renderEvents(){
 const split=$('#partition').value;const intervals=data.intervals.filter(r=>r.split===split);const count=intervals.length;
 let html=`<div class="heat-row" style="--cols:${count}"><span></span>${intervals.map(r=>`<div class="heat-heading">${split} ${r.interval_idx}<br>${Number(r.duration_sec)} s</div>`).join('')}</div>`;
 Object.keys(names).forEach(model=>{
  html+=`<div class="heat-row" style="--cols:${count}"><span class="heat-model">${names[model]}</span>`;
  intervals.forEach(i=>{
   const r=data.events.find(r=>r.Split===split&&r.Model===model&&r.Interval===i.interval_idx);const value=Number(r.mean);const rgb=[52,73,82].map((v,k)=>Math.round(v+value*([105,209,183][k]-v)));
   html+=`<button class="heat-cell" style="background:rgb(${rgb.join(',')});color:${value>.55?'#102f2a':'#fff'}" data-event="${model}:${i.interval_idx}" aria-pressed="false" aria-label="${names[model]}, ${split} interval ${i.interval_idx}, mean recall ${(value*100).toFixed(1)} percent">${(value*100).toFixed(1)}%</button>`;
  });html+='</div>';
 });$('#heatmap').innerHTML=html;
 $('#event-detail').textContent='Select any cell for interval details. Dates below are dataset timestamps, not current activity.';
 $('#heatmap').querySelectorAll('button').forEach(b=>b.onclick=()=>{
  $('#heatmap').querySelectorAll('button').forEach(c=>c.setAttribute('aria-pressed',String(c===b)));
  const [model,idx]=b.dataset.event.split(':');const r=data.events.find(r=>r.Split===split&&r.Model===model&&r.Interval===idx);const i=intervals.find(i=>i.interval_idx===idx);
  $('#event-detail').textContent=`${names[model]} · ${split} interval ${idx}: ${(Number(r.mean)*100).toFixed(1)}% mean observation recall (SD ${(Number(r.std)*100).toFixed(1)} percentage points). ${Number(i.n_rows).toLocaleString()} attack observations across ${i.duration_sec} seconds. Dataset interval: ${i.start_ts.slice(0,19).replace('T',' ')} to ${i.end_ts.slice(0,19).replace('T',' ')}. This is a recorded experiment, not a live alert.`;
 });
}
['search','stage','status'].forEach(id=>$('#'+id).addEventListener(id==='search'?'input':'change',()=>data&&renderRules()));
$('#reset').onclick=()=>{$('#search').value='';$('#stage').value='all';$('#status').value='all';renderRules();};
document.querySelectorAll('[data-jump]').forEach(a=>a.onclick=()=>{$('#status').value=a.dataset.jump;$('#stage').value='all';$('#search').value='';if(data)renderRules();});
document.querySelectorAll('[data-metric]').forEach(b=>b.onclick=()=>{metric=b.dataset.metric;document.querySelectorAll('[data-metric]').forEach(c=>c.setAttribute('aria-pressed',String(c===b)));if(data)renderMetrics();});
$('#seed').onchange=()=>data&&renderMetrics();$('#partition').onchange=()=>data&&renderEvents();
document.querySelectorAll('[data-image]').forEach(b=>b.onclick=()=>{$('#large-figure').src=b.dataset.image;$('#figure-dialog').showModal();});
$('#close-figure').onclick=()=>$('#figure-dialog').close();$('#figure-dialog').onclick=e=>{if(e.target===$('#figure-dialog'))$('#figure-dialog').close();};
fetch('assets/data.json').then(r=>{if(!r.ok)throw Error('data');return r.json();}).then(d=>{data=d;renderRules();renderMetrics();renderEvents();}).catch(()=>{$('#load-error').hidden=false;$('#rule-count').textContent='Unavailable';});

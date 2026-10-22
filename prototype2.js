/* Head Hunters / Prototype 02
   Recruiter-driven criteria, filtering, sorting, evidence review and shortlist.
   The report uses exactly the shared fictional data from Prototype 01.
   No automated applicant assessments or actual interview calls happen here. */
(() => {
  'use strict';
  const D = window.ReportData;
  if (!D?.roles || !D?.candidates || !D?.evidenceFor) {
    document.body.insertAdjacentHTML('afterbegin','<p role="alert" style="padding:20px">Shared report data could not be loaded. Make sure report-data.js and interview-evidence.js are in the same folder.</p>');
    return;
  }
  const $ = id => document.getElementById(id);
  const html = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const initialRole = new URLSearchParams(location.search).get('role');
  let stored = {};
  try { stored = JSON.parse(localStorage.getItem('hh-prototype2-state') || '{}') || {}; } catch { /* Safari private mode and file previews can restrict storage */ }
  const state = {
    role: D.roles[initialRole] ? initialRole : 'ai',
    preset: 'balanced',
    rules: [],
    logic: 'all',
    query: '',
    sort: 'name',
    direction: 'asc',
    view: 'matched',
    compare: false,
    current: null,
    shortlist: stored.shortlist && typeof stored.shortlist === 'object' ? stored.shortlist : {},
    notes: stored.notes && typeof stored.notes === 'object' ? stored.notes : {}
  };
  let nextRuleId = 1;
  const metricList = () => D.roles[state.role].metrics;
  const metricFor = id => metricList().find(m => m[0] === id);
  const score = (candidate, id) => D.score(candidate, metricFor(id));
  const candidateById = id => D.candidates.find(c => c.id === id);
  const list = () => Array.isArray(state.shortlist[state.role]) ? state.shortlist[state.role] : [];
  const selected = id => list().includes(id);
  const asYears = c => Number.parseInt(c.years,10) || 0;
  const pad = n => String(n).padStart(2,'0');

  function save() {
    try { localStorage.setItem('hh-prototype2-state',JSON.stringify({shortlist:state.shortlist, notes:state.notes})); } catch {/* keep in memory */}
  }
  function freshRule(metric, min, required=true) {
    return { id: nextRuleId++, metric, min, required };
  }
  function setPreset(name) {
    const presets = {
      balanced: [['python',85,true],['team',85,true]],
      technical: [['python',88,true],['ai',82,true],['ownership',82,false]],
      team: [['team',91,true],['thinking',88,true],['prioritization',85,false]],
      none: []
    };
    state.rules = (presets[name] || []).map(args => freshRule(...args));
    state.preset = name;
    state.logic = 'all';
    state.sort = 'name';
    state.direction = 'asc';
    state.view = 'matched';
    state.compare = false;
    renderEverything();
  }
  function hasRequiredMatch(c) {
    const checks = state.rules.filter(rule => rule.required).map(rule => score(c,rule.metric) >= rule.min);
    return !checks.length || (state.logic === 'all' ? checks.every(Boolean) : checks.some(Boolean));
  }
  function countPreferred(c) {
    const preferences = state.rules.filter(rule => !rule.required);
    return {achieved:preferences.filter(r => score(c,r.metric)>=r.min).length,total:preferences.length};
  }
  function visibleCandidates() {
    let result = D.candidates.filter(c => {
      if (state.view === 'matched' && !hasRequiredMatch(c)) return false;
      if (state.view === 'shortlisted' && !selected(c.id)) return false;
      if (state.query && !c.name.toLocaleLowerCase().includes(state.query.toLocaleLowerCase())) return false;
      return true;
    });
    result = result.sort((a,b) => {
      let difference = 0;
      if (state.sort === 'name') difference = a.name.localeCompare(b.name);
      else if (state.sort === 'years') difference = asYears(a)-asYears(b);
      else if (metricFor(state.sort)) difference = score(a,state.sort)-score(b,state.sort);
      return (state.direction === 'asc' ? difference : -difference) || a.name.localeCompare(b.name);
    });
    return result;
  }
  function renderRules() {
    const selectedMetrics = new Set(state.rules.map(r=>r.metric));
    $('criteria-list').innerHTML = state.rules.length ? state.rules.map((r,i)=> `
      <article class="p2-rule" data-rule-id="${r.id}">
        <div class="p2-rule-top"><span class="p2-rule-index">${pad(i+1)}</span>
          <label class="sr-only" for="metric-${r.id}">Competency ${i+1}</label>
          <select class="p2-rule-metric" id="metric-${r.id}" data-field="metric" data-id="${r.id}">
            ${metricList().map(m=>`<option value="${m[0]}" ${m[0]===r.metric?'selected':''} ${selectedMetrics.has(m[0])&&m[0]!==r.metric?'disabled':''}>${html(m[1])}</option>`).join('')}
          </select><button class="p2-remove" aria-label="Remove ${html(metricFor(r.metric)[1])} criterion" type="button" data-remove="${r.id}">×</button></div>
        <div class="p2-rule-range-head"><label for="min-${r.id}">Minimum score</label><b id="min-label-${r.id}">${r.min} /100</b></div>
        <input class="p2-slider" type="range" min="0" max="100" step="5" value="${r.min}" id="min-${r.id}" data-field="min" data-id="${r.id}" aria-label="Minimum score for ${html(metricFor(r.metric)[1])}">
        <div class="p2-rule-bottom"><label class="sr-only" for="type-${r.id}">Criterion priority</label><select id="type-${r.id}" data-field="required" data-id="${r.id}" class="p2-rule-type"><option value="true" ${r.required?'selected':''}>Required</option><option value="false" ${!r.required?'selected':''}>Preferred</option></select><span class="p2-rule-hint">${r.required?'Filters candidates':'For comparison only'}</span></div>
      </article>`).join('') : `<div class="p2-empty-comp"><p>No criteria yet. Add a competency to build your own screening view.</p></div>`;
    $('rule-counter').textContent=`${state.rules.length} selected`;
    $('add-rule').disabled=state.rules.length >= metricList().length;
    $('preset').value=state.preset;
    document.querySelectorAll('[data-logic]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.logic===state.logic)));
  }
  function renderSortOptions() {
    const options=[['name','Name'],['years','Experience'], ...metricList().map(m=>[m[0],m[1]])];
    $('sort').innerHTML=options.map(([id,label])=>`<option value="${id}" ${id===state.sort?'selected':''}>${html(label)}</option>`).join('');
    $('direction').textContent=state.sort==='name' ? (state.direction==='asc'?'A → Z':'Z → A') : (state.direction==='asc'?'↑ Low first':'↓ High first');
    $('direction').setAttribute('aria-label',state.direction==='asc'?'Sort descending':'Sort ascending');
  }
  function renderStats() {
    const count=D.candidates.filter(hasRequiredMatch).length;
    $('stat-matches').textContent=pad(count);
    $('stat-shortlist').textContent=pad(list().length);
    $('compare-count').textContent=`(${list().length})`;
    $('results-caption').textContent= state.rules.length
      ? `${state.rules.filter(r=>r.required).length} required and ${state.rules.filter(r=>!r.required).length} preferred competencies · No fixed ranking.`
      : 'Start with all candidates. Add requirements or sort by the competencies you care about.';
  }
  const valueCell = (c,r) => {
    const val=score(c,r.metric);
    const pass=val>=r.min;
    return `<span class="p2-score-cell ${r.required?(pass?'pass':'fail'):'pref'}" title="${html(metricFor(r.metric)[1])}: ${val}/100; ${r.required?'required':'preferred'} minimum ${r.min}">${val} ${r.required?`<span class="p2-check" aria-label="${pass?'meets':'below'} required minimum">${pass?'✓':'–'}</span>`:''}</span>`;
  };
  function renderTable() {
    const candidates=visibleCandidates();
    $('visible-count').textContent=`${candidates.length} of ${D.candidates.length} shown`;
    document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===state.view)));
    if(!candidates.length) {
      $('table-container').innerHTML = `<div class="p2-empty"><div class="p2-empty-icon">⌕</div><h3>No candidates in this view.</h3><p>Try lowering the required thresholds, showing all applicants, or clearing your search. No candidate has been automatically rejected.</p><button type="button" data-showall>Show all applicants →</button></div>`;
      return;
    }
    const sortArrow=id=>id===state.sort?(state.direction==='asc'?'↑':'↓'):'↕';
    $('table-container').innerHTML=`<table class="p2-table"><thead><tr>
      <th scope="col" aria-sort="${state.sort==='name'?(state.direction==='asc'?'ascending':'descending'):'none'}"><button type="button" data-sort="name">Candidate ${sortArrow('name')}</button></th>
      <th scope="col" aria-sort="${state.sort==='years'?(state.direction==='asc'?'ascending':'descending'):'none'}"><button type="button" data-sort="years">Experience ${sortArrow('years')}</button></th>
      ${state.rules.map(r=>`<th scope="col" aria-sort="${state.sort===r.metric?(state.direction==='asc'?'ascending':'descending'):'none'}"><button type="button" data-sort="${r.metric}" title="Sort by ${html(metricFor(r.metric)[1])}">${html(metricFor(r.metric)[1])} ${sortArrow(r.metric)}</button></th>`).join('')}
      <th scope="col">Rule status</th><th scope="col">Human decision</th>
      </tr></thead><tbody>${candidates.map(c=>{
      const matches=hasRequiredMatch(c), preferred=countPreferred(c);
      return `<tr data-match="${matches}"><td><div class="p2-table-candidate"><span class="p2-avatar" style="--avatar:${c.color}">${html(c.initials)}</span><div><button type="button" class="p2-candidate-name" data-evidence="${c.id}">${html(c.name)}</button><span class="p2-candidate-sub">Interview completed · Demo</span></div></div></td>
        <td><span class="p2-number">${html(c.years)}</span></td>
        ${state.rules.map(r=>`<td>${valueCell(c,r)}</td>`).join('')}
        <td><span class="p2-status ${matches?'':'review'}"><span class="p2-dot ${matches?'p2-dot-yes':'p2-dot-no'}"></span>${matches?'Meets required':'Below threshold'}</span>${preferred.total?`<div class="p2-candidate-sub">${preferred.achieved}/${preferred.total} preferred</div>`:''}</td>
        <td><div class="p2-actions"><button class="p2-view-evidence" type="button" data-evidence="${c.id}">Evidence ↗</button><button class="p2-save" type="button" data-shortlist="${c.id}" data-active="${selected(c.id)}" aria-pressed="${selected(c.id)}">${selected(c.id)?'✓ Saved':'+ Shortlist'}</button></div></td></tr>`;}).join('')}</tbody></table>`;
  }
  function renderCompare() {
    const container=$('compare-panel');
    container.hidden=!state.compare;
    $('compare').setAttribute('aria-pressed',String(state.compare));
    if(!state.compare)return;
    const comparison=D.candidates.filter(c=>selected(c.id));
    const cols=metricList();
    container.innerHTML=`<div class="p2-comparison-head"><div><p class="eyebrow">03 / YOUR SELECTED CANDIDATES</p><h3>Side-by-side comparison</h3></div><button type="button" class="p2-close-small" data-close-compare>Close ×</button></div>
      <p>Only people you manually add appear here. This table uses the same assessment dimensions; it does not choose a winner.</p>
      ${comparison.length?`<div class="p2-compare-grid"><table><thead><tr><th scope="col">Competency</th>${comparison.map(c=>`<th scope="col"><button type="button" class="p2-candidate-name" data-evidence="${c.id}">${html(c.name)} ↗</button><button class="p2-link-button" type="button" data-shortlist="${c.id}" aria-label="Remove ${html(c.name)} from shortlist">Remove</button></th>`).join('')}</tr></thead><tbody>
        <tr><td>Experience</td>${comparison.map(c=>`<td>${html(c.years)}</td>`).join('')}</tr>
        ${cols.map(m=>`<tr><td>${html(m[1])}</td>${comparison.map(c=>`<td><span class="p2-compare-score">${D.score(c,m)}/100</span></td>`).join('')}</tr>`).join('')}
      </tbody></table></div>`:`<div class="p2-empty-comp"><p>Your shortlist is empty. Add candidates using the “+ Shortlist” controls above to compare them.</p></div>`}`;
  }
  function renderEverything() {
    renderRules();renderSortOptions();renderStats();renderTable();renderCompare();
    $('role').value=state.role;
  }
  function toggleShortlist(id) {
    if(!candidateById(id))return;
    const items=[...list()];
    const next=items.includes(id)?items.filter(x=>x!==id):[...items,id];
    state.shortlist[state.role]=next;save();
    renderStats();renderTable();renderCompare();
    if(state.current===id && $('detail-dialog').open) updateDetail();
  }
  function renderEvidence(e,index) {
    return `<article class="p2-evidence-card"><div class="p2-focus">INTERVIEW EXAMPLE ${pad(index+1)} · ${html(e.focus)}</div><h4>${html(e.title)}</h4><dl><div><dt>Interview question</dt><dd>${html(e.prompt)}</dd></div><div><dt>Context</dt><dd>${html(e.context)}</dd></div><div><dt>What the candidate says they did</dt><dd>${html(e.action)}</dd></div><div><dt>Reported result & limitations</dt><dd>${html(e.result)}</dd></div></dl><details><summary>Suggested follow-up verification</summary><p>${html(e.verify)}</p></details></article>`;
  }
  function updateDetail() {
    const c=candidateById(state.current);
    if(!c)return;
    $('detail-name').textContent=c.name;
    $('detail-subtitle').textContent=`${D.roles[state.role].title} · ${c.years} experience · Simulated interview completed`;
    const evidence=D.evidenceFor(c,state.role);
    const noteKey=`${state.role}:${c.id}`;
    $('detail-body').innerHTML=`<div class="p2-detail-summary"><p>${html(c.headline)}</p><div class="p2-detail-tags">${c.traits.map(t=>`<span>${html(t)}</span>`).join('')}</div></div>
      <h3 class="p2-detail-subhead">HOW THIS PROFILE MATCHES YOUR CRITERIA</h3>
      <div class="p2-detail-metrics">${(state.rules.length?state.rules.map(r=>metricFor(r.metric)):metricList()).map(m=>`<div class="p2-detail-metric"><span>${html(m[1])}</span><strong>${D.score(c,m)} /100</strong></div>`).join('')}</div>
      <h3 class="p2-detail-subhead">ILLUSTRATIVE INTERVIEW EVIDENCE</h3><p style="color:#858b80;font-size:11px;line-height:1.7">Two fictional response examples, with source context and limitations. They are not verified facts about any real person.</p>
      <div class="p2-evidence-list">${evidence.map(renderEvidence).join('')}</div>
      <div class="p2-note-wrap"><label for="reviewer-notes">Recruiter notes (saved on this browser)</label><textarea id="reviewer-notes" placeholder="Questions to ask, evidence to verify, or rationale for follow-up…">${html(state.notes[noteKey]||'')}</textarea><p>Notes and shortlist selections stay in this browser only. They are not sent to a server.</p></div>
      <div class="p2-detail-actions"><button type="button" class="p2-secondary" data-close-detail>Back to results</button><button type="button" class="p2-primary" data-shortlist="${c.id}">${selected(c.id)?'✓ Remove from shortlist':'+ Add to shortlist'}</button></div>`;
  }
  function showDetail(id) {
    if(!candidateById(id))return;
    state.current=id;updateDetail();
    const dlg=$('detail-dialog');
    if(!dlg.open) dlg.showModal();
  }
  function changeSort(value) {
    if(!['name','years',...metricList().map(m=>m[0])].includes(value))return;
    if(value===state.sort)state.direction=state.direction==='asc'?'desc':'asc';
    else {state.sort=value;state.direction=value==='name'?'asc':'desc';}
    renderSortOptions();renderTable();
  }
  function updateRule(id,field,value) {
    const rule=state.rules.find(r=>r.id===id);if(!rule)return;
    if(field==='metric' && metricFor(value) && !state.rules.some(r=>r.metric===value && r.id!==id)) rule.metric=value;
    if(field==='min') rule.min=Math.max(0,Math.min(100,Number(value)||0));
    if(field==='required') rule.required=value==='true';
    state.preset='custom';
    if(field==='min') {
      const label=$(`min-label-${id}`); if(label)label.textContent=`${rule.min} /100`;
      renderStats();renderTable();renderCompare();
    } else {renderEverything();}
  }
  function csvCell(s){return '"'+String(s).replace(/"/g,'""')+'"';}
  function exportCSV(){
    const cols=state.rules.length?state.rules.map(r=>metricFor(r.metric)):metricList();
    const rows=[['HEAD HUNTERS | FICTIONAL DEMO SCORES'],['Role',D.roles[state.role].title],['Visible view',state.view],['Required logic',state.logic],['Applicant','Experience','Meets required',...cols.map(m=>m[1]),'Shortlisted','Recruiter notes'], ...visibleCandidates().map(c=>[c.name,c.years,hasRequiredMatch(c)?'Yes':'No',...cols.map(m=>D.score(c,m)),selected(c.id)?'Yes':'No',state.notes[`${state.role}:${c.id}`]||''])];
    const url=URL.createObjectURL(new Blob(['\ufeff'+rows.map(r=>r.map(csvCell).join(',')).join('\r\n')],{type:'text/csv;charset=utf-8'}));
    const a=document.createElement('a');a.href=url;a.download=`head-hunters-prototype2-${state.role}-visible-candidates.csv`;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  $('preset').addEventListener('change',e=>setPreset(e.target.value));
  $('reset').addEventListener('click',()=>{state.query='';$('search').value='';setPreset('balanced');});
  $('role').addEventListener('change',e=>{if(!D.roles[e.target.value])return;state.role=e.target.value;state.query='';$('search').value='';setPreset('balanced');try{history.replaceState(null,'','?role='+encodeURIComponent(state.role));}catch{}});
  $('add-rule').addEventListener('click',()=>{
    const used=new Set(state.rules.map(r=>r.metric));const available=metricList().find(m=>!used.has(m[0]));if(!available)return;
    state.rules.push(freshRule(available[0],75,true));state.preset='custom';renderEverything();
  });
  $('criteria-list').addEventListener('click',e=>{
    const btn=e.target.closest('[data-remove]');if(!btn)return;
    state.rules=state.rules.filter(r=>r.id!==Number(btn.dataset.remove));state.preset='custom';renderEverything();
  });
  $('criteria-list').addEventListener('input',e=>{if(e.target.dataset.field==='min')updateRule(Number(e.target.dataset.id),'min',e.target.value);});
  $('criteria-list').addEventListener('change',e=>{const field=e.target.dataset.field;if(field==='metric'||field==='required')updateRule(Number(e.target.dataset.id),field,e.target.value);});
  document.querySelectorAll('[data-logic]').forEach(btn=>btn.addEventListener('click',()=>{state.logic=btn.dataset.logic;renderEverything();}));
  $('search').addEventListener('input',e=>{state.query=e.target.value.trim();renderTable();});
  $('sort').addEventListener('change',e=>{state.sort=e.target.value;state.direction=state.sort==='name'?'asc':'desc';renderSortOptions();renderTable();});
  $('direction').addEventListener('click',()=>{state.direction=state.direction==='asc'?'desc':'asc';renderSortOptions();renderTable();});
  document.querySelectorAll('[data-view]').forEach(btn=>btn.addEventListener('click',()=>{state.view=btn.dataset.view;renderTable();}));
  $('table-container').addEventListener('click',e=>{
    const s=e.target.closest('[data-shortlist]');if(s){toggleShortlist(s.dataset.shortlist);return;}
    const candidate=e.target.closest('[data-evidence]');if(candidate){showDetail(candidate.dataset.evidence);return;}
    const sort=e.target.closest('[data-sort]');if(sort){changeSort(sort.dataset.sort);return;}
    const all=e.target.closest('[data-showall]');if(all){state.view='all';state.query='';$('search').value='';renderTable();}
  });
  $('compare').addEventListener('click',()=>{state.compare=!state.compare;renderCompare();if(state.compare)$('compare-panel').scrollIntoView({block:'nearest',behavior:'smooth'});});
  $('compare-panel').addEventListener('click',e=>{
    if(e.target.closest('[data-close-compare]')){state.compare=false;renderCompare();return;}
    const candidate=e.target.closest('[data-evidence]');if(candidate){showDetail(candidate.dataset.evidence);return;}
    const remove=e.target.closest('[data-shortlist]');if(remove)toggleShortlist(remove.dataset.shortlist);
  });
  $('export').addEventListener('click',exportCSV);
  $('close-detail').addEventListener('click',()=>$('detail-dialog').close());
  $('detail-body').addEventListener('click',e=>{
    if(e.target.closest('[data-close-detail]')){$('detail-dialog').close();return;}
    const s=e.target.closest('[data-shortlist]');if(s)toggleShortlist(s.dataset.shortlist);
  });
  $('detail-body').addEventListener('input',e=>{
    if(e.target.id==='reviewer-notes' && state.current){state.notes[`${state.role}:${state.current}`]=e.target.value;save();}
  });
  $('detail-dialog').addEventListener('click',e=>{if(e.target===$('detail-dialog'))$('detail-dialog').close();});
  setPreset('balanced');
})();

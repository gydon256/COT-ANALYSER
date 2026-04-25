const SOCRATA = 'https://publicreporting.cftc.gov/resource/6dca-aqww.json';
const STORAGE_KEY = 'cot-v3';
const SETTINGS_KEY = 'cot-settings-v1';
const CHECKLIST_KEY = 'cot-trade-checks-v1';
const THEME_KEY = 'cot_theme';
const CFTC_REQUEST_DELAY_MS = 300;
const CFTC_RETRY_DELAYS_MS = [600, 1500, 3000];
const FOREX_MARKET_ALIASES = {
  EURUSD:'EURO FX',
  USDEUR:'EURO FX',
  GBPUSD:'BRITISH POUND',
  USDGBP:'BRITISH POUND',
  USDJPY:'JAPANESE YEN',
  JPYUSD:'JAPANESE YEN',
  USDCHF:'SWISS FRANC',
  CHFUSD:'SWISS FRANC',
  USDCAD:'CANADIAN DOLLAR',
  CADUSD:'CANADIAN DOLLAR',
  AUDUSD:'AUSTRALIAN DOLLAR',
  USDAUD:'AUSTRALIAN DOLLAR',
  NZDUSD:'NEW ZEALAND DOLLAR',
  USDNZD:'NEW ZEALAND DOLLAR',
  USDMXN:'MEXICAN PESO',
  MXNUSD:'MEXICAN PESO',
  USDBRL:'BRAZILIAN REAL',
  BRLUSD:'BRAZILIAN REAL',
  DXY:'U.S. DOLLAR INDEX',
  USDX:'U.S. DOLLAR INDEX',
  USDOLLARINDEX:'U.S. DOLLAR INDEX'
};
const MARKET_MAPPINGS = [
  {keys:['EURUSD','EUR/USD','EUR'], cftc:['EURO FX'], symbol:'EUR/USD', asset:'fx', multiplier:1, search:'EURO FX', suggested:'EURUSD', view:'Euro futures bullish = EUR/USD bullish'},
  {keys:['GBPUSD','GBP/USD','GBP'], cftc:['BRITISH POUND'], symbol:'GBP/USD', asset:'fx', multiplier:1, search:'BRITISH POUND', suggested:'GBPUSD', view:'Pound futures bullish = GBP/USD bullish'},
  {keys:['USDJPY','USD/JPY'], cftc:['JAPANESE YEN'], symbol:'USD/JPY', asset:'fx', multiplier:-1, search:'JAPANESE YEN', suggested:'USDJPY', view:'Yen futures bullish = USD/JPY bearish'},
  {keys:['JPYUSD','JPY/USD','JPY'], cftc:['JAPANESE YEN'], symbol:'JPY futures', asset:'fx', multiplier:1, search:'JAPANESE YEN', suggested:'JPY', view:'Yen futures bullish = stronger JPY'},
  {keys:['USDCHF','USD/CHF'], cftc:['SWISS FRANC'], symbol:'USD/CHF', asset:'fx', multiplier:-1, search:'SWISS FRANC', suggested:'USDCHF', view:'Franc futures bullish = USD/CHF bearish'},
  {keys:['CHFUSD','CHF/USD','CHF'], cftc:['SWISS FRANC'], symbol:'CHF futures', asset:'fx', multiplier:1, search:'SWISS FRANC', suggested:'CHF', view:'Franc futures bullish = stronger CHF'},
  {keys:['USDCAD','USD/CAD'], cftc:['CANADIAN DOLLAR'], symbol:'USD/CAD', asset:'fx', multiplier:-1, search:'CANADIAN DOLLAR', suggested:'USDCAD', view:'CAD futures bullish = USD/CAD bearish'},
  {keys:['CADUSD','CAD/USD','CAD'], cftc:['CANADIAN DOLLAR'], symbol:'CAD futures', asset:'fx', multiplier:1, search:'CANADIAN DOLLAR', suggested:'CAD', view:'CAD futures bullish = stronger CAD'},
  {keys:['AUDUSD','AUD/USD','AUD'], cftc:['AUSTRALIAN DOLLAR'], symbol:'AUD/USD', asset:'fx', multiplier:1, search:'AUSTRALIAN DOLLAR', suggested:'AUDUSD', view:'Aussie futures bullish = AUD/USD bullish'},
  {keys:['NZDUSD','NZD/USD','NZD'], cftc:['NEW ZEALAND DOLLAR','NEW ZEALAND'], symbol:'NZD/USD', asset:'fx', multiplier:1, search:'NEW ZEALAND', suggested:'NZDUSD', view:'Kiwi futures bullish = NZD/USD bullish'},
  {keys:['USDMXN','USD/MXN'], cftc:['MEXICAN PESO'], symbol:'USD/MXN', asset:'fx', multiplier:-1, search:'MEXICAN PESO', suggested:'USDMXN', view:'Peso futures bullish = USD/MXN bearish'},
  {keys:['USDBRL','USD/BRL'], cftc:['BRAZILIAN REAL'], symbol:'USD/BRL', asset:'fx', multiplier:-1, search:'BRAZILIAN REAL', suggested:'USDBRL', view:'Real futures bullish = USD/BRL bearish'},
  {keys:['DXY','USDX','USDOLLARINDEX'], cftc:['U.S. DOLLAR INDEX','USD INDEX'], symbol:'DXY', asset:'fx', multiplier:1, search:'U.S. DOLLAR INDEX', suggested:'DXY', view:'Dollar index futures bullish = DXY bullish'},
  {keys:['XAUUSD','XAU/USD','GOLD'], cftc:['GOLD'], symbol:'XAU/USD', asset:'metals', multiplier:1, search:'GOLD', suggested:'XAUUSD', view:'Gold futures bullish = XAU/USD bullish'},
  {keys:['XAGUSD','XAG/USD','SILVER'], cftc:['SILVER'], symbol:'XAG/USD', asset:'metals', multiplier:1, search:'SILVER', suggested:'XAGUSD', view:'Silver futures bullish = XAG/USD bullish'},
  {keys:['COPPER','XCUUSD'], cftc:['COPPER'], symbol:'Copper', asset:'metals', multiplier:1, search:'COPPER', suggested:'COPPER', view:'Copper futures bullish = copper bullish'},
  {keys:['USOIL','WTI','CRUDE','OIL'], cftc:['CRUDE OIL'], symbol:'USOIL', asset:'energy', multiplier:1, search:'CRUDE OIL', suggested:'USOIL', view:'Crude futures bullish = oil CFDs bullish'},
  {keys:['NATGAS','NGAS','GAS'], cftc:['NATURAL GAS'], symbol:'Natural Gas', asset:'energy', multiplier:1, search:'NATURAL GAS', suggested:'NATGAS', view:'Gas futures bullish = gas CFDs bullish'},
  {keys:['US500','SPX500','SP500','S&P500','S&P 500'], cftc:['S&P 500','SP 500'], symbol:'US500', asset:'indices', multiplier:1, search:'S&P 500', suggested:'US500', view:'S&P futures bullish = US500 bullish'},
  {keys:['NAS100','NASDAQ','NDX','US100'], cftc:['NASDAQ'], symbol:'NAS100', asset:'indices', multiplier:1, search:'NASDAQ', suggested:'NAS100', view:'Nasdaq futures bullish = NAS100 bullish'},
  {keys:['US30','DJ30','DOW','DOWJONES'], cftc:['DOW JONES'], symbol:'US30', asset:'indices', multiplier:1, search:'DOW JONES', suggested:'US30', view:'Dow futures bullish = US30 bullish'},
  {keys:['RTY','RUSSELL','US2000'], cftc:['RUSSELL'], symbol:'US2000', asset:'indices', multiplier:1, search:'RUSSELL', suggested:'US2000', view:'Russell futures bullish = US2000 bullish'},
  {keys:['VIX'], cftc:['VIX'], symbol:'VIX', asset:'indices', multiplier:1, search:'VIX', suggested:'VIX', view:'VIX futures bullish = volatility bullish'},
  {keys:['CORN'], cftc:['CORN'], symbol:'Corn', asset:'agriculture', multiplier:1, search:'CORN', suggested:'CORN', view:'Corn futures bullish = corn bullish'},
  {keys:['WHEAT'], cftc:['WHEAT'], symbol:'Wheat', asset:'agriculture', multiplier:1, search:'WHEAT', suggested:'WHEAT', view:'Wheat futures bullish = wheat bullish'},
  {keys:['SOYBEAN','SOYBEANS'], cftc:['SOYBEANS'], symbol:'Soybeans', asset:'agriculture', multiplier:1, search:'SOYBEANS', suggested:'SOYBEAN', view:'Soybean futures bullish = soybeans bullish'},
  {keys:['COTTON'], cftc:['COTTON'], symbol:'Cotton', asset:'agriculture', multiplier:1, search:'COTTON', suggested:'COTTON', view:'Cotton futures bullish = cotton bullish'},
  {keys:['COFFEE'], cftc:['COFFEE'], symbol:'Coffee', asset:'agriculture', multiplier:1, search:'COFFEE', suggested:'COFFEE', view:'Coffee futures bullish = coffee bullish'},
  {keys:['SUGAR'], cftc:['SUGAR'], symbol:'Sugar', asset:'agriculture', multiplier:1, search:'SUGAR', suggested:'SUGAR', view:'Sugar futures bullish = sugar bullish'},
  {keys:['US10Y','10Y','ZN'], cftc:['10-YEAR','10 YEAR'], symbol:'US10Y', asset:'rates', multiplier:1, search:'10-YEAR', suggested:'US10Y', view:'10Y futures bullish = yields generally pressured lower'},
  {keys:['US30Y','30Y','ZB'], cftc:['30-YEAR','30 YEAR'], symbol:'US30Y', asset:'rates', multiplier:1, search:'30-YEAR', suggested:'US30Y', view:'30Y futures bullish = yields generally pressured lower'}
];

let cot    = {};
let active = null;
let chart  = null;
let chartRange = 13;
let scannerFilters = {asset:'all',mode:'all',bias:'all'};
let tableSort    = {key:'net', dir:'desc'};
let tableFilters = {search:'', group:'all', signal:'all'};
let tradeChecks = {};
let lastSearchContext = null;
let panelOpen = false;
let queue    = [];   // [{cftcName, rows:[{date,ncL,ncS,net,chg,oi}]}]
let qIdx     = 0;
let lastFocus = null;
let chartHidden = new Set();
let touchStartX = 0;
let filterTimer = null;
let resetConfirmTimer = null;
let queueBusy = false;

// =============================================
// DOM HELPERS
// =============================================
function $(id){return document.getElementById(id);}
function clearChildren(el){el.replaceChildren();}
function makeText(tag,className,text){
  const el=document.createElement(tag);
  if(className) el.className=className;
  el.textContent=text;
  return el;
}
function cssVar(name){return getComputedStyle(document.documentElement).getPropertyValue(name).trim();}
function reducedMotion(){return matchMedia('(prefers-reduced-motion: reduce)').matches;}
function formatValue(value){return fmtLg(value);}
function animateValue(el, start, end, duration, formatter=formatValue) {
  const startTime = performance.now();
  function update(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    el.textContent = formatter(Math.round(start + (end - start) * ease));
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}
function setAnimatedNumber(id,end,formatter=formatValue,duration=600){
  const el=$(id);
  if(!el) return;
  const prior=Number(el.dataset.currentValue||0);
  el.dataset.currentValue=String(end);
  if(reducedMotion()){
    el.textContent=formatter(end);
    return;
  }
  animateValue(el,prior,end,duration,formatter);
}
function sleep(ms){return new Promise(resolve=>setTimeout(resolve,ms));}
async function fetchJsonWithRetry(url,options={}){
  const retries=options.retries??CFTC_RETRY_DELAYS_MS.length;
  for(let attempt=0;attempt<=retries;attempt++){
    const res=await fetch(url);
    if(res.ok) return res.json();
    const shouldRetry=(res.status===429||res.status>=500)&&attempt<retries;
    if(!shouldRetry) throw new Error(`HTTP ${res.status}`);
    const retryAfter=Number(res.headers.get('retry-after'));
    const delay=Number.isFinite(retryAfter)&&retryAfter>0
      ? retryAfter*1000
      : CFTC_RETRY_DELAYS_MS[Math.min(attempt,CFTC_RETRY_DELAYS_MS.length-1)];
    await sleep(delay);
  }
  throw new Error('Request failed after retries');
}
function scheduleMarketSearch(value){
  clearTimeout(filterTimer);
  filterTimer=setTimeout(()=>{
    tableFilters.search=value;
    $('topSearchInput').value=value;
    $('marketFilter').value=value;
    renderCotTable();
  },150);
}

function registerServiceWorker(){
  if(location.protocol==='file:'||!('serviceWorker' in navigator)) return;
  navigator.serviceWorker.register('./service-worker.js').catch(()=>{});
}

// =============================================
// BOOT / EVENTS
// =============================================
function init() {
  initTheme();
  loadState();
  loadSettings();
  loadChecklist();
  active = Object.keys(cot)[0] || null;
  bindEvents();
  syncSettingsUI();
  tick();
  setInterval(tick,1000);
  registerServiceWorker();
  renderTabs();
  renderDash();
}

function bindEvents(){
  $('sidebarToggle').addEventListener('click',toggleSidebar);
  $('themeToggleBtn').addEventListener('click',toggleTheme);
  $('addDataBtn').addEventListener('click',togglePanel);
  $('refreshAllBtn').addEventListener('click',refreshAllFromCFTC);
  $('exportBtn').addEventListener('click',exportData);
  $('importBtn').addEventListener('click',()=>$('importFile').click());
  $('importFile').addEventListener('change',e=>importData(e.target));
  $('resetBtn').addEventListener('click',resetApp);
  $('chartRangeSel').addEventListener('change',e=>{
    chartRange=parseInt(e.target.value,10)||13;
    saveSettings();
    syncRangeButtons();
    renderDash({market:false});
  });
  document.querySelectorAll('[data-range]').forEach(btn=>{
    btn.addEventListener('click',()=>{
      chartRange=parseInt(btn.dataset.range,10)||13;
      $('chartRangeSel').value=String(chartRange);
      saveSettings();
      syncRangeButtons();
      renderDash({market:false});
    });
  });
  $('assetFilter').addEventListener('change',e=>{
    scannerFilters.asset=e.target.value;
    saveSettings();
    renderScanner();
  });
  $('modeFilter').addEventListener('change',e=>{
    scannerFilters.mode=e.target.value;
    saveSettings();
    renderScanner();
  });
  $('biasFilter').addEventListener('change',e=>{
    scannerFilters.bias=e.target.value;
    saveSettings();
    renderScanner();
  });
  document.querySelectorAll('[data-check]').forEach(input=>{
    input.addEventListener('change',saveActiveChecklist);
  });
  $('tradeNotes').addEventListener('input',saveActiveChecklist);
  $('pasteBtn').addEventListener('click',doPaste);
  $('csvFile').addEventListener('change',e=>doCSV(e.target));
  $('apiQ').addEventListener('keydown',e=>{
    if(e.key==='Enter'){e.preventDefault();doSearch();}
  });
  $('searchBtn').addEventListener('click',doSearch);
  $('topSearchInput').addEventListener('input',e=>scheduleMarketSearch(e.target.value));
  $('modalCancel').addEventListener('click',closeModal);
  $('modalOk').addEventListener('click',confirmModal);
  $('mLabel').addEventListener('input',clearMErr);
  $('modalBg').addEventListener('click',e=>{
    if(e.target===$('modalBg')) closeModal();
  });
  document.addEventListener('keydown',handleDocumentKeydown);

  // Market overview table
  $('marketFilter').addEventListener('input',e=>scheduleMarketSearch(e.target.value));
  $('groupFilter').addEventListener('change',e=>{tableFilters.group=e.target.value;renderCotTable();});
  $('signalFilter').addEventListener('change',e=>{tableFilters.signal=e.target.value;renderCotTable();});
  $('exportTableBtn').addEventListener('click',exportTableCSV);
  $('exportChartBtn').addEventListener('click',exportChartPNG);
  document.querySelector('.chart-legend').addEventListener('click',toggleChartDataset);
  document.querySelectorAll('[data-target]').forEach(btn=>{
    btn.addEventListener('click',()=>scrollToSection(btn.dataset.target,btn.dataset.page));
  });
  document.addEventListener('touchstart',e=>{
    if(e.target.closest('input,textarea,select,.modal,.table-wrap')) return;
    touchStartX=e.touches[0].clientX;
  },{passive:true});
  document.addEventListener('touchend',e=>{
    if(e.target.closest('input,textarea,select,.modal,.table-wrap')) return;
    const diff=e.changedTouches[0].clientX-touchStartX;
    if(Math.abs(diff)>60){
      diff<0?loadNextInstrument():loadPrevInstrument();
    }
  },{passive:true});
  window.addEventListener('offline',()=>setToolbarStatus('Offline - API calls unavailable.','inf'));
  window.addEventListener('online',()=>setToolbarStatus('Online - API calls available.','ok'));
  document.querySelector('.cot-table thead').addEventListener('click',e=>{
    const th=e.target.closest('th[data-sort]');
    if(!th) return;
    const key=th.dataset.sort;
    tableSort.dir=(tableSort.key===key&&tableSort.dir==='desc')?'asc':'desc';
    tableSort.key=key;
    renderCotTable();
  });

  const tabs=Array.from(document.querySelectorAll('.mtab'));
  tabs.forEach((btn,idx)=>{
    btn.addEventListener('click',()=>switchTab(btn.dataset.tab));
    btn.addEventListener('keydown',e=>{
      const dir=e.key==='ArrowRight'?1:e.key==='ArrowLeft'?-1:0;
      if(!dir) return;
      e.preventDefault();
      const next=tabs[(idx+dir+tabs.length)%tabs.length];
      switchTab(next.dataset.tab);
      next.focus();
    });
  });
}

// =============================================
// TABS
// =============================================
function renderTabs(){
  const bar  = $('instBar');
  const keys = Object.keys(cot);
  clearChildren(bar);
  if(!keys.length){
    bar.append(makeText('span','inst-empty','No instruments yet — use Add Data'));
    return;
  }
  keys.forEach(k=>{
    const b = badge(k);
    const item=document.createElement('div');
    item.className='inst-item'+(k===active?' active':'');

    const pickBtn=document.createElement('button');
    pickBtn.type='button';
    pickBtn.className='inst-btn';
    pickBtn.setAttribute('aria-pressed',String(k===active));
    pickBtn.append(makeText('span','',k),makeText('span','bdg '+b.c,b.t));
    pickBtn.addEventListener('click',()=>pick(k));

    const delBtn=document.createElement('button');
    delBtn.type='button';
    delBtn.className='inst-del';
    delBtn.title='Remove';
    delBtn.setAttribute('aria-label',`Remove ${k}`);
    delBtn.textContent='×';
    delBtn.addEventListener('click',()=>removeInst(k));

    item.append(pickBtn,delBtn);
    bar.append(item);
  });
}

function badge(label){
  const analysis=buildAnalysis(label);
  if(!analysis) return {c:'bdg-empty',t:'—'};
  if(analysis.tradeBias==='long') return {c:'bdg-bull',t:'LONG'};
  if(analysis.tradeBias==='short') return {c:'bdg-bear',t:'SHORT'};
  return {c:'bdg-neut',t:'NEUT'};
}

function pick(k){
  active=k;
  renderTabs();
  renderDash();
}

// =============================================
// DASHBOARD
// =============================================
function renderDash(){
  const keys=Object.keys(cot);
  $('tInfo').textContent = keys.length ? `${keys.length} instrument${keys.length!==1?'s':''} loaded` : '';
  if(!active||!cot[active]){
    showEmpty('No instruments loaded','Click Add Data then paste a report, upload CSV, or search and fetch from the live CFTC API');
    return;
  }

  const all  = cot[active].weeks||[];
  if(!all.length){
    showEmpty(`${active} has no stored weeks`,'Add fresh data for this instrument or remove the empty instrument.');
    return;
  }
  $('emptyState').hidden=true;
  $('dataView').hidden=false;

  const analysis = buildAnalysis(active);
  const view = all.slice(-chartRange);
  const lat  = analysis.latest;
  const prev = analysis.prev;

  $('snapLabel').textContent =
    `SNAPSHOT · WEEK ENDING ${lat.date} · ${analysis.meta.symbol} · ${analysis.meta.view}`;

  const freshness=dataFreshness(lat.date);
  $('freshPill').textContent=freshness.label;
  $('freshPill').className=`fresh-pill ${freshness.className}`;
  $('freshPill').title=freshness.detail;

  renderScanner();
  renderCotTable();

  // Bias score
  $('biasVal').textContent = `${analysis.score>0?'+':''}${analysis.score}`;
  $('biasCard').className = 'card '+(analysis.score>=25?'c-bull':analysis.score<=-25?'c-bear':'c-neut');
  $('biasSub').textContent = analysis.mode.label;

  // Net
  const n=analysis.adjNet;
  $('netVal').textContent = fmtLg(n);
  $('netCard').className = 'card '+(n>=0?'c-bull':'c-bear');
  const ns=$('netSub');
  ns.textContent = analysis.meta.multiplier===-1
    ? `${analysis.meta.symbol} adjusted · raw ${fmtLg(lat.net)}`
    : fmtK(Math.abs(n))+' '+(n>=0?'long':'short')+' bias';
  ns.className = 'csub '+(n>=0?'bull':'bear');

  // Change
  const chg=analysis.adjChg;
  $('chgVal').textContent=fmtLg(chg);
  $('chgCard').className='card '+(chg>=0?'c-bull':'c-bear');
  $('chgSub').textContent = prev
    ? `prev adjusted net: ${fmtK(prev.net*analysis.meta.multiplier)}`:'no prior week';

  // Extreme
  const p=Math.round(analysis.percentile);
  $('extVal').textContent=`${p}th %ile`;
  let ec='card',es='neutral zone',ep='ap-neut',et='NEUTRAL';
  if(p>=80){ec='card c-xbull';es='crowded long extreme';ep='ap-bull';et='CROWDED LONG';}
  else if(p<=20){ec='card c-xbear';es='crowded short extreme';ep='ap-bear';et='CROWDED SHORT';}
  else if(p>=65){es='leaning long';ep='ap-bull';et='LEANING LONG';}
  else if(p<=35){es='leaning short';ep='ap-bear';et='LEANING SHORT';}
  $('extCard').className=ec;
  $('extSub').textContent=es;
  const extPill=$('extPill');
  clearChildren(extPill);
  extPill.append(makeText('span','apill '+ep,et));

  renderDetails(analysis);
  renderChecklist();

  $('cNote').textContent = all.length<10
    ? `Percentile based on ${all.length} week(s) — add 10+ for a reliable extreme reading`:'';
  $('chartTitle').textContent=`Positioning trend — last ${view.length} week${view.length!==1?'s':''}`;
  $('chartSub').textContent=`Showing ${Math.min(chartRange,all.length)} of ${all.length} stored week${all.length!==1?'s':''}`;

  $('wkCount').textContent=`${all.length} week${all.length!==1?'s':''} stored`;
  const chips=$('chips');
  clearChildren(chips);
  all.forEach((e,i)=>{
    const chip=document.createElement('div');
    chip.className='chip';
    chip.append(document.createTextNode(e.date));
    const btn=document.createElement('button');
    btn.type='button';
    btn.textContent='×';
    btn.setAttribute('aria-label',`Delete week ${e.date}`);
    btn.addEventListener('click',()=>delWeek(active,i));
    chip.append(btn);
    chips.append(chip);
  });

  renderChart(view, analysis.meta);
}

function renderChartLegacy(){
  return null;
}

function renderDetails(analysis){
  const {all,latest:lat,prev,percentile:p,mode,meta,index26,index52,index156,adjNet,adjChg} = analysis;
  const cftcName=(cot[active].cftcName||active);
  $('metaName').textContent=cftcName;
  $('metaDate').textContent=lat.date;
  $('metaWeeks').textContent=`${all.length} week${all.length!==1?'s':''}`;
  $('metaSource').textContent=lat.source||'Saved locally';
  $('metaOi').textContent=lat.oi?fmtCount(lat.oi):'n/a';
  $('metaAsset').textContent=assetLabel(meta.asset);
  $('metaView').textContent=meta.symbol;
  $('metaCot26').textContent=formatIndex(index26);
  $('metaCot52').textContent=formatIndex(index52);
  $('metaCot156').textContent=formatIndex(index156);

  const streak=analysis.streak;
  const direction=adjChg>0?'improving':adjChg<0?'weakening':'unchanged';
  $('signalTitle').textContent=`${meta.symbol}: ${mode.label}`;
  const parts=[
    `COT bias score is ${analysis.score>0?'+':''}${analysis.score}, with adjusted net positioning at ${fmtLg(adjNet)} contracts in the ${Math.round(p)}th percentile.`,
    `The 52-week COT Index is ${formatIndex(index52)} and the latest adjusted weekly change is ${fmtLg(adjChg)}.`
  ];
  if(streak.count>1){
    parts.push(`${streak.count} consecutive weeks ${streak.sign>0?'higher':'lower'}.`);
  }else{
    parts.push(`Momentum is currently ${direction}.`);
  }
  if(meta.multiplier===-1) parts.push(`Interpretation is inverted for ${meta.symbol}: ${meta.view}.`);
  $('signalText').textContent=parts.join(' ');
}

function renderScanner(){
  const wrap=$('scannerRows');
  if(!wrap) return;
  clearChildren(wrap);
  const rows=Object.keys(cot)
    .map(buildAnalysis)
    .filter(Boolean)
    .filter(a=>scannerFilters.asset==='all'||a.meta.asset===scannerFilters.asset)
    .filter(a=>scannerFilters.mode==='all'||a.mode.group===scannerFilters.mode)
    .filter(a=>{
      if(scannerFilters.bias==='all') return true;
      if(scannerFilters.bias==='extreme') return a.isExtreme;
      return a.tradeBias===scannerFilters.bias;
    })
    .sort((a,b)=>b.rank-a.rank);

  if(!rows.length){
    wrap.append(makeText('div','scan-empty','No instruments match the current scanner filters.'));
    return;
  }

  rows.forEach(a=>{
    const btn=document.createElement('button');
    btn.type='button';
    btn.className='scan-row'+(a.label===active?' active':'');
    btn.dataset.label=a.label;
    btn.addEventListener('click',()=>pick(a.label));

    const symbol=makeText('div','scan-symbol',a.meta.symbol);
    const meta=makeText('div','scan-meta',`${assetLabel(a.meta.asset)} · ${a.latest.date}`);
    const mode=document.createElement('div');
    mode.className='scan-mode';
    mode.append(makeText('span','mode-pill '+modeClass(a.mode.group),a.mode.label));
    const index=makeText('div','scan-index',`26w ${formatIndex(a.index26)} · 52w ${formatIndex(a.index52)} · ${a.tradeBias.toUpperCase()}`);
    const score=makeText('div','scan-score '+scoreClass(a.score),`${a.score>0?'+':''}${a.score}`);
    btn.append(symbol,meta,mode,index,score);
    wrap.append(btn);
  });
}

function renderChecklist(){
  const state=tradeChecks[active]||{};
  document.querySelectorAll('[data-check]').forEach(input=>{
    input.checked=Boolean(state[input.dataset.check]);
  });
  $('tradeNotes').value=state.notes||'';
  updateChecklistScore();
}

function saveActiveChecklist(){
  if(!active) return;
  const next={...(tradeChecks[active]||{})};
  document.querySelectorAll('[data-check]').forEach(input=>{
    next[input.dataset.check]=input.checked;
  });
  next.notes=$('tradeNotes').value;
  next.updatedAt=new Date().toISOString();
  tradeChecks[active]=next;
  saveChecklist();
  updateChecklistScore();
  renderScanner();
}

function updateChecklistScore(){
  const checks=Array.from(document.querySelectorAll('[data-check]'));
  const ready=checks.filter(input=>input.checked).length;
  $('checkScore').textContent=`${ready}/${checks.length} ready`;
  $('checkScore').className='check-score '+(ready===checks.length?'s-ok':ready>=2?'s-inf':'');
  $('checkTitle').textContent=active?`${active} checklist`:'Checklist';
}

function buildAnalysis(label){
  const item=cot[label];
  if(!item||!Array.isArray(item.weeks)||!item.weeks.length) return null;
  const all=item.weeks;
  const latest=all[all.length-1];
  const prev=all.length>1?all[all.length-2]:null;
  const meta=resolveMarketMeta(label,item.cftcName);
  const adjusted=all.map(row=>({
    ...row,
    adjNet:row.net*meta.multiplier,
    adjChg:row.chg*meta.multiplier
  }));
  const adjLatest=adjusted[adjusted.length-1];
  const percentile=percentileNet(adjusted,adjLatest.adjNet);
  const index26=cotIndex(adjusted,26);
  const index52=cotIndex(adjusted,52);
  const index156=cotIndex(adjusted,156);
  const streak=changeStreak(adjusted,'adjChg');
  const avgAbsChange=avgAbs(adjusted.slice(-13).map(row=>row.adjChg))||1;
  const positionScore=Number.isFinite(index52)?clamp((index52-50)*1.35,-72,72):0;
  const momentumScore=clamp((adjLatest.adjChg/avgAbsChange)*10,-18,18);
  const streakScore=streak.count>1?clamp(streak.sign*Math.min(streak.count*3,10),-10,10):0;
  const score=Math.round(clamp(positionScore+momentumScore+streakScore,-100,100));
  const mode=classifyMode(score,index52,adjLatest.adjChg);
  const tradeBias=mode.tradeBias||(score>=25?'long':score<=-25?'short':'neutral');
  const isExtreme=Number.isFinite(index52)&&(index52>=80||index52<=20);
  const checklist=tradeChecks[label]||{};
  const checklistScore=['bias','level','trigger','risk'].filter(k=>checklist[k]).length;
  return {
    label,all,latest,prev,meta,adjusted,
    adjNet:adjLatest.adjNet,
    adjChg:adjLatest.adjChg,
    percentile,index26,index52,index156,streak,score,mode,tradeBias,isExtreme,checklistScore,
    rank:Math.abs(score)+(isExtreme?18:0)+(mode.group==='reversal'?16:0)+(mode.group==='trend'?10:0)+checklistScore
  };
}

function clearChart(){
  if(chart){chart.destroy();chart=null;}
}

function showEmpty(title,message){
  clearChart();
  $('emptyTitle').textContent=title;
  $('emptyMsg').textContent=message;
  $('emptyState').hidden=false;
  $('dataView').hidden=true;
}

// =============================================
// HELPERS
// =============================================
function fmtK(n){const a=Math.abs(n);return(n<0?'-':'')+(a>=1000?(a/1000).toFixed(1)+'K':String(Math.round(a)));}
function fmtLg(n){const a=Math.abs(n);const s=n<0?'-':n>0?'+':'';return s+(a>=1000?(a/1000).toFixed(1)+'K':String(Math.round(a)));}
function fmtCount(n){const a=Math.abs(n);return a>=1000000?(a/1000000).toFixed(2)+'M':a>=1000?(a/1000).toFixed(1)+'K':String(Math.round(a));}
function setSt(id,msg,cls){const el=$(id);el.textContent=msg;el.className='st'+(cls?' s-'+cls:'');}
function setToolbarStatus(msg,cls){
  const el=$('toolbarSt');
  el.textContent=msg;
  el.className='toolbar-status'+(cls?' s-'+cls:'');
}
function changeStreak(rows,field='chg'){
  const sign=Math.sign(rows[rows.length-1]?.[field]||0);
  if(!sign) return {sign:0,count:0};
  let count=0;
  for(let i=rows.length-1;i>=0;i--){
    if(Math.sign(rows[i][field])!==sign) break;
    count++;
  }
  return {sign,count};
}
function clamp(value,min,max){return Math.max(min,Math.min(max,value));}
function avgAbs(values){
  const valid=values.map(v=>Math.abs(Number(v)||0)).filter(v=>v>0);
  return valid.length?valid.reduce((a,b)=>a+b,0)/valid.length:0;
}
function compactSymbol(value){return String(value||'').toUpperCase().replace(/[^A-Z0-9]/g,'');}
function formatIndex(value){return Number.isFinite(value)?`${Math.round(value)}/100`:'n/a';}
function assetLabel(asset){
  return ({fx:'FX',metals:'Metals',energy:'Energy',indices:'Indices',agriculture:'Agriculture',rates:'Rates',other:'Other'})[asset]||'Other';
}
function scoreClass(score){return score>=25?'score-bull':score<=-25?'score-bear':'score-neut';}
function modeClass(group){return group==='trend'?'mode-trend':group==='reversal'?'mode-reversal':'mode-neutral';}
function cotIndex(rows,lookback){
  const slice=rows.slice(-lookback).filter(row=>Number.isFinite(row.adjNet));
  if(slice.length<2) return null;
  const values=slice.map(row=>row.adjNet);
  const min=Math.min(...values);
  const max=Math.max(...values);
  if(max===min) return 50;
  return ((values[values.length-1]-min)/(max-min))*100;
}
function percentileForField(rows,value,field){
  const valid=rows.map(row=>Number(row[field])).filter(Number.isFinite);
  if(valid.length<=1) return value>=0?60:40;
  const sorted=valid.sort((a,b)=>a-b);
  return (sorted.filter(v=>v<value).length/(sorted.length-1))*100;
}
function percentileNet(rows,value){
  return percentileForField(rows,value,'adjNet');
}
function classifyMode(score,index52,adjChg){
  const hasIndex=Number.isFinite(index52);
  if(hasIndex&&index52>=85&&adjChg<0) return {group:'reversal',label:'REVERSAL SHORT WATCH',tradeBias:'short'};
  if(hasIndex&&index52<=15&&adjChg>0) return {group:'reversal',label:'REVERSAL LONG WATCH',tradeBias:'long'};
  if(score>=35&&adjChg>=0) return {group:'trend',label:'TREND FOLLOW LONG',tradeBias:'long'};
  if(score<=-35&&adjChg<=0) return {group:'trend',label:'TREND FOLLOW SHORT',tradeBias:'short'};
  if(hasIndex&&index52>=85) return {group:'reversal',label:'CROWDED LONG',tradeBias:'short'};
  if(hasIndex&&index52>=80&&index52<85) return {group:'reversal',label:'CROWDED LONG',tradeBias:'short'};
  if(hasIndex&&index52<=15) return {group:'reversal',label:'CROWDED SHORT',tradeBias:'long'};
  if(hasIndex&&index52<=20&&index52>15) return {group:'reversal',label:'CROWDED SHORT',tradeBias:'long'};
  if(score>=25) return {group:'trend',label:'BULLISH FILTER',tradeBias:'long'};
  if(score<=-25) return {group:'trend',label:'BEARISH FILTER',tradeBias:'short'};
  return {group:'neutral',label:'NEUTRAL / WAIT',tradeBias:'neutral'};
}
function resolveMarketMeta(label,cftcName=''){
  const compact=compactSymbol(label);
  const upperName=String(cftcName||'').toUpperCase();
  let found=MARKET_MAPPINGS.find(m=>m.keys.some(k=>compactSymbol(k)===compact));
  if(!found) found=MARKET_MAPPINGS.find(m=>m.cftc.some(term=>upperName.includes(term)));
  if(found) return {...found};
  return {
    keys:[label],
    cftc:[cftcName],
    symbol:label,
    asset:'other',
    multiplier:1,
    search:cftcName||label,
    suggested:label,
    view:'Futures bullish = instrument bullish'
  };
}
function numericValue(value){
  if(value==null) return null;
  const raw=String(value).trim();
  if(!raw) return null;
  const cleaned=raw.replace(/[$,%\s]/g,'').replace(/,/g,'');
  if(!cleaned||cleaned==='-'||cleaned==='+') return null;
  const n=Number(cleaned);
  return Number.isFinite(n)?n:null;
}
function parseNumber(value,fallback=0){
  const n=numericValue(value);
  return n==null?fallback:n;
}
function parseNumberOrNull(value){
  return numericValue(value);
}
function normalizeDate(value){
  const s=String(value||'').trim();
  const iso=s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if(iso) return `${iso[1]}-${iso[2].padStart(2,'0')}-${iso[3].padStart(2,'0')}`;
  const mdY=s.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);
  if(!mdY) return null;
  const yr=mdY[3].length===2?'20'+mdY[3]:mdY[3];
  return `${yr}-${mdY[1].padStart(2,'0')}-${mdY[2].padStart(2,'0')}`;
}
function normalizeHeader(value){
  return String(value||'').trim().toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_+|_+$/g,'');
}
function soqlString(value){
  return `'${String(value).replace(/'/g,"''")}'`;
}
function searchTermsForQuery(value){
  const q=String(value||'').trim();
  const compact=compactSymbol(q);
  const mapped=MARKET_MAPPINGS.find(m=>m.keys.some(k=>compactSymbol(k)===compact));
  if(mapped) return {terms:[mapped.search],alias:mapped.search,prefix:true,suggestedLabel:mapped.suggested,meta:mapped};
  const alias=FOREX_MARKET_ALIASES[compact];
  if(alias) return {terms:[alias],alias,prefix:true,suggestedLabel:compact,meta:null};
  return {terms:[q],alias:null,prefix:false,suggestedLabel:null,meta:null};
}
function normalizeLabel(value){
  return String(value||'').trim().toUpperCase().replace(/\s+/g,'_');
}
function isValidLabel(label){
  return /^[A-Z0-9][A-Z0-9_-]{0,19}$/.test(label);
}

// =============================================
// PANEL / TABS
// =============================================
function togglePanel(){
  panelOpen=!panelOpen;
  $('inpPanel').classList.toggle('open',panelOpen);
  $('addDataBtn').setAttribute('aria-expanded',String(panelOpen));
}
function switchTab(t){
  document.querySelectorAll('.mtab').forEach(e=>{
    const isActive=e.dataset.tab===t;
    e.classList.toggle('active',isActive);
    e.setAttribute('aria-selected',String(isActive));
    e.tabIndex=isActive?0:-1;
  });
  document.querySelectorAll('.mbody').forEach(e=>{
    const isActive=e.id===t+'Body';
    e.classList.toggle('active',isActive);
    e.hidden=!isActive;
  });
}

// =============================================
// MODAL QUEUE (Option B flow)
// =============================================
function labelFor(cftcName){
  for(const k of Object.keys(cot)){
    if((cot[k].cftcName||'').toUpperCase()===cftcName.toUpperCase()) return k;
  }
  return null;
}

function suggestLabel(cftcName){
  const upper=String(cftcName||'').toUpperCase();
  const found=MARKET_MAPPINGS.find(m=>m.cftc.some(term=>upper.includes(term)));
  if(found?.suggested) return found.suggested;
  return String(cftcName||'')
    .split(/[\s\-]+/)
    .filter(Boolean)
    .slice(0,2)
    .join('')
    .toUpperCase()
    .replace(/[^A-Z0-9_-]/g,'')
    .substring(0,12)||'COT';
}

function openQueue(entries){
  if(queueBusy){
    setToolbarStatus('Finish the current import before adding another data batch.','inf');
    return;
  }
  queueBusy=true;
  // Group by cftcName
  const grouped={};
  const metaByName={};
  for(const e of entries){
    const k=(e.cftcName||'UNKNOWN').trim();
    if(!grouped[k]) grouped[k]=[];
    grouped[k].push(e);
    if(!metaByName[k]) metaByName[k]={suggestedLabel:e.suggestedLabel||''};
  }
  queue = Object.entries(grouped).map(([name,rows])=>({cftcName:name,rows,suggestedLabel:metaByName[name]?.suggestedLabel||''}));
  qIdx=0;
  processQueue();
}

function processQueue(){
  // Flush known instruments without modal
  while(qIdx<queue.length){
    const item=queue[qIdx];
    const existing=labelFor(item.cftcName);
    if(existing){
      item.rows.forEach(r=>storeRow(existing,item.cftcName,r));
      qIdx++;
    } else break;
  }
  if(qIdx>=queue.length){
    hideModalDialog();
    queueBusy=false;
    queue=[];
    qIdx=0;
    save(); renderTabs(); renderDash();
    return;
  }
  // Show modal for new instrument
  const item=queue[qIdx];
  const lat=item.rows[item.rows.length-1];
  $('mCftcName').value=item.cftcName;
  $('mLabel').value=item.suggestedLabel||suggestLabel(item.cftcName);
  $('mSub').textContent=
    `${item.rows.length} week${item.rows.length!==1?'s':''} of data · confirm your ticker label`;
  renderModalPreview(lat);
  $('mErr').textContent='';
  openModalDialog();
  setTimeout(()=>{const l=$('mLabel');l.focus();l.select();},80);
}

function renderModalPreview(lat){
  const prev=$('mPrev');
  clearChildren(prev);
  appendMetric(prev,'Latest week',lat.date);
  appendMetric(prev,'Long',fmtK(lat.ncL));
  appendMetric(prev,'Short',fmtK(lat.ncS));
  appendMetric(prev,'Net',fmtLg(lat.net),lat.net>=0?'bull':'bear');
}

function appendMetric(parent,label,value,className){
  if(parent.childNodes.length) parent.append(document.createTextNode(' · '));
  parent.append(document.createTextNode(label+': '));
  const span=document.createElement('span');
  if(className) span.className=className;
  span.textContent=value;
  parent.append(span);
}

function confirmModal(){
  const label=normalizeLabel($('mLabel').value);
  $('mLabel').value=label;
  if(!isValidLabel(label)){
    $('mErr').textContent='Use 1-20 characters: A-Z, 0-9, underscore, or hyphen. Start with a letter or number.';
    return;
  }
  const item=queue[qIdx];
  if(cot[label]&&(cot[label].cftcName||'').toUpperCase()!==item.cftcName.toUpperCase()){
    $('mErr').textContent='That label is already used by another instrument.';
    return;
  }
  item.rows.forEach(r=>storeRow(label,item.cftcName,r));
  active=label;
  qIdx++;
  processQueue();
}

function openModalDialog(){
  const bg=$('modalBg');
  if(!bg.classList.contains('open')) lastFocus=document.activeElement;
  bg.classList.add('open');
  bg.setAttribute('aria-hidden','false');
  bg.querySelector('.modal').focus();
}

function hideModalDialog(){
  $('modalBg').classList.remove('open');
  $('modalBg').setAttribute('aria-hidden','true');
  if(lastFocus&&typeof lastFocus.focus==='function') lastFocus.focus();
  lastFocus=null;
}

function closeModal(){ queue=[];qIdx=0;queueBusy=false;hideModalDialog(); }
function clearMErr(){ $('mErr').textContent=''; }

function deriveMissingChanges(weeks){
  weeks.sort((a,b)=>a.date.localeCompare(b.date));
  weeks.forEach((row,i)=>{
    if(!Number.isFinite(row.net)) row.net=row.ncL-row.ncS;
    if(!Number.isFinite(row.chg)) row.chg=i>0?row.net-weeks[i-1].net:0;
    if(!Number.isFinite(row.chgL)) row.chgL=i>0?row.ncL-weeks[i-1].ncL:null;
    if(!Number.isFinite(row.chgS)) row.chgS=i>0?row.ncS-weeks[i-1].ncS:null;
  });
}

function storeRow(label,cftcName,row){
  if(!cot[label]) cot[label]={cftcName,weeks:[]};
  if(!Array.isArray(cot[label].weeks)) cot[label].weeks=[];
  if(!cot[label].cftcName) cot[label].cftcName=cftcName;
  const arr=cot[label].weeks;
  const ncL=parseNumberOrNull(row.ncL);
  const ncS=parseNumberOrNull(row.ncS);
  if(!row.date||ncL==null||ncS==null) return false;
  const net=parseNumberOrNull(row.net);
  const entry={
    date:row.date,
    ncL,
    ncS,
    net:net!=null?net:ncL-ncS,
    chg:parseNumberOrNull(row.chg),
    chgL:parseNumberOrNull(row.chgL),
    chgS:parseNumberOrNull(row.chgS),
    oi:parseNumber(row.oi),
    source:row.source||row.src||'Saved locally',
    updatedAt:row.updatedAt||new Date().toISOString()
  };
  const idx=arr.findIndex(x=>x.date===row.date);
  if(idx>=0) arr[idx]=entry; else arr.push(entry);
  deriveMissingChanges(arr);
  return true;
}

// =============================================
// PASTE TEXT
// =============================================
function parseCFTC(raw){
  const firstLine=(raw.split('\n').map(l=>l.trim()).find(l=>l.length>5)||'').replace(/\s+Code-\S+/,'').trim();
  const cftcName=firstLine||'UNKNOWN INSTRUMENT';
  const dm=raw.match(/AS OF\s+(\d{1,2}\/\d{1,2}\/\d{2,4})/i);
  if(!dm) return{err:'Date not found — expected "AS OF MM/DD/YY".'};
  const date=normalizeDate(dm[1]);
  const oim=raw.match(/OPEN INTEREST:\s*([\d,]+)/i);
  const oi=oim?parseNumber(oim[1]):0;
  const cm=raw.match(/COMMITMENTS\s*\n\s*([\-\d,\s]+)/i);
  if(!cm) return{err:'COMMITMENTS row not found — paste the full block including the header.'};
  const cn=cm[1].trim().split(/\s+/);
  const ncL=parseNumberOrNull(cn[0]),ncS=parseNumberOrNull(cn[1]);
  if(ncL==null||ncS==null) return{err:'Could not parse long/short positions.'};
  const chm=raw.match(/CHANGES FROM[^\n]*\n\s*([\-\d,\s]+)/i);
  let chg=0;
  if(chm){
    const cc=chm[1].trim().split(/\s+/);
    const chgL=parseNumberOrNull(cc[0]),chgS=parseNumberOrNull(cc[1]);
    if(chgL!=null&&chgS!=null) chg=chgL-chgS;
  }
  return{cftcName,date,ncL,ncS,net:ncL-ncS,chg,oi,source:'Pasted report'};
}

function doPaste(){
  const raw=$('pasteBox').value;
  if(!raw.trim()){setSt('pasteSt','Nothing pasted.','err');return;}
  const r=parseCFTC(raw);
  if(r.err){setSt('pasteSt',r.err,'err');return;}
  setSt('pasteSt','Parsed OK — confirm label in the modal.','ok');
  $('pasteBox').value='';
  openQueue([r]);
}

// =============================================
// CSV UPLOAD
// =============================================
function doCSV(input){
  const file=input.files[0];
  if(!file) return;
  const reader=new FileReader();
  reader.onload=e=>{
    try{
      const rows=parseCSV(e.target.result);
      if(!rows.length){setSt('csvSt','CSV is empty.','err');return;}
      const cols=rows[0].map(normalizeHeader);
      const get=(row,names)=>{
        const wanted=names.map(normalizeHeader);
        const i=cols.findIndex(c=>wanted.some(n=>c===n||c.includes(n)));
        return i>=0?String(row[i]||'').trim():'';
      };
      if(!cols.some(c=>c.includes('market')||c.includes('name'))){
        setSt('csvSt','Not a CFTC CSV — missing market/name column.','err');return;
      }
      const entries=[];
      let skipped=0;
      for(let i=1;i<rows.length;i++){
        const row=rows[i];if(row.length<5) continue;
        const cftcName=get(row,['market_and_exchange_names','market','name']);if(!cftcName) continue;
        const date=normalizeDate(get(row,['report_date_as_yyyy_mm_dd','report_date','date']));if(!date) continue;
        const ncL=parseNumberOrNull(get(row,['noncomm_positions_long_all','noncommercial_long','non_commercial_long']));
        const ncS=parseNumberOrNull(get(row,['noncomm_positions_short_all','noncommercial_short','non_commercial_short']));
        if(ncL==null||ncS==null){skipped++;continue;}
        const chgL=parseNumberOrNull(get(row,['change_in_noncomm_long_all','change_in_noncommercial_long','change_in_non_comm_long']));
        const chgS=parseNumberOrNull(get(row,['change_in_noncomm_short_all','change_in_noncommercial_short','change_in_non_comm_short']));
        const oi=parseNumberOrNull(get(row,['open_interest_all','open_interest']));
        entries.push({cftcName,date,ncL,ncS,net:ncL-ncS,chg:chgL!=null&&chgS!=null?chgL-chgS:null,chgL,chgS,oi:oi||0,source:'CSV upload'});
      }
      if(!entries.length){setSt('csvSt','No valid rows found.','err');return;}
      setSt('csvSt',`${entries.length} row${entries.length!==1?'s':''} detected — confirm labels in modal.`,'ok');
      if(skipped) setSt('csvSt',`${entries.length} row${entries.length!==1?'s':''} detected, ${skipped} skipped for missing long/short fields - confirm labels in modal.`,'ok');
      openQueue(entries);
    }catch(err){
      setSt('csvSt',`CSV parse failed: ${err.message}`,'err');
    }
  };
  reader.onerror=()=>setSt('csvSt','Could not read file.','err');
  reader.readAsText(file);
}

function parseCSV(text){
  const rows=[];
  let row=[];
  let field='';
  let inQuotes=false;
  for(let i=0;i<text.length;i++){
    const ch=text[i];
    const next=text[i+1];
    if(inQuotes){
      if(ch==='"'&&next==='"'){field+='"';i++;}
      else if(ch==='"'){inQuotes=false;}
      else field+=ch;
      continue;
    }
    if(ch==='"') inQuotes=true;
    else if(ch===','){row.push(field);field='';}
    else if(ch==='\n'){row.push(field);rows.push(row);row=[];field='';}
    else if(ch==='\r'){
      if(next==='\n') i++;
      row.push(field);rows.push(row);row=[];field='';
    }
    else field+=ch;
  }
  if(inQuotes) throw new Error('unmatched quote');
  if(field.length||row.length){row.push(field);rows.push(row);}
  return rows.filter(r=>r.some(c=>String(c).trim()!==''));
}

// =============================================
// CFTC SOCRATA API
// =============================================
async function doSearch(){
  const q=$('apiQ').value.trim();
  const btn=$('searchBtn');
  const rl=$('rList');
  if(!q){setSt('apiSt','Type an instrument name first.','err');return;}
  const resolved=searchTermsForQuery(q);
  lastSearchContext=resolved;
  btn.disabled=true;btn.textContent='Searching…';
  setLoadingState(true);
  setSt('apiSt',resolved.alias?`Mapped ${q.toUpperCase()} to "${resolved.alias}" in CFTC markets…`:'Querying CFTC Socrata API — no key required…','inf');
  rl.style.display='none';clearChildren(rl);
  try{
    const where=resolved.terms
      .map(term=>{
        const pattern=resolved.prefix?`${term} -%`:`%${term}%`;
        return `upper(market_and_exchange_names) like upper(${soqlString(pattern)})`;
      })
      .join(' OR ');
    const params=new URLSearchParams({
      '$select':'market_and_exchange_names',
      '$where':where,
      '$group':'market_and_exchange_names',
      '$limit':'25'
    });
    const url=`${SOCRATA}?${params}`;
    const data=await fetchJsonWithRetry(url);
    if(!data.length){setSt('apiSt','No matches in CFTC database — try different keywords or a USD-based pair such as EUR/USD.','err');return;}
    rl.style.display='block';
    data.forEach(d=>{
      const nm=d.market_and_exchange_names;
      const btn=document.createElement('button');
      btn.type='button';
      btn.className='ritem';
      btn.textContent=nm;
      btn.addEventListener('click',()=>fetchInst(nm));
      rl.append(btn);
    });
    setSt('apiSt',`${data.length} match${data.length!==1?'es':''} — click one to fetch its history.`,'ok');
  }catch(err){setSt('apiSt',`Search failed: ${err.message}`,'err');}
  finally{btn.disabled=false;btn.textContent='Search CFTC';setLoadingState(false);}
}

async function fetchCftcHistory(cftcName,weeks,suggestedLabel=''){
  const cutoff=new Date(); cutoff.setDate(cutoff.getDate()-weeks*7);
  const cutoffStr=cutoff.toISOString().split('T')[0];
  const params=new URLSearchParams({
    '$where':`market_and_exchange_names=${soqlString(cftcName)} AND report_date_as_yyyy_mm_dd >= ${soqlString(cutoffStr)}`,
    '$order':'report_date_as_yyyy_mm_dd ASC',
    '$limit':String(weeks+10)
  });
  const url=`${SOCRATA}?${params}`;
  const data=await fetchJsonWithRetry(url);
  return data.map(d=>{
    const ncL=parseNumberOrNull(d.noncomm_positions_long_all);
    const ncS=parseNumberOrNull(d.noncomm_positions_short_all);
    const chgL=parseNumberOrNull(d.change_in_noncomm_long_all);
    const chgS=parseNumberOrNull(d.change_in_noncomm_short_all);
    const oi=parseNumberOrNull(d.open_interest_all);
    return {
      cftcName:d.market_and_exchange_names,
      date:(d.report_date_as_yyyy_mm_dd||'').substring(0,10),
      ncL,
      ncS,
      net:ncL!=null&&ncS!=null?ncL-ncS:null,
      chg:chgL!=null&&chgS!=null?chgL-chgS:null,
      chgL,
      chgS,
      oi:oi||0,
      source:'CFTC API',
      suggestedLabel
    };
  }).filter(e=>e.date&&e.ncL!=null&&e.ncS!=null);
}

async function fetchInst(cftcName){
  $('rList').style.display='none';
  const weeks=parseInt($('wkSel').value,10);
  const cutoff=new Date(); cutoff.setDate(cutoff.getDate()-weeks*7);
  const cutoffStr=cutoff.toISOString().split('T')[0];
  setSt('apiSt',`Fetching ${weeks} weeks for "${cftcName.split(' - ')[0]}"…`,'inf');
  setLoadingState(true);
  try{
    const params=new URLSearchParams({
      '$where':`market_and_exchange_names=${soqlString(cftcName)} AND report_date_as_yyyy_mm_dd >= ${soqlString(cutoffStr)}`,
      '$order':'report_date_as_yyyy_mm_dd ASC',
      '$limit':String(weeks+10)
    });
    const url=`${SOCRATA}?${params}`;
    const data=await fetchJsonWithRetry(url);
    if(!data.length){setSt('apiSt','No rows returned — try a wider date range.','err');setLoadingState(false);return;}
    const entries=data.map(d=>{
      const ncL=parseNumberOrNull(d.noncomm_positions_long_all);
      const ncS=parseNumberOrNull(d.noncomm_positions_short_all);
      const chgL=parseNumberOrNull(d.change_in_noncomm_long_all);
      const chgS=parseNumberOrNull(d.change_in_noncomm_short_all);
      const oi=parseNumberOrNull(d.open_interest_all);
      return {
        cftcName:d.market_and_exchange_names,
        date:(d.report_date_as_yyyy_mm_dd||'').substring(0,10),
        ncL,
        ncS,
        net:ncL!=null&&ncS!=null?ncL-ncS:null,
        chg:chgL!=null&&chgS!=null?chgL-chgS:null,
        chgL,
        chgS,
        oi:oi||0,
        source:'CFTC API',
        suggestedLabel:lastSearchContext?.suggestedLabel||'',
      };
    }).filter(e=>e.date&&e.ncL!=null&&e.ncS!=null);
    if(!entries.length){setSt('apiSt','Rows returned, but required non-commercial fields were missing.','err');setLoadingState(false);return;}
    setSt('apiSt',`${entries.length} weeks fetched — confirm label below.`,'ok');
    openQueue(entries);
    setLoadingState(false);
  }catch(err){setSt('apiSt',`Fetch failed: ${err.message}`,'err');setLoadingState(false);}
}

async function refreshAllFromCFTC(){
  const labels=Object.keys(cot).filter(label=>cot[label]?.cftcName);
  if(!labels.length){setToolbarStatus('No saved instruments to update.','err');return;}
  const btn=$('refreshAllBtn');
  btn.disabled=true;
  setLoadingState(true);
  const oldText=btn.textContent;
  btn.textContent='Updating...';
  let added=0,updated=0,failed=0;
  try{
    for(let i=0;i<labels.length;i++){
      const label=labels[i];
      const item=cot[label];
      setToolbarStatus(`Updating ${label} (${i+1}/${labels.length})...`,'inf');
      try{
        const before=new Set((item.weeks||[]).map(row=>row.date));
        const entries=await fetchCftcHistory(item.cftcName||label,16);
        entries.forEach(entry=>{
          const wasKnown=before.has(entry.date);
          if(storeRow(label,entry.cftcName,entry)){
            if(wasKnown) updated++;
            else {added++;before.add(entry.date);}
          }
        });
      }catch(err){
        failed++;
      }
      if(i<labels.length-1) await sleep(CFTC_REQUEST_DELAY_MS);
    }
    save();
    renderTabs();
    renderDash();
    const parts=[`${added} new week${added!==1?'s':''}`,`${updated} refreshed`];
    if(failed) parts.push(`${failed} failed`);
    setToolbarStatus(`Update complete: ${parts.join(', ')}.` ,failed?'err':'ok');
  }finally{
    btn.disabled=false;
    btn.textContent=oldText;
    setLoadingState(false);
  }
}

// =============================================
// DATA MANAGEMENT
// =============================================
function removeInst(k){
  if(!confirm(`Remove all data for "${k}"?`)) return;
  delete cot[k];
  active=Object.keys(cot)[0]||null;
  save();renderTabs();renderDash();
}
function delWeek(k,i){
  if(!cot[k]||!Array.isArray(cot[k].weeks)) return;
  cot[k].weeks.splice(i,1);
  if(!cot[k].weeks.length){
    delete cot[k];
    active=Object.keys(cot)[0]||null;
  }else{
    active=k;
  }
  save();renderTabs();renderDash();
}

function exportData(){
  if(!Object.keys(cot).length){
    setToolbarStatus('No data to export.','err');
    return;
  }
  const payload={
    version:5,
    exportedAt:new Date().toISOString(),
    instruments:cot,
    tradeChecks,
    settings:{chartRange,scannerFilters}
  };
  const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  const stamp=new Date().toISOString().slice(0,10);
  a.href=url;
  a.download=`cot-dashboard-backup-${stamp}.json`;
  document.body.append(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  setToolbarStatus('Backup exported.','ok');
}

function importData(input){
  const file=input.files[0];
  if(!file) return;
  const reader=new FileReader();
  reader.onload=e=>{
    try{
      const parsed=JSON.parse(e.target.result);
      const next=normalizeCotData(parsed.instruments||parsed);
      if(!Object.keys(next).length) throw new Error('backup contains no instruments');
      if(Object.keys(cot).length&&!confirm('Import backup and replace current saved data?')) return;
      cot=next;
      tradeChecks=parsed.tradeChecks&&typeof parsed.tradeChecks==='object'?parsed.tradeChecks:{};
      if(parsed.settings&&typeof parsed.settings==='object'){
        const range=parseInt(parsed.settings.chartRange,10);
        if([4,13,26,52].includes(range)) chartRange=range;
        if(parsed.settings.scannerFilters) scannerFilters={...scannerFilters,...parsed.settings.scannerFilters};
        syncSettingsUI();
        saveSettings();
      }
      active=Object.keys(cot)[0]||null;
      save();
      saveChecklist();
      renderTabs();
      renderDash();
      setToolbarStatus(`${Object.keys(cot).length} instrument${Object.keys(cot).length!==1?'s':''} imported.`, 'ok');
    }catch(err){
      setToolbarStatus(`Import failed: ${err.message}`, 'err');
    }finally{
      input.value='';
    }
  };
  reader.onerror=()=>{
    setToolbarStatus('Could not read backup file.','err');
    input.value='';
  };
  reader.readAsText(file);
}

function resetApp(){
  const btn=$('resetBtn');
  if(!Object.keys(cot).length){
    setToolbarStatus('No saved data to reset.','inf');
    return;
  }
  if(btn.dataset.confirm!=='yes'){
    btn.dataset.confirm='yes';
    btn.textContent='Confirm reset?';
    setToolbarStatus('Click Confirm reset? within 3 seconds to clear saved COT data.','inf');
    clearTimeout(resetConfirmTimer);
    resetConfirmTimer=setTimeout(()=>{
      btn.textContent='Reset';
      delete btn.dataset.confirm;
    },3000);
    return;
  }
  clearTimeout(resetConfirmTimer);
  btn.textContent='Reset';
  delete btn.dataset.confirm;
  Object.keys(cot).forEach(label=>{
    try{localStorage.removeItem('checklist_'+label);}catch(e){}
  });
  cot={};
  active=null;
  chartRange=13;
  scannerFilters={asset:'all',mode:'all',bias:'all'};
  tradeChecks={};
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(SETTINGS_KEY);
  localStorage.removeItem(CHECKLIST_KEY);
  syncSettingsUI();
  renderTabs();
  renderDash();
  setToolbarStatus('All saved COT data cleared.','ok');
}

function save(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(cot));}catch(e){}}
function loadState(){
  try{
    const raw=localStorage.getItem(STORAGE_KEY)||migrateStoredCotData();
    if(!raw) return;
    const parsed=JSON.parse(raw);
    cot=normalizeCotData(parsed.instruments||parsed);
  }catch(e){cot={};}
}

function migrateStoredCotData(){
  const legacyKeys=['cot-v2','cot-v1','cot-data','cot'];
  for(const key of legacyKeys){
    const raw=localStorage.getItem(key);
    if(!raw) continue;
    try{
      const parsed=JSON.parse(raw);
      const migrated=normalizeCotData(parsed.instruments||parsed);
      if(!Object.keys(migrated).length) continue;
      const next=JSON.stringify(migrated);
      localStorage.setItem(STORAGE_KEY,next);
      return next;
    }catch(e){}
  }
  return null;
}

function normalizeCotData(raw){
  if(!raw||typeof raw!=='object'||Array.isArray(raw)) return {};
  const next={};
  Object.keys(raw).forEach(label=>{
    const safeLabel=normalizeLabel(label);
    if(!isValidLabel(safeLabel)) return;
    const item=raw[label]||{};
    const weeks=Array.isArray(item.weeks)?item.weeks.map(row=>{
      const date=normalizeDate(row.date);
      if(!date) return null;
      const ncL=parseNumberOrNull(row.ncL);
      const ncS=parseNumberOrNull(row.ncS);
      if(ncL==null||ncS==null) return null;
      const net=parseNumberOrNull(row.net);
      return {
        date,
        ncL,
        ncS,
        net:net!=null?net:ncL-ncS,
        chg:parseNumberOrNull(row.chg),
        chgL:parseNumberOrNull(row.chgL),
        chgS:parseNumberOrNull(row.chgS),
        oi:parseNumber(row.oi),
        source:String(row.source||row.src||'Imported backup'),
        updatedAt:String(row.updatedAt||'')
      };
    }).filter(Boolean):[];
    deriveMissingChanges(weeks);
    next[safeLabel]={cftcName:String(item.cftcName||safeLabel),weeks};
  });
  return next;
}

function saveChecklist(){
  try{localStorage.setItem(CHECKLIST_KEY,JSON.stringify(tradeChecks));}catch(e){}
}

function loadChecklist(){
  try{
    const parsed=JSON.parse(localStorage.getItem(CHECKLIST_KEY)||'{}');
    tradeChecks=parsed&&typeof parsed==='object'&&!Array.isArray(parsed)?parsed:{};
  }catch(e){tradeChecks={};}
}

function saveSettings(){
  try{localStorage.setItem(SETTINGS_KEY,JSON.stringify({chartRange,scannerFilters}));}catch(e){}
}

function loadSettings(){
  try{
    const parsed=JSON.parse(localStorage.getItem(SETTINGS_KEY)||'{}');
    const range=parseInt(parsed.chartRange,10);
    if([4,13,26,52].includes(range)) chartRange=range;
    if(parsed.scannerFilters&&typeof parsed.scannerFilters==='object'){
      scannerFilters={
        asset:['all','fx','metals','energy','indices','agriculture','rates','other'].includes(parsed.scannerFilters.asset)?parsed.scannerFilters.asset:'all',
        mode:['all','trend','reversal','neutral'].includes(parsed.scannerFilters.mode)?parsed.scannerFilters.mode:'all',
        bias:['all','long','short','extreme'].includes(parsed.scannerFilters.bias)?parsed.scannerFilters.bias:'all'
      };
    }
  }catch(e){}
}

function syncSettingsUI(){
  $('chartRangeSel').value=String(chartRange);
  $('assetFilter').value=scannerFilters.asset;
  $('modeFilter').value=scannerFilters.mode;
  $('biasFilter').value=scannerFilters.bias;
}

// =============================================
// KEYBOARD / BACKDROP
// =============================================
function handleDocumentKeydown(e){
  const open=$('modalBg').classList.contains('open');
  if(!open) return;
  if(e.key==='Tab') trapModalFocus(e);
  if(e.key==='Escape'){e.preventDefault();closeModal();}
  if(e.key==='Enter'&&document.activeElement===$('mLabel')){e.preventDefault();confirmModal();}
}

function trapModalFocus(e){
  const focusable=Array.from($('modalBg').querySelectorAll('button,input,select,textarea,[tabindex]:not([tabindex="-1"])'))
    .filter(el=>!el.disabled&&el.offsetParent!==null);
  if(!focusable.length){e.preventDefault();return;}
  const first=focusable[0];
  const last=focusable[focusable.length-1];
  if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
  else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
}

// =============================================
// CLOCK
// =============================================
function tick(){
  const n = new Date();
  $('cTime').textContent = n.toLocaleTimeString('en-GB',{hour12:false});
  $('cDate').textContent = n.toLocaleDateString('en-GB',{weekday:'short',year:'numeric',month:'short',day:'numeric'});
}

function dataFreshness(date){
  const normalized=normalizeDate(date);
  if(!normalized) return {label:'DATE UNKNOWN',className:'fresh-stale',detail:'No valid COT report date is stored for this signal.'};
  const [y,m,d]=normalized.split('-').map(Number);
  const report=new Date(y,m-1,d);
  const today=new Date();
  today.setHours(0,0,0,0);
  report.setHours(0,0,0,0);
  const days=Math.floor((today-report)/86400000);
  if(!Number.isFinite(days)) return {label:'DATE UNKNOWN',className:'fresh-stale',detail:'No valid COT report date is stored for this signal.'};
  if(days<=10) return {label:'FRESH',className:'fresh-ok',detail:`Latest stored COT report is ${days} day${days!==1?'s':''} old.`};
  if(days<=17) return {label:'CHECK UPDATE',className:'fresh-warn',detail:`Latest stored COT report is ${days} days old. Use Update All before acting if a newer CFTC report is available.`};
  return {label:'STALE DATA',className:'fresh-stale',detail:`Latest stored COT report is ${days} days old. Refresh before relying on this signal.`};
}

// =============================================
// MARKET OVERVIEW — HELPERS
// =============================================
function groupForInstrument(label, cftcName){
  const meta=resolveMarketMeta(label, cftcName);
  const n=String(cftcName||'').toUpperCase();
  if(/(BITCOIN|ETHER|CRYPTO|BTC|ETH)/.test(n)) return 'Crypto';
  const map={fx:'Currencies',metals:'Metals',energy:'Energy',agriculture:'Agriculture',indices:'Indices',rates:'Rates'};
  return map[meta.asset]||'Other';
}

function cotSignal(weeks){
  if(!weeks||weeks.length<10) return 'Not Enough History';
  const latest=weeks[weeks.length-1];
  const p=percentileForField(weeks, latest.net, 'net');
  if(p>=80&&latest.chg<0)  return 'Crowded Long Weakening';
  if(p>=80)                 return 'Crowded Long';
  if(p<=20&&latest.chg>0)  return 'Crowded Short Unwinding';
  if(p<=20)                 return 'Crowded Short';
  if(latest.chg>0)          return 'Bullish Weekly Shift';
  if(latest.chg<0)          return 'Bearish Weekly Shift';
  return 'Neutral';
}

function signalExplanation(signal,row=null){
  const symbol=row?.meta?.symbol||row?.label||'this market';
  const pctText=row?.percentile!=null?` It is around the ${ordinal(row.percentile)} percentile of the loaded history.`:'';
  const map={
    'Crowded Long':`Speculators are heavily net long ${symbol}.${pctText} This can support trend continuation, but late long entries need tighter confirmation because the trade is crowded.`,
    'Crowded Short':`Speculators are heavily net short ${symbol}.${pctText} This can support bearish continuation, but it is also where short-covering reversals often start.`,
    'Bullish Weekly Shift':`The latest adjusted non-commercial net position increased for ${symbol}. This is a bullish positioning change, best used as a filter with your price trigger.`,
    'Bearish Weekly Shift':`The latest adjusted non-commercial net position fell for ${symbol}. This is a bearish positioning change, best used as a filter with your price trigger.`,
    'Crowded Long Weakening':`Positioning is still crowded long, but the latest adjusted weekly change weakened. Treat this as profit-taking or reversal risk rather than a clean long signal.`,
    'Crowded Short Unwinding':`Positioning is still crowded short, but the latest adjusted weekly change improved. This often means shorts are covering, so watch for bullish reversal confirmation.`,
    'Neutral':`Positioning is not at an extreme and the latest weekly change is flat. COT is not giving a strong directional edge here.`,
    'Not Enough History':`Fewer than 10 weeks are loaded. Add more history before trusting percentile or crowding signals.`
  };
  return map[signal]||'No explanation is available for this signal.';
}

function signalClass(signal){
  if(signal==='Crowded Long'||signal==='Bullish Weekly Shift')    return 'sig-bull';
  if(signal==='Crowded Short'||signal==='Bearish Weekly Shift')   return 'sig-bear';
  if(signal==='Crowded Long Weakening'||signal==='Crowded Short Unwinding') return 'sig-warn';
  if(signal==='Not Enough History')                               return 'sig-muted';
  return 'sig-neutral';
}

function latestRowFor(label){
  const weeks=cot[label]?.weeks||[];
  return weeks.length?weeks[weeks.length-1]:null;
}

function ordinal(n){
  const value=Math.round(Number(n)||0);
  const mod100=value%100;
  const suffix=mod100>=11&&mod100<=13?'th':({1:'st',2:'nd',3:'rd'}[value%10]||'th');
  return `${value}${suffix}`;
}

function rangeStatsFromRows(rows, weeksCount=52){
  const weeks=(rows||[]).slice(-weeksCount);
  if(weeks.length<2) return null;
  const nets=weeks.map(w=>w.net);
  return{min:Math.min(...nets),max:Math.max(...nets),count:weeks.length};
}

function buildRangeBar(value, min, max, count){
  if(!Number.isFinite(min)||!Number.isFinite(max)||min===max){
    return makeText('span','num-muted','n/a');
  }
  const pos=Math.max(0,Math.min(100,((value-min)/(max-min))*100));
  const lbl=count<52?`${count}w range`:'52w range';
  const wrap=document.createElement('div');
  wrap.className='range-cell';
  const labels=document.createElement('div');
  labels.className='range-labels';
  labels.append(makeText('span','',fmtK(min)),makeText('span','',fmtK(max)));
  const bar=document.createElement('div');
  bar.className='range-bar';
  const fill=document.createElement('div');
  fill.className='range-fill';
  fill.style.width=`${pos.toFixed(1)}%`;
  const marker=document.createElement('span');
  marker.className='range-marker';
  marker.style.left=`${pos.toFixed(1)}%`;
  bar.append(fill,marker);
  wrap.append(labels,bar,makeText('div','range-foot',lbl));
  return wrap;
}

function appendCell(row,text,className=''){
  const td=document.createElement('td');
  if(className) td.className=className;
  td.textContent=text;
  row.append(td);
  return td;
}

function appendNodeCell(row,node,className=''){
  const td=document.createElement('td');
  if(className) td.className=className;
  td.append(node);
  row.append(td);
  return td;
}

function createSignalPill(signal,row){
  const pill=makeText('span',`signal-pill ${signalClass(signal)}`,signal);
  const explanation=signalExplanation(signal,row);
  pill.title=explanation;
  pill.dataset.tip=explanation;
  pill.tabIndex=0;
  pill.setAttribute('aria-label',`${signal}. ${explanation}`);
  return pill;
}

function changeClass(val){
  return val>0?'num-pos':val<0?'num-neg':'';
}

function changeText(val){
  return val==null||!Number.isFinite(val)?'n/a':fmtLg(val);
}

// =============================================
// MARKET OVERVIEW — TABLE
// =============================================
function getMarketOverviewRows(){
  return Object.keys(cot).map(label=>{
    const analysis=buildAnalysis(label);
    if(!analysis) return null;
    const cftcName=cot[label].cftcName||label;
    const group=groupForInstrument(label, cftcName);
    const adjustedRows=analysis.adjusted.map(row=>({...row,net:row.adjNet,chg:row.adjChg}));
    const latest={...analysis.latest,net:analysis.adjNet,chg:analysis.adjChg};
    const signal=cotSignal(adjustedRows);
    const percentile=Number.isFinite(analysis.percentile)?Math.round(analysis.percentile):null;
    const range=rangeStatsFromRows(adjustedRows, 52);
    return {label,cftcName,group,latest,rawLatest:analysis.latest,signal,percentile,range,meta:analysis.meta,analysis};
  }).filter(Boolean);
}

function applyMarketFilters(rows){
  const q=tableFilters.search.trim().toLowerCase();
  return rows.filter(r=>{
    if(tableFilters.group!=='all'&&r.group!==tableFilters.group) return false;
    if(tableFilters.signal!=='all'&&r.signal!==tableFilters.signal) return false;
    if(q&&![r.label,r.cftcName,r.group,r.signal].some(s=>s.toLowerCase().includes(q))) return false;
    return true;
  });
}

function sortMarketRows(rows){
  const {key,dir}=tableSort;
  const mul=dir==='asc'?1:-1;
  return [...rows].sort((a,b)=>{
    let av,bv;
    if(key==='label')      {av=a.label;      bv=b.label;      return mul*av.localeCompare(bv);}
    if(key==='group')      {av=a.group;      bv=b.group;      return mul*av.localeCompare(bv);}
    if(key==='signal')     {av=a.signal;     bv=b.signal;     return mul*av.localeCompare(bv);}
    if(key==='net')        {av=a.latest.net; bv=b.latest.net;}
    else if(key==='chg')   {av=a.latest.chg; bv=b.latest.chg;}
    else if(key==='ncL')   {av=a.latest.ncL; bv=b.latest.ncL;}
    else if(key==='ncS')   {av=a.latest.ncS; bv=b.latest.ncS;}
    else if(key==='percentile'){av=a.percentile??-1; bv=b.percentile??-1;}
    else                   {av=0;bv=0;}
    return mul*(av-bv);
  });
}

function renderCotTable(){
  const body=$('cotTableBody');
  if(!body) return;
  clearChildren(body);
  const allRows=getMarketOverviewRows();
  const filtered=applyMarketFilters(allRows);
  const sorted=sortMarketRows(filtered);

  // Update sort indicators on headers
  document.querySelectorAll('.cot-table th[data-sort]').forEach(th=>{
    th.classList.remove('sort-active');
    const ind=th.querySelector('.sort-indicator');
    if(ind) ind.remove();
  });
  const activeTh=document.querySelector(`.cot-table th[data-sort="${tableSort.key}"]`);
  if(activeTh){
    activeTh.classList.add('sort-active');
    const ind=document.createElement('span');
    ind.className='sort-indicator';
    ind.textContent=tableSort.dir==='asc'?'▲':'▼';
    activeTh.append(ind);
  }

  // Status line
  const status=$('marketTableStatus');
  if(status){
    if(!allRows.length) status.textContent='';
    else if(filtered.length!==allRows.length) status.textContent=`Showing ${filtered.length} of ${allRows.length} instruments`;
    else status.textContent=`${allRows.length} instrument${allRows.length!==1?'s':''}`;
  }

  sorted.forEach(r=>{
    const tr=document.createElement('tr');
    tr.dataset.label=r.label;
    if(r.label===active) tr.classList.add('active-row');
    tr.addEventListener('click',()=>pick(r.label));

    const {latest:lat,range,percentile:p}=r;
    const netCls=changeClass(lat.net);
    const chgCls=changeClass(lat.chg);
    const pileCls=p==null?'num-muted':p>=80?'num-pos':p<=20?'num-neg':'';

    const labelCell=document.createElement('td');
    const strong=makeText('strong','',r.label);
    labelCell.append(strong);
    tr.append(labelCell);
    appendCell(tr,r.cftcName.split(' - ')[0],'market-name-cell');
    appendCell(tr,r.group,'group-cell');
    appendCell(tr,fmtLg(lat.net),netCls);
    appendCell(tr,fmtLg(lat.chg),chgCls);
    appendCell(tr,fmtK(lat.ncL));
    appendCell(tr,changeText(lat.chgL),changeClass(lat.chgL)||(lat.chgL==null?'num-muted':''));
    appendCell(tr,fmtK(lat.ncS));
    appendCell(tr,changeText(lat.chgS),changeClass(lat.chgS)||(lat.chgS==null?'num-muted':''));
    appendCell(tr,p!=null?ordinal(p):'n/a',pileCls);
    appendNodeCell(tr,range?buildRangeBar(lat.net,range.min,range.max,range.count):makeText('span','num-muted','n/a'));
    appendNodeCell(tr,createSignalPill(r.signal,r));
    body.append(tr);
  });

  if(!sorted.length&&allRows.length){
    const tr=document.createElement('tr');
    const td=document.createElement('td');
    td.colSpan=12;td.className='num-muted';td.style.textAlign='center';td.style.padding='18px';
    td.textContent='No instruments match the current filters.';
    tr.append(td);body.append(tr);
  }
}

// =============================================
// MARKET OVERVIEW — CSV EXPORT
// =============================================
function csvEscape(value){
  const s=String(value==null?'':value);
  return s.includes(',')||s.includes('"')||s.includes('\n')?`"${s.replace(/"/g,'""')}"`:s;
}

function exportTableCSV(){
  const allRows=getMarketOverviewRows();
  const filtered=applyMarketFilters(allRows);
  const sorted=sortMarketRows(filtered);
  if(!sorted.length){setToolbarStatus('No table data to export.','err');return;}
  const headers=['Label','CFTC Market Name','Group','Report Date','Adjusted Net Position','Adjusted Net Change',
    'Raw Net Position','Raw Net Change','Long Positions','Long Change','Short Positions','Short Change',
    'Open Interest','Percentile','Signal','Signal Explanation','Source'];
  const lines=[headers.map(csvEscape).join(',')];
  sorted.forEach(r=>{
    const lat=r.latest;
    const raw=r.rawLatest||lat;
    lines.push([
      r.label, r.cftcName, r.group, lat.date,
      lat.net, lat.chg, raw.net, raw.chg, lat.ncL,
      lat.chgL!=null?lat.chgL:'', lat.ncS,
      lat.chgS!=null?lat.chgS:'', lat.oi||'',
      r.percentile!=null?r.percentile:'', r.signal, signalExplanation(r.signal,r),
      lat.source||''
    ].map(csvEscape).join(','));
  });
  const blob=new Blob([lines.join('\n')],{type:'text/csv'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url;
  a.download=`cot-market-overview-${new Date().toISOString().slice(0,10)}.csv`;
  document.body.append(a);a.click();a.remove();
  URL.revokeObjectURL(url);
  const scope=sorted.length===allRows.length
    ? `${sorted.length} rows`
    : `${sorted.length} of ${allRows.length} filtered rows`;
  setToolbarStatus(`Exported ${scope} to CSV.`,'ok');
}

// =============================================
// UI REDESIGN OVERRIDES
// =============================================
const chartCrosshairPlugin={
  id:'cotCrosshair',
  afterDraw(chart){
    const active=chart.tooltip?.getActiveElements?.()||[];
    if(!active.length) return;
    const ctx=chart.ctx;
    const {chartArea}=chart;
    const point=active[0].element;
    ctx.save();
    ctx.strokeStyle=cssVar('--border-3');
    ctx.lineWidth=1;
    ctx.setLineDash([4,4]);
    ctx.beginPath();
    ctx.moveTo(point.x,chartArea.top);
    ctx.lineTo(point.x,chartArea.bottom);
    ctx.moveTo(chartArea.left,point.y);
    ctx.lineTo(chartArea.right,point.y);
    ctx.stroke();
    ctx.restore();
  }
};

function renderTabs(){
  const bar=$('instBar');
  const keys=Object.keys(cot);
  clearChildren(bar);
  if(!keys.length){
    bar.append(makeText('span','inst-empty','No instruments yet - use Add Data'));
    return;
  }
  const groups=new Map();
  keys.forEach(k=>{
    const item=cot[k]||{};
    const meta=resolveMarketMeta(k,item.cftcName);
    const group=assetLabel(meta.asset);
    if(!groups.has(group)) groups.set(group,[]);
    groups.get(group).push(k);
  });
  groups.forEach((labels,group)=>{
    bar.append(makeText('div','watch-group',group));
    labels.sort((a,b)=>a.localeCompare(b)).forEach(k=>{
      const b=badge(k);
      const analysis=buildAnalysis(k);
      const item=document.createElement('div');
      item.className='inst-item'+(k===active?' active':'');

      const pickBtn=document.createElement('button');
      pickBtn.type='button';
      pickBtn.className='inst-btn';
      pickBtn.setAttribute('aria-pressed',String(k===active));
      pickBtn.append(
        makeText('span','inst-symbol',k),
        makeText('span','bdg '+b.c,b.t),
        makeText('span','inst-score '+(analysis?scoreClass(analysis.score):'num-muted'),analysis?`${analysis.score>0?'+':''}${analysis.score}`:'-')
      );
      pickBtn.addEventListener('click',()=>pick(k));

      const delBtn=document.createElement('button');
      delBtn.type='button';
      delBtn.className='inst-del';
      delBtn.title='Remove';
      delBtn.setAttribute('aria-label',`Remove ${k}`);
      delBtn.textContent='x';
      delBtn.addEventListener('click',()=>removeInst(k));

      item.append(pickBtn,delBtn);
      bar.append(item);
    });
  });
}

function renderDash(options={}){
  const keys=Object.keys(cot);
  $('tInfo').textContent=keys.length?`${keys.length} instrument${keys.length!==1?'s':''}`:'No instruments';
  if(!active||!cot[active]){
    showEmpty('No instruments loaded','Click Add Data then paste a report, upload CSV, or search and fetch from the live CFTC API.');
    return;
  }

  const all=cot[active].weeks||[];
  if(!all.length){
    showEmpty(`${active} has no stored weeks`,'Add fresh data for this instrument or remove the empty instrument.');
    return;
  }
  $('emptyState').hidden=true;
  $('dataView').hidden=false;

  const analysis=buildAnalysis(active);
  const view=all.slice(-chartRange);
  const lat=analysis.latest;
  const prev=analysis.prev;

  $('snapLabel').textContent=`SNAPSHOT - WEEK ENDING ${lat.date} - ${analysis.meta.symbol} - ${analysis.meta.view}`;

  const freshness=dataFreshness(lat.date);
  updateTopFreshness(freshness);
  $('freshPill').textContent=freshness.label;
  $('freshPill').className=`fresh-pill ${freshness.className}`;
  $('freshPill').title=freshness.detail;

  if(options.market!==false) renderMarketViews();
  renderActiveInstrument(analysis,all,view);
  syncActiveTableRow();
}

function renderMarketViews(){
  renderScanner();
  renderCotTable();
}

function syncActiveTableRow(){
  document.querySelectorAll('#cotTableBody tr[data-label]').forEach(tr=>{
    tr.classList.toggle('active-row',tr.dataset.label===active);
  });
  document.querySelectorAll('#scannerRows .scan-row[data-label]').forEach(row=>{
    row.classList.toggle('active',row.dataset.label===active);
  });
}

function renderActiveInstrument(analysis,all,view){
  const lat=analysis.latest;
  const prev=analysis.prev;
  setAnimatedNumber('biasVal',analysis.score,v=>`${v>0?'+':''}${v}`);
  setKpiClass('biasCard',analysis.score>=25?'up':analysis.score<=-25?'down':'neutral');
  $('biasSub').textContent=analysis.mode.label;
  $('biasSub').className='csub kpi-delta';

  const n=analysis.adjNet;
  setAnimatedNumber('netVal',n,fmtLg);
  setKpiClass('netCard',n>=0?'up':'down');
  const netDelta=prev?n-(prev.net*analysis.meta.multiplier):null;
  const ns=$('netSub');
  ns.textContent=netDelta!=null
    ? `${netDelta>=0?'up':'down'} ${fmtLg(netDelta)} vs prev`
    : (analysis.meta.multiplier===-1?`${analysis.meta.symbol} adjusted - raw ${fmtLg(lat.net)}`:'no prior week');
  ns.className='csub kpi-delta '+(netDelta==null?'':netDelta>=0?'up':'down');

  const chg=analysis.adjChg;
  setAnimatedNumber('chgVal',chg,fmtLg);
  setKpiClass('chgCard',chg>=0?'up':'down');
  $('chgSub').textContent=prev?`prev adjusted net: ${fmtK(prev.net*analysis.meta.multiplier)}`:'no prior week';
  $('chgSub').className='csub kpi-delta '+(chg>=0?'up':'down');

  const p=Math.round(analysis.percentile);
  setAnimatedNumber('extVal',p,v=>`${v}th %ile`);
  let es='neutral zone',ep='ap-neut',et='NEUTRAL',tone='neutral';
  if(p>=80){es='crowded long extreme';ep='ap-bull';et='CROWDED LONG';tone='extreme';}
  else if(p<=20){es='crowded short extreme';ep='ap-bear';et='CROWDED SHORT';tone='extreme';}
  else if(p>=65){es='leaning long';ep='ap-bull';et='LEANING LONG';tone='up';}
  else if(p<=35){es='leaning short';ep='ap-bear';et='LEANING SHORT';tone='down';}
  setKpiClass('extCard',tone,p===100||p===0);
  $('extSub').textContent=es;
  $('extSub').className='csub kpi-delta';
  const extPill=$('extPill');
  clearChildren(extPill);
  extPill.append(makeText('span','apill '+ep,et));

  renderDetails(analysis);
  renderChecklist();

  $('cNote').textContent=all.length<10
    ? `Percentile based on ${all.length} week(s) - add 10+ for a reliable extreme reading`:'';
  $('chartTitle').textContent=`Positioning trend - last ${view.length} week${view.length!==1?'s':''}`;
  $('chartSub').textContent=`Showing ${Math.min(chartRange,all.length)} of ${all.length} stored week${all.length!==1?'s':''}`;

  $('wkCount').textContent=`${all.length} week${all.length!==1?'s':''} stored`;
  const chips=$('chips');
  clearChildren(chips);
  all.forEach((e,i)=>{
    const chip=document.createElement('div');
    chip.className='chip';
    chip.append(document.createTextNode(e.date));
    const btn=document.createElement('button');
    btn.type='button';
    btn.textContent='x';
    btn.setAttribute('aria-label',`Delete week ${e.date}`);
    btn.addEventListener('click',()=>delWeek(active,i));
    chip.append(btn);
    chips.append(chip);
  });

  renderChart(view,analysis.meta);
}

function pick(k){
  active=k;
  renderTabs();
  renderDash({market:false});
}

function setKpiClass(id,tone,glow=false){
  const el=$(id);
  if(!el) return;
  const map={up:'accent-up',down:'accent-down',neutral:'accent-neutral',extreme:'accent-extreme'};
  el.className=`card kpi-card ${map[tone]||map.neutral}${glow?' extreme-glow':''}`;
}

function updateTopFreshness(freshness){
  const badge=$('freshTopBadge');
  const dot=$('liveStatusDot');
  badge.textContent=freshness?.label||'WAITING';
  badge.className=`freshness-badge ${freshness?.className||''}`;
  dot.className='status-dot';
  if(freshness?.className==='fresh-ok') dot.classList.add('live');
  else if(freshness?.className==='fresh-warn') dot.classList.add('warn');
}

function showEmpty(title,message){
  clearChart();
  $('emptyTitle').textContent=title;
  $('emptyMsg').textContent=message;
  $('emptyState').hidden=false;
  $('dataView').hidden=true;
  $('tInfo').textContent=Object.keys(cot).length?`${Object.keys(cot).length} instrument${Object.keys(cot).length!==1?'s':''}`:'No instruments';
  updateTopFreshness(null);
}

function renderChart(view,meta={multiplier:1}){
  syncLegendButtons();
  if(view.length<2){
    clearChart();
    return;
  }
  if(typeof Chart==='undefined'){
    $('cNote').textContent='Chart unavailable because Chart.js did not load.';
    return;
  }
  const colors={
    accent:cssVar('--accent'),
    up:cssVar('--color-up'),
    down:cssVar('--color-down'),
    upMuted:cssVar('--color-up-muted'),
    downMuted:cssVar('--color-down-muted'),
    surface1:cssVar('--surface-1'),
    surface3:cssVar('--surface-3'),
    border:cssVar('--border-1'),
    text:cssVar('--text-primary'),
    text2:cssVar('--text-secondary'),
    text3:cssVar('--text-tertiary')
  };
  const labels=view.map(e=>e.date);
  const nets=view.map(e=>e.net*meta.multiplier);
  const longs=view.map(e=>e.ncL);
  const shorts=view.map(e=>e.ncS);
  const chgs=view.map(e=>e.chg*meta.multiplier);
  const config={
    type:'bar',
    data:{labels,datasets:[
      {type:'line',label:'Net position',data:nets,borderColor:colors.accent,backgroundColor:'transparent',
       pointBackgroundColor:colors.accent,pointBorderColor:colors.surface1,pointBorderWidth:2,pointRadius:4,
       tension:.35,yAxisID:'y',order:1,hidden:chartHidden.has(0)},
      {type:'line',label:'Non-commercial longs',data:longs,borderColor:colors.up,backgroundColor:'transparent',
       pointBackgroundColor:colors.up,pointRadius:2,borderDash:[4,3],tension:.25,yAxisID:'y',order:3,hidden:chartHidden.has(1)},
      {type:'line',label:'Non-commercial shorts',data:shorts,borderColor:colors.down,backgroundColor:'transparent',
       pointBackgroundColor:colors.down,pointRadius:2,borderDash:[4,3],tension:.25,yAxisID:'y',order:3,hidden:chartHidden.has(2)},
      {type:'bar',label:'Weekly change',data:chgs,
       backgroundColor:chgs.map(v=>v>=0?colors.upMuted:colors.downMuted),
       borderColor:chgs.map(v=>v>=0?colors.up:colors.down),
       borderWidth:1,borderRadius:3,yAxisID:'y2',order:2,hidden:chartHidden.has(3)}
    ]},
    options:{
      responsive:true,
      maintainAspectRatio:false,
      interaction:{mode:'index',intersect:false},
      animation:{duration:reducedMotion()?0:800,easing:'easeOutCubic'},
      onHover:(event,elements)=>{event.native.target.style.cursor=elements.length?'crosshair':'default';},
      plugins:{
        legend:{display:false},
        tooltip:{
          backgroundColor:colors.surface3,
          titleColor:colors.text2,
          bodyColor:colors.text,
          borderColor:colors.border,
          borderWidth:1,
          callbacks:{label:c=>{
            const value=c.dataset.label==='Weekly change'?fmtLg(c.parsed.y):fmtK(c.parsed.y);
            return `${c.dataset.label}: ${value}`;
          }}
        }
      },
      scales:{
        x:{ticks:{color:colors.text3,font:{family:'JetBrains Mono',size:10}},grid:{color:colors.border}},
        y:{position:'left',ticks:{color:colors.accent,font:{family:'JetBrains Mono',size:10},callback:v=>fmtK(v)},grid:{color:colors.border}},
        y2:{position:'right',ticks:{color:colors.text3,font:{family:'JetBrains Mono',size:10},callback:v=>fmtK(v)},grid:{display:false}}
      }
    },
    plugins:[chartCrosshairPlugin]
  };
  if(chart){
    chart.data=config.data;
    chart.options=config.options;
    chart.update(reducedMotion()?'none':'active');
  }else{
    chart=new Chart($('tChart'),config);
  }
  syncLegendButtons();
}

function renderCotTable(){
  const body=$('cotTableBody');
  if(!body) return;
  clearChildren(body);
  const allRows=getMarketOverviewRows();
  const filtered=applyMarketFilters(allRows);
  const sorted=sortMarketRows(filtered);

  document.querySelectorAll('.cot-table th[data-sort]').forEach(th=>{
    th.classList.remove('sort-active');
    const ind=th.querySelector('.sort-indicator');
    if(ind) ind.remove();
  });
  const activeTh=document.querySelector(`.cot-table th[data-sort="${tableSort.key}"]`);
  if(activeTh){
    activeTh.classList.add('sort-active');
    const ind=document.createElement('span');
    ind.className='sort-indicator';
    ind.textContent=tableSort.dir==='asc'?'\u2191':'\u2193';
    activeTh.append(ind);
  }

  const status=$('marketTableStatus');
  if(status){
    if(!allRows.length) status.textContent='';
    else if(filtered.length!==allRows.length) status.textContent=`Showing ${filtered.length} of ${allRows.length} instruments`;
    else status.textContent=`${allRows.length} instrument${allRows.length!==1?'s':''}`;
  }

  sorted.forEach(r=>{
    const tr=document.createElement('tr');
    tr.dataset.label=r.label;
    if(r.label===active) tr.classList.add('active-row');
    tr.addEventListener('click',()=>{
      pick(r.label);
      scrollToSection('detailSection','detail');
    });

    const {latest:lat,range,percentile:p}=r;
    const labelCell=document.createElement('td');
    labelCell.className='symbol';
    const strong=makeText('strong','',r.label);
    labelCell.append(strong);
    tr.append(labelCell);
    appendCell(tr,r.cftcName.split(' - ')[0],'market-name-cell');
    appendCell(tr,r.group,'group-cell');
    appendCell(tr,fmtLg(lat.net),changeClass(lat.net)+' numeric');
    appendCell(tr,fmtLg(lat.chg),changeClass(lat.chg)+' numeric');
    appendCell(tr,fmtK(lat.ncL),'numeric');
    appendCell(tr,changeText(lat.chgL),(changeClass(lat.chgL)||(lat.chgL==null?'num-muted':''))+' numeric');
    appendCell(tr,fmtK(lat.ncS),'numeric');
    appendCell(tr,changeText(lat.chgS),(changeClass(lat.chgS)||(lat.chgS==null?'num-muted':''))+' numeric');
    appendNodeCell(tr,p!=null?buildPercentileBar(p):makeText('span','num-muted','n/a'),'numeric');
    appendNodeCell(tr,range?buildRangeBar(lat.net,range.min,range.max,range.count):makeText('span','num-muted','n/a'),'numeric');
    appendNodeCell(tr,createSignalPill(r.signal,r));
    body.append(tr);
  });

  if(!sorted.length&&allRows.length){
    const tr=document.createElement('tr');
    const td=document.createElement('td');
    td.colSpan=12;
    td.className='num-muted';
    td.style.textAlign='center';
    td.style.padding='18px';
    td.textContent='No instruments match the current filters.';
    tr.append(td);
    body.append(tr);
  }
}

function buildPercentileBar(p){
  const value=clamp(Math.round(p),0,100);
  const wrap=document.createElement('div');
  wrap.className='ile-bar';
  const track=document.createElement('div');
  track.className='ile-track';
  const fill=document.createElement('div');
  fill.className='ile-fill '+(value>66?'up':value<33?'down':'neutral');
  fill.style.width=`${value}%`;
  track.append(fill);
  wrap.append(track,makeText('span','',ordinal(value)));
  return wrap;
}

function renderChecklist(){
  let state=tradeChecks[active]||{};
  $('checklistSection').dataset.instrument=active||'';
  if(active&&!tradeChecks[active]){
    try{
      const single=JSON.parse(localStorage.getItem('checklist_'+active)||'{}');
      if(single&&typeof single==='object'&&!Array.isArray(single)) state=single;
    }catch(e){}
  }
  document.querySelectorAll('[data-check]').forEach(input=>{
    input.checked=Boolean(state[input.dataset.check]);
  });
  $('tradeNotes').value=state.notes||'';
  updateChecklistScore();
}

function saveActiveChecklist(){
  if(!active) return;
  const boundInstrument=$('checklistSection').dataset.instrument;
  if(boundInstrument&&boundInstrument!==active) return;
  const next={...(tradeChecks[active]||{})};
  document.querySelectorAll('[data-check]').forEach(input=>{
    next[input.dataset.check]=input.checked;
  });
  next.notes=$('tradeNotes').value;
  next.updatedAt=new Date().toISOString();
  tradeChecks[active]=next;
  try{localStorage.setItem('checklist_'+active,JSON.stringify(next));}catch(e){}
  saveChecklist();
  updateChecklistScore();
  renderScanner();
}

function updateChecklistScore(){
  const checks=Array.from(document.querySelectorAll('[data-check]'));
  const ready=checks.filter(input=>input.checked).length;
  const total=checks.length||4;
  $('checkTitle').textContent=active?`${active} checklist`:'Checklist';
  $('checkScoreLabel').textContent=`${ready}/${total} ready`;
  $('checkScore').className='check-score '+(ready===total?'s-ok':ready>=2?'s-inf':'');
  const badge=$('checkReadyBadge');
  badge.hidden=ready!==total;
  updateRing(ready,total);
}

function updateRing(checked,total){
  const pct=total?checked/total:0;
  const circumference=2*Math.PI*18;
  const offset=circumference*(1-pct);
  const fill=document.querySelector('.ring-fill');
  const text=document.querySelector('.ring-text');
  if(fill){
    fill.style.strokeDasharray=String(circumference);
    fill.style.strokeDashoffset=String(offset);
  }
  if(text) text.textContent=`${checked}/${total}`;
}

function syncSettingsUI(){
  $('chartRangeSel').value=String(chartRange);
  $('assetFilter').value=scannerFilters.asset;
  $('modeFilter').value=scannerFilters.mode;
  $('biasFilter').value=scannerFilters.bias;
  $('topSearchInput').value=tableFilters.search;
  $('marketFilter').value=tableFilters.search;
  syncRangeButtons();
  syncThemeButton();
}

function syncRangeButtons(){
  document.querySelectorAll('[data-range]').forEach(btn=>{
    btn.classList.toggle('active',parseInt(btn.dataset.range,10)===chartRange);
  });
}

function toggleChartDataset(e){
  const btn=e.target.closest('[data-dataset]');
  if(!btn||!chart) return;
  const idx=parseInt(btn.dataset.dataset,10);
  const visible=chart.isDatasetVisible(idx);
  chart.setDatasetVisibility(idx,!visible);
  if(visible) chartHidden.add(idx);
  else chartHidden.delete(idx);
  chart.update();
  syncLegendButtons();
}

function syncLegendButtons(){
  document.querySelectorAll('[data-dataset]').forEach(btn=>{
    const idx=parseInt(btn.dataset.dataset,10);
    const hidden=chartHidden.has(idx);
    btn.classList.toggle('muted',hidden);
    btn.classList.toggle('active',!hidden);
    btn.setAttribute('aria-pressed',String(!hidden));
  });
}

function exportChartPNG(){
  const canvas=$('tChart');
  if(!chart||!canvas){
    setToolbarStatus('No chart is available to export.','err');
    return;
  }
  const a=document.createElement('a');
  a.href=canvas.toDataURL('image/png');
  a.download=`cot-chart-${active||'instrument'}-${new Date().toISOString().slice(0,10)}.png`;
  document.body.append(a);
  a.click();
  a.remove();
  setToolbarStatus('Chart exported as PNG.','ok');
}

function initTheme(){
  const saved=localStorage.getItem(THEME_KEY);
  const preferred=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';
  document.body.dataset.theme=saved||preferred;
}

function toggleTheme(){
  const current=document.body.dataset.theme||'dark';
  const next=current==='dark'?'light':'dark';
  document.body.dataset.theme=next;
  localStorage.setItem(THEME_KEY,next);
  syncThemeButton();
  if(active) renderDash();
}

function syncThemeButton(){
  const btn=$('themeToggleBtn');
  if(btn) btn.textContent=(document.body.dataset.theme||'dark')==='dark'?'Light':'Dark';
}

function toggleSidebar(){
  const sidebar=$('sidebar');
  const expanded=!sidebar.classList.contains('expanded');
  sidebar.classList.toggle('expanded',expanded);
  $('sidebarToggle').setAttribute('aria-expanded',String(expanded));
}

function scrollToSection(target,page=''){
  const el=$(target);
  if(!el) return;
  el.scrollIntoView({behavior:reducedMotion()?'auto':'smooth',block:'start'});
  if(page) setActivePage(page);
}

function setActivePage(page){
  document.querySelectorAll('[data-page]').forEach(btn=>{
    btn.classList.toggle('active',btn.dataset.page===page);
  });
}

function loadNextInstrument(){selectNextInstrument(1);}
function loadPrevInstrument(){selectNextInstrument(-1);}
function selectNextInstrument(step){
  const keys=Object.keys(cot);
  if(!keys.length) return;
  const idx=Math.max(0,keys.indexOf(active));
  const next=keys[(idx+step+keys.length)%keys.length];
  pick(next);
}

function openSelectedInstrumentDetail(){
  if(active) scrollToSection('detailSection','detail');
}

function triggerUpdateAll(){
  if(!$('refreshAllBtn').disabled) refreshAllFromCFTC();
}

function closeOpenPanels(){
  if(panelOpen) togglePanel();
  if($('modalBg').classList.contains('open')) closeModal();
}

function handleDocumentKeydown(e){
  const open=$('modalBg').classList.contains('open');
  if(open){
    if(e.key==='Tab') trapModalFocus(e);
    if(e.key==='Escape'){e.preventDefault();closeModal();}
    if(e.key==='Enter'&&document.activeElement===$('mLabel')){e.preventDefault();confirmModal();}
    return;
  }
  const tag=document.activeElement?.tagName;
  if(tag==='INPUT'||tag==='TEXTAREA'||tag==='SELECT') return;
  switch(e.key){
    case '/':
      e.preventDefault();
      $('topSearchInput').focus();
      break;
    case 'ArrowDown':
      e.preventDefault();
      selectNextInstrument(1);
      break;
    case 'ArrowUp':
      e.preventDefault();
      selectNextInstrument(-1);
      break;
    case 'Enter':
      e.preventDefault();
      openSelectedInstrumentDetail();
      break;
    case 'u':
    case 'U':
      e.preventDefault();
      triggerUpdateAll();
      break;
    case 'Escape':
      e.preventDefault();
      closeOpenPanels();
      break;
  }
}

function setLoadingState(isLoading){
  document.body.classList.toggle('is-loading',Boolean(isLoading));
}

init();

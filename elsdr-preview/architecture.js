
/* ELSDR Website Architecture — 2026.10.25 approved outline
   Data registry is intentionally separate from visual components.
   Draft/example entries must not be presented as verified content. */
(()=>{
'use strict';
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const E=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const root=name=>$('[data-page="'+name+'"]');
const headings={
 research:['Research Archive','Research','프로젝트와 논문을 하나의 아카이브에서 탐색합니다.'],
 people:['Our People','People','연구실의 구성원과 졸업생, 연구와 저술 활동을 소개합니다.'],
 study:['Learning & Resources','Study','연구실의 연구 역량과 공개 가능한 학습자료를 모아 소개합니다.'],
 life:['Life at ELSDR','Life at ELSDR','공식 소식과 행사, 연구실 구성원의 활동 기록입니다.'],
 contact:['Connect with Us','Contact','연구실 위치와 연구 참여 안내를 확인하세요.']
};
const navItems={
 about:[['vision','Vision'],['identity','Identity'],['themes','Research Themes'],['approach','Research Approach']],
 research:[['projects','Projects'],['publications','Publications']],
 people:[['professor','Professor — Profile'],['professor/career','Career & Activities'],['professor/books','Books & Writings'],['researchers','Researchers'],['alumni','Alumni Directory'],['alumni/theses','Thesis Archive']],
 study:[['learning','Learning & Training'],['resources','Research Resources']],
 life:[['news','News'],['events','Events'],['activities','Activities']],
 contact:[['location','Location'],['join','Join Us']]
};
const themes=[['climate','Climate'],['ecosystem','Ecosystem'],['coastal','Coastal'],['regional','Regional']];
const registry={
 projects:[], publications:[], researchers:[], alumni:[], theses:[],
 careers:[], books:[], columns:[], essays:[], resources:[], news:[],
 events:[], activities:[], positions:[]
};
window.ELSDRArchitectureData=registry;
const exampleResearch=[
 {id:'project-demo',kind:'project',year:'2025',theme:'climate',title:'프로젝트 제목이 들어가는 자리',period:'20XX.XX–20XX.XX',funder:'지원기관 입력 예정',role:'참여 역할 입력 예정',summary:'연구 개요를 등록하면 이곳에 표시됩니다.',sample:true},
 {id:'publication-demo',kind:'publication',year:'2024',theme:'ecosystem',title:'Publication title will appear here',authors:'Author names',journal:'Journal / Conference name',abstract:'논문 초록을 등록하면 이곳에 표시됩니다.',sample:true}
];
function shell(page,inner){
 const [k,title,description]=headings[page];
 return '<div class="arch-shell"><header class="arch-hero"><div class="arch-container"><small>ELSDR / '+E(k)+'</small><h1>'+E(title)+'<em>.</em></h1><p>'+E(description)+'</p></div></header><div class="arch-container">'+inner+'</div></div>';
}
function subnav(page,items){return '<nav class="arch-subnav" aria-label="'+E(page)+' sections">'+items.map(([slug,label],i)=>'<a href="#/'+page+'/'+slug+'" data-arch-path="'+page+'/'+slug+'"><small>'+String(i+1).padStart(2,'0')+'</small>'+E(label)+'</a>').join('')+'</nav>';}
function intro(k,h,desc=''){return '<div class="arch-intro"><div><span class="arch-kicker">'+E(k)+'</span><h2>'+E(h)+'</h2></div><p>'+E(desc)+'</p></div>';}
function empty(title='콘텐츠 등록 예정',message='페이지 구조를 먼저 만들었습니다. 확인된 자료를 입력하면 이 영역에 표시됩니다.'){return '<div class="arch-empty"><strong>'+E(title)+'</strong><p>'+E(message)+'</p></div>';}
function fields(obj){return '<dl class="arch-fields">'+obj.map(([label,val])=>'<div><dt>'+E(label)+'</dt><dd>'+E(val||'자료 입력 예정')+'</dd></div>').join('')+'</dl>';}
function placeholder(k='PHOTO / CONTENT PENDING'){return '<div class="arch-photo">'+E(k)+'</div>';}
function initialNav(){
 Object.entries(navItems).forEach(([page,items])=>{
  const links=items.map(([slug,label])=>'<a href="#/'+page+'/'+slug+'" data-subnav="'+page+'/'+slug+'">'+E(label)+'</a>').join('');
  const menu=$('#submenu-'+page);
  if(menu)menu.innerHTML=links;
  const mega=$('[data-mega="'+page+'"]');
  if(mega)mega.innerHTML=items.map(([slug,label])=>'<a href="#/'+page+'/'+slug+'">'+E(label)+'</a>').join('');
 });
}
function researchHTML(){
 return shell('research',subnav('research',[['','All Research'],...navItems.research])+
 '<section class="arch-section">'+intro('RESEARCH / FILTERABLE ARCHIVE','Research Archive','자료 유형·연구영역·연도·검색어를 각각 선택할 수 있습니다.')+
 '<div class="arch-filters" id="arch-research-types">'+[['all','All Research'],['project','Projects'],['publication','Publications']].map(([val,label])=>'<button class="arch-chip" data-r-kind="'+val+'" aria-pressed="false">'+label+'</button>').join('')+'</div>'+
 '<div class="arch-searchbar"><select id="arch-r-theme" class="arch-select" aria-label="연구영역 선택"><option value="all">All Themes</option>'+themes.map(([v,t])=>'<option value="'+v+'">'+t+'</option>').join('')+'</select><select id="arch-r-year" class="arch-select" aria-label="연도 선택"><option value="all">All Years</option></select><input id="arch-r-search" class="arch-input" type="search" placeholder="제목 · 연구자 · 키워드 검색" aria-label="연구 자료 검색"></div>'+
 '<p class="arch-preview-ribbon">구조 확인용 샘플 2건이 표시됩니다. 실제 프로젝트·논문 데이터는 추후 입력합니다.</p><div class="arch-count"><span id="arch-r-count"></span><span>NEWEST FIRST / ACCORDION VIEW</span></div><div class="arch-list" id="arch-r-list"></div><button class="arch-load" id="arch-r-more" hidden>Load more +</button></section>');
}
let rState={kind:'all',theme:'all',year:'all',query:'',limit:8};
function renderResearch(){
 const live=[...registry.projects.map(d=>({...d,kind:'project'})),...registry.publications.map(d=>({...d,kind:'publication'}))];
 const records=live.length?live:exampleResearch;
 const years=[...new Set(records.map(d=>String(d.year)))].sort((a,b)=>Number(b)-Number(a));
 const yearEl=$('#arch-r-year');
 if(yearEl){const current=yearEl.value;yearEl.innerHTML='<option value="all">All Years</option>'+years.map(y=>'<option value="'+E(y)+'">'+E(y)+'</option>').join('');yearEl.value=years.includes(current)?current:'all';rState.year=yearEl.value;}
 let rows=records.filter(d=>(rState.kind==='all'||rState.kind===d.kind)&&(rState.theme==='all'||rState.theme===d.theme)&&(rState.year==='all'||rState.year===String(d.year))&&[d.title,d.summary,d.authors,d.journal,d.funder,d.keywords].join(' ').toLowerCase().includes(rState.query));
 rows.sort((a,b)=>Number(b.year)-Number(a.year));
 const html=rows.slice(0,rState.limit).map(d=>{
  const detail=d.kind==='project'?
   fields([['Research Period',d.period],['Funding Organization',d.funder],['Participation / Role',d.role],['Research Theme',themes.find(x=>x[0]===d.theme)?.[1]]]):
   fields([['Authors',d.authors],['Journal / Citation',d.journal],['Publication Type',d.publicationType],['DOI',d.doi]]);
  const more=(d.doi&&d.kind==='publication'?'<p><a class="arch-anchor" href="https://doi.org/'+encodeURI(String(d.doi).replace(/^https?:\/\/doi\.org\//i,''))+'" target="_blank" rel="noopener noreferrer">Open DOI ↗</a></p>':'')+(d.link?'<p><a class="arch-anchor" href="'+E(d.link)+'" target="_blank" rel="noopener noreferrer">Read original ↗</a></p>':'');
  return '<details class="arch-record"><summary><span class="arch-record-year">'+E(d.year)+'</span><span class="arch-record-kind">'+(d.kind==='project'?'PROJECT':'PUBLICATION')+'</span><span class="arch-record-title">'+E(d.title)+(d.sample?'<small>DESIGN SAMPLE — 실제 연구성과가 아닙니다</small>':'<small>'+E(d.funder||d.journal||'')+'</small>')+'</span><span class="arch-record-open">＋</span></summary><div class="arch-detail"><p>'+E(d.summary||d.abstract||'연구 개요·초록 입력 예정')+'</p>'+detail+more+'</div></details>';
 }).join('');
 $('#arch-r-list').innerHTML=html||empty('일치하는 연구 자료가 없습니다','선택한 유형·연구영역·연도 또는 검색어를 변경해 보세요.');
 $('#arch-r-count').textContent=rows.length+' records'+(live.length?'':' · sample only');
 $('#arch-r-more').hidden=rows.length<=rState.limit;
 $$('[data-r-kind]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.rKind===rState.kind)));
}
function setupResearch(){
 const page=root('research');page.innerHTML=researchHTML();
 $('#arch-r-search').addEventListener('input',e=>{rState.query=e.target.value.toLowerCase().trim();rState.limit=8;renderResearch();});
 $('#arch-r-theme').addEventListener('change',e=>{rState.theme=e.target.value;rState.limit=8;renderResearch();});
 $('#arch-r-year').addEventListener('change',e=>{rState.year=e.target.value;rState.limit=8;renderResearch();});
 $$('[data-r-kind]').forEach(b=>b.addEventListener('click',()=>{location.hash=b.dataset.rKind==='all'?'#/research':'#/research/'+(b.dataset.rKind==='project'?'projects':'publications');}));
 $('#arch-r-more').addEventListener('click',()=>{rState.limit+=8;renderResearch();});
}
function peopleHTML(){
 const link=(path,title)=>'<a href="#/people/'+path+'">'+E(title)+' ↗</a>';
 const prof='<section data-arch-people="professor">'+intro('PROFESSOR / PROFILE','Principal Investigator','연구 책임자의 기본 프로필. 논문과 연구과제는 Research Archive에서 관리합니다.')+
 '<div class="arch-profile">'+placeholder('PROFESSOR PHOTO')+'<div><span class="arch-kicker">PRINCIPAL INVESTIGATOR</span><h2>전진형</h2><p>Junhyung Chon · Korea University<br>Division of Environmental Science and Ecological Engineering</p><p>연구자로서의 전문성과 연구 방향을 소개하는 짧은 문단이 배치됩니다.</p>'+fields([['Position','Professor / Principal Investigator'],['Email','확인 후 입력'],['Phone','확인 후 입력']])+'<div class="arch-links">'+link('professor/career','Career & Activities')+link('professor/books','Books & Writings')+'<a href="#/research">Research Archive ↗</a></div></div></div></section>';
 const career='<section data-arch-people="professor/career" hidden>'+intro('PROFESSOR / CAREER','Career & Activities','주요 경력과 대외 활동을 유형별로 관리합니다.')+
 [['career','Major Career & Appointments'],['societies','Academic Societies & Professional Associations'],['advisory','Public Committees & Policy Advisory'],['awards','Honors & Academic Achievements']].map(([k,t])=>'<section class="arch-group"><h3>'+t+'</h3>'+empty('경력 및 활동 입력 예정','항목별로 연도·기관·직책·설명을 추가할 수 있도록 구성했습니다.')+'</section>').join('')+'</section>';
 const books='<section data-arch-people="professor/books" hidden>'+intro('PROFESSOR / PUBLIC WRITINGS','Books & Writings','저서·신문 칼럼·잡지 및 기타 기고글을 분리하여 관리합니다.')+
 '<section class="arch-group"><h3>Books</h3><div class="arch-covers"><div class="arch-cover-card"><div class="arch-cover-img">BOOK COVER</div><h3>도서 등록 예정</h3><p class="arch-muted">제목 · 출판사 · 발행연도 · 소개 · 판매처</p></div></div></section>'+
 '<section class="arch-group"><h3>Newspaper Columns</h3>'+empty('신문 칼럼 등록 예정','제목 · 매체명 · 발행일 · 원문 링크')+'</section>'+
 '<section class="arch-group"><h3>Essays & Other Writings</h3>'+empty('기고글 등록 예정','제목 · 매체명 · 발행일 · 원문 링크')+'</section></section>';
 const researchers='<section data-arch-people="researchers" hidden>'+intro('PEOPLE / RESEARCH TEAM','Researchers','Ph.D. / M.S. / Research Interns — 구성원은 신분 및 졸업에 따라 한 번만 등록하고 이동합니다.')+
 '<div class="arch-people-categories">'+[['phd','Ph.D. Researchers'],['ms','M.S. Researchers'],['intern','Research Interns']].map(([key,label])=>'<section class="arch-people-row"><div><h3>'+label+'</h3><p>구성원 분류 · '+key.toUpperCase()+'</p></div><div>'+empty('프로필 등록 예정','사진 · 국문/영문 이름 · 학위/신분 · 연구관심 · 이메일을 동일한 형태로 표시합니다.')+'</div></section>').join('')+'</div></section>';
 const alumni='<section data-arch-people="alumni" hidden>'+intro('PEOPLE / ALUMNI','Alumni Directory','이름·학위·졸업연도·현재 소속·활동 분야 중심의 디렉터리입니다.')+
 '<div class="arch-searchbar"><input id="arch-alumni-query" class="arch-input" type="search" placeholder="이름 · 소속 · 분야 검색" aria-label="졸업생 검색"></div><div class="arch-count"><span id="arch-alumni-count">0 alumni</span><a class="arch-anchor" href="#/people/alumni/theses">Thesis Archive ↗</a></div><div id="arch-alumni-list">'+empty('졸업생 명단 입력 예정','기존 기록은 검수 후 이전하며 Researcher에서 Alumni로 이동 관리합니다.')+'</div></section>';
 const thesis='<section data-arch-people="alumni/theses" hidden>'+intro('ALUMNI / DEGREE THESES','Thesis Archive','학위논문은 Alumni Directory와 연결하면서 별도의 목록으로 관리합니다.')+
 '<div class="arch-searchbar"><input id="arch-thesis-query" class="arch-input" type="search" placeholder="논문 제목 · 저자 검색" aria-label="학위논문 검색"><select class="arch-select" id="arch-thesis-degree" aria-label="학위 구분"><option value="all">All Degrees</option><option value="phd">Ph.D.</option><option value="ms">M.S.</option></select></div>'+
 '<div class="arch-count"><span id="arch-thesis-count">0 theses</span><span>NEWEST FIRST</span></div><div id="arch-thesis-list">'+empty('학위논문 이전 예정','이전 시안의 17편을 확정 수치로 표시하지 않습니다. 논문 제목·저자·학위·연도·원문 링크를 입력할 수 있습니다.')+'</div></section>';
 return shell('people',subnav('people',[['professor','Professor'],['researchers','Researchers'],['alumni','Alumni']])+prof+career+books+researchers+alumni+thesis);
}
function setupPeople(){
 root('people').innerHTML=peopleHTML();
 $('#arch-alumni-query').addEventListener('input',updateAlumni);
 $('#arch-thesis-query').addEventListener('input',updateTheses);
 $('#arch-thesis-degree').addEventListener('change',updateTheses);
}
function updateAlumni(){
 const q=$('#arch-alumni-query').value.toLowerCase().trim();
 const data=registry.alumni.filter(d=>[d.name,d.nameEn,d.affiliation,d.field,d.year].join(' ').toLowerCase().includes(q)).sort((a,b)=>Number(b.year)-Number(a.year));
 $('#arch-alumni-count').textContent=data.length+' alumni';
 $('#arch-alumni-list').innerHTML=data.length?'<div class="arch-list">'+data.map(d=>'<div class="arch-resource-row"><span>'+E(d.year)+'</span><div><strong>'+E(d.name)+' · '+E(d.nameEn)+'</strong><p>'+E(d.degree)+' · '+E(d.affiliation)+' · '+E(d.field)+'</p></div><span class="arch-pill">ALUMNI</span></div>').join('')+'</div>':empty('졸업생 명단 입력 예정','자료 등록 후 이름·소속·분야 검색을 사용할 수 있습니다.');
}
function updateTheses(){
 const q=$('#arch-thesis-query').value.toLowerCase().trim(),type=$('#arch-thesis-degree').value;
 const data=registry.theses.filter(d=>(type==='all'||d.degree===type)&&[d.title,d.author,d.year].join(' ').toLowerCase().includes(q)).sort((a,b)=>Number(b.year)-Number(a.year));
 $('#arch-thesis-count').textContent=data.length+' theses';
 $('#arch-thesis-list').innerHTML=data.length?'<div class="arch-list">'+data.map(d=>'<div class="arch-resource-row"><span>'+E(d.year)+'</span><div><strong>'+E(d.title)+'</strong><p>'+E(d.author)+' · '+E(d.degree)+'</p></div>'+(d.url?'<a href="'+E(d.url)+'" class="arch-anchor" target="_blank" rel="noopener noreferrer">원문 ↗</a>':'<span>입력 예정</span>')+'</div>').join('')+'</div>':empty('학위논문 이전 예정','자료가 준비되면 제목·저자·학위·연도·원문 링크가 표시됩니다.');
}
function studyHTML(){
 const learning=[
 ['01','Systems Thinking & Modeling','시스템 사고·인과순환지도·시스템다이내믹스·시나리오 분석을 통해 변화의 구조를 탐색합니다.'],
 ['02','Spatial Analysis & Simulation','GIS·원격탐사·공간분석·경관 시뮬레이션을 통해 공간적 증거를 다룹니다.'],
 ['03','Ecological & Environmental Assessment','생태계서비스·생물다양성·기후위험·회복탄력성을 평가하는 연구 역량을 기릅니다.'],
 ['04','Research Practice & Communication','연구 설계·현장조사·논문 작성·학술발표·연구실 세미나를 경험합니다.']
 ];
 return shell('study',subnav('study',navItems.study)+
 '<section id="arch-study-learning" class="arch-section">'+intro('STUDY / LEARNING','Learning & Training','연구실에서 기르는 네 가지 핵심 연구 역량입니다. 교육 프로그램의 상세 내용은 추후 입력합니다.')+
 '<div class="arch-info-grid">'+learning.map(([n,title,desc])=>'<article class="arch-info-card"><span class="arch-kicker">'+n+' / RESEARCH COMPETENCY</span><div><h3>'+E(title)+'</h3><p>'+E(desc)+'</p></div></article>').join('')+'</div></section>'+
 '<section id="arch-study-resources" class="arch-section">'+intro('STUDY / RESOURCES','Research Resources','연구노트·교육자료·세미나 자료를 한 목록에서 탐색합니다. 공개 가능한 자료만 게시합니다.')+
 '<div class="arch-filters" id="arch-resource-filters">'+[['all','All Resources'],['note','Research Notes'],['education','Learning Materials'],['seminar','Seminar Materials']].map(([k,l])=>'<button class="arch-chip" data-resource-type="'+k+'" aria-pressed="false">'+l+'</button>').join('')+'</div>'+
 '<div class="arch-searchbar"><input id="arch-resource-search" type="search" class="arch-input" placeholder="자료 제목 · 주제 검색" aria-label="연구자료 검색"></div><div id="arch-resource-list">'+empty('공개 자료 등록 예정','기존 리질리언스 연구노트 4건을 검수한 후 이관하고, 이후 새 자료를 추가할 수 있도록 준비했습니다.')+'</div><p class="arch-muted">※ 학과별 전체 교과목 표는 삭제했습니다. 공식 교육과정은 <a class="arch-anchor" href="https://lifesci.korea.ac.kr/" target="_blank" rel="noopener noreferrer">고려대학교 홈페이지</a>에서 확인합니다.</p></section>');
}
let resourceType='all';
function renderResources(){
 const q=$('#arch-resource-search').value.toLowerCase().trim();
 const entries=registry.resources.filter(d=>(resourceType==='all'||d.type===resourceType)&&[d.title,d.topic,d.summary].join(' ').toLowerCase().includes(q)).sort((a,b)=>Number(b.year)-Number(a.year));
 $('#arch-resource-list').innerHTML=entries.length?'<div class="arch-list">'+entries.map(d=>'<div class="arch-resource-row"><span>'+E(d.year)+'</span><div><strong>'+E(d.title)+'</strong><p>'+E(d.topic)+' · '+E(d.summary)+'</p></div><span>'+(d.url?'<a class="arch-anchor" href="'+E(d.url)+'" target="_blank" rel="noopener noreferrer">열람 / 다운로드 ↗</a>':'링크 준비 중')+'</span></div>').join('')+'</div>':empty('공개 자료 등록 예정','연구노트·교육자료·세미나 자료를 유형별로 등록하면 여기에 나타납니다.');
 $$('[data-resource-type]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.resourceType===resourceType)));
}
function setupStudy(){
 root('study').innerHTML=studyHTML();
 $('#arch-resource-search').addEventListener('input',renderResources);
 $$('[data-resource-type]').forEach(b=>b.addEventListener('click',()=>{resourceType=b.dataset.resourceType;renderResources();}));
 renderResources();
}
function collectExistingEvents(){
 const list=$$('[data-life-view="events"] .lf-seminar');
 return list.map((a,i)=>{
  const slug=(a.getAttribute('href')||'').split('/').pop()||'event-'+i;
  const txt=a.querySelectorAll('span');
  const date=a.querySelector('small')?.textContent?.trim()||'';
  return {id:slug,year:txt[1]?.textContent?.trim()||'',title:a.querySelector('h3')?.textContent?.trim()||'행사명',category:a.dataset.seminarCategory||'other',date,host:a.querySelector('.lf-seminar-person')?.textContent?.trim()||'',place:'장소 입력 예정',summary:'행사 개요·관련 자료·사진은 추후 정리합니다.',existingDraft:true};
 });
}
let eState={type:'all',query:'',limit:12};
function newsHTML(){
 return '<section data-arch-life="news">'+intro('LIFE / LAB UPDATES','News','연구실 공식 소식·연구성과·수상·관련 보도 중심. 교수 개인 칼럼은 Books & Writings, 모집 공고는 Join Us에서 관리합니다.')+
 '<div class="arch-news-grid" id="arch-news-list">'+[1,2,3].map(i=>'<article class="arch-news-card"><div class="arch-news-image">NEWS IMAGE / '+i.toString().padStart(2,'0')+'</div><div class="arch-news-body"><span class="arch-kicker">DATE / CATEGORY</span><h3>공식 소식 등록 예정</h3><p>확인된 기사 또는 활동 소식을 입력할 수 있습니다.</p></div></article>').join('')+'</div><p class="arch-preview-ribbon">실제 이미지·기사 내용·게시일은 자료 확인 후 등록합니다.</p></section>';
}
function eventsHTML(){
 return '<section data-arch-life="events" hidden>'+intro('LIFE / ACADEMIC EVENTS','Events','세미나·초청강연·학술대회·워크숍·포럼의 공식 안내와 기록을 관리합니다.')+
 '<div class="arch-filters" id="arch-event-filters">'+[['all','All Events'],['seminar','Seminars'],['lecture','Guest Lectures'],['conference','Conferences'],['workshop','Workshops'],['forum','Forums']].map(([key,label])=>'<button class="arch-chip" data-event-kind="'+key+'" aria-pressed="false">'+label+'</button>').join('')+'</div>'+
 '<div class="arch-searchbar"><input class="arch-input" id="arch-event-search" placeholder="행사명 · 연도 · 발표자 · 주최기관 검색" type="search" aria-label="행사 검색"></div>'+
 '<div class="arch-count"><span id="arch-event-count"></span><span>YEAR / CATEGORY / EVENT</span></div><div id="arch-events-list"></div><button id="arch-events-more" class="arch-load" hidden>Load more +</button><p class="arch-preview-ribbon">기존 가안에 있던 행사 목록을 임시로 연결했습니다. 날짜·발표자·자료를 검수한 뒤 확정해 주세요.</p></section>';
}
function renderEvents(){
 const items=registry.events.filter(d=>(eState.type==='all'||d.category===eState.type)&&[d.title,d.year,d.date,d.host].join(' ').toLowerCase().includes(eState.query)).sort((a,b)=>Number(b.year)-Number(a.year));
 $('#arch-event-count').textContent=items.length+' event records';
 $('#arch-events-list').innerHTML=items.length?'<div class="arch-list">'+items.slice(0,eState.limit).map(d=>'<div class="arch-event-row"><span class="arch-record-year">'+E(d.year)+'</span><span class="arch-record-kind">'+E(d.category)+'</span><div><a href="#/life/events/'+E(d.id)+'">'+E(d.title)+' ↗</a><small>'+E(d.date)+' · '+E(d.host)+'</small></div><span>↗</span></div>').join('')+'</div>':empty('행사 기록이 없습니다','기존 행사 기록을 확인하거나 다른 검색어를 선택해 주세요.');
 $('#arch-events-more').hidden=items.length<=eState.limit;
 $$('[data-event-kind]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.eventKind===eState.type)));
}
function resolvedActivity(a){
 const evt=a.eventId?registry.events.find(e=>e.id===a.eventId):null;
 return evt?{...a,title:evt.title,date:evt.date,placeLabel:evt.place,linkedEvent:evt}:a;
}
function activityLocations(){
 const places=new Map();
 registry.activities.map(resolvedActivity).forEach(a=>a.places?.forEach(p=>{
  if(!places.has(p.id))places.set(p.id,{...p,activities:[]});
  places.get(p.id).activities.push(a);
 }));
 return [...places.values()];
}
function activitiesHTML(){
 return '<section data-arch-life="activities" hidden>'+
 intro('LIFE / PLACES & EXPERIENCES','Activities','기존 Fieldwork와 Gallery를 통합합니다. 지도와 활동 카드는 동일한 활동 데이터에서 생성됩니다.')+
 '<section class="arch-group"><span class="arch-kicker">WHERE WE’VE BEEN</span><h3>Where We’ve Been</h3><div class="arch-activity-layout"><div><div class="arch-map" id="arch-map" role="region" aria-label="연구실 국내외 활동 지도"></div><p class="arch-muted">지도 확대·축소 가능 · 위치별 관련 활동 연결 · 정확한 방문 지점은 추후 검수</p></div><div class="arch-map-side"><span class="arch-kicker">LOCATIONS & ASSOCIATED ACTIVITIES</span><div id="arch-location-list"></div></div></div></section>'+
 '<section class="arch-group"><span class="arch-kicker">ACTIVITY RECORDS</span><h3>Activity Archive</h3><div class="arch-filters">'+[['all','All Activities'],['fieldwork','Fieldwork'],['workshop','Workshops'],['exchange','Academic Exchange'],['lab','Lab Life']].map(([key,label])=>'<button data-activity-filter="'+key+'" aria-pressed="false" class="arch-chip">'+label+'</button>').join('')+'</div><div id="arch-activities-list"></div></section>'+
 '<p class="arch-preview-ribbon">임시로 연결한 활동 2건은 기존 가안에서 가져온 구성 확인용 자료입니다. 실제 현장 사진·위치·상세기록은 추후 등록합니다. 위치 정보가 없어도 활동 카드가 표시되도록 구성했습니다.</p></section>';
}
let aFilter='all',mapInstance=null,mapMarkers={},mapReady=false;
function activityCards(){
 const data=registry.activities.map(resolvedActivity).filter(d=>aFilter==='all'||d.category===aFilter).sort((a,b)=>(b.date||'').localeCompare(a.date||''));
 $('#arch-activities-list').innerHTML=data.length?data.map(d=>
 '<a class="arch-activity-card" id="arch-activity-'+E(d.id)+'" href="#/life/activities/'+E(d.id)+'"><div class="arch-activity-photo">PHOTO PENDING</div><div><span class="arch-kicker">'+E(d.date||'DATE TBC')+' / '+E(d.category)+'</span><h3>'+E(d.title)+'</h3><p>'+E(d.placeLabel||'Location unspecified')+' · '+E(d.summary||'활동 소개 입력 예정')+'</p></div><span>↗</span></a>'
 ).join(''):empty('활동 기록 입력 예정','장소가 없는 활동도 지도와 별개로 등록할 수 있습니다.');
 $$('[data-activity-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.activityFilter===aFilter)));
}
function activitiesLocList(){
 const locations=activityLocations();
 $('#arch-location-list').innerHTML=locations.length?locations.map(p=>'<button type="button" data-show-place="'+E(p.id)+'"><strong>'+E(p.name)+'</strong><small style="display:block;color:#82968a;margin-top:5px">'+p.activities.length+' linked activities</small></button>').join(''):empty('지도 지점 등록 예정','활동에 좌표를 입력하면 해당 장소가 지도에 표시됩니다.');
 $$('[data-show-place]').forEach(b=>b.addEventListener('click',()=>{const marker=mapMarkers[b.dataset.showPlace];if(marker&&mapInstance){mapInstance.flyTo(marker.getLatLng(),8);marker.openPopup();}}));
}
function initializeActivityMap(){
 if(mapReady||!$('#arch-map')||$('#arch-map').offsetWidth===0)return;
 if(typeof window.L==='undefined'){
  $('#arch-map').innerHTML='<div style="padding:30px;color:#63786b">지도 서비스를 불러오지 못했습니다. 네트워크 연결을 확인해 주세요.</div>';
  return;
 }
 mapReady=true;
 mapInstance=L.map('arch-map',{scrollWheelZoom:false,worldCopyJump:true}).setView([32,20],2);
 L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{minZoom:2,maxZoom:17,attribution:'&copy; OpenStreetMap contributors'}).addTo(mapInstance);
 activityLocations().forEach(p=>{
  const marker=L.marker([p.lat,p.lon]).addTo(mapInstance);
  const content=document.createElement('div');const title=document.createElement('strong');title.textContent=p.name;content.append(title);
  p.activities.forEach(a=>{const item=document.createElement('p');const link=document.createElement('a');link.textContent=a.title+' ↗';link.href='#/life/activities/'+a.id;item.append(link);content.append(item);});
  marker.bindPopup(content);mapMarkers[p.id]=marker;
 });
 mapInstance.invalidateSize();
}
function renderNews(){
 const entries=[...registry.news].sort((a,b)=>(b.date||'').localeCompare(a.date||''));
 if(!entries.length)return;
 $('#arch-news-list').innerHTML=entries.map(d=>'<article class="arch-news-card"><div class="arch-news-image">IMAGE PENDING</div><div class="arch-news-body"><span class="arch-kicker">'+E(d.date)+' · '+E(d.category)+'</span><h3>'+E(d.title)+'</h3><p>'+E(d.summary)+'</p>'+(d.url?'<a class="arch-anchor" href="'+E(d.url)+'" target="_blank" rel="noopener noreferrer">Read story ↗</a>':'')+'</div></article>').join('');
}
function setupLife(){
 // Retain the previous events archive as temporary records before replacing its markup.
 registry.events=collectExistingEvents();
 // The initial examples exist only to prove map/card reuse, not to claim final accuracy.
 registry.activities=[
  {id:'draft-seoul-forest',date:'2024',title:'서울숲 필드트립',category:'fieldwork',placeLabel:'서울숲 · 서울',summary:'기존 시안 항목 · 상세기록 검수 예정',sample:true,places:[{id:'seoulforest',name:'서울숲',lat:37.5446,lon:127.0374}]},
  {id:'draft-portland-seattle',date:'2025',title:'Portland & Seattle 2025',category:'fieldwork',placeLabel:'Portland · Seattle',summary:'기존 시안 항목 · 상세기록 검수 예정',sample:true,places:[{id:'portland',name:'Portland',lat:45.5152,lon:-122.6784},{id:'seattle',name:'Seattle',lat:47.6062,lon:-122.3321}]}
 ];
 root('life').innerHTML=shell('life',subnav('life',navItems.life)+newsHTML()+eventsHTML()+activitiesHTML()+
 '<section data-arch-life="detail" hidden><div id="arch-life-detail"></div></section>');
 $('#arch-event-search').addEventListener('input',e=>{eState.query=e.target.value.toLowerCase().trim();eState.limit=12;renderEvents();});
 $$('[data-event-kind]').forEach(b=>b.addEventListener('click',()=>{eState.type=b.dataset.eventKind;eState.limit=12;renderEvents();}));
 $('#arch-events-more').addEventListener('click',()=>{eState.limit+=12;renderEvents();});
 $$('[data-activity-filter]').forEach(b=>b.addEventListener('click',()=>{aFilter=b.dataset.activityFilter;activityCards();}));
 renderEvents();renderNews();activityCards();activitiesLocList();
}
function renderLifeDetail(view,id){
 let record=view==='events'?registry.events.find(x=>x.id===id):registry.activities.map(resolvedActivity).find(x=>x.id===id);
 const back='#/life/'+view,head=view==='events'?'EVENT DETAILS':'ACTIVITY DETAILS';
 $('#arch-life-detail').innerHTML=record?'<div class="arch-event-detail"><a class="arch-anchor" href="'+back+'">← Back to '+E(view)+'</a>'+
 intro('ELSDR / '+head,'Details','게시물별 상세 화면 골조입니다. 사진·자료·본문은 추후 입력됩니다.')+
 '<span class="arch-kicker">'+E(record.date||record.year)+' · '+E(record.category)+'</span><h2>'+E(record.title)+'</h2>'+
 fields([['Date / Period',record.date],['Location',record.place||record.placeLabel],['Speaker / Organizer',record.host],['Related Research / Materials','입력 예정']])+
 '<section class="arch-group"><h3>Overview</h3><p class="arch-muted">'+E(record.summary)+'</p>'+(record.linkedEvent?'<p><a class="arch-anchor" href="#/life/events/'+E(record.linkedEvent.id)+'">Connected Event ↗</a></p>':'')+(view==='events'&&registry.activities.some(a=>a.eventId===record.id)?'<p><a class="arch-anchor" href="#/life/activities/'+E(registry.activities.find(a=>a.eventId===record.id).id)+'">Connected Activity ↗</a></p>':'')+'</section><section class="arch-group"><h3>Photos & Related Materials</h3>'+empty('사진 및 자료 등록 예정','게시물의 관련 이미지와 다운로드 자료가 표시됩니다.')+'</section></div>':
 '<div class="arch-event-detail"><a class="arch-anchor" href="'+back+'">← Back</a>'+empty('기록을 찾을 수 없습니다','목록으로 돌아가 자료를 확인해 주세요.')+'</div>';
}
function contactHTML(){
 return shell('contact',subnav('contact',navItems.contact)+
 '<section id="arch-contact-location" class="arch-section">'+intro('CONTACT / VISIT US','Location','연구실 위치와 공식 연락처를 한곳에 모았습니다. 게시 전 주소·호실·연락처를 확인합니다.')+
 '<div class="arch-location-panel"><div class="arch-location-map"><span>LOCATION MAP / 지도 위치 확인 후 연결</span></div><div><span class="arch-kicker">KOREA UNIVERSITY / ELSDR</span><h3 style="font-size:28px;font-weight:500">Lab & Contact</h3>'+fields([['Address','서울특별시 성북구 안암로 145 · 고려대학교'],['Building / Room','건물 및 호실 최종 확인 예정'],['Lab Email','최종 확인 후 입력'],['Lab Phone','최종 확인 후 입력'],['Professor Contact','최종 확인 후 입력']])+'</div></div></section>'+
 '<section id="arch-contact-join" class="arch-section">'+intro('CONTACT / JOIN US','Join Us','대학원 진학 및 연구 인턴 지원 안내. 모집 공고도 여기에서 관리합니다.')+
 [['01','Research Opportunities','참여 가능한 연구 주제와 활동을 간단히 소개하고, <a class="arch-anchor" href="#/about/themes">About</a>과 <a class="arch-anchor" href="#/research">Research</a>로 연결합니다.'],
 ['02','Who We’re Looking For','지원 대상·학위과정·기대 역량을 안내하는 영역입니다.'],
 ['03','How to Apply','지원 방법·제출 자료·문의처·절차를 안내하는 영역입니다. 연구 역량 학습 내용은 <a class="arch-anchor" href="#/study">Study</a>로 연결합니다.'],
 ['04','Open Positions','현재 모집 현황과 지원 기간, 진행 상태를 표시합니다. 확정된 모집 공고가 등록되면 노출됩니다.']
 ].map(([n,t,desc])=>'<div class="arch-join-list"><div><span class="arch-kicker">'+n+' / JOIN ELSDR</span><h3>'+E(t)+'</h3></div><p>'+desc+'</p></div>').join('')+
 '<div id="arch-open-positions">'+empty('등록된 모집 공고가 없습니다','모집 상태·일정은 실제 공고가 확인되면 입력합니다.')+'</div></section>');
}
function setupContact(){root('contact').innerHTML=contactHTML();}
function refreshCurrentRoute(){
 const path=location.hash.replace(/^#\/?/,'').split('?')[0]||'home';
 const [page,section='',detail='']=path.split('/');
 const sections={people:['professor','professor/career','professor/books','researchers','alumni','alumni/theses'],life:['news','events','activities']};
 if(page==='research'){
  const requested=section==='projects'?'project':section==='publications'?'publication':'all';
  if(rState.kind!==requested){rState.kind=requested;rState.limit=8;}
  renderResearch();
 }
 if(page==='people'){
  let key=section||'professor';
  if(section==='professor'&&detail==='career')key='professor/career';
  else if(section==='professor'&&detail==='books')key='professor/books';
  else if(section==='alumni'&&detail==='theses')key='alumni/theses';
  if(!sections.people.includes(key))key='professor';
  $$('[data-arch-people]').forEach(el=>el.hidden=el.dataset.archPeople!==key);
 }
 if(page==='life'){
  const view=sections.life.includes(section)?section:'news';
  const isDetail=!!detail&&['events','activities'].includes(view);
  $$('[data-arch-life]').forEach(el=>el.hidden=isDetail?el.dataset.archLife!=='detail':el.dataset.archLife!==view);
  if(isDetail)renderLifeDetail(view,detail);
  if(view==='activities'&&!isDetail)requestAnimationFrame(()=>{initializeActivityMap();if(mapInstance)mapInstance.invalidateSize();});
 }
 if(page==='study'&&['learning','resources'].includes(section)){
  requestAnimationFrame(()=>$('#arch-study-'+section)?.scrollIntoView({block:'start',behavior:'smooth'}));
 }
 if(page==='contact'&&['location','join'].includes(section)){
  requestAnimationFrame(()=>$('#arch-contact-'+section)?.scrollIntoView({block:'start',behavior:'smooth'}));
 }
 $$('[data-arch-path]').forEach(a=>{
  const key=a.dataset.archPath,active=path===key||(page===key.split('/')[0]&&key.endsWith('/'+(section||({research:'',people:'professor',study:'learning',life:'news',contact:'location'}[page]))));
  a.classList.toggle('is-active',!!active);
  if(active)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');
 });
 $$('[data-subnav]').forEach(a=>{
  const selected=path===a.dataset.subnav;
  a.classList.toggle('active',selected);
 });
 if(['research','people','study','life','contact'].includes(page))document.title=(detail||section||page)+' | ELSDR Concept Preview';
}
initialNav();
setupResearch();setupPeople();setupStudy();setupLife();setupContact();
window.addEventListener('hashchange',refreshCurrentRoute);
window.addEventListener('load',refreshCurrentRoute);
refreshCurrentRoute();
})();

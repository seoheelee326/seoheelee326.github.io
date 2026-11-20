const page=document.body.dataset.page;
const main=document.getElementById('page-content');
const pageNav=document.querySelector('.page-nav');
pageNav.prepend(pageNav.querySelector('[data-page="cv"]'));
const headings={artwork:['ARTWORK','Painting · Installation · Moving Image · Public Art Projects · Drawing'],exhibitions:['EXHIBITIONS','Solo and group exhibitions'],education:['ARTS EDUCATION','Observation and Shared Questions'],contact:['CONTACT','Art and collaboration inquiries'],cv:['CV','SEOHEE LEE · VISUAL ARTIST']};
document.querySelectorAll('.page-nav a').forEach(a=>{if(a.dataset.page===page)a.setAttribute('aria-current','page')});
const esc=v=>String(v??'').replace(/[&<>"']/g,s=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
function heading(){const [title,subtitle]=headings[page];return `<div class="page-heading"><h1>${title}</h1><p>${subtitle}</p></div>`}
async function json(path){try{const r=await fetch(path,{cache:'no-store'});if(!r.ok)throw Error(r.status);return await r.json()}catch{return []}}
const category=w=>{const c=String(w.category||'').toLowerCase();if(c.includes('draw'))return'drawing';if(c.includes('install'))return'installation';if(c.includes('video')||c.includes('media')||c.includes('moving'))return'video';return'painting'};
async function artwork(){const works=(await json('data/works.json')).filter(w=>w.published!==false);const categories=['all','painting','installation','video','drawing'];const labels=['ALL','PAINTING','INSTALLATION','MOVING IMAGE','DRAWING'];main.innerHTML=heading()+`<div class="filters">${categories.map((c,i)=>`<button data-filter="${c}" class="${i===0?'active':''}">${labels[i]}</button>`).join('')}</div><div class="art-grid" id="art-grid"></div><div class="detail-dialog" id="work-detail" hidden role="dialog" aria-modal="true"><button class="detail-close" aria-label="Close">×</button><div class="detail-layout"><div class="detail-image"></div><div class="detail-info"></div></div></div>`;
const grid=document.getElementById('art-grid');const render=filter=>{const selected=works.filter(w=>filter==='all'||category(w)===filter);grid.innerHTML=selected.length?selected.map(w=>{const i=works.indexOf(w);return `<button class="art-card" data-index="${i}"><div class="art-image">${w.image?`<img src="${esc(w.image)}" alt="${esc(w.title)}">`:'IMAGE TO BE ADDED'}</div><h2>${esc(w.title)}</h2><p>${esc(w.year)} · ${esc(w.category)}</p></button>`}).join(''):'<p class="empty">Works in this category will be added.</p>'};
main.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>{main.querySelectorAll('[data-filter]').forEach(x=>x.classList.toggle('active',x===b));render(b.dataset.filter)}));
grid.addEventListener('click',e=>{const b=e.target.closest('[data-index]');if(!b)return;const w=works[Number(b.dataset.index)],d=document.getElementById('work-detail');d.querySelector('.detail-image').innerHTML=w.image?`<img src="${esc(w.image)}" alt="${esc(w.title)}">`:'IMAGE TO BE ADDED';d.querySelector('.detail-info').innerHTML=`<h2>${esc(w.title)}</h2><p>${esc(w.year)} · ${esc(w.materials_en||w.materials_ko)}</p><p>${esc(w.height_cm&&w.width_cm?`${w.height_cm} × ${w.width_cm} cm`:'')}</p><p>${esc(w.description_en||w.description_ko)}</p>`;d.hidden=false});
const d=document.getElementById('work-detail');d.querySelector('.detail-close').addEventListener('click',()=>d.hidden=true);d.addEventListener('click',e=>{if(e.target===d)d.hidden=true});document.addEventListener('keydown',e=>{if(e.key==='Escape')d.hidden=true});render('all')}
async function exhibitions(){
  const {solo,group}=await loadExhibitionRecords();
  const section=(title,items)=>{
    const records=items.map((r,i)=>`${i===0||r[0]!==items[i-1][0]?`<h3 class="cv-year">${esc(r[0])}</h3>`:''}<article class="cv-entry"><strong>${esc(r[1])}</strong><span>${esc(r[2]||'—')}</span><span>${esc(r[3]||'—')}</span><span>${esc(r[4]||'—')}</span></article>`).join('');
    return `<section class="cv-block"><h2>${title}</h2><div class="cv-columns"><span>EXHIBITION</span><span>VENUE</span><span>SUPPORT / SPONSOR</span><span>LOCATION</span></div>${records}</section>`;
  };
  main.innerHTML=heading()+section('SOLO EXHIBITIONS',solo)+section('GROUP EXHIBITIONS',group);
}
function education(){main.innerHTML=heading()+`<h2 class="statement">Art as a way to observe, question and create together.</h2><p class="body-copy">Through observation, making and dialogue, arts education becomes an extension of artistic practice. Experiences with places, environments and materials are translated into shared questions and individual forms of expression.</p><p class="body-copy"><a href="https://sites.google.com/view/culturemakingart/" target="_blank" rel="noopener noreferrer">Culturemakingart Archive</a></p>`}
function contact(){main.innerHTML=heading()+`<div class="contact-list"><a href="mailto:seoheelee.artwork@gmail.com">seoheelee.artwork@gmail.com</a><a href="https://www.instagram.com/seohee_work/" target="_blank" rel="noopener noreferrer">Instagram · @seohee_work</a><a href="https://www.youtube.com/results?search_query=SEOHEE%27s+Palette" target="_blank" rel="noopener noreferrer" title="Channel URL pending confirmation">YouTube · SEOHEE's Palette</a></div>`}
function exhibitionRecords(){
  // The supplied CV image is the source for historical group exhibitions.
  // Unverified venues/supporters are deliberately left blank.
  const solo=[
    ['2026','Yesterday’s Tomorrow_어제의 내일','더나르떼','남양주문화재단','남양주, 한국']
  ];
  const group=[
    ['2026','Re-Assemble Mapping _ 흐릿해진 좌표들','인사아트센터','서울시','서울, 한국'],
    ['2026','조용한 지속','이화여자대학교 / 이대목동병원','','서울, 한국'],
    ['2026','S-OF-T NARRATIVE','파비욘드갤러리','','경기도, 한국'],
    ['2025','시간 사이 풍경 한 스푼','모란스페이스','경기문화재단','경기도, 한국'],
    ['2025','엔탱글먼트','갤러리 순','','서울, 한국'],
    ['2025','Re-Assemble Mapping','창성동실험실','','서울, 한국'],
    ['2024–2025','일상 너머로_FAR BEYOND EVERYDAY','파비욘드갤러리','경기문화재단','경기도, 한국'],
    ['2024','일상의 변곡점_아주 작은 것들로부터','갤러리와부','경기문화재단','경기도, 한국'],
    ['2023','여가_느슨한 상상','갤러리와부','경기문화재단','경기도, 한국'],
    ['2023','우리들의 공집합_뒤틀린 신호','신흥공공예술창작소','성남문화재단','성남, 한국'],
    ['2023','납작해진 프로필','옥빛고등학교','경기도교육청','양주, 한국'],
    ['2023','성남·광주·대구 지역 교류전 뜻밖의 만남 : 인카운터','성남아트센터 갤러리808','성남문화재단','성남, 한국'],
    ['2022','얼음~땡!','갤러리와부','경기문화재단','경기도, 한국'],
    ['2020–2022','아시아프 & 히든아티스트 페스티벌','홍익대학교 현대미술관','조선일보 · 홍익대학교 · 문화체육관광부','서울, 한국'],
    ['2018–2022','돈의문박물관마을','돈의문박물관마을','서울특별시','서울, 한국'],
    ['2021','두서있음','학고재아트센터','서울문화재단 · 잠실창작스튜디오','서울, 한국'],
    ['2021','투~게더 with you','돈의문박물관마을 i8','서울시 · 돈의문박물관마을','서울, 한국'],
    ['2020','릴레이디스플레이','돈의문박물관마을 i8','서울시 · 돈의문박물관마을','서울, 한국'],
    ['2020','조형아트서울 PLAS-CONTEMPORARY ART SHOW','코엑스','서울문화재단 · 잠실창작스튜디오','서울, 한국'],
    ['2019','무무MUMU','플랫폼엘','서울문화재단 · 잠실창작스튜디오','서울, 한국'],
    ['2018','INTERLOCK','돈의문박물관마을 G3','서울시 · 돈의문박물관마을','서울, 한국'],
    ['2018','돈의문이 열려있다','돈의문박물관마을','서울특별시 도시공간개선단 도시건축센터','서울, 한국'],
    ['2018','쓰레기 새로고침','서울새활용플라자','서울시 · 서울디자인재단','서울, 한국'],
    ['2017','미묘한 소통','갤러리와부','경기문화재단','서울, 한국'],
    ['2017','원더랜드 큐브','갤러리와부','경기문화재단 · 현대차정몽구재단','경기도, 한국']
  ];
  return {solo,group};
}
async function loadExhibitionRecords(){
  const records=(await json('data/exhibitions.json')).filter(r=>r.published!==false);
  const toRow=r=>[r.year,r.title_ko||r.title_en,r.venue_ko||r.venue_en||'',r.support_ko||r.support_en||'',r.location_ko||r.location_en||''];
  return {solo:records.filter(r=>String(r.type_en||r.type_ko).toLowerCase().includes('solo')||r.type_ko==='개인전').map(toRow),group:records.filter(r=>String(r.type_en||r.type_ko).toLowerCase().includes('group')||r.type_ko==='단체전').map(toRow)};
}
async function cv(){
  const {solo,group}=await loadExhibitionRecords();
  const residency=[['2022–2023','신흥공공예술창작소','신흥공공예술창작소','성남문화재단','경기도, 한국']];
  const artsEducation=[
    ['2025','경기문화재단 〈노는예술〉 우수단체 선정 및 예술교육 활동','문화제작예술소','경기문화재단','경기도, 한국']
  ];
  const rows=items=>items.map((r,i)=>{
    const yearLabel=i===0||items[i-1][0]!==r[0]?`<h3 class="cv-year">${esc(r[0])}</h3>`:'';
    return `${yearLabel}<article class="cv-entry"><strong>${esc(r[1])}</strong><span>${esc(r[2]||'—')}</span><span>${esc(r[3]||'—')}</span><span>${esc(r[4]||'—')}</span></article>`;
  }).join('');
  const block=(title,items,heads=['EXHIBITION','VENUE','SUPPORT / SPONSOR','LOCATION'])=>`<section class="cv-block"><h2>${title}</h2><div class="cv-columns">${heads.map(h=>`<span>${h}</span>`).join('')}</div>${rows(items)}</section>`;
  main.innerHTML=heading()+`<div class="profile-grid"><div><h2 class="cv-artist-name">이서희 <small>SEOHEE LEE</small></h2><p class="cv-artist-bio">Visual Artist<br>Born in 2000<br>Working across Seoul &amp; Gyeonggi-do, South Korea</p></div><div><h2>EDUCATION</h2><div class="cv-school"><span>Present</span><span>Integrated M.S.–Ph.D. Program, Environmental Science &amp; Ecological Engineering, Korea University</span></div><div class="cv-school"><span>2024</span><span>M.F.A., Art &amp; Culture, Korea University</span></div><div class="cv-school"><span>2022</span><span>B.F.A., Art &amp; Design, Korea University</span></div></div></div>
  ${block('SOLO EXHIBITIONS',solo)}
  ${block('GROUP EXHIBITIONS',group)}
  ${block('RESIDENCIES',residency,['PERIOD / PROGRAM','LOCATION / SPACE','OPERATED BY','REGION'])}
  ${block('ARTS EDUCATION',artsEducation,['ACTIVITY','ORGANIZATION','SUPPORT','LOCATION'])}
  <p class="cv-note">Entries with “—” require source confirmation. Some exhibition titles, dates and institutions transcribed from the supplied CV image are pending final verification.</p>`;
}
({artwork,exhibitions,education,contact,cv}[page]||contact)();

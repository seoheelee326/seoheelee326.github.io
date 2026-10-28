/* ELSDR V2 — Navigation structure only (28 October 2026).
   V1 and the existing V2 page content remain unchanged except the
   intentional display/grouping of navigation destinations. */
(function(){
 'use strict';
 const $=(selector,root=document)=>root.querySelector(selector);
 const $$=(selector,root=document)=>Array.from(root.querySelectorAll(selector));
 const menuStructure={
   about:[['vision','Vision'],['identity','Identity'],['themes','Research Themes'],['approach','Research Approach']],
   research:[['','Research Archive']],
   people:[['professor','Professor'],['researchers','Researchers'],['alumni','Alumni']],
   study:[['learning','Learning & Training'],['resources','Research Resources']],
   life:[['news','News'],['events','Events'],['activities','Activities']],
   contact:[['location','Location'],['join','Join Us']]
 };
 const legacy={
   'people/staff':'people/researchers',
   'study/research-notes':'study/resources',
   'study/course-guide':'study/learning',
   'life/fieldwork':'life/activities',
   'life/gallery':'life/activities',
   'contact/email':'contact/location'
 };
 const peopleDetails={
   professor:[['professor','Profile'],['professor/career','Career & Activities'],['professor/books','Books & Writings']],
   researchers:[['researchers/phd','Ph.D. Researchers'],['researchers/ms','M.S. Researchers'],['researchers/interns','Research Interns']],
   alumni:[['alumni','Alumni Directory'],['alumni/theses','Thesis Archive']]
 };
 const labelMap={
   'professor/career':['Career & Activities','주요 경력·보직·학술활동·자문·수상 내역을 담을 페이지입니다.'],
   'professor/books':['Books & Writings','Books / Newspaper Columns / Essays & Other Writings의 페이지 구조를 준비했습니다.'],
   'researchers/phd':['Ph.D. Researchers','박사과정 연구원 프로필을 배치할 예정입니다.'],
   'researchers/ms':['M.S. Researchers','석사과정 연구원 프로필을 배치할 예정입니다.'],
   'researchers/interns':['Research Interns','연구 인턴 프로필을 배치할 예정입니다.'],
   'alumni/theses':['Thesis Archive','졸업생 학위논문의 제목·저자·학위·졸업연도·원문 링크를 배치할 예정입니다.']
 };
 const rootPath=()=>location.hash.replace(/^#\/?/,'').split('?')[0].toLowerCase()||'home';
 function link(page,slug,label){
   const path=page+(slug?'/'+slug:'');
   const element=document.createElement('a');
   element.href='#/'+path;
   element.textContent=label;
   element.dataset.subnav=path;
   return element;
 }
 function buildMenus(){
   Object.entries(menuStructure).forEach(([page,links])=>{
     const submenu=$('#submenu-'+page),mega=$('[data-mega="'+page+'"]');
     if(submenu)submenu.replaceChildren(...links.map(([slug,title])=>link(page,slug,title)));
     if(mega)mega.replaceChildren(...links.map(([slug,title])=>link(page,slug,title)));
   });
   // Local third-level links, rather than making all Professor/Alumni pages
   // top-level siblings in the global navigation.
   const people=$('[data-page="people"]');
   const mainTabs=$('.pp-jump',people);
   if(mainTabs){
     mainTabs.innerHTML=[
       '<a href="#/people/professor" data-people-nav="professor">01 <span>Professor</span><span aria-hidden="true">↘</span></a>',
       '<a href="#/people/researchers" data-people-nav="researchers">02 <span>Researchers</span><span aria-hidden="true">↘</span></a>',
       '<a href="#/people/alumni" data-people-nav="alumni">03 <span>Alumni</span><span aria-hidden="true">↘</span></a>'
     ].join('');
     const group=document.createElement('nav');
     group.className='v2-depth-nav';
     group.id='v2-people-depth';
     group.setAttribute('aria-label','People 상세 페이지');
     mainTabs.after(group);
   }
   const staff=$('[data-people-view="staff"]',people);
   if(staff){
     staff.dataset.peopleView='researchers';
     const title=staff.querySelector('#pp-staff-h');
     if(title)title.innerHTML='Researchers<span>.</span>';
   }
   const study=$('[data-page="study"]');
   const studyNav=$('.st-nav',study);
   if(studyNav){
     studyNav.innerHTML='<a href="#/study/learning" data-v2-study-nav="learning"><small>01</small>Learning &amp; Training<b>↗</b></a>'+
       '<a href="#/study/resources" data-v2-study-nav="resources"><small>02</small>Research Resources<b>↗</b></a>';
     const panel=document.createElement('div');
     panel.id='v2-study-shell';
     panel.className='v2-study-shell';
     panel.innerHTML='<section data-v2-study-panel="learning"><div class="v2-shell-eyebrow">01 / LEARNING &amp; TRAINING</div>'+
       '<h2>Learning &amp; Training<span>.</span></h2><p>Systems Thinking &amp; Modeling / Spatial Analysis &amp; Simulation / Ecological &amp; Environmental Assessment / Research Practice &amp; Communication</p>'+
       '<div class="v2-outline-note">메뉴와 페이지 골조만 준비했습니다. 상세 내용은 다음 단계에서 적용합니다.</div></section>'+
       '<section data-v2-study-panel="resources" hidden><div class="v2-shell-eyebrow">02 / RESEARCH RESOURCES</div>'+
       '<h2>Research Resources<span>.</span></h2><p>Research Notes / Learning Materials / Seminar Materials</p>'+
       '<div class="v2-outline-note">자료 목록과 열람·다운로드 구조는 다음 단계에서 적용합니다.</div></section>';
     studyNav.after(panel);
     const intro=$('.st-head-row p',study);
     if(intro)intro.textContent='연구실의 학습과 연구자료를 소개합니다.';
   }
   const life=$('[data-page="life"]');
   const lifeNav=$('.lf-tabs',life);
   if(lifeNav)lifeNav.innerHTML=[
     ['news','News'],['events','Events'],['activities','Activities']
   ].map(([slug,title],i)=>'<a href="#/life/'+slug+'" data-v2-life-nav="'+slug+'"><small>0'+(i+1)+'</small> '+title+' <b aria-hidden="true">↗</b></a>').join('');
   // Existing Fieldwork map and Gallery stay intact within the unified
   // Activities view until their content is reworked later.
   const field=$('[data-life-view="fieldwork"]',life);
   const gallery=$('[data-life-view="gallery"]',life);
   if(field){
     const kicker=$('.lf-intro span',field),heading=$('.lf-intro h2',field);
     if(kicker)kicker.textContent='03 / ACTIVITIES · WHERE WE’VE BEEN';
     if(heading)heading.innerHTML='Where We’ve Been<span>.</span>';
   }
   if(gallery){
     const kicker=$('.lf-intro span',gallery),heading=$('.lf-intro h2',gallery);
     if(kicker)kicker.textContent='ACTIVITIES / ARCHIVE';
     if(heading)heading.innerHTML='Activity Archive<span>.</span>';
   }
   const contact=$('[data-page="contact"]');
   const contactNav=$('.ct-jump',contact);
   if(contactNav)contactNav.innerHTML='<a href="#/contact/location"><small>01</small><span>Location</span><b aria-hidden="true">↘</b></a>'+
     '<a href="#/contact/join"><small>02</small><span>Join Us</span><b aria-hidden="true">↘</b></a>';
   // Keep original contact information; make it part of Location rather than
   // deleting useful email/phone details from the old page.
   const location=$('#contact-location'),email=$('#contact-email');
   if(location&&email){
     location.appendChild(email);
     email.classList.add('v2-contact-information');
     const h=$('#ct-email-title',email);
     if(h)h.innerHTML='Contact Information<span>.</span>';
     const heading=$('.ct-section-heading>span',email);
     if(heading)heading.textContent='CONTACT / INFORMATION';
   }
   const stub=document.createElement('section');
   stub.className='pp-section v2-people-placeholder';
   stub.id='v2-people-placeholder';
   stub.hidden=true;
   stub.setAttribute('aria-live','polite');
   $('.pp-main',people)?.appendChild(stub);
 }
 function renderPeople(route){
   const page=$('[data-page="people"]');
   if(!page)return;
   const parts=route.split('/');
   if(parts[0]!=='people')return;
   const primary=['professor','researchers','alumni'].includes(parts[1])?parts[1]:'professor';
   const key=parts.slice(1).join('/');
   const pending=labelMap[key]||null;
   $$('[data-people-view]',page).forEach(section=>{
     section.hidden=!!pending || section.dataset.peopleView!==primary;
   });
   const stub=$('#v2-people-placeholder',page);
   if(stub){
     stub.hidden=!pending;
     if(pending){
       const [heading,desc]=pending;
       stub.replaceChildren();
       const eyebrow=document.createElement('span');eyebrow.className='v2-shell-eyebrow';eyebrow.textContent='PEOPLE / '+primary.toUpperCase();
       const h=document.createElement('h2');h.textContent=heading+'.';
       const p=document.createElement('p');p.textContent=desc;
       const note=document.createElement('div');note.className='v2-outline-note';note.textContent='페이지 경로만 먼저 생성했습니다. 세부 디자인과 자료는 추후 적용합니다.';
       stub.append(eyebrow,h,p,note);
     }
   }
   $$('[data-people-nav]',page).forEach(a=>{
     const active=a.dataset.peopleNav===primary;
     a.classList.toggle('is-selected',active);
     if(active)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');
   });
   const sub=$('#v2-people-depth',page);
   if(sub){
     sub.replaceChildren(...(peopleDetails[primary]||[]).map(([slug,title])=>{
       const a=document.createElement('a');
       a.href='#/people/'+slug;a.textContent=title;
       const active=key===slug || (!key&&slug==='professor');
       if(active)a.classList.add('is-active');
       return a;
     }));
   }
 }
 function renderStudy(route){
   if(!route.startsWith('study'))return;
   const selected=route.split('/')[1]==='resources'?'resources':'learning';
   const root=$('[data-page="study"]');
   $$('[data-study-tab]',root).forEach(x=>x.hidden=true);
   $$('[data-v2-study-panel]',root).forEach(x=>x.hidden=x.dataset.v2StudyPanel!==selected);
   $$('[data-v2-study-nav]',root).forEach(a=>{
     const active=a.dataset.v2StudyNav===selected;
     a.classList.toggle('selected',active);
     if(active)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');
   });
 }
 function renderLife(route){
   if(!route.startsWith('life'))return;
   const sub=route.split('/')[1],selected=['news','events','activities'].includes(sub)?sub:'news';
   const life=$('[data-page="life"]');
   $$('[data-life-view]',life).forEach(p=>{
     p.hidden=selected==='activities'? !['fieldwork','gallery'].includes(p.dataset.lifeView):p.dataset.lifeView!==selected;
   });
   $$('[data-v2-life-nav]',life).forEach(a=>{
     const active=a.dataset.v2LifeNav===selected;
     a.classList.toggle('is-active',active);
     if(active)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');
   });
 }
 function renderMenu(route){
   $$('[data-subnav]').forEach(el=>{
     const active=el.dataset.subnav===route;
     el.classList.toggle('active',active);
     if(active)el.setAttribute('aria-current','page');else el.removeAttribute('aria-current');
   });
   // Keep desktop mega menu and mobile expanded submenu logically identical.
 }
 function render(){
   const route=rootPath();
   if(legacy[route]){
     location.replace('#/'+legacy[route]);
     return;
   }
   renderPeople(route);renderStudy(route);renderLife(route);renderMenu(route);
 }
 buildMenus();
 window.addEventListener('hashchange',render);
 render();
})();

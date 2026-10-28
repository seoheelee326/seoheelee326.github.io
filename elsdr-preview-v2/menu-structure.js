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

 }
 function renderStudy(route){
   if(!(route==='study'||route.startsWith('study/')))return;
   const selected=route.split('/')[1]||'learning';
   const root=$('[data-page="study"]');
   if(!root)return;
   $$('[data-v2-study-nav]',root).forEach(anchor=>{
     const active=anchor.dataset.v2StudyNav===selected;
     anchor.classList.toggle('selected',active);
     if(active)anchor.setAttribute('aria-current','page');
     else anchor.removeAttribute('aria-current');
   });
   // Both content areas stay on the same page; hash routes scroll to their section.
   if(['learning','resources'].includes(selected)&&route.includes('/')){
     requestAnimationFrame(()=>{
       const destination=$('#v2-study-'+selected,root);
       destination?.scrollIntoView({block:'start',behavior:'smooth'});
     });
   }
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
   renderStudy(route);renderLife(route);renderMenu(route);
 }
 buildMenus();
 window.addEventListener('hashchange',render);
 render();
})();

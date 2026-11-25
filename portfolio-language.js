/* Shared KR / EN switch for the standalone portfolio archive pages. */
(() => {
  const key = 'seohee-lang';
  const labels = {
    ko: {
      artwork:'작업', exhibitions:'전시', education:'문화예술교육',
      news:'소식', contact:'연락', cv:'이력',
      heading: {artwork:['작업','회화 · 설치 · 영상 · 공공미술 · 드로잉'],exhibitions:['전시','개인전과 단체전'],education:['문화예술교육','관찰과 함께 나누는 질문'],news:['소식','최근 소식'],contact:['연락','예술과 협업 문의'],cv:['이력','이서희 · 시각예술가']}
    },
    en: {
      artwork:'ARTWORK', exhibitions:'EXHIBITIONS', education:'ARTS EDUCATION',
      news:'NEWS', contact:'CONTACT', cv:'CV',
      heading: {artwork:['ARTWORK','Painting · Installation · Moving Image · Public Art Projects · Drawing'],exhibitions:['EXHIBITIONS','Solo and group exhibitions'],education:['ARTS EDUCATION','Observation and Shared Questions'],news:['NEWS','Latest Updates'],contact:['CONTACT','Art and collaboration inquiries'],cv:['CV','SEOHEE LEE · VISUAL ARTIST']}
    }
  };
  let lang;
  try{lang=localStorage.getItem(key)==='en'?'en':'ko';}catch{lang='ko';}
  const controls=document.querySelector('.page-language');
  const main=document.getElementById('page-content');
  const page=document.body.dataset.page;
  const headingPage=page==='artwork-detail'?'artwork':page==='exhibition-detail'?'exhibitions':page;
  function apply(){
    const data=labels[lang];
    document.documentElement.lang=lang;
    document.body.dataset.lang=lang;
    document.querySelector('.page-nav')?.setAttribute('aria-label',lang==='ko'?'주 메뉴':'Main menu');
    controls?.setAttribute('aria-label',lang==='ko'?'언어 선택':'Language');
    document.querySelectorAll('.page-nav [data-page]').forEach(link=>{
      link.textContent=data[link.dataset.page]||link.textContent;
    });
    controls?.querySelectorAll('button[data-lang]').forEach(button=>{
      button.setAttribute('aria-pressed',String(button.dataset.lang===lang));
    });
    const heading=main?.querySelector('.page-heading');
    if(heading&&data.heading[headingPage]){
      const [title,subtitle]=data.heading[headingPage];
      const h=heading.querySelector('h1'),p=heading.querySelector('p');
      if(h)h.textContent=title;
      if(p&&!p.dataset.dynamicExhibitionFilter)p.textContent=subtitle;
    }
  }
  let scheduled=false;
  const observer=new MutationObserver(()=>{
    if(scheduled)return;
    scheduled=true;
    queueMicrotask(()=>{scheduled=false;apply();});
  });
  if(main)observer.observe(main,{childList:true,subtree:false});
  controls?.addEventListener('click',e=>{
    const button=e.target.closest('button[data-lang]');
    if(!button)return;
    lang=button.dataset.lang==='en'?'en':'ko';
    try{localStorage.setItem(key,lang);}catch{}
    apply();
  });
  apply();
})();
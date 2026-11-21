const page=document.body.dataset.page;
const main=document.getElementById('page-content');
const pageNav=document.querySelector('.page-nav');
pageNav.prepend(pageNav.querySelector('[data-page="cv"]'));
const headings={artwork:['ARTWORK','Painting · Installation · Moving Image · Public Art Projects · Drawing'],exhibitions:['EXHIBITIONS','Solo and group exhibitions'],education:['ARTS EDUCATION','Observation and Shared Questions'],contact:['CONTACT','Art and collaboration inquiries'],cv:['CV','SEOHEE LEE · VISUAL ARTIST']};
document.querySelectorAll('.page-nav a').forEach(a=>{if(a.dataset.page===((page==='exhibition-detail')?'exhibitions':(page==='artwork-detail'?'artwork':page)))a.setAttribute('aria-current','page')});
const esc=v=>String(v??'').replace(/[&<>"']/g,s=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
function heading(){const [title,subtitle]=headings[page];return `<div class="page-heading"><h1>${title}</h1><p>${subtitle}</p></div>`}
async function json(path){try{const r=await fetch(path,{cache:'no-store'});if(!r.ok)throw Error(r.status);return await r.json()}catch{return []}}
const category=w=>{const c=String(w.category||'').toLowerCase();if(c.includes('print')||c.includes('silk'))return'printmaking';if(c.includes('public'))return'public';if(c.includes('draw'))return'drawing';if(c.includes('install'))return'installation';if(c.includes('video')||c.includes('media')||c.includes('moving'))return'video';return'painting'};
async function exhibitionArchive(){
  const [records,posts,content,localPhotos,source]=await Promise.all([json('data/exhibitions.json'),json('data/exhibition-blog.json'),json('data/exhibition-content.json'),json('data/exhibition-local-photos.json'),json('data/exhibition-source.json')]);
  const enrich=post=>post?{...post,...content.find(c=>c.post_id===post.post_id),photos_local:source[post.post_id]?.photos||localPhotos[post.post_id]||[],source_paragraphs:source[post.post_id]?.paragraphs||[]}:null;
  const withPosts=records.filter(e=>e.published!==false).map(e=>({...e,blog:enrich(posts.find(p=>p.title===(e.title_ko||e.title_en)&&Number(p.year)===Number(e.year)))}));
  for(const post of posts){if(!withPosts.some(e=>e.blog?.post_id===post.post_id))withPosts.push({year:post.year,title_ko:post.title,type_en:'Group Exhibition',venue_ko:post.venue||'',location_ko:post.location||'',blog:enrich(post)});}
  return withPosts.sort((a,b)=>Number(b.year)-Number(a.year));
}
const workId=(w,i)=>String(w.id||w.slug||[w.year,w.title].filter(Boolean).join('|')||i);
const workImages=w=>[w.image,...(Array.isArray(w.gallery)?w.gallery.map(x=>typeof x==='string'?x:x?.image||x?.src):[])].filter(Boolean);
const artCategories=[['all','ALL'],['painting','PAINTING'],['installation','INSTALLATION'],['video','MOVING IMAGE'],['public','PUBLIC ART'],['printmaking','PRINTMAKING'],['drawing','DRAWING']];
async function artwork(){
 const works=(await json('data/works.json')).filter(w=>w.published!==false);
 main.innerHTML=heading()+'<div class="artwork-intro">Selected works <span>— An ongoing visual archive</span></div><div class="artwork-filters" role="group" aria-label="Artwork category">'+artCategories.map(([k,l],i)=>'<button data-art-filter="'+k+'" class="'+(i===0?'active':'')+'">'+l+'</button>').join('')+'</div><div class="artwork-gallery" id="artwork-gallery"></div>';
 const grid=main.querySelector('#artwork-gallery');
 const scrollKey='seohee-artwork-return-v1';
 const scroller=main;
 const savePosition=()=>{try{sessionStorage.setItem(scrollKey,JSON.stringify({top:scroller.scrollTop,filter:main.querySelector('[data-art-filter].active')?.dataset.artFilter||'all'}));}catch{}};
 grid.addEventListener('click',event=>{if(event.target.closest('.artwork-card'))savePosition();});
 function render(filter){
  const selection=works.map((w,i)=>({...w,_index:i})).filter(w=>filter==='all'||category(w)===filter);
  grid.innerHTML=selection.length?selection.map((w,i)=>{
   const title=esc(w.title||w.title_ko||'Untitled');
   const src=workImages(w)[0];
   const href='artwork-detail.html?id='+encodeURIComponent(workId(w,w._index));
   const prominence=(filter==='all'&&w.featured&&selection.length>2)?'artwork-card--featured':(i%4===1?'artwork-card--offset':'');
   return '<a class="artwork-card '+prominence+'" href="'+esc(href)+'" aria-label="'+title+' — view artwork"><div class="artwork-thumb '+(src?'':'artwork-thumb--empty')+'">'+(src?'<img src="'+esc(src)+'" alt="'+title+'" loading="lazy">':'<span>IMAGE TO BE ADDED</span>')+'</div><div class="artwork-card-caption"><div><h2>'+title+'</h2><p>'+esc(w.year||'')+' · '+esc(w.category||'')+'</p></div><span aria-hidden="true">↗</span></div></a>';
  }).join(''):'<p class="empty">Works in this category will be added.</p>';
 }
 main.querySelectorAll('[data-art-filter]').forEach(btn=>btn.addEventListener('click',()=>{
  main.querySelectorAll('[data-art-filter]').forEach(x=>x.classList.toggle('active',x===btn));render(btn.dataset.artFilter);
 }));
 let saved=null;
 try{saved=JSON.parse(sessionStorage.getItem(scrollKey)||'null');sessionStorage.removeItem(scrollKey);}catch{}
 const activeFilter=artCategories.some(([key])=>key===saved?.filter)?saved.filter:'all';
 main.querySelectorAll('[data-art-filter]').forEach(x=>x.classList.toggle('active',x.dataset.artFilter===activeFilter));
 render(activeFilter);
 if(saved&&Number.isFinite(Number(saved.top))){
  const restore=()=>{scroller.scrollTop=Math.max(0,Number(saved.top));};
  requestAnimationFrame(()=>{restore();requestAnimationFrame(restore);});
  // Images can finish loading after layout. Restore once more when the gallery settles.
  const images=[...grid.querySelectorAll('img')];
  if(images.length)Promise.all(images.map(img=>img.complete?Promise.resolve():new Promise(resolve=>{img.addEventListener('load',resolve,{once:true});img.addEventListener('error',resolve,{once:true});}))).then(restore);
 }
}
async function artworkDetail(){
 const [works,exhibitions]=await Promise.all([json('data/works.json'),exhibitionArchive()]);
 const visible=works.filter(w=>w.published!==false),id=new URLSearchParams(location.search).get('id');
 const index=visible.findIndex((w,i)=>workId(w,i)===id);
 if(index===-1){main.innerHTML='<article class="artwork-detail-page"><a class="artwork-back" href="artwork.html">← BACK TO ARTWORK</a><h1>Artwork not found</h1></article>';return;}
 const w=visible[index],title=esc(w.title||w.title_ko||'Untitled');
 const src=workImages(w)[0],materials=w.materials_ko||w.materials_en;
 const ghostCat=(Number(w.year)===2018&&w.title==='돈의문 유령고양이'&&!!w.companion_image);
 const heroMedia=src?'<figure><img src="'+esc(src)+'" alt="'+title+'" loading="eager"></figure>':'<div class="artwork-detail-empty">IMAGE TO BE ADDED</div>';
 const ghostCompanion=ghostCat?'<span class="ghost-companion" aria-label="작품 속 유령고양이가 선에 걸터앉아 꼬리를 살랑입니다" role="img"><span class="ghost-companion-figure"><img class="ghost-companion-body" src="'+esc(w.companion_image)+'" alt="" aria-hidden="true"><img class="ghost-companion-tail" src="'+esc(w.companion_image)+'" alt="" aria-hidden="true"></span></span>':'';

 const dimensions=[w.height_cm,w.width_cm,w.depth_cm].filter(v=>v!==undefined&&v!==null&&v!=='').join(' × ');
 const fields=[['YEAR',w.year],['CATEGORY',w.category],['MATERIALS',materials],['DIMENSIONS',w.dimensions_text|| (dimensions?dimensions+' cm':'')]];
 const note=w.artist_statement_ko||w.artist_statement_en||w.artist_text||w.description_ko||w.description_en;
 const detailImages=(Array.isArray(w.detail_images)?w.detail_images:[]).map(x=>typeof x==='string'?{src:x}:x).concat(Array.isArray(w.gallery)?w.gallery.map(x=>typeof x==='string'?{src:x}:x):[]).filter(x=>x&&(x.src||x.image));
 const exhibitionPhotos=(Array.isArray(w.exhibition_views)?w.exhibition_views:[]).map(x=>typeof x==='string'?{src:x}:x).filter(x=>x&&(x.src||x.image));
 const seriesIds=Array.isArray(w.related_works)?w.related_works.map(String):[];
 const relatedWorks=visible.map((work,i)=>({work,i})).filter(({work,i})=>i!==index&&(seriesIds.includes(workId(work,i))||(w.series_id&&work.series_id===w.series_id)));
 const exIds=Array.isArray(w.related_exhibitions)?w.related_exhibitions.map(String):[];
 const relatedExhibitions=exhibitions.filter(e=>exIds.includes(String(e.id||[e.year,e.title_ko||e.title_en].join('|'))));
 const block=(label,desc,body)=>'<section class="artwork-archive-section"><div class="artwork-section-top"><h2>'+label+'</h2></div>'+body+'</section>';
 const empty=msg=>'<p class="artwork-section-empty">'+msg+'</p>';
 const detailBlock=block('DETAIL VIEWS','A closer look at materials, surfaces and process',
  detailImages.length?'<div class="artwork-detail-carousel" aria-label="Artwork detail photographs"><div class="artwork-carousel-stage">'+detailImages.map((item,i)=>'<figure class="artwork-carousel-slide" data-slide="'+i+'" '+(i?'hidden':'')+'><img src="'+esc(item.src||item.image)+'" alt="'+title+' — detail '+(i+1)+' of '+detailImages.length+'" loading="'+(i?'lazy':'eager')+'">'+(item.caption?'<figcaption>'+esc(item.caption)+'</figcaption>':'')+'</figure>').join('')+'</div><div class="artwork-carousel-controls"><button class="artwork-carousel-arrow" data-carousel-step="-1" aria-label="Previous detail photograph"><span aria-hidden="true">‹</span></button><span class="artwork-carousel-count" aria-live="polite">01 / '+String(detailImages.length).padStart(2,'0')+'</span><button class="artwork-carousel-arrow" data-carousel-step="1" aria-label="Next detail photograph"><span aria-hidden="true">›</span></button></div></div>':empty('Detail photographs will be added.'));
 const exhibitionViewsBlock=block('EXHIBITION VIEWS','A closer look at materials, surfaces and process',
  exhibitionPhotos.length?'<div class="artwork-detail-carousel" aria-label="Exhibition installation photographs"><div class="artwork-carousel-stage">'+exhibitionPhotos.map((item,i)=>'<figure class="artwork-carousel-slide" data-slide="'+i+'" '+(i?'hidden':'')+'><img src="'+esc(item.src||item.image)+'" alt="'+title+' — detail '+(i+1)+' of '+exhibitionPhotos.length+'" loading="'+(i?'lazy':'eager')+'">'+(item.caption?'<figcaption>'+esc(item.caption)+'</figcaption>':'')+'</figure>').join('')+'</div><div class="artwork-carousel-controls"><button class="artwork-carousel-arrow" data-carousel-step="-1" aria-label="Previous detail photograph"><span aria-hidden="true">‹</span></button><span class="artwork-carousel-count" aria-live="polite">01 / '+String(exhibitionPhotos.length).padStart(2,'0')+'</span><button class="artwork-carousel-arrow" data-carousel-step="1" aria-label="Next detail photograph"><span aria-hidden="true">›</span></button></div></div>':empty('전시 전경 사진을 추가하면 이곳에서 볼 수 있습니다.'));
  const strangeAxis=(Number(w.year)===2019&&w.title==='이상한 축/도르륵,도르륵,도륵!');
 const yarnDecoration=strangeAxis?"<svg class=\"axis-red-yarn\" viewBox=\"0 0 1400 525\" preserveAspectRatio=\"none\" aria-hidden=\"true\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\"><defs><filter id=\"axis-wool-fuzz\" x=\"-15%\" y=\"-15%\" width=\"130%\" height=\"130%\"><feTurbulence type=\"fractalNoise\" baseFrequency=\".042 .075\" numOctaves=\"2\" seed=\"18\" result=\"noise\"/><feDisplacementMap in=\"SourceGraphic\" in2=\"noise\" scale=\"2.2\" xChannelSelector=\"R\" yChannelSelector=\"G\"/></filter></defs><g fill=\"none\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path class=\"axis-yarn-shadow\" d=\"M171,-18 C200,72 194,177 147,273 S39,431 -39,455\"/><path class=\"axis-yarn-main\" d=\"M171,-18 C200,72 194,177 147,273 S39,431 -39,455\"/><path class=\"axis-yarn-highlight\" d=\"M170,-18 C199,72 193,177 146,273 S38,431 -40,455\"/><path class=\"axis-yarn-shadow\" d=\"M788,-22 C904,3 952,182 1118,208 S1290,104 1419,-37\"/><path class=\"axis-yarn-main\" d=\"M788,-22 C904,3 952,182 1118,208 S1290,104 1419,-37\"/><path class=\"axis-yarn-highlight\" d=\"M788,-22 C904,3 952,182 1118,208 S1290,104 1419,-37\"/><path class=\"axis-yarn-shadow\" d=\"M998,-22 C1059,45 1127,123 1223,110 S1354,39 1417,-5\"/><path class=\"axis-yarn-main\" d=\"M998,-22 C1059,45 1127,123 1223,110 S1354,39 1417,-5\"/><path class=\"axis-yarn-shadow\" d=\"M1165,-20 C1203,44 1250,71 1301,51 S1380,-8 1422,-40\"/><path class=\"axis-yarn-main\" d=\"M1165,-20 C1203,44 1250,71 1301,51 S1380,-8 1422,-40\"/></g></svg>":'';
 const noteBlock=block('ARTIST’S NOTE','Words behind the work',yarnDecoration+(note?'<div class="artwork-statement">'+esc(note)+'</div>':empty('Artist’s text will be added.'))+(w.exhibition_context_ko?'<div class="artwork-exhibition-context"><h3>INTERLOCK · 전시 소개</h3><p>'+esc(w.exhibition_context_ko)+'</p></div>':''));
 const pendingRelated=Array.isArray(w.related_works_pending)?w.related_works_pending.filter(Boolean):[];
 const seriesBlock=block('RELATED WORKS',w.series_name?esc(w.series_name):'Works from the same series',
  (relatedWorks.length||pendingRelated.length)?'<div class="artwork-related-grid">'+relatedWorks.map(({work,i})=>{const image=workImages(work)[0],name=esc(work.title||work.title_ko||'Untitled');return '<a class="artwork-related-card" href="artwork-detail.html?id='+encodeURIComponent(workId(work,i))+'"><div class="artwork-related-image">'+(image?'<img src="'+esc(image)+'" alt="'+name+'" loading="lazy">':'<span>IMAGE TO BE ADDED</span>')+'</div><h3>'+name+'</h3><p>'+esc(work.year||'')+' · '+esc(work.category||'')+'</p></a>'}).join('')+pendingRelated.map(name=>'<div class="artwork-related-card artwork-related-pending"><div class="artwork-related-image"><span>ARCHIVE PENDING</span></div><h3>'+esc(name)+'</h3><p>추후 등록 예정</p></div>').join('')+'</div>':empty(w.series_name?'Other works from this series will be linked here.':'Related works will appear here when a series is linked.'));
 const exhibitionBlock=block('RELATED EXHIBITIONS','Where this work has been presented',
  relatedExhibitions.length?'<div class="artwork-exhibitions">'+relatedExhibitions.map(e=>{const name=esc(e.title_ko||e.title_en),href='exhibition-detail.html?id='+encodeURIComponent([e.year,e.title_ko||e.title_en].join('|')),poster=e.image||e.blog?.photos_local?.[0];return '<a class="artwork-exhibition-card" href="'+esc(href)+'"><div class="artwork-exhibition-preview">'+(poster?'<img src="'+esc(poster)+'" alt="'+name+'" loading="lazy">':'<span>EXHIBITION ARCHIVE</span>')+'</div><div><p>'+esc(e.year_label||e.year)+'</p><h3>'+name+'</h3><span>'+esc(e.venue_ko||e.venue_en||'')+'</span></div><span class="artwork-exhibition-arrow">↗</span></a>'}).join('')+'</div>':empty('Related exhibition records will be linked here.'));
 const prev=visible[index-1],next=visible[index+1];
 main.innerHTML='<article class="artwork-detail-page"><a class="artwork-back" href="artwork.html">← BACK TO ARTWORK</a><div class="artwork-detail-layout"><div class="artwork-detail-media">'+heroMedia+'</div><div class="artwork-detail-info"><p class="artwork-detail-eyebrow">ARTWORK / '+esc(w.category||'WORK')+'</p><h1>'+title+'</h1>'+(w.title_translation_en?'<p class="artwork-translation">'+esc(w.title_translation_en)+'</p>':'')+'<dl class="artwork-meta">'+fields.filter(([,v])=>v!==undefined&&v!==null&&v!=='').map(([k,v])=>'<dt>'+k+'</dt><dd>'+esc(v)+'</dd>').join('')+'</dl><nav class="artwork-jump-nav" aria-label="Artwork page sections"><a href="#work-details">DETAIL VIEWS</a><a href="#work-installations">EXHIBITION VIEWS</a><a href="#work-statement">ARTIST’S NOTE</a><a href="#work-series">RELATED WORKS</a><a href="#work-exhibitions">EXHIBITIONS</a>'+ghostCompanion+'</nav></div></div><div class="artwork-archive-content"><div id="work-details">'+detailBlock+'</div><div id="work-installations">'+exhibitionViewsBlock+'</div><div id="work-statement"'+(strangeAxis?' class="axis-yarn-note"':'')+'>'+noteBlock+'</div><div id="work-series">'+seriesBlock+'</div><div id="work-exhibitions">'+exhibitionBlock+'</div></div><nav class="artwork-pagination" aria-label="Other artworks">'+(prev?'<a href="artwork-detail.html?id='+encodeURIComponent(workId(prev,index-1))+'">← PREVIOUS WORK</a>':'<span></span>')+(next?'<a href="artwork-detail.html?id='+encodeURIComponent(workId(next,index+1))+'">NEXT WORK →</a>':'<span></span>')+'</nav></article>';
 // The companion is a separate decorative cutout, not the original artwork.
 // Crop transparent margins for this decorative copy only, then align the seated rump to the rule.
 if(ghostCat){
  const iconImgs=[...main.querySelectorAll('.ghost-companion img')];
  const companion=main.querySelector('.ghost-companion');
  const source=new Image();
  source.onload=()=>{
   try{
    const canvas=document.createElement('canvas');canvas.width=source.naturalWidth;canvas.height=source.naturalHeight;
    const ctx=canvas.getContext('2d',{willReadFrequently:true});if(!ctx)return;
    ctx.drawImage(source,0,0);const pixels=ctx.getImageData(0,0,canvas.width,canvas.height);
    let x0=canvas.width,y0=canvas.height,x1=0,y1=0;
    for(let y=0;y<canvas.height;y++)for(let x=0;x<canvas.width;x++){
     const i=(y*canvas.width+x)*4,r=pixels.data[i],g=pixels.data[i+1],blue=pixels.data[i+2],white=Math.min(r,g,blue);
     if(white>=252){pixels.data[i+3]=0;continue;}
     if(white>215)pixels.data[i+3]=Math.round(pixels.data[i+3]*(252-white)/37);
     if(pixels.data[i+3]>40){x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y);}
    }
    ctx.putImageData(pixels,0,0);
    if(x1<=x0||y1<=y0)return;
    const pad=5,left=Math.max(0,x0-pad),top=Math.max(0,y0-pad),right=Math.min(canvas.width,x1+pad+1),bottom=Math.min(canvas.height,y1+pad+1);
    const cropped=document.createElement('canvas');cropped.width=right-left;cropped.height=bottom-top;
    cropped.getContext('2d').drawImage(canvas,left,top,cropped.width,cropped.height,0,0,cropped.width,cropped.height);
    const url=cropped.toDataURL('image/png');
    iconImgs.forEach(el=>el.src=url);
    companion.style.setProperty('--ghost-aspect',cropped.width+' / '+cropped.height);
    companion.classList.add('ghost-companion--ready');
   }catch(e){/* Keep static original companion if canvas conversion is unavailable. */}
  };
  source.src=w.companion_image;
 }
 // Each collection has its own independent image carousel.
 main.querySelectorAll('.artwork-detail-carousel').forEach(carousel=>{
  const slides=[...carousel.querySelectorAll('.artwork-carousel-slide')],count=carousel.querySelector('.artwork-carousel-count');
  if(!slides.length)return;
  let selected=0;
  const showSlide=next=>{
   selected=(next+slides.length)%slides.length;
   slides.forEach((slide,i)=>{slide.hidden=i!==selected;});
   count.textContent=String(selected+1).padStart(2,'0')+' / '+String(slides.length).padStart(2,'0');
  };
  carousel.querySelectorAll('[data-carousel-step]').forEach(button=>button.addEventListener('click',()=>showSlide(selected+Number(button.dataset.carouselStep))));
  carousel.tabIndex=0;
  carousel.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();showSlide(selected+(event.key==='ArrowRight'?1:-1));}});
 });
 // The page content is the scroll container, so section navigation scrolls within it.
 main.querySelectorAll('.artwork-jump-nav a').forEach(a=>a.addEventListener('click',event=>{const target=main.querySelector(a.getAttribute('href'));if(target){event.preventDefault();target.scrollIntoView({behavior:'smooth',block:'start'});}}));
 document.title=(w.title||'Artwork')+' | SEOHEE LEE';
}
async function exhibitions(){
  const records=await exhibitionArchive();
  const isSolo=e=>String(e.type_en||e.type_ko).toLowerCase().includes('solo')||e.type_ko==='개인전';
  main.innerHTML=heading()+`<div class="exhibition-filters" role="group" aria-label="Exhibition type"><button class="active" data-ex-type="all">ALL</button><button data-ex-type="solo">SOLO</button><button data-ex-type="group">GROUP</button></div><div class="exhibition-gallery" id="exhibition-gallery"></div>`;
  const gallery=main.querySelector('#exhibition-gallery');
  const render=filter=>{
    main.querySelector('.page-heading p').textContent={all:'Solo and Group Exhibitions',solo:'Solo Exhibitions',group:'Group Exhibitions'}[filter];
    const selected=records.filter(e=>filter==='all'||(filter==='solo'?isSolo(e):!isSolo(e)));
    gallery.innerHTML=selected.map(e=>{
      const title=esc(e.title_ko||e.title_en),year=esc(e.year_label||e.year);
      const href=`exhibition-detail.html?id=${encodeURIComponent(`${e.year}|${e.title_ko||e.title_en}`)}`;
      const poster=e.image||e.blog?.photos_local?.[0]||e.blog?.photos?.[0];
      return `<a class="exhibition-card" href="${esc(href)}" aria-label="${title} details"><div class="exhibition-frame"><span class="frame-pin tl" aria-hidden="true"></span><span class="frame-pin tr" aria-hidden="true"></span><span class="frame-pin bl" aria-hidden="true"></span><span class="frame-pin br" aria-hidden="true"></span><div class="frame-inner">${poster?`<img src="${esc(poster)}" referrerpolicy="no-referrer" alt="${title}" loading="lazy">`:`<div class="frame-placeholder"><small>EXHIBITION ARCHIVE</small>${title}</div>`}</div></div><div class="exhibition-caption"><strong>${title}</strong><span>${year} · ${esc(e.venue_ko||e.venue_en||'Venue to be added')}</span></div></a>`;
    }).join('');
  };
  main.querySelectorAll('[data-ex-type]').forEach(b=>b.addEventListener('click',()=>{main.querySelectorAll('[data-ex-type]').forEach(x=>x.classList.toggle('active',x===b));render(b.dataset.exType)}));
  render('all');
}
async function exhibitionDetail(){
  const id=new URLSearchParams(location.search).get('id');
  const records=await exhibitionArchive();
  const e=records.find(e=>`${e.year}|${e.title_ko||e.title_en}`===id);
  if(!e){main.innerHTML='<div class="exhibition-detail-page"><a class="exhibition-back" href="exhibitions.html">BACK TO EXHIBITIONS</a><h1>Exhibition not found</h1></div>';return;}
  const title=esc(e.title_ko||e.title_en);
  const solo=String(e.type_en||e.type_ko).toLowerCase().includes('solo')||e.type_ko==='개인전';
  const entries=[['YEAR',e.year_label||e.year],['VENUE',e.venue_ko||e.venue_en],['SUPPORT / SPONSOR',e.support_ko||e.support_en],['LOCATION',e.location_ko||e.location_en]];
  const gallery=Array.isArray(e.gallery)?e.gallery.filter(Boolean):[];
  const blog=e.blog;
  const photos=Array.isArray(blog?.photos_local)&&blog.photos_local.length?blog.photos_local:Array.isArray(blog?.photos)?blog.photos.filter(Boolean):[];
  const lead=e.image||photos[0];
  const extras=[...photos.slice(e.image?0:1),...gallery.map(src=>typeof src==='string'?src:src.image||src.src||'')].filter(Boolean);
  const paragraphs=[['EXHIBITION TEXT',blog?.intro||blog?.summary],['ARTIST’S NOTE',blog?.artist_text]].filter(([,value])=>value).map(([label,value])=>`<section class="exhibition-copy"><h3>${label}</h3><p>${esc(value)}</p></section>`).join('');
  const blogInfo=blog?`<section class="exhibition-blog-info"><h2>EXHIBITION ARCHIVE</h2><dl class="exhibition-info-grid">${[['DATES',blog.dates],['ORGANIZED BY',blog.organizer],['SUPPORT',blog.support],['PARTICIPATING ARTISTS',blog.artists],['WORK SHOWN',blog.work]].filter(([,value])=>value).map(([label,value])=>`<dt>${label}</dt><dd>${esc(value)}</dd>`).join('')}</dl>${paragraphs}</section>`:'';
  const fullText=Array.isArray(blog?.source_paragraphs)&&blog.source_paragraphs.length?`<section class="exhibition-transcript"><h2>ORIGINAL EXHIBITION RECORD</h2><p class="exhibition-transcript-lead">Text and artwork captions archived from the artist’s blog.</p>${blog.source_paragraphs.map(text=>`<p>${esc(text)}</p>`).join('')}</section>`:'';
  main.innerHTML=`<article class="exhibition-detail-page"><a class="exhibition-back" href="exhibitions.html">BACK TO EXHIBITIONS</a><div class="exhibition-detail-layout"><div><div class="exhibition-frame exhibition-detail-frame"><span class="frame-pin tl" aria-hidden="true"></span><span class="frame-pin tr" aria-hidden="true"></span><span class="frame-pin bl" aria-hidden="true"></span><span class="frame-pin br" aria-hidden="true"></span><div class="frame-inner">${lead?`<img src="${esc(lead)}" referrerpolicy="no-referrer" alt="${title} poster or installation view">`:`<div class="frame-placeholder"><small>EXHIBITION ARCHIVE</small>${title}</div>`}</div></div>${extras.length?`<div class="exhibition-detail-images"><h2>EXHIBITION VIEWS &amp; WORKS</h2>${extras.map((src,i)=>`<figure><img src="${esc(src)}" referrerpolicy="no-referrer" alt="${title} exhibition archive image ${i+1}" loading="lazy"></figure>`).join('')}</div>`:''}</div><div class="exhibition-detail-text"><p class="exhibition-type">${solo?'SOLO EXHIBITION':'GROUP EXHIBITION'}</p><h1>${title}</h1><dl class="exhibition-info-grid">${entries.map(([label,value])=>`<dt>${label}</dt><dd>${esc(value||'—')}</dd>`).join('')}</dl>${blogInfo}</div></div>${fullText}</article>`;
  document.title=`${e.title_ko||e.title_en} | SEOHEE LEE`;
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
  const toRow=r=>[r.year_label||r.year,r.title_ko||r.title_en,r.venue_ko||r.venue_en||'',r.support_ko||r.support_en||'',r.location_ko||r.location_en||''];
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
({artwork,'artwork-detail':artworkDetail,exhibitions,'exhibition-detail':exhibitionDetail,education,contact,cv}[page]||contact)();

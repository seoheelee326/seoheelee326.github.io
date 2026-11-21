/* Strange Axis (2019): one red, cursor-responsive line for each page divider.
   Bounded, damped spring shape: straight at rest, no spinning or broken segments. */
(() => {
  const expected='2019|이상한 축/도르륵,도르륵,도륵!';
  if(new URLSearchParams(location.search).get('id')!==expected)return;
  const scroller=document.getElementById('page-content');
  if(!scroller)return;
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ns='http://www.w3.org/2000/svg';
  const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
  const lines=[];
  let activeFrame=0,lastTime=0;

  function addLine(element){
    if(element.dataset.axisDividerReady)return;
    element.dataset.axisDividerReady='true';
    element.classList.add('axis-reactive-divider');
    const svg=document.createElementNS(ns,'svg');
    svg.setAttribute('viewBox','0 0 1000 80');
    svg.setAttribute('preserveAspectRatio','none');
    svg.setAttribute('aria-hidden','true');
    svg.classList.add('axis-divider-overlay');
    const path=document.createElementNS(ns,'path');
    path.setAttribute('d','M0 40 L1000 40');
    path.setAttribute('fill','none');
    path.setAttribute('stroke','#b52e3d');
    path.setAttribute('stroke-width','2');
    path.setAttribute('vector-effect','non-scaling-stroke');
    path.setAttribute('stroke-linecap','round');
    svg.appendChild(path);
    element.insertBefore(svg,element.firstChild);
    lines.push({element,path,x:500,targetX:500,offset:0,velocity:0,impulse:0});
  }

  function mount(){
    const root=scroller.querySelector('[data-axis-detail="true"]');
    if(!root)return false;
    root.querySelectorAll('.artwork-meta,.artwork-jump-nav,.artwork-archive-section,.artwork-pagination').forEach(addLine);
    return true;
  }
  if(!mount()){
    const watcher=new MutationObserver(()=>{if(mount())watcher.disconnect();});
    watcher.observe(scroller,{subtree:true,childList:true});
  }

  function draw(line){
    const {path,x,offset}=line;
    if(Math.abs(offset)<.025){
      path.setAttribute('d','M0 40 L1000 40');return;
    }
    const sigma=62,points=80;
    let d='M0 40';
    const values=[];
    for(let i=0;i<=points;i++){
      const px=i*1000/points;
      const fade=Math.sin(Math.PI*px/1000)**2;
      const dy=offset*Math.exp(-((px-x)/sigma)**2/2)*fade;
      values.push(40+dy);
    }
    for(let i=1;i<points;i++){
      const px=i*1000/points,midX=(i+.5)*1000/points;
      const midY=(values[i]+values[i+1])/2;
      d+=' Q'+px.toFixed(1)+' '+values[i].toFixed(2)+' '+midX.toFixed(1)+' '+midY.toFixed(2);
    }
    d+=' T1000 40';
    path.setAttribute('d',d);
  }

  function tick(time){
    activeFrame=0;
    const dt=clamp(lastTime?(time-lastTime)/16.67:1,.3,1.6);
    lastTime=time;
    let moving=false;
    for(const line of lines){
      if(!line.element.isConnected)continue;
      // Movement itself injects a small impulse. The damped restoring spring
      // brings the rule back to a perfectly straight line at rest.
      line.velocity=clamp((line.velocity-line.offset*.095*dt+line.impulse)*Math.pow(.79,dt),-9,9);
      line.impulse=0;
      line.offset=clamp(line.offset+line.velocity*dt,-20,20);
      line.x+=(line.targetX-line.x)*Math.min(1,.23*dt);
      if(Math.abs(line.velocity)<.012&&Math.abs(line.offset)<.06){
        line.velocity=0;line.offset=0;
      }else moving=true;
      draw(line);
    }
    if(moving)activeFrame=requestAnimationFrame(tick);
    else lastTime=0;
  }

  let oldPointer=null;
  scroller.addEventListener('pointermove',event=>{
    if(reduced)return;
    const now=performance.now();
    const previous=oldPointer;
    oldPointer={x:event.clientX,y:event.clientY,t:now};
    const velocity=previous&&now-previous.t<200?
      Math.hypot(event.clientX-previous.x,event.clientY-previous.y):2.5;
    // A normal mouse pass is enough to trigger the reaction; no second
    // movement within a narrow SVG hit box is necessary.
    for(const line of lines){
      const rect=line.element.getBoundingClientRect();
      const y=rect.top;
      const dx=event.clientX-rect.left;
      const distance=Math.abs(event.clientY-y);
      if(dx<0||dx>rect.width||distance>40||rect.width<1)continue;
      const px=clamp(dx/rect.width*1000,0,1000);
      const impact=(1-distance/40)**1.5;
      const direction=previous&&Math.abs(event.clientY-previous.y)>.6?
        Math.sign(event.clientY-previous.y):event.clientY>=y?1:-1;
      line.targetX=px;
      // Clamp every impulse, including fast pointer jumps.
      line.impulse=clamp(line.impulse+direction*(1.2+Math.min(velocity,24)*.19)*impact,-7,7);
      if(!activeFrame)activeFrame=requestAnimationFrame(tick);
    }
  },{passive:true});
})();

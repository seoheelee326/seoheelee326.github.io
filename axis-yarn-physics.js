/* Strange Axis — stable, reactive red divider. No hanging strands or rotation. */
(() => {
  if (new URLSearchParams(location.search).get('id') !== '2019|이상한 축/도르륵,도르륵,도륵!') return;
  const scroller=document.getElementById('page-content');
  if (!scroller) return;
  const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function start(svg){
    if(svg.dataset.dividerReady)return;
    svg.dataset.dividerReady='true';
    if(reduceMotion)return;
    const path=svg.querySelector('path');
    if(!path)return;
    const count=80, base=30, width=1000;
    const points=Array.from({length:count+1},()=>({y:base,v:0}));
    let lastPointer=null, frame=0, visible=false, lastTime=0;
    const clamp=(x,min,max)=>Math.min(max,Math.max(min,x));

    function pointerMove(event){
      if(!visible)return;
      const rect=svg.getBoundingClientRect();
      if(rect.width<=0||rect.height<=0)return;
      const px=(event.clientX-rect.left)/rect.width*width;
      const py=(event.clientY-rect.top)/rect.height*60;
      if(!Number.isFinite(px)||!Number.isFinite(py))return;
      if(px<0||px>width||Math.abs(py-base)>90){
        lastPointer=null;return;
      }
      const now=performance.now();
      const prior=lastPointer;
      lastPointer={x:px,y:py,t:now};
      if(!prior||now-prior.t>140)return;
      const dx=clamp(px-prior.x,-70,70);
      const dy=clamp(py-prior.y,-70,70);
      const movement=Math.hypot(dx,dy);
      if(movement<.5)return;
      // Only deform a small portion near the cursor. All nodes stay close to
      // the straight baseline, so the line cannot spin, loop, or break.
      const direction=Math.abs(dy)>1?Math.sign(dy):Math.sign(dx)||1;
      for(let i=2;i<count-1;i++){
        const x=i*width/count;
        const distance=Math.hypot((x-px), (py-base)*1.5);
        if(distance>95)continue;
        const influence=(1-distance/95)**2;
        points[i].v=clamp(points[i].v+direction*clamp(movement*.12,0,5.5)*influence,-7,7);
      }
      if(!frame)frame=requestAnimationFrame(tick);
    }

    function tick(now){
      frame=0;
      if(!svg.isConnected){clean();return;}
      if(!visible)return;
      const dt=clamp(lastTime?(now-lastTime)/16.67:1,.25,1.5);
      lastTime=now;
      let energy=0;
      for(let i=1;i<count;i++){
        const p=points[i];
        const next=(points[i-1].y+points[i+1].y)*.5;
        // Damped springs restore the original straight line.
        p.v=(p.v+(base-p.y)*.105*dt+(next-p.y)*.09*dt)*Math.pow(.77,dt);
        p.y=clamp(p.y+p.v*dt,base-25,base+25);
        energy+=Math.abs(p.y-base)+Math.abs(p.v);
      }
      points[0].y=base;points[count].y=base;
      const pathData=['M0 '+points[0].y.toFixed(2)];
      for(let i=1;i<count;i++){
        const x=i*width/count;
        const nextX=(i+.5)*width/count;
        const midY=(points[i].y+points[i+1].y)/2;
        pathData.push('Q'+x.toFixed(2)+' '+points[i].y.toFixed(2)+' '+nextX.toFixed(2)+' '+midY.toFixed(2));
      }
      pathData.push('T1000 '+points[count].y.toFixed(2));
      path.setAttribute('d',pathData.join(' '));
      if(energy>.4)frame=requestAnimationFrame(tick);
      else {
        points.forEach(p=>{p.y=base;p.v=0;});
        path.setAttribute('d','M0 30 L1000 30');
        lastTime=0;
      }
    }
    const intersect=new IntersectionObserver(entries=>{
      visible=entries.some(e=>e.isIntersecting);
      if(!visible){lastPointer=null;if(frame)cancelAnimationFrame(frame);frame=0;lastTime=0;}
    },{root:scroller,rootMargin:'100px'});
    intersect.observe(svg);
    document.addEventListener('pointermove',pointerMove,{passive:true});
    function clean(){intersect.disconnect();document.removeEventListener('pointermove',pointerMove);}
  }

  if(!startIfReady()){
    const watch=new MutationObserver(()=>{if(startIfReady())watch.disconnect();});
    watch.observe(scroller,{childList:true,subtree:true});
  }
  function startIfReady(){
    const svg=scroller.querySelector('.axis-interactive-divider');
    if(!svg)return false;
    start(svg);return true;
  }
})();

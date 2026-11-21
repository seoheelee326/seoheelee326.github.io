/* STRANGE AXIS: Verlet textile ropes reacting to the visitor's cursor. */
(() => {
  if (new URLSearchParams(location.search).get('id') !== '2019|이상한 축/도르륵,도르륵,도륵!') return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const container = document.getElementById('page-content');
  if (!container) return;

  function start(svg) {
    if (svg.dataset.ropeReady) return;
    svg.dataset.ropeReady = 'true';
    const paths = [...svg.querySelectorAll('g > path')];
    // One physical strand for each group of decorative paths (shadow, wool, highlight).
    const strands = [[0,1,2],[3,4,5],[6,7],[8,9]].map((indices,strandIndex) => {
      const elements=indices.map(i=>paths[i]).filter(Boolean);
      const source=elements.find(e=>e.classList.contains('axis-yarn-main'))||elements[0];
      if (!source) return null;
      const length=source.getTotalLength();
      const count=Math.max(18,Math.min(46,Math.ceil(length/23)));
      const nodes=Array.from({length:count+1},(_,i)=>{
        const p=source.getPointAtLength(length*i/count);
        return {x:p.x,y:p.y,oldX:p.x,oldY:p.y,homeX:p.x,homeY:p.y,pinned:i===0||(i===count&&strandIndex!==0)};
      });
      return {elements,nodes,segment:length/count};
    }).filter(Boolean);
    if (!strands.length) return;

    let pointer={x:-1000,y:-1000,px:-1000,py:-1000,lastMove:0};
    let frame=0,lastFrame=0,visible=false;
    const viewWidth=1400,viewHeight=525;
    const constrain=(v,min,max)=>Math.max(min,Math.min(max,v));
    const onPointer=e=>{
      if(!visible)return;
      const rect=svg.getBoundingClientRect();
      if (!rect.width || !rect.height)return;
      const x=(e.clientX-rect.left)*viewWidth/rect.width;
      const y=(e.clientY-rect.top)*viewHeight/rect.height;
      pointer.px=pointer.x;
      pointer.py=pointer.y;
      if(!Number.isFinite(pointer.px)||pointer.px<0) {pointer.px=x;pointer.py=y;}
      pointer.x=x;pointer.y=y;pointer.lastMove=performance.now();
    };
    const onLeave=()=>{pointer.x=-1000;pointer.y=-1000;pointer.px=-1000;pointer.py=-1000;};
    const observer=new IntersectionObserver(entries=>{
      visible=entries.some(e=>e.isIntersecting);
      if(visible&&!frame)frame=requestAnimationFrame(draw);
      if(!visible&&frame){cancelAnimationFrame(frame);frame=0;lastFrame=0;onLeave();}
    },{root:container,rootMargin:'100px'});
    observer.observe(svg);
    document.addEventListener('pointermove',onPointer,{passive:true});
    document.addEventListener('pointerout',e=>{if(!e.relatedTarget)onLeave();},{passive:true});

    function draw(now){
      frame=0;
      if(!visible||!svg.isConnected){if(!svg.isConnected){observer.disconnect();document.removeEventListener('pointermove',onPointer);}return;}
      const elapsed=lastFrame?Math.min(34,now-lastFrame):16.67;
      lastFrame=now;
      const dt=elapsed/16.67;
      const sweep=now-pointer.lastMove<100 && pointer.x>=0;
      const moveX=constrain(pointer.x-pointer.px,-45,45);
      const moveY=constrain(pointer.y-pointer.py,-45,45);
      for (const strand of strands) {
        const a=strand.nodes;
        // Verlet: positions hold inertia. Weak home springs preserve the original
        // hand-draped shape while gravity, damping, and constraints settle motion.
        for(let i=1;i<a.length-1;i++){
          const p=a[i],vx=(p.x-p.oldX)*.945,vy=(p.y-p.oldY)*.945;
          p.oldX=p.x;p.oldY=p.y;
          const homePull=.0065;
          p.x+=vx*dt+(p.homeX-p.x)*homePull*dt*dt;
          p.y+=vy*dt+(.12+(p.homeY-p.y)*homePull)*dt*dt;
          if(sweep){
            const dx=p.x-pointer.x,dy=p.y-pointer.y;
            const d=Math.hypot(dx,dy)||.001;
            const radius=76;
            if(d<radius){
              const influence=(1-d/radius)**2;
              // Contact pushes threads aside. Pointer movement adds a soft flick.
              p.x+=(dx/d*8+moveX*.65)*influence;
              p.y+=(dy/d*8+moveY*.65)*influence;
            }
          }
        }
        // The first strand hangs free at its far end; the other three are attached\n      // to the divider line at both ends. Their anchors never move.\n      // Inextensible segments: non-elastic distance constraints for taut yarn.
        for(let pass=0;pass<6;pass++){
          for(let i=0;i<a.length-1;i++){
            const p=a[i],q=a[i+1];
            let dx=q.x-p.x,dy=q.y-p.y,dist=Math.hypot(dx,dy)||.001;
            let corr=(dist-strand.segment)/dist;
            if(p.pinned){q.x-=dx*corr;q.y-=dy*corr;}
            else if(q.pinned){p.x+=dx*corr;p.y+=dy*corr;}
            else {dx*=corr*.5;dy*=corr*.5;p.x+=dx;p.y+=dy;q.x-=dx;q.y-=dy;}
          }
        }
        // A smooth quadratic curve avoids the visual faceting of connected nodes.
        let d='M '+a[0].x.toFixed(1)+' '+a[0].y.toFixed(1);
        for(let i=1;i<a.length-1;i++){
          const midX=(a[i].x+a[i+1].x)*.5,midY=(a[i].y+a[i+1].y)*.5;
          d+=' Q '+a[i].x.toFixed(1)+' '+a[i].y.toFixed(1)+' '+midX.toFixed(1)+' '+midY.toFixed(1);
        }
        d+=' Q '+a[a.length-2].x.toFixed(1)+' '+a[a.length-2].y.toFixed(1)+' '+a[a.length-1].x.toFixed(1)+' '+a[a.length-1].y.toFixed(1);
        strand.elements.forEach(path=>path.setAttribute('d',d));
      }
      // Do not keep applying the last mouse movement in subsequent frames.
      pointer.px=pointer.x;pointer.py=pointer.y;
      frame=requestAnimationFrame(draw);
    }
  }
  const ready=()=>{
    const svg=container.querySelector('.axis-red-yarn');
    if(!svg)return false;
    start(svg);
    return true;
  };
  if(!ready()){
    const watch=new MutationObserver(()=>{if(ready())watch.disconnect();});
    watch.observe(container,{childList:true,subtree:true});
  }
})();

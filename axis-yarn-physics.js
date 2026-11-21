/* Stable, gently sagging red-line interaction for Strange Axis (2019).
   Each line is a damped spring around its original hanging curve. There is no
   accumulated rotation, free rigid body or constraint explosion. */
(() => {
  const id=new URLSearchParams(location.search).get('id');
  if(id!=='2019|이상한 축/도르륵,도르륵,도륵!')return;
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const scroller=document.getElementById('page-content');
  if(!scroller)return;
  let disposed=false;
  function mount(svg){
    if(svg.dataset.redLineReady)return;
    svg.dataset.redLineReady='true';
    const all=[...svg.querySelectorAll('g > path')];
    const groups=[[0,1,2],[3,4,5],[6,7],[8,9]];
    const strands=groups.map(indices=>{
      const elements=indices.map(i=>all[i]).filter(Boolean);
      const path=elements.find(p=>p.classList.contains('axis-yarn-main'));
      if(!path)return null;
      const len=path.getTotalLength();
      const count=Math.max(24,Math.min(48,Math.ceil(len/18)));
      const nodes=Array.from({length:count+1},(_,i)=>{
        const pt=path.getPointAtLength(len*i/count);
        return {homeX:pt.x,homeY:pt.y,x:pt.x,y:pt.y,vx:0,vy:0,
                fixed:i===0 || (indices[0]!==0 && i===count)};
      });
      return {elements,nodes};
    }).filter(Boolean);
    if(!strands.length)return;

    const pointer={x:-1e5,y:-1e5,dx:0,dy:0,last:0};
    let frame=0,active=false,lastTime=0;
    const xMax=1400,yMax=525;
    const bound=(n,lo,hi)=>Math.min(hi,Math.max(lo,n));
    const move=e=>{
      if(!active)return;
      const rect=svg.getBoundingClientRect();
      if(rect.width<=0||rect.height<=0)return;
      const nx=(e.clientX-rect.left)*xMax/rect.width;
      const ny=(e.clientY-rect.top)*yMax/rect.height;
      pointer.dx=pointer.x< -1000?0:bound(nx-pointer.x,-40,40);
      pointer.dy=pointer.y< -1000?0:bound(ny-pointer.y,-40,40);
      pointer.x=nx;pointer.y=ny;pointer.last=performance.now();
    };
    const resetPointer=()=>{pointer.x=-1e5;pointer.y=-1e5;pointer.dx=0;pointer.dy=0;};
    document.addEventListener('pointermove',move,{passive:true});
    const watch=new IntersectionObserver(entries=>{
      active=entries.some(e=>e.isIntersecting);
      if(active && !frame){lastTime=0;frame=requestAnimationFrame(tick);}
      else if(!active && frame){cancelAnimationFrame(frame);frame=0;lastTime=0;resetPointer();}
    },{root:scroller,rootMargin:'100px'});
    watch.observe(svg);

    function tick(t){
      frame=0;
      if(!svg.isConnected){
        if(!disposed){watch.disconnect();document.removeEventListener('pointermove',move);disposed=true;}
        return;
      }
      if(!active)return;
      const dt=bound(lastTime?(t-lastTime)/16.667:1,.25,1.5);
      lastTime=t;
      const touching=t-pointer.last<110 && Math.hypot(pointer.dx,pointer.dy)>0.35;
      for(const strand of strands){
        const a=strand.nodes;
        for(let i=0;i<a.length;i++){
          const p=a[i];
          if(p.fixed){p.x=p.homeX;p.y=p.homeY;p.vx=0;p.vy=0;continue;}
          // Bounded impulse only from the current mouse sweep, not while idle.
          if(touching){
            const dx=p.x-pointer.x,dy=p.y-pointer.y;
            const distance=Math.hypot(dx,dy);
            const radius=92;
            if(distance<radius){
              const f=(1-distance/radius)**2;
              p.vx+=bound((dx/(distance||1))*1.8+pointer.dx*.30,-6,6)*f;
              p.vy+=bound((dy/(distance||1))*1.8+pointer.dy*.30,-6,6)*f;
            }
          }
          // Critically damped spring around the original downward-hanging line.
          // No neighbour impulses or angle integration: cannot whirl or fold over.
          p.vx=(p.vx+(p.homeX-p.x)*.042*dt)*Math.pow(.81,dt);
          p.vy=(p.vy+(p.homeY-p.y)*.042*dt)*Math.pow(.81,dt);
          p.x=bound(p.x+p.vx*dt,p.homeX-52,p.homeX+52);
          p.y=bound(p.y+p.vy*dt,p.homeY-48,p.homeY+48);
        }
        // Smooth interpolation through the original hanging profile.
        let d='M'+a[0].x.toFixed(2)+' '+a[0].y.toFixed(2);
        for(let i=1;i<a.length-1;i++){
          const p=a[i],q=a[i+1];
          d+=' Q'+p.x.toFixed(2)+' '+p.y.toFixed(2)+' '+((p.x+q.x)*.5).toFixed(2)+' '+((p.y+q.y)*.5).toFixed(2);
        }
        const end=a[a.length-1];
        d+=' T'+end.x.toFixed(2)+' '+end.y.toFixed(2);
        strand.elements.forEach(path=>path.setAttribute('d',d));
      }
      pointer.dx=0;pointer.dy=0;
      frame=requestAnimationFrame(tick);
    }
  }
  const tryMount=()=>{
    const svg=scroller.querySelector('.axis-red-yarn');
    if(!svg)return false;
    mount(svg);return true;
  };
  if(!tryMount()){
    const pending=new MutationObserver(()=>{if(tryMount())pending.disconnect();});
    pending.observe(scroller,{subtree:true,childList:true});
  }
})();

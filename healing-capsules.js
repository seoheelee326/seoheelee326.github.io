/* Interactive capsule rain, only for FROM DAY TO DAY_힐링 (2017). */
(() => {
  const params = new URLSearchParams(location.search);
  if (params.get('id') !== '2017|FROM DAY TO DAY_힐링') return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) return;
  const canvas = document.createElement('canvas');
  canvas.className = 'healing-capsule-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  const clear = document.createElement('button');
  clear.type = 'button';
  clear.className = 'healing-clear';
  clear.textContent = 'CLEAR  ×';
  clear.setAttribute('aria-label', 'Clear the falling capsules');
  document.body.append(canvas, clear);
  const ctx = canvas.getContext('2d');
  if (!ctx) { canvas.remove(); clear.remove(); return; }
  const pointer = {x:-999,y:-999,px:-999,py:-999,active:false,energy:0};
  const palettes = [
    [239,79,64],[246,193,54],[58,163,132],
    [62,157,210],[169,126,206],[231,147,60],[197,222,209]
  ];
  let seed=2017;
  const rand=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);
  let w=0,h=0,dpr=1,balls=[],raf=0,elapsed=0,scrolled=false,last=0,clearing=false;
  const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
  function resize(){
    w=innerWidth;h=innerHeight;dpr=Math.min(devicePixelRatio||1,2);
    canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);
    canvas.style.width=w+'px';canvas.style.height=h+'px';
    ctx.setTransform(dpr,0,0,dpr,0,0);
    if(balls.length) for(const p of balls) {p.x=clamp(p.x,p.r,w-p.r);p.y=Math.min(p.y,h-p.r);}
  }
  function spawn(){
    // Slow cascade rather than fast, chaotic rain. Natural accumulation fills the lower view.
    const number=clamp(Math.round(w*h/4800),85,205);
    const radiusScale=clamp(w/1000,.70,1.10);
    balls=Array.from({length:number},(_,i)=>{
      const r=(21+rand()*10)*radiusScale;
      return {x:r+rand()*Math.max(1,w-2*r),
        y:-r-15-rand()*h*.55-i*.65,
        vx:(rand()-.5)*.40,vy:0,r,angle:rand()*Math.PI,
        spin:(rand()-.5)*.002,color:palettes[Math.floor(rand()*palettes.length)],
        opacity:1,cleared:false,rest:0,asleep:false,contact:false};
    });
  }
  const frameImage=(p)=>{
    const r=p.r,[rr,gg,bb]=p.color;
    ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.angle);
    // Light, translucent plastic capsule with colored half and a clear lid.
    ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.clip();
    const glass=ctx.createRadialGradient(-r*.33,-r*.43,r*.08,0,0,r*1.25);
    glass.addColorStop(0,'rgba(255,255,255,.63)');
    glass.addColorStop(.65,'rgba(246,248,248,.22)');
    glass.addColorStop(1,'rgba(210,215,218,.25)');
    ctx.fillStyle=glass;ctx.fillRect(-r,-r,2*r,2*r);
    ctx.beginPath();ctx.rect(-r,0,r*2,r);
    ctx.fillStyle='rgba('+rr+','+gg+','+bb+',.57)';ctx.fill();
    ctx.beginPath();ctx.moveTo(-r,0);ctx.lineTo(r,0);
    ctx.strokeStyle='rgba(255,255,255,.68)';ctx.lineWidth=2.4;ctx.stroke();
    ctx.beginPath();ctx.arc(0,0,r-1.3,0,Math.PI*2);
    ctx.strokeStyle='rgba(105,112,111,.36)';ctx.lineWidth=1.5;ctx.stroke();
    ctx.beginPath();ctx.ellipse(-r*.32,-r*.44,r*.17,r*.34,-.68,0,Math.PI*2);
    ctx.fillStyle='rgba(255,255,255,.6)';ctx.fill();
    ctx.restore();
  };
  function advance(dt){
    // Fixed-step-like semi-implicit integration: low restitution and strong tangential
    // friction remove collision energy. A quiet contact enters a sleeping state.
    const gravity=.095, terminalSpeed=3.05, restitution=.075, floorY=h-8;
    const pointerMoving=pointer.active && pointer.energy>1.35 && !clearing && !scrolled;
    const pointerRadius=82;
    for(const p of balls){
      if(p.opacity<=0)continue;
      if(p.cleared||clearing||scrolled){
        if(!p.cleared){p.cleared=true;p.vy=-.7;}
        p.opacity=Math.max(0,p.opacity-.022*dt);
        p.vx*=Math.pow(.91,dt);
        p.vy=(p.vy-.015*dt)*Math.pow(.95,dt);
        p.x+=p.vx*dt;p.y+=p.vy*dt;
        continue;
      }
      p.contact=false;
      if(pointerMoving){
        const dx=p.x-pointer.x,dy=p.y-pointer.y;
        const dist=Math.hypot(dx,dy)||.0001;
        if(dist<pointerRadius+p.r){
          // No constant force from a stationary pointer; only an intentional sweep.
          const strength=1-dist/(pointerRadius+p.r);
          const moveX=pointer.x-pointer.px,moveY=pointer.y-pointer.py;
          p.vx+=clamp(moveX*.25,-2.8,2.8)*strength+(dx/dist)*.22;
          p.vy+=clamp(moveY*.18,-2,2)*strength+(dy/dist)*.2;
          p.asleep=false;p.rest=0;
          if(dist<p.r+14 && pointer.energy>4){
            p.cleared=true;p.vy=-.6;p.vx*=.5;
          }
        }
      }
      if(p.asleep)continue;
      p.vy=Math.min(terminalSpeed,p.vy+gravity*dt);
      p.vx*=Math.pow(.976,dt);
      p.vy*=Math.pow(.995,dt);
      p.x+=p.vx*dt;p.y+=p.vy*dt;
      p.spin*=Math.pow(.98,dt);
      p.angle+=p.spin*dt;
      if(p.x<p.r){p.x=p.r;p.vx=Math.abs(p.vx)*restitution;p.vy*=.94;p.contact=true;}
      if(p.x>w-p.r){p.x=w-p.r;p.vx=-Math.abs(p.vx)*restitution;p.vy*=.94;p.contact=true;}
    }
    // Multiple positional constraint passes allow a pile to become stable,
    // rather than repeatedly injecting energy into overlapping capsules.
    for(let pass=0;pass<4;pass++){
      const cell=76,grid=new Map();
      for(let i=0;i<balls.length;i++){
        const p=balls[i];if(p.cleared||p.opacity<=0||p.y<-70)continue;
        if(p.y+p.r>floorY){
          p.y=floorY-p.r;p.contact=true;
          if(p.vy>0)p.vy=-p.vy*restitution;
          p.vx*=.76;
          if(Math.abs(p.vy)<.32)p.vy=0;
        }
        const gx=Math.floor(p.x/cell),gy=Math.floor(p.y/cell);
        for(let ix=-1;ix<=1;ix++)for(let iy=-1;iy<=1;iy++){
          const neighbors=grid.get((gx+ix)+','+(gy+iy));
          if(!neighbors)continue;
          for(const j of neighbors){
            const q=balls[j],dx=p.x-q.x,dy=p.y-q.y;
            const limit=p.r+q.r;
            const distance=Math.hypot(dx,dy);
            if(distance>=limit || distance===0)continue;
            const nx=dx/distance,ny=dy/distance;
            // Slop avoids endless micro-adjustments when stacked.
            const overlap=Math.max(0,limit-distance-.20);
            if(overlap===0)continue;
            const displacement=overlap*.49;
            p.x+=nx*displacement;p.y+=ny*displacement;
            q.x-=nx*displacement;q.y-=ny*displacement;
            if(ny<-.30)p.contact=true;
            if(ny>.30)q.contact=true;
            // Normal impulse for an inelastic collision, plus Coulomb-like friction.
            if(pass===0){
              const rvx=p.vx-q.vx,rvy=p.vy-q.vy,normal=rvx*nx+rvy*ny;
              if(normal<0){
                const impulse=-(1+restitution)*normal*.5;
                p.vx+=impulse*nx;p.vy+=impulse*ny;
                q.vx-=impulse*nx;q.vy-=impulse*ny;
                const tangentX=-ny,tangentY=nx;
                const slip=rvx*tangentX+rvy*tangentY;
                const friction=clamp(-slip*.24,-Math.abs(impulse)*.55,Math.abs(impulse)*.55);
                p.vx+=friction*tangentX;p.vy+=friction*tangentY;
                q.vx-=friction*tangentX;q.vy-=friction*tangentY;
                if(Math.abs(normal)>.50){p.asleep=false;q.asleep=false;p.rest=0;q.rest=0;}
              }
            }
          }
        }
        const key=gx+','+gy;
        if(!grid.has(key))grid.set(key,[]);
        grid.get(key).push(i);
      }
    }
    for(const p of balls){
      if(p.cleared||p.opacity<=0)continue;
      p.x=clamp(p.x,p.r,w-p.r);
      if(p.y+p.r>=floorY-.7){p.y=Math.min(p.y,floorY-p.r);p.contact=true;}
      // Contact velocity damping and sleep suppress sub-pixel jitter.
      if(p.contact){
        p.vx*=.74;p.vy*=.52;
        const speed=Math.hypot(p.vx,p.vy);
        p.rest=speed<.32?p.rest+dt:0;
        if(p.rest>25){p.vx=0;p.vy=0;p.spin=0;p.asleep=true;}
      }else{p.rest=0;p.asleep=false;}
    }
  }
  function tick(now){
    const dt=clamp(last?(now-last)/16.67:1,.35,1.5);last=now;
    ctx.clearRect(0,0,w,h);
    advance(dt);
    for(const p of balls){
      if(p.opacity<=0||p.y+p.r<0||p.y-p.r>h)continue;
      ctx.globalAlpha=p.opacity*.86;frameImage(p);
    }
    ctx.globalAlpha=1;
    pointer.px=pointer.x;pointer.py=pointer.y;
    pointer.energy*=.65;
    elapsed+=dt;
    if(balls.some(p=>p.opacity>0)){
      raf=requestAnimationFrame(tick);
    }else{
      canvas.remove();clear.remove();window.removeEventListener('pointermove',onPointer);
      window.removeEventListener('pointerdown',onTouch);window.removeEventListener('keydown',onKey);
      window.removeEventListener('resize',resize);document.querySelector('.page-content')?.removeEventListener('scroll',onScroll);
    }
  }
  function onPointer(e){
    pointer.energy=Math.hypot(e.clientX-pointer.x,e.clientY-pointer.y);
    if(!pointer.active){pointer.px=e.clientX;pointer.py=e.clientY;}
    pointer.x=e.clientX;pointer.y=e.clientY;pointer.active=true;
  }
  function onTouch(e){onPointer(e);pointer.energy=30;}
  function onKey(e){if(e.key==='Escape')clearAll();}
  function clearAll(){clearing=true;clear.style.opacity='0';clear.style.pointerEvents='none';}
  function onScroll(e){if(e.target.scrollTop>115){scrolled=true;clearAll();}}
  clear.addEventListener('click',clearAll);
  window.addEventListener('pointermove',onPointer,{passive:true});
  window.addEventListener('pointerdown',onTouch,{passive:true});
  window.addEventListener('keydown',onKey);
  window.addEventListener('resize',resize,{passive:true});
  document.querySelector('.page-content')?.addEventListener('scroll',onScroll,{passive:true});
  resize();spawn();raf=requestAnimationFrame(tick);
})();

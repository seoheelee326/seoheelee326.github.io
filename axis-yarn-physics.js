/* Strange Axis (2019) — visible by default, gently reactive red dividers. */
(() => {
  const target='2019|이상한 축/도르륵,도르륵,도륵!';
  if(new URLSearchParams(window.location.search).get('id')!==target)return;
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;

  const main=document.getElementById('page-content');
  if(!main)return;
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const count=48;
  let last=null,raf=0;
  const states=new Map();

  function stateFor(svg){
    let s=states.get(svg);
    if(!s){
      s={svg,path:svg.querySelector('path'),center:500,amplitude:0,velocity:0,target:500};
      states.set(svg,s);
    }
    return s;
  }
  function paint(s){
    const a=s.amplitude,x=s.center,parts=['M0 40'];
    for(let i=1;i<count;i++){
      const px=i*1000/count;
      const distance=(px-x)/90;
      const bell=Math.exp(-.5*distance*distance);
      const edge=Math.sin(Math.PI*px/1000)**2;
      const y=40+a*bell*edge;
      parts.push('L'+px.toFixed(1)+' '+y.toFixed(2));
    }
    parts.push('L1000 40');
    s.path.setAttribute('d',parts.join(' '));
  }
  function tick(){
    raf=0;
    let moving=false;
    for(const [svg,s] of states){
      if(!svg.isConnected){states.delete(svg);continue;}
      s.velocity=(s.velocity-s.amplitude*.105)*.77;
      s.amplitude=clamp(s.amplitude+s.velocity,-22,22);
      s.center+=(s.target-s.center)*.2;
      if(Math.abs(s.amplitude)<.04 && Math.abs(s.velocity)<.03){
        s.amplitude=0;s.velocity=0;
        s.path.setAttribute('d','M0 40 L1000 40');
      }else{paint(s);moving=true;}
    }
    if(moving)raf=requestAnimationFrame(tick);
  }
  main.addEventListener('pointermove',event=>{
    const root=main.querySelector('[data-axis-detail="true"]');
    if(!root)return;
    const now=performance.now();
    const previous=last;
    last={x:event.clientX,y:event.clientY,time:now};
    for(const svg of root.querySelectorAll('.axis-divider-overlay')){
      const rect=svg.getBoundingClientRect();
      if(rect.width<1)continue;
      const x=(event.clientX-rect.left)/rect.width*1000;
      const proximity=Math.abs(event.clientY-(rect.top+rect.height/2));
      if(x<0||x>1000||proximity>48)continue;
      const s=stateFor(svg);
      if(!s.path)continue;
      const vertical=previous&&now-previous.time<200?event.clientY-previous.y:0;
      const direction=Math.abs(vertical)>.6?Math.sign(vertical):(event.clientY>=rect.top+rect.height/2?1:-1);
      const impact=(1-proximity/48)**2;
      s.target=x;
      s.velocity=clamp(s.velocity+direction*(2.2+Math.min(12,Math.abs(vertical))*.23)*impact,-7,7);
      if(!raf)raf=requestAnimationFrame(tick);
    }
  },{passive:true});
})();

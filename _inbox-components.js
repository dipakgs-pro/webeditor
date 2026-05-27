// _inbox-components.js — all React components for gallabox-web-inbox
// Requires: _inbox-data.js (tokens, React shorthands, data) and _inbox-icons.js (icon fns)
// Does NOT include App (in inline script) or icon functions (in _inbox-icons.js)

// STATUS PILL
function StatusPill(p){
  var s=ST[p.status]||ST.Dropped;
  return ce('div',{style:{display:'inline-flex',alignItems:'center',gap:4,background:s.bg,borderRadius:20,padding:'2px 7px',fontSize:10.5,fontWeight:700,color:s.cl,flexShrink:0}},
    ce('div',{style:{width:5,height:5,borderRadius:'50%',background:s.dot,flexShrink:0,animation:s.pulse?'glow 2s ease-in-out infinite':'none'}}),p.status);
}

// WEB CHAT OVERLAY
function WebChatOverlay(p){
  var sess=p.session,onClose=p.onClose;
  var ts=useState('log'),tab=ts[0],setTab=ts[1];
  var msgs=sess.id==='s1'?WEB_MSGS:WEB_MSGS.slice(0,6);
  return ce('div',{style:{position:'absolute',inset:0,zIndex:40,display:'flex',flexDirection:'column',background:'#fff',animation:'slideR .24s cubic-bezier(.34,1.1,.64,1)'}},
    ce('div',{style:{flexShrink:0,borderBottom:'1px solid #F1F5F9'}},
      ce('div',{style:{display:'flex',alignItems:'center',gap:8,padding:'11px 14px 9px'}},
        ce('div',{style:{width:28,height:28,borderRadius:8,flexShrink:0,background:TBGL,border:'1px solid '+TRING,display:'flex',alignItems:'center',justifyContent:'center'}},ce(GlobeI,{sz:13,cl:TEAL})),
        ce('div',{style:{flex:1,minWidth:0}},
          ce('div',{style:{fontSize:13,fontWeight:700,color:'#0F172A',marginBottom:1}},'Web Session'),
          ce('div',{className:'ell',style:{fontSize:10,color:'#94A3B8'}},'S ID: '+sess.sessionId)),
        ce('button',{onClick:onClose,style:{width:28,height:28,borderRadius:7,border:'1px solid #E2E8F0',background:'#F8FAFC',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0},
          onMouseEnter:function(e){e.currentTarget.style.background='#F1F5F9';},onMouseLeave:function(e){e.currentTarget.style.background='#F8FAFC';}},ce(XI,{sz:11,cl:'#64748B'}))),
      ce('div',{style:{display:'flex',alignItems:'center',gap:7,padding:'0 14px 9px',flexWrap:'wrap'}},
        ce(StatusPill,{status:sess.status}),
        ce('div',{style:{display:'flex',alignItems:'center',gap:3}},ce(ClockI,{sz:9,cl:'#94A3B8'}),ce('span',{style:{fontSize:10.5,color:'#64748B'}},sess.startedAt)),
        sess.msgCount?ce('div',{style:{display:'flex',alignItems:'center',gap:3}},ce(MsgI,{sz:9,cl:'#94A3B8'}),ce('span',{style:{fontSize:10.5,color:'#64748B'}},sess.msgCount+' msgs')):null,
      ce('div',{style:{display:'flex',padding:'0 14px',marginBottom:'-1px'}},
        [['log','Chat Log'],['analyze','Analyze']].map(function(item){
          return ce('button',{key:item[0],onClick:function(){setTab(item[0]);},style:{padding:'6px 13px',background:'transparent',border:'none',borderBottom:tab===item[0]?'2px solid '+TEAL:'2px solid transparent',cursor:'pointer',fontFamily:'inherit',fontSize:12,fontWeight:600,color:tab===item[0]?TEAL:'#94A3B8',transition:'color .12s,border-color .12s'}},item[1]);
        }))),
    tab==='log'
      ?ce('div',{style:{flex:1,overflowY:'auto',padding:'10px 14px',background:'#F8FAFC'}},
          msgs.map(function(m){
            var isIn=m.who==='in';
            if(m.btns){return ce('div',{key:m.id,style:{marginBottom:9}},
              ce('div',{style:{background:'#fff',border:'1px solid #E2E8F0',borderRadius:'9px 9px 9px 3px',padding:'7px 10px',fontSize:11.5,color:'#334155',marginBottom:4,maxWidth:'90%'}},m.text),
              ce('div',{style:{display:'flex',flexWrap:'wrap',gap:4}},m.btns.map(function(b){return ce('div',{key:b,style:{padding:'3px 9px',border:'1.5px solid '+TEAL,borderRadius:16,fontSize:10.5,color:TEAL,fontWeight:600,background:'#fff'}},b);})),
              ce('div',{style:{fontSize:9.5,color:'#CBD5E1',marginTop:3}},m.time));}
            return ce('div',{key:m.id,style:{display:'flex',flexDirection:'column',alignItems:isIn?'flex-end':'flex-start',marginBottom:7}},
              ce('div',{style:{maxWidth:'85%',background:isIn?TEAL:'#fff',color:isIn?'#fff':'#334155',borderRadius:isIn?'9px 9px 3px 9px':'9px 9px 9px 3px',padding:'7px 10px',fontSize:11.5,lineHeight:1.5,border:!isIn?'1px solid #E2E8F0':'none'}},m.text),
              ce('div',{style:{fontSize:9.5,color:'#CBD5E1',marginTop:2,paddingLeft:!isIn?2:0,paddingRight:isIn?2:0}},m.time));
          }))
      :ce('div',{style:{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'28px',textAlign:'center',background:'#fff'}},
          ce('div',{style:{fontSize:10,fontWeight:800,color:'#94A3B8',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:10}},'Lead Context · Agent only'),
          ce('div',{style:{fontSize:32,marginBottom:8}},'🤖'),
          ce('div',{style:{fontSize:13,fontWeight:700,color:'#334155',marginBottom:5}},sess.status==='Live'?'Session still active':'Analysis ready'),
          ce('div',{style:{fontSize:11.5,color:'#94A3B8',lineHeight:1.6}},sess.status==='Live'?'Insights appear after the session ends.':'Enable AI Insights on your plan.'),
          ce('div',{style:{marginTop:14,padding:'10px 12px',background:'#FAF5FF',border:'1px solid #E9D5FF',borderRadius:8,borderLeft:'3px solid #7C3AED'}},
            ce('div',{style:{fontSize:9.5,fontWeight:800,color:'#7C3AED',textTransform:'uppercase',letterSpacing:.5,marginBottom:5}},'☑ Architecture note'),
            ce('div',{style:{fontSize:11.5,color:'#6B21A8',lineHeight:1.6}},'Web context is a log, not a new conversation. No WhatsApp conversation is opened. Context is appended to the contact record and injected into the active thread on resolve.'),
            ce('div',{style:{fontSize:10,color:'#A78BFA',marginTop:6,fontWeight:600}},'Backlog → Web editor settings: “Inject to channel” — configure target inbox per web agent')
))));
}
// CONV ROW
function ConvRow(p){
  var c=p.conv,active=p.active,onClick=p.onClick;
  function ChanDot(){
    return c.ch==='web'
      ?ce('div',{style:{width:15,height:15,borderRadius:'50%',background:TBGL,border:'1px solid '+TRING,display:'flex',alignItems:'center',justifyContent:'center'}},ce(GlobeI,{sz:8,cl:TEAL}))
      :ce('div',{style:{width:15,height:15,borderRadius:'50%',background:'#F0FDF4',display:'flex',alignItems:'center',justifyContent:'center'}},ce(WaI,{sz:8,cl:WAG}));
  }
  return ce('div',{onClick:onClick,style:{display:'flex',alignItems:'center',gap:9,padding:'9px 10px',cursor:'pointer',borderBottom:'1px solid #F8FAFC',background:active?'#EEF4FF':'#fff',borderLeft:active?'3px solid '+GB:'3px solid transparent',transition:'background .1s'},
    onMouseEnter:function(e){if(!active)e.currentTarget.style.background='#F8FAFC';},
    onMouseLeave:function(e){if(!active)e.currentTarget.style.background=active?'#EEF4FF':'#fff';}},
    ce('div',{style:{width:36,height:36,borderRadius:'50%',flexShrink:0,background:active?c.color:'#E2E8F0',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,color:active?'#fff':'#6B7280',position:'relative'}},
      c.ini,ce('div',{style:{position:'absolute',bottom:-1,right:-1}},ce(ChanDot,null))),
    ce('div',{style:{flex:1,minWidth:0}},
      ce('div',{style:{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:2}},
        ce('span',{className:'ell',style:{fontSize:12.5,fontWeight:active?700:500,color:'#0F172A',maxWidth:118}},c.name),
        ce('span',{style:{fontSize:10,color:'#94A3B8',flexShrink:0}},c.time)),
      ce('div',{style:{display:'flex',alignItems:'center',justifyContent:'space-between'}},
        ce('span',{className:'ell',style:{fontSize:11,color:'#94A3B8',maxWidth:120}},c.preview),
        ce('div',{style:{display:'flex',alignItems:'center',gap:3,flexShrink:0}},
          c.webN>0?ce('div',{title:c.webN+' web session'+(c.webN>1?'s':''),style:{display:'flex',alignItems:'center',gap:2,padding:'1px 4px',borderRadius:6,background:TBGL,border:'1px solid '+TRING}},ce(GlobeI,{sz:7,cl:TEAL}),ce('span',{style:{fontSize:9,fontWeight:700,color:TEAL}},c.webN)):null,
          c.unread>0?ce('div',{style:{width:17,height:17,borderRadius:'50%',background:'#22C55E',display:'flex',alignItems:'center',justifyContent:'center',fontSize:9.5,fontWeight:700,color:'#fff'}},c.unread):null))));
}

// CONV LIST
function ConvList(p){
  var activeId=p.activeId,onSelect=p.onSelect,vcPanel=p.vcPanel,setVcPanel=p.setVcPanel;
  var fs=useState('Unassigned'),activeFilter=fs[0],setFilter=fs[1];
  var vs=useState(null),activeView=vs[0],setView=vs[1];
  var FILTERS=[
    {label:'Unassigned',count:81},{label:'Assigned to me',count:3},
    {label:'Mentions',count:null},{label:'Pinned',count:null},
    {label:'Open',count:null},{label:'Resolved',count:null},{label:'Incoming Calls',count:null}
  ];
  return ce('div',{style:{width:246,flexShrink:0,borderRight:'1px solid #E2E8F0',display:'flex',flexDirection:'column',background:'#fff',overflow:'hidden'}},
    ce('div',{style:{padding:'10px 12px 8px',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:'1px solid #F8FAFC',flexShrink:0}},
      ce('div',{style:{display:'flex',alignItems:'center',gap:6}},
        ce('button',{style:{width:24,height:24,border:'none',background:'transparent',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',borderRadius:4,color:'#64748B',fontSize:14}},'◧'),
        ce('span',{style:{fontSize:13,fontWeight:700,color:'#1E293B'}},'Unassigned')),
      ce('div',{style:{display:'flex',gap:4}},
        ce('button',{style:{width:26,height:26,border:'1px solid #E2E8F0',borderRadius:6,background:'#fff',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}},ce(SearchI,{sz:12})),
        ce('button',{style:{width:26,height:26,border:'1px solid #E2E8F0',borderRadius:6,background:'#fff',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}},ce(FilterI,{sz:12})),
        ce('button',{style:{width:26,height:26,border:'1px solid #E2E8F0',borderRadius:6,background:'#fff',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12}},'⊞'))),
    ce('div',{style:{flex:1,overflowY:'auto'}},
      ce('div',{style:{padding:'6px 8px 2px'}},
        ce('div',{style:{fontSize:10,fontWeight:800,color:'#94A3B8',textTransform:'uppercase',letterSpacing:.7,padding:'2px 6px 4px'}},'CONVERSATIONS'),
        FILTERS.map(function(f){
          var isA=activeFilter===f.label;
          return ce('div',{key:f.label,onClick:function(){setFilter(f.label);setView(null);},style:{display:'flex',alignItems:'center',gap:7,padding:'5px 7px',borderRadius:6,marginBottom:1,cursor:'pointer',background:isA?GBL:'transparent',transition:'background .1s'},
            onMouseEnter:function(e){if(!isA)e.currentTarget.style.background='#F8FAFC';},
            onMouseLeave:function(e){if(!isA)e.currentTarget.style.background=isA?GBL:'transparent';}},
            ce('span',{style:{fontSize:12.5,flex:1,fontWeight:isA?600:400,color:isA?GB:'#334155'}},f.label),
            f.count?ce('span',{style:{fontSize:9.5,fontWeight:700,padding:'1px 6px',borderRadius:10,background:isA?GB:'#E2E8F0',color:isA?'#fff':'#64748B'}},f.count):null);
        })),
      ce('div',{style:{height:1,background:'#F1F5F9',margin:'2px 8px'}}),
      CONVS.map(function(c){return ce(ConvRow,{key:c.id,conv:c,active:c.id===activeId,onClick:function(){onSelect(c.id);setView(null);setVcPanel(null);}});}),
      ce('div',{style:{padding:'4px 8px 4px'}},
        ce('div',{style:{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'5px 6px 3px'}},
          ce('span',{style:{fontSize:10,fontWeight:800,color:'#94A3B8',textTransform:'uppercase',letterSpacing:.7}},'VIEWS'),
          ce('button',{style:{width:18,height:18,border:'none',background:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}},ce(PlusI,{sz:10,cl:'#94A3B8'}))),
        VIEWS_DATA.map(function(v){
          var isA=activeView===v.id;
          return ce('div',{key:v.id},
            ce('div',{onClick:function(){setView(isA?null:v.id);},style:{display:'flex',alignItems:'center',gap:6,padding:'4px 6px',borderRadius:6,cursor:'pointer',fontSize:12,color:isA?GB:'#475569',fontWeight:isA?600:400,background:isA?GBL:'transparent',transition:'all .1s'},
              onMouseEnter:function(e){if(!isA)e.currentTarget.style.background='#F8FAFC';},
              onMouseLeave:function(e){if(!isA)e.currentTarget.style.background=isA?GBL:'transparent';}},
              ce('span',{style:{color:v.emoji==='\u26a1'?'#F59E0B':'#EC4899',fontSize:12}},v.emoji),
              ce('span',{className:'ell',style:{flex:1,maxWidth:140}},v.name),
              v.warn?ce('span',{style:{fontSize:10,color:'#F59E0B'}},' \u26a0'):null,
              v.contacts.length>0?ce('span',{style:{fontSize:9,color:'#94A3B8',flexShrink:0}},v.contacts.length):null),
            isA&&v.contacts.length>0?ce('div',{style:{padding:'2px 0 4px 18px',animation:'fadeIn .15s ease'}},
              v.contacts.map(function(c){
                return ce('div',{key:c.id,onClick:function(e){e.stopPropagation();setVcPanel(vcPanel&&vcPanel.id===c.id?null:c);},style:{display:'flex',alignItems:'center',gap:6,padding:'4px 6px',borderRadius:5,cursor:'pointer',transition:'background .1s'},
                  onMouseEnter:function(e){e.currentTarget.style.background='#F8FAFC';},
                  onMouseLeave:function(e){e.currentTarget.style.background='transparent';}},
                  ce('div',{style:{width:20,height:20,borderRadius:'50%',background:c.color||GB,display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,fontWeight:700,color:'#fff',flexShrink:0}},c.ini),
                  ce('span',{className:'ell',style:{fontSize:11.5,color:'#334155',flex:1,maxWidth:110}},c.name),
                  c.webN>0?ce('div',{style:{display:'flex',alignItems:'center',gap:2,padding:'1px 4px',borderRadius:5,background:TBGL,border:'1px solid '+TRING}},ce(GlobeI,{sz:7,cl:TEAL}),ce('span',{style:{fontSize:8.5,fontWeight:700,color:TEAL}},c.webN)):null);
              })):null);
        }))),
    ce('div',{style:{padding:'8px 12px',borderTop:'1px solid #F1F5F9',flexShrink:0}},
      ce('button',{style:{width:'100%',padding:'7px',background:GB,color:'#fff',border:'none',borderRadius:8,cursor:'pointer',fontFamily:'inherit',fontSize:12.5,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center',gap:5,transition:'opacity .12s',boxShadow:'0 1px 4px rgba(27,88,227,.28)'},
        onMouseEnter:function(e){e.currentTarget.style.opacity='.88';},onMouseLeave:function(e){e.currentTarget.style.opacity='1';}},
        ce(PlusI,{sz:13,cl:'#fff'}),' New')));
}

// VIEW CONTACT PANEL
function ViewContactPanel(p){
  var c=p.contact,onClose=p.onClose;
  return ce('div',{style:{width:220,flexShrink:0,borderRight:'1px solid #E2E8F0',background:'#FAFAFA',display:'flex',flexDirection:'column',animation:'slideL .2s ease',overflow:'hidden'}},
    ce('div',{style:{padding:'10px 12px 8px',borderBottom:'1px solid #F1F5F9',display:'flex',alignItems:'center',justifyContent:'space-between'}},
      ce('span',{style:{fontSize:11,fontWeight:700,color:'#1E293B'}},'Contact'),
      ce('button',{onClick:onClose,style:{background:'none',border:'none',cursor:'pointer',width:22,height:22,borderRadius:5,display:'flex',alignItems:'center',justifyContent:'center'}},ce(XI,{sz:11,cl:'#94A3B8'}))),
    ce('div',{style:{padding:'14px 12px',flex:1,overflowY:'auto'}},
      ce('div',{style:{display:'flex',flexDirection:'column',alignItems:'center',marginBottom:14}},
        ce('div',{style:{width:46,height:46,borderRadius:'50%',background:c.color||GB,display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,fontWeight:700,color:'#fff',marginBottom:7}},c.ini),
        ce('div',{style:{fontSize:13,fontWeight:700,color:'#1E293B',textAlign:'center',marginBottom:2}},c.name),
        ce('div',{style:{fontSize:11,color:'#94A3B8'}},'WhatsApp')),
      ce('div',{style:{marginBottom:10}},
        ce('div',{style:{fontSize:9.5,color:'#94A3B8',marginBottom:2,textTransform:'uppercase',letterSpacing:.4}},'Phone'),
        ce('div',{style:{fontSize:12,color:'#334155',fontWeight:500}},'+91 80121 44822')),
      c.webN>0?ce('div',{style:{padding:'8px 10px',background:TBGL,border:'1px solid '+TRING,borderRadius:8,marginBottom:10}},
        ce('div',{style:{display:'flex',alignItems:'center',gap:5,marginBottom:3}},ce(GlobeI,{sz:10,cl:TEAL}),ce('span',{style:{fontSize:10.5,fontWeight:700,color:TEAL}},c.webN+' web session'+(c.webN>1?'s':''))),
        ce('div',{style:{fontSize:10,color:'#64748B'}},'Open conversation to see context')):null,
      ce('button',{style:{width:'100%',padding:'8px',background:GB,color:'#fff',border:'none',borderRadius:7,cursor:'pointer',fontFamily:'inherit',fontSize:12,fontWeight:700,transition:'opacity .12s'},
        onMouseEnter:function(e){e.currentTarget.style.opacity='.85';},onMouseLeave:function(e){e.currentTarget.style.opacity='1';}},'Open conversation')));
}

// RIGHT PANEL
function RightPanel(p){
  var sessions=p.sessions,overlayOpen=p.overlayOpen,overlaySess=p.overlaySess,onClose=p.onClose;
  var as=useState(true),aiOpen=as[0],setAi=as[1];
  var cs=useState(true),capOpen=cs[0],setCap=cs[1];
  var ps=useState(true),plOpen=ps[0],setPl=ps[1];
  var ss=useState(true),srcOpen=ss[0],setSrc=ss[1];
  var capturedSession=null;
  for(var i=0;i<sessions.length;i++){if(sessions[i].fields){capturedSession=sessions[i];break;}}
  var fields=capturedSession?capturedSession.fields:null;
  function SH(hp){
    return ce('div',{onClick:hp.onToggle,style:{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:hp.open?9:0,cursor:'pointer',userSelect:'none'}},
      ce('div',{style:{display:'flex',alignItems:'center',gap:5}},ce('span',{style:{fontSize:12.5,fontWeight:700,color:'#1E293B'}},hp.title),hp.extra||null),
      ce('div',{style:{transform:hp.open?'rotate(0)':'rotate(-90deg)',transition:'transform .18s'}},ce(ChevD,{sz:11,cl:'#94A3B8'})));
  }
  function InfoLine(ip){
    return ce('div',{style:{display:'flex',alignItems:'center',gap:9,marginBottom:8}},
      ce('div',{style:{width:22,height:22,borderRadius:6,background:'#F8FAFC',flexShrink:0,border:'1px solid #F1F5F9',display:'flex',alignItems:'center',justifyContent:'center'}},ip.icon),
      ip.link?ce('a',{href:'#',onClick:function(e){e.preventDefault();},style:{fontSize:12,color:GB,textDecoration:'none',wordBreak:'break-all'}},ip.val):ce('span',{style:{fontSize:12,color:'#334155',fontWeight:500}},ip.val));
  }
  return ce('div',{style:{width:272,flexShrink:0,borderLeft:'1px solid #E2E8F0',display:'flex',flexDirection:'column',background:'#fff',position:'relative',overflow:'hidden'}},
    ce('div',{style:{height:44,borderBottom:'1px solid #E2E8F0',padding:'0 14px',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}},
      ce('span',{style:{fontSize:13,fontWeight:700,color:'#1E293B'}},'User Info'),
      ce('div',{style:{display:'flex',gap:3}},
        [{ico:'👤',a:true},{ico:'🔗',a:false},{ico:'👁',a:false}].map(function(item,i){
          return ce('button',{key:i,style:{width:26,height:26,border:'none',cursor:'pointer',borderRadius:6,display:'flex',alignItems:'center',justifyContent:'center',background:item.a?'#F1F5F9':'transparent',fontSize:13,transition:'background .12s'},
            onMouseEnter:function(e){if(!item.a)e.currentTarget.style.background='#F8FAFC';},
            onMouseLeave:function(e){if(!item.a)e.currentTarget.style.background='transparent';}},item.ico);
        }))),
    ce('div',{style:{flex:1,overflowY:'auto'}},
      ce('div',{style:{padding:'11px 14px 10px',borderBottom:'1px solid #F1F5F9'}},
        ce('div',{style:{display:'flex',alignItems:'center',gap:6,marginBottom:aiOpen?11:0,cursor:'pointer',userSelect:'none'},onClick:function(){setAi(function(v){return !v;});}},
          ce('span',{style:{fontSize:11,color:GB,fontWeight:800}},'\u2736'),
          ce('span',{style:{fontSize:13,fontWeight:700,color:'#1E293B'}},'AI Insights'),
          ce('div',{style:{marginLeft:'auto',transform:aiOpen?'rotate(0)':'rotate(-90deg)',transition:'transform .18s'}},ce(ChevD,{sz:11,cl:'#94A3B8'}))),
        aiOpen?ce('div',{style:{animation:'fadeIn .18s ease'}},
          ce('div',{style:{display:'flex',alignItems:'center',gap:8,marginBottom:8}},
            ce('div',{style:{width:22,height:22,borderRadius:6,background:'#FFF7ED',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center'}},ce(SmileyI,{sz:12,cl:'#F59E0B'})),
            ce('span',{style:{fontSize:11.5,color:'#64748B',flex:1}},'Sentiment'),
            ce('span',{style:{fontSize:11.5,fontWeight:600,color:'#334155'}},'Negative (8/10)')),
          ce('div',{style:{display:'flex',alignItems:'center',gap:8}},
            ce('div',{style:{width:22,height:22,borderRadius:6,background:GBL,flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center'}},ce(BulbI,{sz:12,cl:GB})),
            ce('span',{style:{fontSize:11.5,color:'#64748B'}},'Intent'),
            ce('div',{style:{display:'flex',flexWrap:'wrap',gap:3,flex:1,justifyContent:'flex-end'}},
              ce('span',{style:{padding:'2px 7px',borderRadius:12,fontSize:10.5,fontWeight:700,background:'#EFF4FF',color:GB}},'CUSTOMER SUPPORT (9/10)'),
              ce('span',{style:{padding:'2px 7px',borderRadius:12,fontSize:10.5,fontWeight:700,background:'#F1F5F9',color:'#64748B'}},'+2')))):null),
      ce('div',{style:{padding:'10px 14px 10px',borderBottom:'1px solid #F1F5F9'}},
        ce('div',{style:{fontSize:12.5,fontWeight:700,color:'#1E293B',marginBottom:10}},'Basic Informations'),
        ce(InfoLine,{icon:ce(UserI,{sz:11,cl:'#64748B'}),val:CONTACT.name}),
        ce(InfoLine,{icon:ce(PhoneI,{sz:11,cl:'#64748B'}),val:CONTACT.phone}),
        ce(InfoLine,{icon:ce(WaI,{sz:10,cl:WAG}),val:CONTACT.wa}),
        ce('div',{style:{display:'flex',alignItems:'center',gap:9,marginBottom:8}},ce('div',{style:{width:22,height:22,borderRadius:6,background:'#F8FAFC',flexShrink:0,border:'1px solid #F1F5F9',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11}},'📷'),ce('span',{style:{fontSize:12,color:'#CBD5E1'}},'-')),
        ce('div',{style:{display:'flex',alignItems:'center',gap:9}},ce('div',{style:{width:22,height:22,borderRadius:6,background:'#F8FAFC',flexShrink:0,border:'1px solid #F1F5F9',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11}},'✉️'),ce('span',{style:{fontSize:12,color:'#CBD5E1'}},'-'))),
      ce('div',{style:{padding:'10px 14px 10px',borderBottom:'1px solid #F1F5F9'}},
        ce(SH,{title:'Contact Fields',open:capOpen,onToggle:function(){setCap(function(v){return !v;});},
          extra:ce('div',{style:{marginLeft:4}},
            sessions[0].status==='Resolved'
              ?ce('span',{style:{display:'inline-flex',alignItems:'center',gap:3,padding:'1px 7px',borderRadius:20,background:'#F0FDF4',border:'1px solid #BBF7D0',fontSize:9.5,color:'#15803D',fontWeight:700}},
                  '✓ Injected · '+(sessions[0].injectedAt||sessions[0].endedAt||''))
              :sessions[0].status==='Live'
              ?ce('span',{style:{display:'inline-flex',alignItems:'center',gap:3,padding:'1px 7px',borderRadius:20,background:TBGL,border:'1px solid '+TRING,fontSize:9.5,color:TEAL,fontWeight:700}},
                  '● Live')
              :ce('span',{style:{display:'inline-flex',alignItems:'center',gap:3,padding:'1px 7px',borderRadius:20,background:'#FFFBEB',border:'1px solid #FDE68A',fontSize:9.5,color:'#B45309',fontWeight:700}},
                  sessions[0].status))}),
        capOpen?ce('div',{style:{animation:'fadeIn .18s ease'}},
          fields?ce('div',null,
            ce('div',{style:{padding:'6px 9px',background:TBGL,border:'1px solid '+TRING,borderRadius:8,marginBottom:8}},
              ce('div',{style:{fontSize:9.5,color:'#64748B',marginBottom:1,textTransform:'uppercase',letterSpacing:.4}},'Source page'),
              ce('a',{href:'#',onClick:function(e){e.preventDefault();},style:{fontSize:11,color:TEAL,textDecoration:'none',wordBreak:'break-all',fontWeight:500}},capturedSession.sourceUrl)),
            [
              {icon:ce(WalletI,{sz:10,cl:'#64748B'}),label:'Budget',val:fields.budget},
              {icon:ce(PinI,{sz:10,cl:'#64748B'}),label:'Location',val:fields.location},
              {icon:ce(CalI,{sz:10,cl:'#64748B'}),label:'Timeline',val:fields.timeline}
            ].map(function(row){
              return ce('div',{key:row.label,style:{display:'flex',alignItems:'center',gap:7,marginBottom:7}},
                ce('div',{style:{width:20,height:20,borderRadius:5,background:'#F1F5F9',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center'}},row.icon),
                ce('div',{style:{flex:1}},
                  ce('div',{style:{fontSize:9.5,color:'#94A3B8',marginBottom:1}},row.label),
                  ce('div',{style:{fontSize:12,color:'#334155',fontWeight:600}},row.val)));
            })):
          ce('div',{style:{padding:'9px 10px',background:TBGL,border:'1px solid '+TRING,borderRadius:8}},
            ce('div',{style:{display:'flex',alignItems:'center',gap:6,marginBottom:4}},
              ce('div',{style:{width:6,height:6,borderRadius:'50%',background:'#22C55E',animation:'glow 2s ease-in-out infinite'}}),
              ce('span',{style:{fontSize:11,color:TEAL,fontWeight:700}},'conversation.create fired')),
            ce('div',{style:{fontSize:11,color:'#64748B',lineHeight:1.5}},'Fields injected here when conversation.resolve fires.'))):null),
      ce('div',{style:{padding:'10px 14px 9px',borderBottom:'1px solid #F1F5F9'}},
        ce(SH,{title:'Sales Pipeline',open:plOpen,onToggle:function(){setPl(function(v){return !v;});},
          extra:ce('span',{style:{fontSize:9.5,fontWeight:700,padding:'1px 5px',borderRadius:4,background:'#DCFCE7',color:'#15803D',marginLeft:4}},'NEW')}),
        plOpen?ce('div',{style:{animation:'fadeIn .18s ease'}},
          ce('div',{style:{marginBottom:8}},
            ce('div',{style:{fontSize:10.5,color:'#94A3B8',marginBottom:4}},'Stage'),
            ce('div',{style:{border:'1.5px solid #E2E8F0',borderRadius:7,padding:'7px 10px',display:'flex',alignItems:'center',justifyContent:'space-between',cursor:'pointer',background:'#fff'}},
              ce('span',{style:{fontSize:12,color:'#334155',fontWeight:500}},'New Lead'),
              ce(ChevD,{sz:11,cl:'#94A3B8'}))),
          ce('button',{style:{width:'100%',padding:'8px 0',border:'1.5px dashed #CBD5E1',borderRadius:7,background:'#fff',cursor:'pointer',fontFamily:'inherit',fontSize:12.5,color:GB,fontWeight:600,display:'flex',alignItems:'center',justifyContent:'center',gap:5}},
            ce(PlusI,{sz:12,cl:GB}),' Add lead')):null),
      ce('div',{style:{padding:'10px 14px 14px'}},
        ce('div',{style:{fontSize:11,color:'#64748B',marginBottom:1}},'Marketing Opt-In'),
        ce('div',{style:{fontSize:13,fontWeight:600,color:'#22C55E',marginBottom:10}},'Yes'),
        ce('div',{style:{fontSize:11,color:'#64748B',marginBottom:5}},'Contact Owner'),
        ce('div',{style:{display:'flex',alignItems:'center',gap:7}},
          ce('div',{style:{width:22,height:22,borderRadius:'50%',background:GB,display:'flex',alignItems:'center',justifyContent:'center',fontSize:8.5,fontWeight:800,color:'#fff',flexShrink:0}},'TM'),
          ce('span',{style:{fontSize:12,fontWeight:500,color:'#334155'}},CONTACT.owner)))),
    overlayOpen&&overlaySess?ce(WebChatOverlay,{session:overlaySess,onClose:onClose}):null);
}

// CREATE ENTRY — standalone single-line chip (EVENT 1: session.create)
// Fires at contact mapping moment. No expand. Always visible when session exists.
function CreateEntry(p){
  var sess=p.sess,onView=p.onView;
  var method=sess.contactMapping?sess.contactMapping.method:'cookie';
  var methodLabel={'cookie':'via cookie','phone_capture':'via phone','business_inject':'via form','wa_ref':'via Ref','ip_fallback':'via fingerprint','manual':'manually'}[method]||'via cookie';
  var mappedAt=sess.contactMapping?sess.contactMapping.mappedAt:sess.startedAt;
  var refCode=sess.refCode||'';
  var refExpired=sess.infusion&&sess.infusion.refExpired===true;
  var isDropped=sess.status==='Dropped';
  var borderCol=isDropped?'#CBD5E1':'#0D9488';
  var bg=isDropped?'#F8FAFC':'#F0FDFA';
  var bd=isDropped?'#E2E8F0':'#99F6E4';
  var textCol=isDropped?'#94A3B8':'#0D9488';
  return ce('div',{className:'ctx-card',style:{
    margin:'8px 16px 4px',
    borderRadius:7,
    background:bg,
    border:'1px solid '+bd,
    borderLeft:'3px solid '+borderCol,
    padding:'6px 10px 6px 11px',
    display:'flex',alignItems:'center',gap:7}},
    ce('div',{style:{width:16,height:16,borderRadius:4,flexShrink:0,
      background:isDropped?'#F1F5F9':'#CCFBF1',border:'1px solid '+(isDropped?'#E2E8F0':'#99F6E4'),
      display:'flex',alignItems:'center',justifyContent:'center'}},
      ce(GlobeI,{sz:8,cl:textCol})),
    ce('span',{style:{fontSize:10.5,fontWeight:700,color:textCol}},'Web session'),
    ce('span',{style:{fontSize:10,color:'#CBD5E1'}},'·'),
    refCode?ce('span',{style:{fontSize:10.5,fontFamily:'ui-monospace,monospace',fontWeight:600,color:refExpired?'#CBD5E1':'#64748B'}},refExpired?'Ref · expired':'Ref:'+refCode):null,
    refCode?ce('span',{style:{fontSize:10,color:'#CBD5E1'}},'·'):null,
    ce('span',{style:{fontSize:10.5,color:'#94A3B8'}},mappedAt),
    ce('span',{style:{fontSize:10,color:'#CBD5E1'}},'·'),
    ce('span',{className:'ell',style:{fontSize:10.5,color:'#64748B',flex:1,maxWidth:130}},
      isDropped?'dropped · no handoff':methodLabel),
    ce('button',{onClick:function(){onView(sess);},
      style:{fontSize:9.5,fontWeight:700,color:isDropped?'#94A3B8':textCol,background:'transparent',border:'none',
        cursor:'pointer',padding:'1px 4px',borderRadius:3,fontFamily:'inherit',flexShrink:0,whiteSpace:'nowrap'},
      onMouseEnter:function(e){e.currentTarget.style.background=isDropped?'#F1F5F9':'#CCFBF1';},
      onMouseLeave:function(e){e.currentTarget.style.background='transparent';}},'View chat →'));
}

// GENERATING STUB — placeholder while async summary is being generated (~2s in demo, ~10s real)
function GeneratingStub(){
  return ce('div',{style:{
    margin:'4px 16px',
    borderRadius:7,
    background:'#F8FAFC',
    border:'1px solid #E2E8F0',
    borderLeft:'3px solid #CBD5E1',
    padding:'6px 11px',
    display:'flex',alignItems:'center',gap:8,
    animation:'stubIn .2s ease',
    position:'relative',overflow:'hidden'}},
    ce('div',{style:{width:6,height:6,borderRadius:'50%',background:'#CBD5E1',flexShrink:0,animation:'glow 1.5s ease-in-out infinite'}}),
    ce('span',{style:{fontSize:10.5,fontWeight:700,color:'#94A3B8'}},'Generating context'),
    ce('span',{style:{fontSize:10,color:'#CBD5E1'}},'·'),
    ce('span',{style:{fontSize:10.5,color:'#CBD5E1'}},'7:34 AM'),
    ce('div',{style:{position:'absolute',top:0,height:'100%',width:'40%',
      background:'linear-gradient(90deg,transparent,rgba(148,163,184,.12),transparent)',
      animation:'shimmer 1.8s ease-in-out infinite',left:'-40%'}}));
}

// LEAD SUMMARY — shown inside ResolveCard when AI fields are available
function LeadSummary(p){
  var sess=p.sess;
  if(!sess||!sess.fields)return null;
  var f=sess.fields;
  var score=typeof f.leadScore==='number'?f.leadScore:8;
  var barW=Math.round((score/10)*100)+'%';
  var rows=[
    {key:'Intent',val:f.intentType},
    {key:'Budget',val:f.budget},
    {key:'Location',val:f.location},
    {key:'Timeline',val:f.timeline}
  ].filter(function(r){return r.val;});
  var summary=f.summary?f.summary.slice(0,600):null;
  return ce('div',{style:{background:'#F8FAFC',border:'1px solid #E2E8F0',
    borderRadius:7,padding:'9px 10px',marginTop:7}},
    ce('div',{style:{fontSize:9,fontWeight:800,textTransform:'uppercase',letterSpacing:.7,
      color:'#15803D',marginBottom:8,display:'flex',alignItems:'center',gap:5}},
      ce('div',{style:{width:5,height:5,borderRadius:'50%',background:WAG,flexShrink:0}}),
      'Lead Summary — AI Generated'),
    rows.map(function(row){
      return ce('div',{key:row.key,style:{display:'flex',alignItems:'baseline',gap:8,marginBottom:5}},
        ce('span',{style:{color:'#94A3B8',width:60,flexShrink:0,fontSize:10.5}},row.key),
        ce('span',{style:{color:'#0F172A',fontWeight:600,fontSize:11.5}},row.val));
    }),
    ce('div',{style:{display:'flex',alignItems:'center',gap:6,marginTop:8,padding:'7px 9px',
      background:'linear-gradient(90deg,rgba(27,88,227,.06),rgba(37,211,102,.06))',
      borderRadius:7,border:'1px solid #E2E8F0'}},
      ce('span',{style:{fontSize:10.5,fontWeight:700,color:'#1E293B',flexShrink:0}},'Lead score'),
      ce('div',{style:{flex:1,height:3,background:'#E2E8F0',borderRadius:2,overflow:'hidden',margin:'0 6px'}},
        ce('div',{style:{height:'100%',background:'linear-gradient(90deg,'+GB+','+WAG+')',width:barW,borderRadius:2}})),
      ce('span',{style:{fontSize:11,fontWeight:800,color:GB,flexShrink:0}},score+'/10')),
    summary?ce('div',{style:{marginTop:7,fontSize:11,color:'#64748B',lineHeight:1.55,
      borderTop:'1px solid #E2E8F0',paddingTop:7}},summary):null);
}

// RESOLVE CARD — standalone expandable entry (EVENT 2: session.resolve)
// Expanded view: source URL + resolve details only. No create-section duplication (CreateEntry chip is always co-visible).
function ResolveCard(p){
  var sess=p.sess,onView=p.onView,sessionNum=p.sessionNum||null,totalSessions=p.totalSessions||null,prevScore=typeof p.prevScore==='number'?p.prevScore:null;
  var expState=useState(false);
  var isExp=expState[0],setExp=expState[1];
  var isResolved=sess.status==='Resolved';
  var isDropped=sess.status==='Dropped';
  var borderCol=isResolved?GB:isDropped?'#94A3B8':'#EF4444';
  var dotCol=isResolved?GB:isDropped?'#94A3B8':'#EF4444';
  var labelCol=isResolved?GB:isDropped?'#64748B':'#DC2626';
  var statusLabel=isResolved?'Context injected':isDropped?'Session dropped':'Injection error';
  var resolveColor=isResolved?GB:isDropped?'#94A3B8':'#EF4444';
  var resolveBg=isResolved?GBL:isDropped?'#F8FAFC':'#FEF2F2';
  var resolveDesc=isResolved?'Lead context written · contact record updated':isDropped?'Session ended without handoff':'Injection failed · check webhook logs';
  var resolvedAt=sess.infusion&&sess.infusion.resolveInjectedAt?sess.infusion.resolveInjectedAt:(sess.injectedAt||sess.endedAt||'');
  var trend=null;
  if(sess.fields&&typeof sess.fields.leadScore==='number'&&prevScore!==null){
    if(sess.fields.leadScore>prevScore)trend='↑';
    else if(sess.fields.leadScore<prevScore)trend='↓';
    else trend='→';
  }
  return ce('div',{className:'ctx-card',style:{
    margin:'4px 16px 4px',borderRadius:9,overflow:'hidden',
    background:'#fff',border:'1px solid #E2E8F0',borderLeft:'3px solid '+borderCol,
    boxShadow:'0 1px 3px rgba(15,23,42,.06)',animation:'fullIn .3s cubic-bezier(.2,1,.4,1) both'}},
    // Compact header — always visible, toggle to expand
    ce('div',{style:{display:'flex',alignItems:'center',gap:8,padding:'7px 11px',cursor:'pointer',userSelect:'none'},
      onClick:function(){setExp(function(v){return !v;});}},
      ce('div',{style:{width:6,height:6,borderRadius:'50%',background:dotCol,flexShrink:0}}),
      ce('div',{style:{flex:1,minWidth:0,display:'flex',alignItems:'center',gap:5,overflow:'hidden'}},
        ce('span',{style:{fontSize:11,fontWeight:700,color:labelCol,whiteSpace:'nowrap'}},statusLabel),
        ce('span',{style:{fontSize:10.5,color:'#94A3B8',fontWeight:400,whiteSpace:'nowrap'}},'· '+resolvedAt),
        sess.msgCount&&sess.durationMin?ce('div',{style:{display:'flex',alignItems:'center',gap:8,marginLeft:4,flexShrink:0}},
          ce('div',{style:{display:'flex',alignItems:'center',gap:3}},
            ce(MsgI,{sz:9,cl:'#CBD5E1'}),
            ce('span',{style:{fontSize:10,color:'#CBD5E1'}},sess.msgCount+' msgs')),
          ce('div',{style:{display:'flex',alignItems:'center',gap:3}},
            ce(ClockI,{sz:9,cl:'#CBD5E1'}),
            ce('span',{style:{fontSize:10,color:'#CBD5E1'}},sess.durationMin+' min'))):null,
        sessionNum&&totalSessions?ce('div',{style:{display:'flex',alignItems:'center',gap:3,marginLeft:4,flexShrink:0}},
          ce('span',{style:{fontSize:10,color:'#CBD5E1'}},'·'),
          ce('span',{style:{fontSize:10,color:'#94A3B8',fontWeight:500}},'Sess. '+sessionNum+' of '+totalSessions+' in 30d'),
          trend?ce('span',{style:{fontSize:11.5,fontWeight:800,color:trend==='↑'?WAG:trend==='↓'?'#EF4444':'#94A3B8',marginLeft:2}},trend):null):null),
      ce('div',{style:{display:'flex',alignItems:'center',gap:2,flexShrink:0}},
        ce('span',{style:{fontSize:10,fontWeight:700,color:TEAL}},'View summary'),
        ce('div',{style:{transform:isExp?'rotate(180deg)':'rotate(0)',transition:'transform .18s'}},
          ce(ChevD,{sz:10,cl:TEAL})))),
    // Expanded — source row + resolve details (no create-section; CreateEntry chip above is always visible)
    isExp?ce('div',{style:{borderTop:'1px solid #F1F5F9',animation:'slideUp .18s cubic-bezier(.2,1,.4,1) both'}},
      // Source URL + view chat
      ce('div',{style:{padding:'6px 11px',borderBottom:'1px solid #F1F5F9',display:'flex',alignItems:'center',gap:7}},
        ce('div',{style:{width:14,height:14,borderRadius:3,background:'#F1F5F9',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center'}},
          ce(GlobeI,{sz:8,cl:'#94A3B8'})),
        ce('span',{style:{fontSize:10,color:'#94A3B8',fontFamily:'ui-monospace,monospace',flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}},sess.sourceUrl),
        ce('button',{onClick:function(e){e.stopPropagation();onView(sess);},
          style:{fontSize:9.5,fontWeight:700,color:TEAL,background:'transparent',border:'none',cursor:'pointer',padding:'1px 4px',borderRadius:3,fontFamily:'inherit',flexShrink:0},
          onMouseEnter:function(e){e.currentTarget.style.background=TBGL;},
          onMouseLeave:function(e){e.currentTarget.style.background='transparent';}},'View chat →')),
      // Resolve details
      ce('div',{style:{padding:'8px 11px',animation:'slideUp .25s .1s cubic-bezier(.2,1,.4,1) both'}},
        ce('div',{style:{display:'flex',alignItems:'center',gap:5,marginBottom:4}},
          ce('span',{style:{fontSize:8.5,fontWeight:800,color:resolveColor,textTransform:'uppercase',letterSpacing:.6,padding:'1px 5px',background:resolveBg,borderRadius:3}},'resolve'),
          ce('span',{style:{fontSize:10.5,color:'#94A3B8',fontWeight:400}},'· '+resolvedAt),
          sess.msgCount||sess.durationMin?ce('div',{style:{marginLeft:'auto',display:'flex',alignItems:'center',gap:8}},
            sess.msgCount?ce('div',{style:{display:'flex',alignItems:'center',gap:3}},
              ce(MsgI,{sz:9,cl:'#94A3B8'}),
              ce('span',{style:{fontSize:10,color:'#94A3B8'}},sess.msgCount+' msgs')):null,
            sess.durationMin?ce('div',{style:{display:'flex',alignItems:'center',gap:3}},
              ce(ClockI,{sz:9,cl:'#94A3B8'}),
              ce('span',{style:{fontSize:10,color:'#94A3B8'}},sess.durationMin+' min')):null):null),
        ce('div',{style:{fontSize:11,color:'#475569',lineHeight:1.4}},resolveDesc),
        ce(LeadSummary,{sess:sess}),
        sess.fields&&sess.fields.summary?ce('div',{style:{marginTop:6,display:'inline-flex',alignItems:'center',gap:4,padding:'2px 8px',background:'#F0FDF4',border:'1px solid #86EFAC',borderRadius:4}},
          ce('div',{style:{width:5,height:5,borderRadius:'50%',background:WAG,flexShrink:0}}),
          ce('span',{style:{fontSize:9.5,fontWeight:700,color:'#15803D',letterSpacing:.2}},'AI context available')):null)):null);
}

// CONTEXT CARD — thin wrapper; decides which entries to render based on session status + channel flag
// Phase 5: renders ALL sessions in chronological order (oldest→newest) as independent thread entries
function ContextCard(p){
  var sessions=p.sessions||[];
  var generating=p.generating||false;
  var webCtxEnabled=p.webCtxEnabled!==undefined?p.webCtxEnabled:true;
  var onView=p.onView;
  if(!sessions.length)return null;
  var mostRecentId=sessions[0]?sessions[0].id:null;
  var isConcurrent=sessions[0]&&sessions[0].status==='Concurrent';
  // Layer B: if web context is disabled for this channel, show a muted note instead
  if(!webCtxEnabled){
    return ce('div',{style:{margin:'8px 16px 4px',borderRadius:7,
      background:'#F8FAFC',border:'1px solid #E2E8F0',borderLeft:'3px solid #E2E8F0',
      padding:'6px 11px',display:'flex',alignItems:'center',gap:7,animation:'fadeUp .25s ease'}},
      ce('div',{style:{width:14,height:14,borderRadius:4,background:'#F1F5F9',flexShrink:0,
        border:'1px solid #E2E8F0',display:'flex',alignItems:'center',justifyContent:'center'}},
        ce(GlobeI,{sz:7,cl:'#CBD5E1'})),
      ce('span',{style:{fontSize:10,color:'#94A3B8',flex:1}},'Web context not enabled for this channel — configure in Channel Settings'),
      ce('a',{href:'GBWebWidget.html',target:'_blank',
        style:{fontSize:9.5,fontWeight:700,color:'#CBD5E1',textDecoration:'none',
          padding:'1px 6px',border:'1px solid #E2E8F0',borderRadius:4,
          background:'#fff',cursor:'pointer',flexShrink:0,whiteSpace:'nowrap'},
        onMouseEnter:function(e){e.currentTarget.style.color='#94A3B8';e.currentTarget.style.borderColor='#CBD5E1';},
        onMouseLeave:function(e){e.currentTarget.style.color='#CBD5E1';e.currentTarget.style.borderColor='#E2E8F0';}},'Channel Settings'));
  }
  // Active sessions (non-dropped) — sessions array is newest-first
  var activeSessions=sessions.filter(function(s){return s.status!=='Dropped';});
  var totalActive=activeSessions.length;
  // Build nodes oldest-first for chronological thread display
  var ordered=[].concat(sessions).reverse();
  var nodes=[];
  if(isConcurrent){
    nodes.push(ce('div',{key:'banner',style:{margin:'8px 16px 4px',background:'#FFFBEB',
      border:'1px solid #FDE68A',borderRadius:7,
      padding:'5px 11px',display:'flex',alignItems:'center',gap:6,animation:'fadeUp .3s ease'}},
      ce('div',{style:{width:5,height:5,borderRadius:'50%',background:'#F59E0B',animation:'glow 2s ease-in-out infinite',flexShrink:0}}),
      ce('span',{style:{fontSize:10.5,fontWeight:700,color:'#B45309',flex:1}},'Customer is chatting on web while this conversation is open'),
      ce('span',{style:{fontSize:10,color:'#D97706'}},'Concurrent')));
  }
  ordered.forEach(function(sess){
    var isCurrentSess=sess.id===mostRecentId;
    var isLive=sess.status==='Live';
    var isDropped=sess.status==='Dropped';
    // Session counter among active (non-dropped) sessions; newest=totalActive, oldest=1
    var activeIdx=activeSessions.findIndex(function(s){return s.id===sess.id;});
    var sessionNum=activeIdx>=0?(totalActive-activeIdx):null;
    // Trend: compare with previous (older) active session's lead score
    var prevScore=null;
    if(activeIdx>=0&&activeIdx+1<activeSessions.length){
      var olderSess=activeSessions[activeIdx+1];
      if(olderSess&&olderSess.fields&&typeof olderSess.fields.leadScore==='number'){
        prevScore=olderSess.fields.leadScore;
      }
    }
    nodes.push(ce(CreateEntry,{key:'ce-'+sess.id,sess:sess,onView:onView}));
    if(isCurrentSess&&generating){
      nodes.push(ce(GeneratingStub,{key:'stub'}));
    }else if(!isLive&&!isDropped){
      nodes.push(ce(ResolveCard,{key:'rc-'+sess.id,sess:sess,onView:onView,
        sessionNum:totalActive>1?sessionNum:null,totalSessions:totalActive>1?totalActive:null,prevScore:prevScore}));
    }
  });
  return ce('div',null,nodes);
}

// CHAT AREA
function ChatArea(p){
  var sessions=p.sessions,onView=p.onView,compact=p.compact||false,generating=p.generating||false;
  var ref=useRef(null);
  useEffect(function(){if(ref.current)ref.current.scrollTop=ref.current.scrollHeight;},[]);
  var px=compact?12:16;
  // Layer B — per-channel web context toggle (Phase 3 cross-channel demo)
  var we=useState(true),webCtxEnabled=we[0],setWebCtxEnabled=we[1];
  function Bubble(bp){
    var m=bp.msg;
    if(m.who==='date')return ce('div',{style:{textAlign:'center',padding:'12px 0 6px'}},ce('span',{style:{display:'inline-block',fontSize:11.5,color:'#94A3B8',fontWeight:600,background:'rgba(255,255,255,.92)',padding:'3px 16px',borderRadius:18,border:'1px solid #E2E8F0'}},m.text));
    if(m.who==='sys')return ce('div',{style:{textAlign:'center',padding:'3px 0 8px'}},ce('span',{style:{display:'inline-block',fontSize:11,color:'#94A3B8',background:'rgba(255,255,255,.78)',padding:'3px 14px',borderRadius:16,border:'1px solid #F1F5F9'}},m.text));
    var isOut=m.who==='out';
    return ce('div',{style:{display:'flex',flexDirection:'column',alignItems:isOut?'flex-end':'flex-start',padding:'0 '+px+'px',marginBottom:5,animation:'msgIn .2s ease'}},
      ce('div',{style:{maxWidth:'70%',background:isOut?'#DCF8C6':'#fff',color:'#1E293B',borderRadius:isOut?'12px 12px 3px 12px':'12px 12px 12px 3px',padding:'9px 12px',fontSize:13,lineHeight:1.55,boxShadow:'0 1px 2px rgba(0,0,0,.08)'}},
        m.text,
        m.note?ce('div',{style:{fontSize:10.5,color:'#94A3B8',fontStyle:'italic',marginTop:4}},m.note):null),
      ce('div',{style:{fontSize:9.5,color:'#94A3B8',marginTop:2,paddingLeft:!isOut?3:0,paddingRight:isOut?3:0}},m.time+(isOut?' \u2713\u2713':'')));
  }
  return ce('div',{style:{flex:1,display:'flex',flexDirection:'column',background:'#F0F4F8',overflow:'hidden',minWidth:0}},
    ce('div',{style:{height:compact?52:60,background:'#fff',borderBottom:'1px solid #E2E8F0',padding:'0 '+px+'px',display:'flex',alignItems:'center',gap:10,flexShrink:0}},
      ce('div',{style:{flex:1,minWidth:0}},
        ce('div',{style:{display:'flex',alignItems:'center',gap:7,marginBottom:2}},
          ce('span',{style:{fontSize:compact?13.5:15,fontWeight:700,color:'#0F172A'}},'Ganesh Krishna'),
          ce('div',{style:{display:'flex',alignItems:'center',gap:3}},ce(ClockI,{sz:10,cl:'#94A3B8'}),ce('span',{style:{fontSize:10.5,color:'#94A3B8'}},'23h'))),
        ce('div',{style:{display:'flex',alignItems:'center',gap:6}},
          ce('div',{style:{display:'flex',alignItems:'center',gap:4,background:'#F0FDF4',border:'1px solid #BBF7D0',borderRadius:20,padding:'2px 9px'}},ce(WaI,{sz:9,cl:WAG}),ce('span',{style:{fontSize:10.5,fontWeight:600,color:'#15803D'}},'Maya - Dialog360')),
          // Layer B toggle: per-channel web context on/off
          ce('button',{
            onClick:function(){setWebCtxEnabled(function(v){return !v;});},
            title:webCtxEnabled?'Web context enabled for this channel — click to disable':'Web context disabled for this channel — click to enable',
            style:{display:'flex',alignItems:'center',gap:4,padding:'2px 8px',
              borderRadius:20,border:'1px solid '+(webCtxEnabled?TRING:'#CBD5E1'),
              background:webCtxEnabled?TBGL:'#F8FAFC',
              cursor:'pointer',fontFamily:'inherit',fontSize:10,fontWeight:600,
              color:webCtxEnabled?TEAL:'#94A3B8',transition:'all .15s',flexShrink:0}},
            ce('div',{style:{width:5,height:5,borderRadius:'50%',
              background:webCtxEnabled?TEAL:'#CBD5E1',flexShrink:0,
              animation:webCtxEnabled?'glow 2s ease-in-out infinite':'none'}}),
            'Web context'),
          ce('button',{style:{padding:'2px 8px',border:'1px solid #E2E8F0',borderRadius:20,background:'#fff',cursor:'pointer',fontFamily:'inherit',fontSize:10.5,color:'#475569'}},'+ Add Tag'))),
      ce('div',{style:{display:'flex',gap:6,alignItems:'center'}},
        ce('button',{style:{display:'flex',alignItems:'center',gap:4,padding:'5px 10px',border:'1px solid #E2E8F0',borderRadius:7,background:'#fff',cursor:'pointer',fontFamily:'inherit',fontSize:11.5,color:'#475569',transition:'all .12s'},
          onMouseEnter:function(e){e.currentTarget.style.background='#F8FAFC';},onMouseLeave:function(e){e.currentTarget.style.background='#fff';}},'✦ Generate Summary'),
        ce('button',{style:{padding:'5px 10px',border:'1px solid #E2E8F0',borderRadius:7,background:'#fff',cursor:'pointer',fontFamily:'inherit',fontSize:11.5,color:'#475569'}},'+ Add lead'),
        ce('div',{style:{display:'flex',border:'1px solid #E2E8F0',borderRadius:7,overflow:'hidden'}},
          ce('button',{style:{padding:'5px 10px',border:'none',background:'#fff',cursor:'pointer',fontFamily:'inherit',fontSize:11.5,color:'#475569',borderRight:'1px solid #E2E8F0'}},'Assign Team, User\u2026'),
          ce('button',{style:{padding:'5px 8px',border:'none',background:'#fff',cursor:'pointer'}},ce(ChevD,{sz:11,cl:'#94A3B8'}))),
        ce('button',{style:{width:30,height:30,border:'1px solid #22C55E',borderRadius:6,background:'#F0FDF4',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'#22C55E',fontSize:14,fontWeight:700,flexShrink:0}},'✓'),
        ce('button',{style:{width:30,height:30,border:'1px solid #E2E8F0',borderRadius:6,background:'#fff',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,color:'#94A3B8',flexShrink:0}},'\u22ef'))),
    ce('div',{ref:ref,style:{flex:1,overflowY:'auto',paddingTop:4}},
      ce(ContextCard,{sessions:sessions,onView:onView,generating:generating,webCtxEnabled:webCtxEnabled}),
      WA_MSGS.map(function(m){return ce(Bubble,{key:m.id,msg:m});})),
    ce('div',{style:{borderTop:'1px solid #E2E8F0',background:'#fff',flexShrink:0}},
      ce('div',{style:{display:'flex',padding:'0 '+px+'px',borderBottom:'1px solid #F8FAFC'}},
        ['Reply','Notes'].map(function(t,i){return ce('button',{key:t,style:{padding:'7px 14px',border:'none',background:'transparent',cursor:'pointer',fontFamily:'inherit',fontSize:12.5,fontWeight:600,borderBottom:i===0?'2px solid '+GB:'2px solid transparent',color:i===0?GB:'#94A3B8'}},t);})),
      ce('div',{style:{padding:'10px '+px+'px 0'}},
        ce('div',{style:{display:'flex',alignItems:'center',justifyContent:'space-between',fontSize:13,color:'#CBD5E1',marginBottom:12,cursor:'text'}},
          ce('span',null,'Message Ganesh Krishna or '),
          ce('button',{style:{border:'none',background:'none',cursor:'pointer',fontFamily:'inherit',fontSize:13,color:'#7C3AED',fontWeight:600}},'Try AI Reply')),
        ce('div',{style:{display:'flex',alignItems:'center',justifyContent:'space-between',paddingBottom:10}},
          ce('div',{style:{display:'flex',gap:5,alignItems:'center'}},
            ce('button',{style:{width:28,height:28,border:'1px solid #E2E8F0',borderRadius:6,background:'#fff',cursor:'pointer',fontSize:14,display:'flex',alignItems:'center',justifyContent:'center'}},'+'),
            ce('button',{style:{width:28,height:28,border:'1px solid #E2E8F0',borderRadius:6,background:'#fff',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}},ce(SmileyI,{sz:13,cl:'#64748B'})),
            ce('button',{style:{width:28,height:28,border:'1px solid #E2E8F0',borderRadius:6,background:'#fff',cursor:'pointer',fontSize:12,fontWeight:600,display:'flex',alignItems:'center',justifyContent:'center',color:'#64748B'}},'Aa'),
            ce('div',{style:{width:1,height:16,background:'#F1F5F9',margin:'0 1px'}}),
            ce('button',{style:{width:28,height:28,border:'1px solid #E2E8F0',borderRadius:6,background:'#fff',cursor:'pointer',fontSize:13,display:'flex',alignItems:'center',justifyContent:'center'}},'\u26a1'),
            ce('button',{style:{width:28,height:28,border:'1px solid #E2E8F0',borderRadius:6,background:'#fff',cursor:'pointer',fontSize:12,display:'flex',alignItems:'center',justifyContent:'center'}},'📋'),
            ce('button',{style:{width:28,height:28,border:'1px solid #E2E8F0',borderRadius:6,background:'#fff',cursor:'pointer',fontSize:12,display:'flex',alignItems:'center',justifyContent:'center'}},'\u229e'),
            compact?null:ce('button',{style:{display:'flex',alignItems:'center',gap:5,padding:'5px 10px',border:'1px solid #DDD6FE',borderRadius:7,background:'#FAF5FF',cursor:'pointer',fontFamily:'inherit',fontSize:12,color:'#7C3AED',fontWeight:600,transition:'all .12s'},
              onMouseEnter:function(e){e.currentTarget.style.background='#F3E8FF';},onMouseLeave:function(e){e.currentTarget.style.background='#FAF5FF';}},'✦ AI Assist')),
          ce('button',{style:{padding:'8px 20px',background:GB,color:'#fff',border:'none',borderRadius:7,cursor:'pointer',fontFamily:'inherit',fontSize:13,fontWeight:700,boxShadow:'0 1px 4px rgba(27,88,227,.28)',transition:'opacity .12s'},
            onMouseEnter:function(e){e.currentTarget.style.opacity='.85';},onMouseLeave:function(e){e.currentTarget.style.opacity='1';}},'Send'))),
      ce('div',{style:{padding:'0 '+px+'px 8px',fontSize:10,color:'#E2E8F0'}},'Create a strikethrough effect with >  followed by a space')));
}

// LEFT SIDEBAR
function LeftSidebar(){
  var ns=useState('inbox'),nav=ns[0],setNav=ns[1];
  var NAV_HREF={'home':null,'inbox':null,'contacts':null,'agents':'gallabox-web-empty.html','campaigns':'gallabox-outbound.html','pipelines':null,'whatsapp':null,'instagram':null,'web':'gallabox-web-empty.html','sett':null};
  var NAV_LABEL={'home':'Home','inbox':'Conversations','contacts':'Contacts','agents':'AI Agents & Bots','campaigns':'Campaigns','pipelines':'Pipelines','whatsapp':'WhatsApp','instagram':'Instagram','web':'Web Agents','sett':'Settings'};
  function NavBtn(item){
    var isA=nav===item.id;
    return ce('button',{key:item.id,title:NAV_LABEL[item.id]||item.id,
      onClick:function(){
        if(NAV_HREF[item.id])window.location.href=NAV_HREF[item.id];
        else setNav(item.id);
      },
      style:{width:38,height:38,borderRadius:8,border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',background:isA?'rgba(27,88,227,.25)':'transparent',transition:'background .13s'},
      onMouseEnter:function(e){if(!isA)e.currentTarget.style.background='rgba(255,255,255,.07)';},
      onMouseLeave:function(e){if(!isA)e.currentTarget.style.background='transparent';}},
      ce(item.I,{sz:18,cl:isA?'#93C5FD':'#64748B'}));
  }
  var NavSep=ce('div',{style:{width:28,height:1,background:'rgba(255,255,255,.07)',margin:'3px 0',flexShrink:0}});
  var HomeI=function(p){return ce('svg',{width:18,height:18,viewBox:'0 0 24 24',fill:'none',stroke:p.cl||'#64748B',strokeWidth:1.8,strokeLinecap:'round',strokeLinejoin:'round'},ce('path',{d:'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z'}),ce('polyline',{points:'9 22 9 12 15 12 15 22'}));};
  var AgentsI=function(p){return ce('svg',{width:18,height:18,viewBox:'0 0 24 24',fill:'none',stroke:p.cl||'#64748B',strokeWidth:2,strokeLinecap:'round',strokeLinejoin:'round'},ce('rect',{x:3,y:11,width:18,height:11,rx:2,ry:2}),ce('path',{d:'M7 11V7a5 5 0 0 1 10 0v4'}));};
  var CampsI=function(p){return ce('svg',{width:18,height:18,viewBox:'0 0 24 24',fill:'none',stroke:p.cl||'#64748B',strokeWidth:2,strokeLinecap:'round',strokeLinejoin:'round'},ce('line',{x1:22,y1:2,x2:11,y2:13}),ce('polygon',{points:'22 2 15 22 11 13 2 9 22 2'}));};
  var PipeI=function(p){return ce('svg',{width:18,height:18,viewBox:'0 0 24 24',fill:'none',stroke:p.cl||'#64748B',strokeWidth:2,strokeLinecap:'round',strokeLinejoin:'round'},ce('line',{x1:18,y1:20,x2:18,y2:10}),ce('line',{x1:12,y1:20,x2:12,y2:4}),ce('line',{x1:6,y1:20,x2:6,y2:14}));};
  var WAI=function(p){return ce('svg',{width:18,height:18,viewBox:'0 0 24 24',fill:'none',stroke:p.cl||'#64748B',strokeWidth:2,strokeLinecap:'round',strokeLinejoin:'round'},ce('path',{d:'M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z'}));};
  var IGI=function(p){return ce('svg',{width:18,height:18,viewBox:'0 0 24 24',fill:'none',stroke:p.cl||'#64748B',strokeWidth:2,strokeLinecap:'round',strokeLinejoin:'round'},ce('rect',{x:2,y:2,width:20,height:20,rx:5,ry:5}),ce('path',{d:'M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z'}),ce('line',{x1:17.5,y1:6.5,x2:17.51,y2:6.5}));};
  var WebI=function(p){return ce('svg',{width:18,height:18,viewBox:'0 0 24 24',fill:'none',stroke:p.cl||'#64748B',strokeWidth:2,strokeLinecap:'round'},ce('circle',{cx:12,cy:12,r:10}),ce('line',{x1:2,y1:12,x2:22,y2:12}),ce('path',{d:'M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z'}));};
  var MAIN_ITEMS=[
    {id:'home',I:HomeI},{id:'inbox',I:InboxI},{id:'contacts',I:ContactsI},
    {id:'agents',I:AgentsI},{id:'campaigns',I:CampsI},{id:'pipelines',I:PipeI}
  ];
  var CHAN_ITEMS=[{id:'whatsapp',I:WAI},{id:'instagram',I:IGI},{id:'web',I:WebI}];
  return ce('div',{style:{width:52,flexShrink:0,background:GBD,display:'flex',flexDirection:'column',alignItems:'center',paddingTop:10,paddingBottom:10,borderRight:'1px solid rgba(255,255,255,.06)'}},
    ce('div',{style:{width:32,height:32,borderRadius:8,background:GB,display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:900,color:'#fff',marginBottom:14,boxShadow:'0 2px 8px rgba(27,88,227,.4)'}},'G'),
    ce('div',{style:{display:'flex',flexDirection:'column',gap:3,flex:1,alignItems:'center',width:'100%'}},
      MAIN_ITEMS.map(NavBtn),
      NavSep,
      CHAN_ITEMS.map(NavBtn),
      NavSep,
      NavBtn({id:'sett',I:SettI})
    ),
    ce('div',{style:{width:30,height:30,borderRadius:'50%',background:'#1E3A5F',border:'2px solid #334155',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700,color:'#7CB9E8',cursor:'pointer',marginTop:6}},'DG'));
}

// DEMO BAR
function DemoBar(p){
  var status=p.status,onEnd=p.onEnd,onReset=p.onReset,onNewSess=p.onNewSess,generating=p.generating||false;
  var isLive=status==='Live';
  var isResolved=status==='Resolved';
  return ce('div',{style:{height:34,background:'#0F172A',display:'flex',alignItems:'center',
    padding:'0 14px',gap:10,flexShrink:0,borderBottom:'1px solid rgba(255,255,255,.05)',
    overflowX:'auto'}},
    ce('span',{style:{fontSize:9.5,color:'#475569',fontWeight:800,letterSpacing:.8,flexShrink:0}},'DEMO'),
    ce('div',{style:{width:1,height:12,background:'#1E293B',flexShrink:0}}),
    // Step 1 — always shown as completed/active
    ce('div',{style:{display:'flex',alignItems:'center',gap:4,flexShrink:0}},
      ce('div',{style:{width:14,height:14,borderRadius:'50%',
        border:'1.5px solid '+(isLive?TEAL:'#334155'),
        background:isLive?'transparent':'#334155',
        display:'flex',alignItems:'center',justifyContent:'center'}}),
      ce('span',{style:{fontSize:10.5,color:isLive?TEAL:'#475569',fontWeight:isLive?700:500}},'conversation.create')),
    ce('div',{style:{width:16,height:1,background:'#1E293B',flexShrink:0}}),
    // Step 2 — fire resolve
    ce('div',{style:{display:'flex',alignItems:'center',gap:4,flexShrink:0}},
      ce('div',{style:{width:14,height:14,borderRadius:'50%',
        border:'1.5px solid '+(isResolved?GB:'#334155'),
        background:isResolved?GB:'transparent',
        display:'flex',alignItems:'center',justifyContent:'center'}}),
      ce('span',{style:{fontSize:10.5,color:isResolved?GB:'#475569',fontWeight:isResolved?700:500}},'conversation.resolve')),
    // Action buttons
    isLive&&!generating?ce('button',{onClick:onEnd,style:{padding:'3px 10px',borderRadius:5,
      border:'1px solid rgba(245,158,11,.4)',background:'rgba(245,158,11,.1)',
      cursor:'pointer',fontFamily:'inherit',fontSize:10.5,fontWeight:600,
      color:'#F59E0B',transition:'all .13s',flexShrink:0,marginLeft:4}},
      'Simulate resolve \u2192 inject'):null,
    generating?ce('div',{style:{display:'flex',alignItems:'center',gap:4,padding:'3px 10px',
      borderRadius:5,border:'1px solid rgba(148,163,184,.2)',background:'rgba(148,163,184,.07)',
      flexShrink:0,marginLeft:4}},
      ce('div',{style:{width:6,height:6,borderRadius:'50%',background:'#CBD5E1',animation:'glow 1.5s ease-in-out infinite'}}),
      ce('span',{style:{fontSize:10.5,fontWeight:600,color:'#64748B'}},'Generating\u2026')):null,
    !isLive&&!generating?ce('button',{onClick:onNewSess,style:{padding:'3px 10px',borderRadius:5,
      border:'1px solid rgba(2,132,199,.3)',background:'rgba(2,132,199,.08)',
      cursor:'pointer',fontFamily:'inherit',fontSize:10.5,fontWeight:600,
      color:TEAL,transition:'all .13s',flexShrink:0,marginLeft:4}},
      '+ New web session'):null,
    !isLive&&!generating?ce('button',{onClick:onReset,style:{padding:'3px 10px',borderRadius:5,
      border:'1px solid #1E293B',background:'rgba(255,255,255,.04)',
      cursor:'pointer',fontFamily:'inherit',fontSize:10.5,fontWeight:600,
      color:'#475569',transition:'all .13s',flexShrink:0}},
      'Reset'):null,
    ce('div',{style:{flex:1}}),
    // Backlog pill
    ce('div',{style:{display:'flex',alignItems:'center',gap:5,
      padding:'2px 8px',background:'rgba(124,58,237,.12)',borderRadius:4,
      border:'1px solid rgba(124,58,237,.2)',flexShrink:0}},
      ce('span',{style:{fontSize:9,fontWeight:800,color:'#A78BFA',letterSpacing:.4}},'\u2611 BACKLOG'),
      ce('span',{style:{fontSize:9.5,color:'#6D4ACE'}},
        'Web as log \u00b7 no new convo \u00b7 editor settings \u2192 inject-to channel')));
}

/* ── Outbound OS shared data & utilities v5 ─────────────── */
'use strict';
var LS_KEY='gb_outbound_v5';
var SEED=[
  {id:1,name:'Diwali Flash Sale 2025',        type:'broadcast',obj:'engagement',  status:'active', priority:1,enrolled:8420,sent:8420,delivered:7780,read:1204,replied:840, cold:6576,bounced:640},
  {id:2,name:'Webinar Nurture — Education',   type:'sequence', obj:'conversion',  status:'active', priority:2,enrolled:2150,sent:2150,delivered:1895,read:489, replied:396, cold:1406,bounced:255},
  {id:3,name:'Q4 Upsell — Premium Plan',      type:'sequence', obj:'conversion',  status:'paused', priority:3,enrolled:5300,sent:5300,delivered:4198,read:605, replied:435, cold:3593,bounced:1102},
  {id:4,name:'Wednesday Wishlist — Returning',type:'sequence', obj:'reengagement',status:'active', priority:4,enrolled:347, sent:289, delivered:255, read:77,  replied:58,  cold:178, bounced:34},
  {id:5,name:'30-Day Re-engage',              type:'broadcast',obj:'reengagement',status:'draft',  priority:5,enrolled:0,   sent:0,   delivered:0,   read:0,   replied:0,   cold:0,   bounced:0},
  {id:6,name:'Summer Sale — A/B Test',        type:'broadcast',obj:'engagement',  status:'active', priority:1,enrolled:10000,sent:1000,delivered:940,read:162,replied:103,cold:778, bounced:60,  ab_test:true},
];
function loadC(){try{var d=localStorage.getItem(LS_KEY);if(d)return JSON.parse(d);localStorage.setItem(LS_KEY,JSON.stringify(SEED));return JSON.parse(JSON.stringify(SEED));}catch(e){return JSON.parse(JSON.stringify(SEED));}}
function saveC(a){try{localStorage.setItem(LS_KEY,JSON.stringify(a));}catch(e){}}
var CAMPS=loadC();
var activeCampId=1;

/* ── FLOW PERSISTENCE ─────────────────────────────────────── */
var LS_FLOW='gb_flow_';
var SEED_FLOWS={
  1:[
    {id:'n1',type:'segment-enroll',parentId:null, branch:null,cfg:{segments:['All Contacts — Tier 1'],api_events:[],web_sources:[],reentry:'never'}},
    {id:'n2',type:'send-wa',       parentId:'n1', branch:null,cfg:{template:'diwali_flash_offer_v2',dnd:true,retry:1}},
    {id:'n3',type:'condition',     parentId:'n2', branch:null,cfg:{logic:'OR',conditions:[{group:'msg',field:'replied',op:'is',val:true}]}},
    {id:'n4',type:'exit-success',  parentId:'n3', branch:'yes',cfg:{label:'Replied — converted'}},
    {id:'n5',type:'wait-delay',    parentId:'n3', branch:'no', cfg:{amount:24,unit:'hours'}},
    {id:'n6',type:'add-cold-seg',  parentId:'n5', branch:null,cfg:{segment:'Cold — Diwali No Reply'}},
    {id:'n7',type:'exit-cold',     parentId:'n6', branch:null,cfg:{label:'Cold — no reply after 24h'}},
  ],
  2:[
    {id:'n1',type:'api-trigger',   parentId:null, branch:null,cfg:{event:'form_submit',source:'webinar_signup'}},
    {id:'n2',type:'send-wa',       parentId:'n1', branch:null,cfg:{template:'webinar_welcome_v1',dnd:true,retry:1}},
    {id:'n3',type:'condition',     parentId:'n2', branch:null,cfg:{logic:'OR',conditions:[{group:'msg',field:'read',op:'is',val:true}]}},
    {id:'n4',type:'send-wa',       parentId:'n3', branch:'yes',cfg:{template:'webinar_speakers_v1',dnd:true,retry:1}},
    {id:'n5',type:'wait-delay',    parentId:'n3', branch:'no', cfg:{amount:48,unit:'hours'}},
    {id:'n6',type:'exit-success',  parentId:'n4', branch:null,cfg:{label:'Engaged'}},
    {id:'n7',type:'add-cold-seg',  parentId:'n5', branch:null,cfg:{segment:'Cold — Webinar No Read'}},
    {id:'n8',type:'exit-cold',     parentId:'n7', branch:null,cfg:{label:'Cold — never read'}},
  ],
  4:[
    {id:'n1',type:'web-returning', parentId:null, branch:null,cfg:{page:'any',session:'30min',mode:'immediate',freq:'7d'}},
    {id:'n2',type:'condition',     parentId:'n1', branch:null,cfg:{logic:'OR',conditions:[{group:'contact',field:'in_whatsapp',op:'is',val:true}]}},
    {id:'n3',type:'send-wa',       parentId:'n2', branch:'yes',cfg:{template:'returning_visitor_wed_v2',dnd:true,retry:1}},
    {id:'n4',type:'exit-success',  parentId:'n2', branch:'no', cfg:{label:'Not on WhatsApp'}},
    {id:'n5',type:'tag-contact',   parentId:'n3', branch:null,cfg:{add:'wishlist-engaged',remove:''}},
    {id:'n6',type:'exit-success',  parentId:'n5', branch:null,cfg:{label:'Tagged and exited'}},
  ],
  6:[
    {id:'n1',type:'segment-enroll',parentId:null, branch:null,cfg:{segments:['All Contacts — Tier 1'],reentry:'never'}},
    {id:'n2',type:'ab-test',       parentId:'n1', branch:null,cfg:{template_a:'diwali_flash_offer_v2',template_b:'discount_10pct_v1',test_pct:10,metric:'replied',window_minutes:30,auto_winner:true,winner:'b',status:'rollout'}},
    {id:'n3',type:'condition',     parentId:'n2', branch:null,cfg:{logic:'OR',conditions:[{group:'msg',field:'replied',op:'is',val:true}]}},
    {id:'n4',type:'exit-success',  parentId:'n3', branch:'yes',cfg:{label:'Replied — summer sale'}},
    {id:'n5',type:'wait-delay',    parentId:'n3', branch:'no', cfg:{amount:24,unit:'hours'}},
    {id:'n6',type:'add-cold-seg',  parentId:'n5', branch:null,cfg:{segment:'Cold — Summer No Reply'}},
    {id:'n7',type:'exit-cold',     parentId:'n6', branch:null,cfg:{label:'Cold after 24h'}},
  ],
};
function loadFlow(id){
  try{var d=localStorage.getItem(LS_FLOW+id);if(d)return JSON.parse(d);return SEED_FLOWS[id]?JSON.parse(JSON.stringify(SEED_FLOWS[id])):[];}
  catch(e){return SEED_FLOWS[id]?JSON.parse(JSON.stringify(SEED_FLOWS[id])):[];}
}
function saveFlow(id,flow){try{localStorage.setItem(LS_FLOW+id,JSON.stringify(flow));}catch(e){}}

/* ── ANALYTICS DATA ───────────────────────────────────────── */
var ANA={
  1:{obj:'engagement', type:'broadcast',enrolled:8420,sent:8420,delivered:7780,read:1204,replied:840,cold:6576,bounced:640,
     nm:{'n2':{sent:8420,delivered:7780,read:1204,replied:840,clicked:320},'n3':{entered:7780,yes:840,no:6940}}},
  2:{obj:'conversion',  type:'sequence', enrolled:2150,sent:2150,delivered:1895,read:489, replied:396,cold:1406,bounced:255,
     nm:{'n2':{sent:2150,delivered:1895,read:489,replied:396,clicked:180},'n3':{entered:1895,yes:489,no:1406},'n4':{sent:489,delivered:462,read:144,replied:112,clicked:48}}},
  3:{obj:'conversion',  type:'sequence', enrolled:5300,sent:5300,delivered:4198,read:605, replied:435,cold:3593,bounced:1102,
     nm:{'n2':{sent:5300,delivered:4198,read:605,replied:435,clicked:112},'n3':{entered:4198,yes:605,no:3593}}},
  4:{obj:'reengagement',type:'sequence', enrolled:347, sent:289, delivered:255, read:77,  replied:58, cold:178, bounced:34,
     nm:{'n3':{sent:289,delivered:255,read:77,replied:58,clicked:22},'n2':{entered:289,yes:255,no:34}}},
  5:{obj:'reengagement',type:'broadcast',enrolled:0,   sent:0,   delivered:0,   read:0,   replied:0,  cold:0,   bounced:0,  nm:{}},
  6:{obj:'engagement',  type:'broadcast',enrolled:10000,sent:1000,delivered:940,read:162,replied:103,cold:778, bounced:60,
     ab_test:{status:'rollout',winner:'b',rollout_sent:7200,rollout_total:9000,metric:'replied',window_minutes:30,auto_winner:true},
     nm:{
       'n2':{a_sent:500,a_delivered:478,a_read:62,a_replied:32,b_sent:500,b_delivered:462,b_read:100,b_replied:71,status:'rollout',winner:'b'},
       'n3':{entered:940,yes:103,no:837}
     }
  },
};

/* ── NODE TYPE METADATA ───────────────────────────────────── */
var NM={
  'segment-enroll': {group:'entry',    label:'Segment Enrollment',    ic:'🎯',bg:'#EEF4FF',desc:'Enroll contacts from a segment'},
  'csv-upload':     {group:'entry',    label:'Upload List (CSV/Excel)',ic:'📄',bg:'#EEF4FF',desc:'Bulk upload from spreadsheet'},
  'api-trigger':    {group:'entry',    label:'API Trigger',           ic:'⚡',bg:'#EDE9FE',desc:'API call enrolls a contact'},
  'web-returning':  {group:'entry',    label:'Web Returning Visitor', ic:'🌐',bg:'#EDE9FE',desc:'Returning website visitor'},
  'ab-test':        {group:'experiment',label:'A/B Test',              ic:'⚗️',bg:'#F3E8FF',desc:'Test 2 templates, roll out winner'},
  'send-wa':        {group:'message',  label:'Send WhatsApp',         ic:'💬',bg:'#E6FAF1',desc:'Send approved WA template'},
  'send-call':      {group:'message',  label:'Outbound Call',         ic:'📞',bg:'#F1F5F9',desc:'Outbound call (coming soon)',disabled:true},
  'condition':      {group:'condition',label:'Condition',             ic:'⑃', bg:'#FEF3C7',desc:'Branch on message status or contact field'},
  'wait-delay':     {group:'wait',     label:'Wait',                  ic:'⏱',bg:'#F1F5F9',desc:'Delay before next step'},
  'update-stage':   {group:'action',   label:'Update CRM Stage',      ic:'📋',bg:'#E6FAF1',desc:'Move to a pipeline stage'},
  'assign-inbox':   {group:'action',   label:'Assign to Inbox',       ic:'📥',bg:'#E6FAF1',desc:'Route to specific inbox'},
  'assign-owner':   {group:'action',   label:'Assign to Owner',       ic:'👤',bg:'#EEF4FF',desc:'Assign to contact owner'},
  'assign-team':    {group:'action',   label:'Assign to Team',        ic:'👥',bg:'#EEF4FF',desc:'Assign to team (round-robin)'},
  'assign-pipeline':{group:'action',   label:'Move to Pipeline',      ic:'🔀',bg:'#EDE9FE',desc:'Move to a different pipeline'},
  'add-success-seg':{group:'action',   label:'Add to Success Segment',ic:'✅',bg:'#E6FAF1',desc:'Mark as converted / hot'},
  'add-cold-seg':   {group:'action',   label:'Mark Cold',             ic:'🥶',bg:'#EEF4FF',desc:'Add to cold / no-response segment'},
  'update-field':   {group:'action',   label:'Update Contact Field',  ic:'✏️',bg:'#FEF3C7',desc:'Set a contact field value'},
  'tag-contact':    {group:'action',   label:'Tag Contact',           ic:'🏷',bg:'#E6FAF1',desc:'Add or remove a tag'},
  'exit-success':   {group:'exit',     label:'Exit — Success',        ic:'✅',bg:'#E6FAF1',desc:'Converted or completed'},
  'exit-cold':      {group:'exit',     label:'Exit — Cold',           ic:'❄️',bg:'#EEF4FF',desc:'No engagement — cold contact'},
  'exit-failure':   {group:'exit',     label:'Exit — Bounced',        ic:'⛔',bg:'#FEE2E2',desc:'Bounced or opted out'},
  'exit-dropped':   {group:'exit',     label:'Exit — Dropped',        ic:'🚫',bg:'#FFF7ED',desc:'Contact did not meet enrollment conditions'},
};

var OPTS_AFTER={
  'segment-enroll': ['ab-test','send-wa','condition','wait-delay'],
  'csv-upload':     ['ab-test','send-wa','condition','wait-delay'],
  'api-trigger':    ['ab-test','send-wa','condition','wait-delay','update-stage'],
  'web-returning':  ['ab-test','condition','send-wa','wait-delay'],
  'ab-test':        ['condition','wait-delay','tag-contact','assign-inbox','assign-owner','assign-team','update-field','exit-success','exit-cold','exit-failure','exit-dropped'],
  'send-wa':        ['condition','wait-delay','tag-contact','assign-inbox','assign-owner','assign-team','update-field','exit-success','exit-cold','exit-failure','exit-dropped'],
  'wait-delay':     ['send-wa','condition','tag-contact','assign-inbox','assign-team','update-field','exit-cold','exit-failure','exit-dropped'],
  'update-stage':   ['send-wa','condition','wait-delay','assign-inbox','assign-team','exit-success','exit-cold'],
  'assign-inbox':   ['tag-contact','update-field','exit-success'],
  'assign-owner':   ['tag-contact','update-field','exit-success'],
  'assign-team':    ['tag-contact','update-field','exit-success'],
  'assign-pipeline':['send-wa','wait-delay','exit-cold'],
  'add-success-seg':['exit-success'],
  'add-cold-seg':   ['exit-cold'],
  'update-field':   ['send-wa','condition','exit-success','exit-cold'],
  'tag-contact':    ['send-wa','wait-delay','assign-inbox','assign-team','exit-success','exit-cold'],
  'yes':            ['send-wa','wait-delay','update-stage','assign-inbox','assign-owner','assign-team','assign-pipeline','add-success-seg','add-cold-seg','update-field','tag-contact','exit-success','exit-cold','exit-failure','exit-dropped'],
  'no':             ['send-wa','wait-delay','update-stage','assign-inbox','assign-owner','assign-team','assign-pipeline','add-success-seg','add-cold-seg','update-field','tag-contact','exit-success','exit-cold','exit-failure','exit-dropped'],
  'main':           ['segment-enroll','csv-upload','api-trigger','web-returning'],
};

var PICKER_SECS=[
  {title:'Entry',      types:['segment-enroll','csv-upload','api-trigger','web-returning']},
  {title:'Experiment', types:['ab-test']},
  {title:'Message',    types:['send-wa','send-call']},
  {title:'Condition',  types:['condition']},
  {title:'Wait',     types:['wait-delay']},
  {title:'Actions',  types:['update-stage','assign-inbox','assign-owner','assign-team','assign-pipeline','add-success-seg','add-cold-seg','update-field','tag-contact']},
  {title:'Exit',     types:['exit-success','exit-cold','exit-failure','exit-dropped']},
];

var TEMPLATES=[
  {id:'diwali_flash_offer_v2',  name:'Diwali Flash Offer v2',       cat:'Marketing'},
  {id:'diwali_flash_offer_v1',  name:'Diwali Flash Offer v1',       cat:'Marketing'},
  {id:'diwali_thankyou_v1',     name:'Diwali Thank You',            cat:'Utility'},
  {id:'webinar_welcome_v1',     name:'Webinar Welcome',             cat:'Marketing'},
  {id:'webinar_speakers_v1',    name:'Webinar Speakers Spotlight',  cat:'Marketing'},
  {id:'webinar_reminder_1d',    name:'Webinar Reminder — 1 day',    cat:'Utility'},
  {id:'webinar_recording',      name:'Webinar Recording Link',      cat:'Utility'},
  {id:'returning_visitor_wed_v2',name:'Wednesday Wishlist Offer',   cat:'Marketing'},
  {id:'returning_visitor_immediate_v1',name:'Returning Visitor Offer',cat:'Marketing'},
  {id:'re_engage_diwali_v1',    name:'Re-engage — Diwali',          cat:'Marketing'},
  {id:'q4_upsell_premium_v1',   name:'Q4 Upsell — Premium',         cat:'Marketing'},
  {id:'reactivation_30d_v1',    name:'30-Day Reactivation',         cat:'Marketing'},
  {id:'discount_10pct_v1',      name:'10% Discount Offer',          cat:'Marketing'},
  {id:'cart_abandon_v1',        name:'Cart Abandonment Follow-up',  cat:'Marketing'},
  {id:'payment_reminder_v1',    name:'Payment Reminder',            cat:'Utility'},
];

var SEGMENTS=['All Contacts — Tier 1','Education — Webinar Interest','30d Inactive','Premium plan holders','Web returning visitors (30d)','High-value contacts','Trial users','Churned customers'];
var PIPELINES=['Sales Pipeline','Onboarding Flow','Renewal Pipeline','Cold Nurture'];
var INBOXES=['Sales','Support','Education','General'];
var TEAMS=['Sales Team','Education Team','Support Team','Customer Success'];

var OBJ_L   ={engagement:'Engagement',conversion:'Conversion',awareness:'Awareness',reengagement:'Re-engagement'};
var OBJ_IC  ={engagement:'👁',conversion:'📈',awareness:'📢',reengagement:'♻️'};
var TYPE_L  ={broadcast:'Broadcast',sequence:'Sequence'};
var STATUS_L={active:'Active',paused:'Paused',draft:'Draft',completed:'Completed'};

/* UTILITIES */
function esc(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function nt(id,v){var e=document.getElementById(id);if(e)e.textContent=v;}
function ni(id,v){var e=document.getElementById(id);if(e)e.innerHTML=v;}
function fmt(n){return Number(n||0).toLocaleString();}
function today(){return new Date().toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});}
function pct(n,d){return d>0?Math.round(n/d*10)/10+'%':'—';}

// _inbox-data.js — token colors, React shorthands, and all demo data
// Load order: React CDN → ReactDOM CDN → _gb.js → _inbox-data.js → _inbox-icons.js → _inbox-components.js

// TOKENS
var GB='#1B58E3',GBL='#EFF4FF',GBD='#0F1117',WAG='#25D366',TEAL='#0284C7',TBGL='#F0F9FF',TRING='#BAE6FD';
var ST={Live:{bg:'#DCFCE7',cl:'#15803D',dot:'#22C55E',pulse:true},Dropped:{bg:'#FEF2F2',cl:'#B91C1C',dot:'#EF4444',pulse:false},Resolved:{bg:'#F0FDF4',cl:'#15803D',dot:'#4ADE80',pulse:false}};
var R=React,useState=R.useState,useEffect=R.useEffect,useRef=R.useRef,ce=R.createElement;

// DATA
var CONTACT={name:'Ganesh Krishna',phone:'+91 80121 44822',wa:'+91 80121 44822',company:'Gallabox',website:'https://app.gallabox.com',source:'CTWA',sourceUrl:'https://www.instagram.com/p/C7Kt1lMtbG5/',owner:'Test Mailinator'};
var SESSIONS_INIT=[
  {id:'s1',status:'Live',refCode:'100041',
   sourceUrl:'pricing.gallabox.com/villas',startedAt:'7:27 AM',endedAt:null,msgCount:null,durationMin:null,sessionId:'69f2b713a0c16298e8e7ab9',
   contactMapping:{status:'mapped',contactId:'c-8821',method:'cookie',mappedAt:'7:27 AM',retroactive:false},
   infusion:{createInjectedAt:'7:27 AM',resolveInjectedAt:null,targetThreadId:'wa-thread-9921',method:'auto_resolve',withinWindow:true},
   fields:null},
  {id:'s2',status:'Dropped',refCode:'100040',
   sourceUrl:'gallabox.com/features',startedAt:'Apr 30, 9:14 AM',endedAt:'Apr 30, 9:21 AM',msgCount:6,durationMin:7,sessionId:'4ca1b291d7e823fa0012',
   contactMapping:{status:'mapped',contactId:'c-8821',method:'cookie',mappedAt:'Apr 30, 9:14 AM',retroactive:false},
   infusion:{createInjectedAt:'Apr 30, 9:14 AM',resolveInjectedAt:null,targetThreadId:'wa-thread-9921',method:'auto_resolve',withinWindow:true,refExpired:true},
   fields:{budget:'50L-1Cr',location:'Chennai',timeline:'Within 3 Months'}},
  {id:'s3',status:'Resolved',refCode:'100039',
   sourceUrl:'gallabox.com/pricing',startedAt:'Apr 22, 2:05 PM',endedAt:'Apr 22, 2:14 PM',msgCount:9,durationMin:9,sessionId:'3bdf99c17a2e456cd981',
   contactMapping:{status:'mapped',contactId:'c-8821',method:'phone_capture',mappedAt:'Apr 22, 2:05 PM',retroactive:false},
   infusion:{createInjectedAt:'Apr 22, 2:05 PM',resolveInjectedAt:'Apr 22, 2:14 PM',targetThreadId:'wa-thread-9921',method:'auto_resolve',withinWindow:true,refExpired:true},
   fields:{budget:'Above 1 Crore',location:'Bangalore',timeline:'6-12 Months',intentType:'Commercial Property',leadScore:6,summary:'Ganesh was exploring pricing options for commercial property in Bangalore with a budget above 1 Crore and a timeline of 6-12 months. Shared contact via phone during session. Longer timeline suggests active research phase — moderate intent, warm but not yet urgent.'}}
];
var SESSION_DONE={id:'s1',status:'Resolved',refCode:'100041',
  sourceUrl:'pricing.gallabox.com/villas',startedAt:'7:27 AM',endedAt:'7:34 AM',msgCount:10,durationMin:7,sessionId:'69f2b713a0c16298e8e7ab9',injectedAt:'7:34 AM',
  contactMapping:{status:'mapped',contactId:'c-8821',method:'cookie',mappedAt:'7:27 AM',retroactive:false},
  infusion:{createInjectedAt:'7:27 AM',resolveInjectedAt:'7:34 AM',targetThreadId:'wa-thread-9921',method:'auto_resolve',withinWindow:true},
  fields:{budget:'50L – 1 Crore',location:'Chennai',timeline:'Within 3 months',intentType:'Villa Purchase',leadScore:8,summary:'Ganesh is actively looking for a villa in Chennai with a budget of 50L–1 Crore and a purchase timeline of within 3 months. He engaged with the villas pricing page, completed the qualification flow, and shared contact details — all strong buying signals. High responsiveness and clear criteria suggest this is a warm lead ready for an immediate follow-up call.'}};
var SESSION_NEW_LIVE={id:'s4',status:'Live',sourceUrl:'gallabox.com/pricing',startedAt:'7:41 AM',endedAt:null,msgCount:null,durationMin:null,sessionId:'a9f3c211b0e7834de123',fields:null};
// out=agent sends right green, in=contact sends left white
var WA_MSGS=[
  {id:1,who:'out',text:'Hi! With boundless possibilities \ud83d\ude80 Delve into a wealth of knowledge about our prestigious organization through our comprehensive PDFs and resources. \ud83c\udf1f Feel free to reach out for further information. \u2600\ufe0f',time:'3:31 PM',note:'Reply with STOP to unsubscribe from marketing messages.'},
  {id:'d1',who:'date',text:'TODAY'},
  {id:'s1',who:'sys',text:'Contact has initiated the conversation at 05:28 PM'},
  {id:2,who:'out',text:'Hi! We regret to inform you that the user you are searching for is currently unavailable.',time:'5:28 PM'}
];
var WEB_MSGS=[
  {id:'w1',who:'in',text:'villas',time:'7:27 AM'},
  {id:'w2',who:'bot',text:'What is your budget range for the villas?',time:'7:27 AM',btns:['Below 50 Lakhs','50-1 Crore','Above 1 Crore']},
  {id:'w3',who:'in',text:'50-1 Crore',time:'7:27 AM'},
  {id:'w4',who:'bot',text:'Which location are you considering for your villa purchase?',time:'7:27 AM',btns:['Chennai','Bangalore','Hyderabad']},
  {id:'w5',who:'in',text:'Chennai',time:'7:27 AM'},
  {id:'w6',who:'bot',text:'When are you looking to make your purchase?',time:'7:28 AM',btns:['Within 3 Months','3-6 Months','6-12 Months']},
  {id:'w7',who:'in',text:'Within 3 Months',time:'7:28 AM'},
  {id:'w8',who:'bot',text:'Thank you! Villa in Chennai, 50L-1Cr, within 3 months. Can we get your contact details?',time:'7:29 AM'},
  {id:'w9',who:'in',text:'Ganesh Krishna, +91 80121 44822',time:'7:29 AM'},
  {id:'w10',who:'bot',text:'Thank you Ganesh! Your details are recorded. Expect a call within 24 hours. \ud83c\udfe0',time:'7:30 AM'}
];
var CONVS=[
  {id:1,name:'Ganesh Krishna',ini:'GK',preview:'Hi! We regret to inform that\u2026',time:'5:28 PM',ch:'wa',unread:1,webN:3,active:true,color:'#8B5CF6'},
  {id:2,name:'Dipak Gowrishankar',ini:'DG',preview:'Hi! We regret to inform that\u2026',time:'Yesterday',ch:'wa',unread:1,webN:0,color:'#EC4899'},
  {id:3,name:'Navayuvan\u2026',ini:'NS',preview:'The base URL of the link you provid\u2026',time:'30 Apr',ch:'wa',unread:0,webN:0,color:'#F59E0B'},
  {id:4,name:'Abel Roshan',ini:'AR',preview:'Hi! We apologize for the inconv\u2026',time:'30 Apr',ch:'wa',unread:1,webN:0,color:'#10B981'},
  {id:5,name:'Dev',ini:'DE',preview:'name: Dev email: Devhhw@ma\u2026',time:'6 Apr',ch:'web',unread:2,webN:2,color:'#3B82F6'},
  {id:6,name:'+91 79041 24381',ini:'79',preview:'This message will be sent if the sta\u2026',time:'26 Mar',ch:'wa',unread:0,webN:0,color:'#6B7280'},
  {id:7,name:'Pravin Saran S',ini:'PS',preview:'Hey Pravin, Stephen from Kun Motc\u2026',time:'19 Mar',ch:'wa',unread:0,webN:0,color:'#F97316'}
];
var VIEWS_DATA=[
  {id:'v1',name:'Ganesh View',emoji:'\u26a1',contacts:[CONVS[0]]},
  {id:'v2',name:'custom views',emoji:'\u26a1',contacts:[CONVS[1],CONVS[4]]},
  {id:'v3',name:'MultiSelect - S\u2026',emoji:'\ud83d\ude0d',warn:true,contacts:[]},
  {id:'v4',name:'Tag month',emoji:'\u26a1',contacts:[]},
  {id:'v5',name:'hot lead',emoji:'\u26a1',contacts:[CONVS[0],CONVS[1]]}
];

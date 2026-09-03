import{A as e,C as t,Dt as n,N as r,l as i,m as a,u as o}from"./runtime-core.esm-bundler-CJwJIixi.js";import{t as s}from"./axios-CCJmxm5Z.js";import{S as c,n as l,t as u}from"./basecomponent-TGs4kQcs.js";var d=l.extend({name:`progressbar`,style:`
    .p-progressbar {
        display: block;
        position: relative;
        overflow: hidden;
        height: dt('progressbar.height');
        background: dt('progressbar.background');
        border-radius: dt('progressbar.border.radius');
    }

    .p-progressbar-value {
        margin: 0;
        background: dt('progressbar.value.background');
    }

    .p-progressbar-label {
        color: dt('progressbar.label.color');
        font-size: dt('progressbar.label.font.size');
        font-weight: dt('progressbar.label.font.weight');
    }

    .p-progressbar-determinate .p-progressbar-value {
        height: 100%;
        width: 0%;
        position: absolute;
        display: none;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        transition: width 1s ease-in-out;
    }

    .p-progressbar-determinate .p-progressbar-label {
        display: inline-flex;
    }

    .p-progressbar-indeterminate .p-progressbar-value::before {
        content: '';
        position: absolute;
        background: inherit;
        inset-block-start: 0;
        inset-inline-start: 0;
        inset-block-end: 0;
        will-change: inset-inline-start, inset-inline-end;
        animation: p-progressbar-indeterminate-anim 2.1s cubic-bezier(0.65, 0.815, 0.735, 0.395) infinite;
    }

    .p-progressbar-indeterminate .p-progressbar-value::after {
        content: '';
        position: absolute;
        background: inherit;
        inset-block-start: 0;
        inset-inline-start: 0;
        inset-block-end: 0;
        will-change: inset-inline-start, inset-inline-end;
        animation: p-progressbar-indeterminate-anim-short 2.1s cubic-bezier(0.165, 0.84, 0.44, 1) infinite;
        animation-delay: 1.15s;
    }

    @keyframes p-progressbar-indeterminate-anim {
        0% {
            inset-inline-start: -35%;
            inset-inline-end: 100%;
        }
        60% {
            inset-inline-start: 100%;
            inset-inline-end: -90%;
        }
        100% {
            inset-inline-start: 100%;
            inset-inline-end: -90%;
        }
    }
    @-webkit-keyframes p-progressbar-indeterminate-anim {
        0% {
            inset-inline-start: -35%;
            inset-inline-end: 100%;
        }
        60% {
            inset-inline-start: 100%;
            inset-inline-end: -90%;
        }
        100% {
            inset-inline-start: 100%;
            inset-inline-end: -90%;
        }
    }

    @keyframes p-progressbar-indeterminate-anim-short {
        0% {
            inset-inline-start: -200%;
            inset-inline-end: 100%;
        }
        60% {
            inset-inline-start: 107%;
            inset-inline-end: -8%;
        }
        100% {
            inset-inline-start: 107%;
            inset-inline-end: -8%;
        }
    }
    @-webkit-keyframes p-progressbar-indeterminate-anim-short {
        0% {
            inset-inline-start: -200%;
            inset-inline-end: 100%;
        }
        60% {
            inset-inline-start: 107%;
            inset-inline-end: -8%;
        }
        100% {
            inset-inline-start: 107%;
            inset-inline-end: -8%;
        }
    }
`,classes:{root:function(e){var t=e.instance;return[`p-progressbar p-component`,{"p-progressbar-determinate":t.determinate,"p-progressbar-indeterminate":t.indeterminate}]},value:`p-progressbar-value`,label:`p-progressbar-label`}}),f={name:`ProgressBar`,extends:{name:`BaseProgressBar`,extends:u,props:{value:{type:Number,default:null},mode:{type:String,default:`determinate`},showValue:{type:Boolean,default:!0}},style:d,provide:function(){return{$pcProgressBar:this,$parentInstance:this}}},inheritAttrs:!1,computed:{progressStyle:function(){return{width:this.value+`%`,display:`flex`}},indeterminate:function(){return this.mode===`indeterminate`},determinate:function(){return this.mode===`determinate`},dataP:function(){return c({determinate:this.determinate,indeterminate:this.indeterminate})}}},p=[`aria-valuenow`,`data-p`],m=[`data-p`],h=[`data-p`],g=[`data-p`];function _(s,c,l,u,d,f){return e(),o(`div`,t({role:`progressbar`,class:s.cx(`root`),"aria-valuemin":`0`,"aria-valuenow":s.value,"aria-valuemax":`100`,"data-p":f.dataP},s.ptmi(`root`)),[f.determinate?(e(),o(`div`,t({key:0,class:s.cx(`value`),style:f.progressStyle,"data-p":f.dataP},s.ptm(`value`)),[s.value!=null&&s.value!==0&&s.showValue?(e(),o(`div`,t({key:0,class:s.cx(`label`),"data-p":f.dataP},s.ptm(`label`)),[r(s.$slots,`default`,{},function(){return[a(n(s.value+`%`),1)]})],16,h)):i(``,!0)],16,m)):f.indeterminate?(e(),o(`div`,t({key:1,class:s.cx(`value`),"data-p":f.dataP},s.ptm(`value`)),null,16,g)):i(``,!0)],16,p)}f.render=_;var v={summary:()=>s.get(`/v1/crm/finance/summary`),list:e=>s.get(`/v1/crm/finance/business-cases`,{params:e}),uninitialized:e=>s.get(`/v1/crm/finance/uninitialized-business-cases`,{params:e}),detail:e=>s.get(`/v1/crm/finance/business-cases/${e}`),payments:e=>s.get(`/v1/crm/finance/business-cases/${e}/payments`),risks:e=>s.get(`/v1/crm/finance/business-cases/${e}/risks`),settlement:e=>s.get(`/v1/crm/finance/business-cases/${e}/settlement`),history:e=>s.get(`/v1/crm/finance/business-cases/${e}/history`),initialize:(e,t)=>s.post(`/v1/crm/finance/business-cases/${e}`,t)};Object.freeze({myPerformance:[`SALES`,`SALES_SUPERVISOR`,`ADMIN`],teamPerformance:[`SALES_SUPERVISOR`,`ADMIN`],financeCenter:[`ADMIN`]});var y={DRAFT:`草稿`,FROZEN:`已凍結`,OPEN:`結算中`,FINALIZED:`已結算`},b={OPERATING:`進行中`,PAUSED:`暫停`,ADMINISTRATIVE_ASSISTANCE:`行政協助`,FAILED:`未成交`,CLOSED:`已結案`},x={EQUITY:`股權`,PARKING:`停車位`,LICENSE:`牌照`,NETWORK:`網路`},S={BUY:`買方`,SELL:`賣方`},C={RECEIVED:`已收款`,VOIDED:`已作廢`},w={FINANCE_NOT_FROZEN:`財務尚未凍結`,CASE_NOT_CLOSED:`案件尚未結案`,CLOSED_APPROVAL_MISSING:`缺少結案核准`,PAYMENT_INCOMPLETE:`服務費尚未收齊`,ALREADY_FINALIZED:`結算已完成`,UNRESOLVED_DEFICIT:`仍有未解決差額`,SUPERVISOR_PARTICIPATES_IN_CASE:`需由最高管理者核准`,CONTRIBUTION_REQUIRED:`尚待貢獻比例核准`,FINANCE_FROZEN:`財務資料已凍結`},T=e=>e?y[e]||`未知狀態`:`尚未結算`,E=e=>b[e]||`未知狀態`,D=e=>x[e]||`其他`,O=e=>S[e]||`未知方向`,k=e=>C[e]||`未知狀態`,A=e=>w[e]||`目前不可執行`,j=e=>new Intl.NumberFormat(`zh-TW`,{style:`currency`,currency:`TWD`,maximumFractionDigits:0}).format(e);export{j as a,v as c,T as i,f as l,D as n,k as o,O as r,A as s,E as t};
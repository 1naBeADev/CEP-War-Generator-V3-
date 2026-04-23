
let concernType = document.getElementById("concernType");
let voc_inq = document.getElementById("voc-inq");
let voc_ffup = document.getElementById("voc-ffup");
let voc_comp = document.getElementById("voc-comp");
let voc_aftersales = document.getElementById("voc-aftersales");
let voc_others = document.getElementById("voc-others");
let buttonDiv = document.getElementById("buttonDiv");

let ticketCreation = document.getElementById("ticketCreation");
let follow_up = document.getElementById("follow-up");
let aftersales = document.getElementById("aftersales");

let = resultDivABCA = document.getElementById("resultDivABCA");
let = resultDivNote1 = document.getElementById("resultDivNote1");
let = resultDivSI = document.getElementById("resultDivSI");

let CEPbtn = document.getElementById("CEPbtn");
let cepBTNoptDiv = document.getElementById("cepBTNoptDiv");

let resABCAbtn = document.getElementById("resABCAbtn");
let cepNoteBtn = document.getElementById("cepNoteBtn");
let siBtn = document.getElementById("siBtn");
let showDiv = document.getElementById("showDiv");

let vocD_inq = document.getElementById("vocD_inq");
let vocD_ffup = document.getElementById("vocD_ffup");
let vocD_comp = document.getElementById("vocD_comp");
let vocD_aftersales = document.getElementById("vocD_aftersales");
let vocD_others = document.getElementById("vocD_others");

let closeBTN = document.querySelectorAll(".closeBTN");

concernType.addEventListener("change",()=>{
    console.log(concernType.value)

    voc_inq.style.display = "none";
    voc_ffup.style.display = "none";
    voc_comp.style.display = "none";
    voc_aftersales.style.display = "none";
    voc_others.style.display = "none";

    ticketCreation.style.display = "none";
    follow_up.style.display = "none";
    buttonDiv.style.display = "none";
    aftersales.style.display = "none";

    if (concernType.value == "Inquiry"){
    voc_inq.style.display = "block";
    voc_ffup.style.display = "none";
    voc_comp.style.display = "none";
    voc_aftersales.style.display = "none";
    voc_others.style.display = "none";
    }
    else if (concernType.value == "Complaint"){
    voc_inq.style.display = "none";
    voc_ffup.style.display = "none";
    voc_comp.style.display = "block";
    voc_aftersales.style.display = "none";
    voc_others.style.display = "none";
    }
    else if (concernType.value == "Follow-up"){
    voc_inq.style.display = "none";
    voc_ffup.style.display = "block";
    voc_comp.style.display = "none";
    voc_aftersales.style.display = "none";
    voc_others.style.display = "none";
    }
    else if (concernType.value == "Aftersales"){
    voc_inq.style.display = "none";
    voc_ffup.style.display = "none";
    voc_comp.style.display = "none";
    voc_aftersales.style.display = "block";
    voc_others.style.display = "none";
    }
    else if (concernType.value == "Others"){
    voc_inq.style.display = "none";
    voc_ffup.style.display = "none";
    voc_comp.style.display = "none";
    voc_aftersales.style.display = "none";
    voc_others.style.display = "block";
    }
})

vocD_inq.addEventListener("change", ()=>{

    const inqs = [
    "Account Inquiry",
    "Billing Inquiry",
    "Permanent Disconnection",
    "Reconnection From PD",
    "Reconnection From TD",
    "Rerouting Request",
    "Relocation Request",
    "Upgrade Request",
    "Resume VTD",
    "VTD",
    "Change Number",
    "Winback Offer for Disconnection Request for Direct Line Service Only",
    "Unposted Payment",
    "Copy of Bill",
    "BOL/e Enrollment",
    "Service Rebate",
    "​Change Number"
];

    if(inqs.includes(vocD_inq.value)){
        buttonDiv.style.display = "grid";
    }else{
         buttonDiv.style.display = "none";
    }
})

vocD_comp.addEventListener("change", ()=>{

    const validComplaints = [
    "No Internet Connection and Dialtone",
    "No Internet Connection",
    "Bridge Mode Configuration",
    "CGNAT Deactivation/Activation",
    "LAN Port Activation",
    "Port Forwarding",
    "Selective Browsing",
    "No Dial Tone",
    "Cannot Make Call",
    "Cannot Receive Call",
    "Cannot Make and Receive Call"
];

    if(validComplaints.includes(vocD_comp.value)){
        ticketCreation.style.display = "block";
        buttonDiv.style.display = "grid";
    }else{
        ticketCreation.style.display = "none";
         buttonDiv.style.display = "none";
    }
})

vocD_ffup.addEventListener("change", ()=>{

    const fFfup = [
    "Follow up Voice and Data Problem",
    "Follow up No internet Connection",
    "Follow up Slow browsing",
    "Follow up Intermittent Connection",
    "Follow up No Dialtone",
    "Follow up Cannot make_receive call",
    "Follow up Relocation Request",
    "Follow up Upgrade Request",
    "Follow up Reconnection from TD",
    "Follow up Reconnection from PD",
    "Follow up New Connect",
    "Follow up Rerouting",
    "Follow up Change Number",
    "Follow up Unposted Payment",
    "Follow up Copy of Bill",
    "Follow up BOL/e Enrollment",
    "Follow up Service Rebate"
];

    if(fFfup.includes(vocD_ffup.value)){
        follow_up.style.display = "block";
        buttonDiv.style.display = "grid";
    }else{
        follow_up.style.display = "none";
         buttonDiv.style.display = "none";
    }
})

vocD_aftersales.addEventListener("change", ()=>{

    const aftersopt = [
    "Change Number",
    "Permanent Disconnection",
    "Reconnection from OP",
    "Reconnection from PD",
    "Rerouting Request",
    "Relocation Request",
    "Resume VTD",
    "Upgrade Request",
    "Voluntary VTD",
    "Downgrade Request"
];

    if(aftersopt.includes(vocD_aftersales.value)){
        aftersales.style.display = "block";
        buttonDiv.style.display = "grid";
    }else{
        aftersales.style.display = "none";
        buttonDiv.style.display = "none";
    }
})

vocD_others.addEventListener("change", ()=>{

    const others = [
    "Home Concern",
    "Smart Concern"
];

    if(others.includes(vocD_others.value)){
        buttonDiv.style.display = "grid";
    }else{
        buttonDiv.style.display = "none";
    }
})




CEPbtn.addEventListener("click",()=>{
    cepBTNoptDiv.classList.toggle("toogleoff");
})





let abcatxtfield = document.getElementById("abcatxtfield");

// abca text field values
// Show buttons


function getIfVisible(){
    let voc = document.querySelectorAll(".concern");

    for(let x of voc){
        if (x.offsetParent !== null){
            return x.value;
        }
    }

    return "";
}

resABCAbtn.addEventListener("click",()=>{

    let ani = document.getElementById("ani").value;
    let account = document.getElementById("account").value
    let concern = getIfVisible();
    let actionTaken = document.getElementById("actionTaken").value;

    showDiv.style.display = "flex";
    
    resultDivABCA.style.display = "flex";
    resultDivNote1.style.display = "none";
    resultDivSI.style.display = "none";

    abcatxtfield.value =`Ani: ${ani}
Billing Account Number: ${account}
concern: ${concern}
action Taken: ${actionTaken}
    `;
})

cepNoteBtn.addEventListener("click",()=>{

    let sfdc = document.getElementById("sfdcCase").value;
    let cName = document.getElementById("cName").value;
    let cnum = document.getElementById("cnum").value;
    let cmail = document.getElementById("cmail").value;
    let wpermit = document.getElementById("wpermit").value;
    let adt = document.getElementById("adt").value;
    let cvResult = document.getElementById("cvResult").value;
    let wocastxtarea = document.getElementById("wocastxtarea").value;
    let actionTaken = document.getElementById("actionTaken").value;
    let serial = document.getElementById("serial").value;
    let lightStatus = document.getElementById("lightStatus").value;


    showDiv.style.display = "flex";
    
    resultDivABCA.style.display = "none";
    resultDivNote1.style.display = "flex";
    resultDivSI.style.display = "none";

    cepnote1txtfield.value =`Contact Channel Vendor: Hotline - CND
SFDC Case Number: ${sfdc}
Contact Name: ${cName}
Contact Number: ${cnum}
Contact Email: ${cmail}
Working Permit: ${wpermit}
Availability Date and Time: ${adt}
Clearview Test Result: ${cvResult}
Serial number: ${serial}
lightStatus: ${lightStatus}
Complaint Remarks / WOCAS: ${wocastxtarea}
action Taken: ${actionTaken}
    `
})

siBtn.addEventListener("click",()=>{

    let phone = document.getElementById("phone").value;
    let callerName = document.getElementById("callerName").value;
    let cName = document.getElementById("cName").value;
    let cnum = document.getElementById("cnum").value;
    let cmail = document.getElementById("cmail").value;
    let wpermit = document.getElementById("wpermit").value;
    let adt = document.getElementById("adt").value;


    showDiv.style.display = "flex";
    
    resultDivABCA.style.display = "none";
    resultDivNote1.style.display = "none";
    resultDivSI.style.display = "flex";

    sitxtfield.value = `Phone Number: ${phone}
Caller Name: ${callerName}
Contact Name: ${cName}
Contact Number: ${cnum}
Contact Email: ${cmail}
Working Permit: ${wpermit}
Availability Date and Time: ${adt}
    `
})



closeBTN.forEach((e)=>
    e.addEventListener("click",()=>{
        showDiv.style.display = "none";  
    })
)


let resetBtn = document.getElementById("resetBtn");

resetBtn.addEventListener("click", resetForm);

function resetForm() {
    document.querySelectorAll("input, textarea").forEach(el => {
        el.value = "";
    });

    document.querySelectorAll("select").forEach(el => {
        el.selectedIndex = 0;
    });

    voc_inq.style.display = "none";
    voc_ffup.style.display = "none";
    voc_comp.style.display = "none";
    voc_aftersales.style.display = "none";
    voc_others.style.display = "none";


    ticketCreation.style.display = "none";
    follow_up.style.display = "none";
    aftersales.style.display = "none";

    buttonDiv.style.display = "none";

    showDiv.style.display = "none";
    resultDivABCA.style.display = "none";
    resultDivNote1.style.display = "none";
    resultDivSI.style.display = "none";


    cepBTNoptDiv.classList.add("toogleoff");
}

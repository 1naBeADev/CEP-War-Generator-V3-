document.addEventListener('DOMContentLoaded', () => {

  // --- Theme Mode State Management ---
  const themeToggle = document.getElementById('themeToggle');
  themeToggle.addEventListener('click', () => {
    const currentTheme = document.body.getAttribute('data-theme');
    const targetTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.body.setAttribute('data-theme', targetTheme);
    themeToggle.innerHTML = targetTheme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
  });

  // Dynamic Theme Palette Customizations
  const agentThemePicker = document.getElementById('agentThemePicker');
  agentThemePicker.addEventListener('input', (e) => {
    document.documentElement.style.setProperty('--primary', e.target.value);
  });

  // --- Overlay Modals Interactions ---
  const loginReminderScreen = document.getElementById('loginReminderScreen');
  const dismissReminderBtn = document.getElementById('dismissReminderBtn');
  dismissReminderBtn.addEventListener('click', () => {
    loginReminderScreen.style.display = 'none';
  });

  const metaTrackerOrb = document.getElementById('metaTrackerOrb');
  const metaTrackerDrawer = document.getElementById('metaTrackerDrawer');
  const closeMetaDrawerBtn = document.getElementById('closeMetaDrawerBtn');

  metaTrackerOrb.addEventListener('click', () => {
    metaTrackerDrawer.classList.toggle('open');
  });
  closeMetaDrawerBtn.addEventListener('click', () => {
    metaTrackerDrawer.classList.remove('open');
  });

  // --- Structural Context Switchers (Channel Specific UI Layers) ---
  const contactChannel = document.getElementById('contactChannel');
  const abcaHL = document.getElementById('abcaHL');
  const abcaSA = document.getElementById('abcaSA');
  const abcaEC = document.getElementById('abcaEC');

  contactChannel.addEventListener('change', (e) => {
    const channel = e.target.value;
    abcaHL.style.display = 'none';
    abcaSA.style.display = 'none';
    abcaEC.style.display = 'none';

    if (channel === 'ENT-HOTLINE') {
      abcaHL.style.display = 'block';
    } else if (channel === 'ENT-SANA ALL') {
      abcaSA.style.display = 'block';
    } else if (channel === 'ENT-EMAIL') {
      abcaEC.style.display = 'block';
    }
  });

  // --- Structural Context Switchers (Concern Strategy Dropdowns) ---
  const concernType = document.getElementById('concernType');
  const vocInq = document.getElementById('voc-inq');
  const vocFfup = document.getElementById('voc-ffup');
  const vocComp = document.getElementById('voc-comp');
  const vocAftersales = document.getElementById('voc-aftersales');
  const vocOthers = document.getElementById('voc-others');

  const ticketCreation = document.getElementById('ticketCreation');
  const followUpPanel = document.getElementById('follow-up');
  const aftersalesPanel = document.getElementById('aftersales');

  concernType.addEventListener('change', (e) => {
    const val = e.target.value;
    vocInq.style.display = 'none';
    vocFfup.style.display = 'none';
    vocComp.style.display = 'none';
    vocAftersales.style.display = 'none';
    vocOthers.style.display = 'none';

    ticketCreation.style.display = 'none';
    followUpPanel.style.display = 'none';
    aftersalesPanel.style.display = 'none';

    if (val === 'Inquiry') {
      vocInq.style.display = 'block';
    } else if (val === 'Follow-up') {
      vocFfup.style.display = 'block';
      followUpPanel.style.display = 'block';
    } else if (val === 'Complaint') {
      vocComp.style.display = 'block';
      ticketCreation.style.display = 'block';
    } else if (val === 'Aftersales') {
      vocAftersales.style.display = 'block';
      aftersalesPanel.style.display = 'block';
    } else if (val === 'Others') {
      vocOthers.style.display = 'block';
    }
  });

  // --- Template Generators Core Engine Logic ---
  const noteppad = document.getElementById('noteppad');
  const abcatxtfield = document.getElementById('abcatxtfield');
  const cepnote1txtfield = document.getElementById('cepnote1txtfield');
  const sitxtfield = document.getElementById('sitxtfield');
  const metaOrbBadgeCount = document.getElementById('metaOrbBadgeCount');

  function getActiveVocValue() {
    const activeSelect = document.querySelector('.concern:not([style*="display: none"]):not([style*="display:none"]) select, select.concern:not([style*="display: none"]):not([style*="display:none"])');
    return activeSelect ? activeSelect.value : '';
  }

  // Generate CEP Action
  document.getElementById('CEPbtn').addEventListener('click', () => {
    const agentName = document.querySelector('input[name="aName"]').value;
    const teamLead = document.querySelector('input[name="teamLead"]').value;
    const username = document.querySelector('input[name="t_name"]').value;
    const channel = contactChannel.value;
    const concern = concernType.value;
    const activeVoc = getActiveVocValue();
    const wocas = document.getElementById('wocastxtarea').value;

    let segmentBlock = '';

    if (concern === 'Complaint') {
      segmentBlock = [
        `SFDC Case Number: ${document.querySelector('#ticketCreation input[name="sfdcCase"]').value}`,
        `Contact: ${document.querySelector('#ticketCreation input[name="cName"]').value} (${document.querySelector('#ticketCreation input[name="cnum"]').value} / ${document.querySelector('#ticketCreation input[name="cmail"]').value})`,
        `Permit Required: ${document.querySelector('#ticketCreation input[name="wpermit"]').value}`,
        `Schedule Slot: ${document.querySelector('#ticketCreation input[name="adt"]').value}`,
        `Diagnostics: CV Result: ${document.querySelector('#ticketCreation input[name="cvResult"]').value} | Serial: ${document.querySelector('#ticketCreation input[name="serial"]').value}`,
        `Troubleshooting: ${document.querySelector('#ticketCreation input[name="troubleshooting"]').value}`,
        `ONU Light Status: ${document.querySelector('#ticketCreation input[name="lightStatus"]').value}`,
        `Action Taken: ${document.querySelector('#ticketCreation textarea[name="actionTaken"]').value}`
      ].join('\n');
    } else if (concern === 'Follow-up') {
      segmentBlock = [
        `Billing Account: ${document.querySelector('#follow-up input[name="billNum"]').value}`,
        `Ticket Reference: ${document.querySelector('#follow-up input[name="ticketNum"]').value}`,
        `SFDC Case Number: ${document.querySelector('#follow-up input[name="sfdcCase"]').value}`,
        `Service ID: ${document.querySelector('#follow-up input[name="serviceID"]').value}`
      ].join('\n');
    } else if (concern === 'Aftersales') {
      segmentBlock = [
        `Billing Account: ${document.querySelector('#aftersales input[name="billNum"]').value}`,
        `SFDC Case Number: ${document.querySelector('#aftersales input[name="sfdcCase"]').value}`,
        `Service ID: ${document.querySelector('#aftersales input[name="serviceID"]').value}`
      ].join('\n');
    } else {
      segmentBlock = 'No supplementary context tracking variables required for this structural profile.';
    }

    const compiledCEP = [
      `=== PLDT CEP TRANSACTION SNAPSHOT ===`,
      `TIMESTAMP : ${new Date().toLocaleString()}`,
      `AGENT     : ${agentName} (TL: ${teamLead})`,
      `WORKSPACE : ${username} [${channel}]`,
      `ROUTING   : ${concern} -> ${activeVoc || 'None Selected'}`,
      `WOCAS REF : ${wocas}`,
      `--------------------------------------`,
      segmentBlock,
      `======================================`
    ].join('\n');

    noteppad.value = compiledCEP;
    cepnote1txtfield.value = `[${concern}] ${wocas ? wocas : '(No Summary Checked)'}`;
    sitxtfield.value = `Processed by ${agentName} at ${new Date().toLocaleTimeString()}`;
    metaOrbBadgeCount.textContent = "1";
  });

  // Generate ABCA Action
  document.getElementById('resABCAbtn').addEventListener('click', () => {
    const channel = contactChannel.value;
    let abcaParameters = '';

    if (channel === 'ENT-HOTLINE') {
      abcaParameters = [
        `Channel Framework: PLDT ENTERPRISE HOTLINE`,
        `ANI             : ${document.getElementById('ani').value}`,
        `Caller Identity : ${document.getElementById('callerName').value}`,
        `Account Number  : ${document.getElementById('account').value}`,
        `Phone Baseline  : ${document.getElementById('phone').value}`
      ].join('\n');
    } else if (channel === 'ENT-SANA ALL') {
      abcaParameters = [
        `Channel Framework: SANA ALL TRACKING INTERFACE`,
        `RITM Reference  : ${document.getElementById('ritm').value}`,
        `Received Date   : ${document.getElementById('saDated').value}`,
        `Customer Account: ${document.getElementById('ecCaAcccount').value}`,
        `Billing Account : ${document.getElementById('saBaAccount').value}`,
        `Account Mapping : ${document.querySelector('#abcaSA input[id="ecAccName"]').value}`,
        `Service ID Link : ${document.getElementById('saServiceID').value}`
      ].join('\n');
    } else if (channel === 'ENT-EMAIL') {
      abcaParameters = [
        `Channel Framework: ENTERPRISE CARE INBOUND MAILBOX`,
        `Received Date   : ${document.getElementById('ecDated').value}`,
        `Customer Account: ${document.querySelector('#abcaEC input[id="EcCaAcccount"]').value}`,
        `Billing Account : ${document.getElementById('ecBaAccount').value}`,
        `Account Identity: ${document.querySelector('#abcaEC input[id="ecAccName"]').value}`,
        `Service ID Link : ${document.getElementById('ecServiceID').value}`
      ].join('\n');
    }

    const compiledABCA = [
      `=== PLDT SYSTEM ABCA DATA INFRASTRUCTURE ===`,
      abcaParameters,
      `============================================`
    ].join('\n');

    noteppad.value = compiledABCA;
    abcatxtfield.value = `Active Context Block: Channel [${channel}] Configuration Validated.`;
    metaOrbBadgeCount.textContent = "2";
  });

  // Clear Form Engine Reset Function
  document.getElementById('resetBtn').addEventListener('click', () => {
    document.querySelectorAll('input').forEach(input => {
      if(input.type !== 'color' && input.type !== 'button') input.value = '';
    });
    document.querySelectorAll('textarea').forEach(tx => tx.value = '');
    document.querySelectorAll('select').forEach(sel => sel.selectedIndex = 0);
    
    abcaHL.style.display = 'block';
    abcaSA.style.display = 'none';
    abcaEC.style.display = 'none';
    vocInq.style.display = 'none';
    vocFfup.style.display = 'none';
    vocComp.style.display = 'none';
    vocAftersales.style.display = 'none';
    vocOthers.style.display = 'none';
    ticketCreation.style.display = 'none';
    followUpPanel.style.display = 'none';
    aftersalesPanel.style.display = 'none';
    
    metaOrbBadgeCount.textContent = "0";
  });

  // Save Operations Records Function
  document.getElementById('saveBtn').addEventListener('click', () => {
    if (!noteppad.value.trim()) {
      alert("Workspace notepad contains no transaction record metrics to persist!");
      return;
    }
    localStorage.setItem('latestSavedNoteWorkspace', noteppad.value);
    alert("Record workspace snapshot cached successfully!");
  });

  // Raw File Blueprint Data Exporters
  document.getElementById('toTXTbtn').addEventListener('click', () => {
    const textContent = noteppad.value;
    if (!textContent.trim()) {
      alert("No structured content detected to trigger file build stream.");
      return;
    }
    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `NoteBlock_${new Date().toISOString().slice(0,10)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  });
});
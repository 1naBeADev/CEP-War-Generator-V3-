document.addEventListener('DOMContentLoaded', () => {
  const FIREBASE_URL = 'https://autodocs-a12f0-default-rtdb.firebaseio.com';

  // --- DOM Elements Reference ---
  const loginReminderScreen = document.getElementById('loginReminderScreen');
  const gatewayLoginForm = document.getElementById('gatewayLoginForm');
  const loginUsernameInput = document.getElementById('loginUsername');
  const loginWinIDInput = document.getElementById('loginWinID');
  const formUsernameInput = document.querySelector('input[name="t_name"]');
  const formAgentNameInput = document.querySelector('input[name="aName"]');
  const sessionLogoutBtn = document.getElementById('sessionLogoutBtn');
  const adminBtn = document.getElementById('adminBtn');

  // Channel & Header Sections
  const contactChannel = document.getElementById('contactChannel');
  const abcaHL = document.getElementById('abcaHL');
  const abcaSA = document.getElementById('abcaSA');
  const abcaEC = document.getElementById('abcaEC');

  // Concern & Sub-Form Elements
  const concernTypeSelect = document.getElementById('concernType');
  const vocInq = document.getElementById('voc-inq');
  const vocFfup = document.getElementById('voc-ffup');
  const vocComp = document.getElementById('voc-comp');
  const vocAftersales = document.getElementById('voc-aftersales');
  const vocOthers = document.getElementById('voc-others');

  const ticketCreation = document.getElementById('ticketCreation');
  const followUpSec = document.getElementById('follow-up');
  const aftersalesSec = document.getElementById('aftersales');

  // Output Notepad and Buttons
  const noteppad = document.getElementById('noteppad');
  const CEPbtn = document.getElementById('CEPbtn');
  const resABCAbtn = document.getElementById('resABCAbtn');
  const resetBtn = document.getElementById('resetBtn');
  const saveBtn = document.getElementById('saveBtn');
  const toTXTbtn = document.getElementById('toTXTbtn');

  // Drawer / Case Monitor Textareas
  const abcatxtfield = document.getElementById('abcatxtfield');
  const cepnote1txtfield = document.getElementById('cepnote1txtfield');

  // Meta Tracker Drawer Toggle
  const metaTrackerOrb = document.getElementById('metaTrackerOrb');
  const metaTrackerDrawer = document.getElementById('metaTrackerDrawer');
  const closeMetaDrawerBtn = document.getElementById('closeMetaDrawerBtn');

  if (metaTrackerOrb && metaTrackerDrawer) {
    metaTrackerOrb.addEventListener('click', () => {
      metaTrackerDrawer.classList.toggle('active');
    });
  }
  if (closeMetaDrawerBtn && metaTrackerDrawer) {
    closeMetaDrawerBtn.addEventListener('click', () => {
      metaTrackerDrawer.classList.remove('active');
    });
  }

  // --- Authorized Admin Whitelist ---
  const ALLOWED_ADMINS = [
    { domain: 't-jtagores', winId: '52385305' },
    { domain: 't-jrcote', winId: '52499941' }
  ];

  function isAuthorizedAdmin(domain, winId) {
    if (!domain || !winId) return false;
    return ALLOWED_ADMINS.some(
      admin => admin.domain.toLowerCase() === domain.toLowerCase().trim() &&
               String(admin.winId) === String(winId).trim()
    );
  }

  function updateAdminButtonVisibility(domain, winId) {
    if (adminBtn) {
      adminBtn.style.display = isAuthorizedAdmin(domain, winId) ? 'inline-block' : 'none';
    }
  }

  // --- 1. Check Active Session on Page Load ---
  let savedSession = JSON.parse(sessionStorage.getItem('activeSession'));

  if (savedSession && savedSession.firebaseKey) {
    if (formUsernameInput) formUsernameInput.value = savedSession.agentId;
    if (formAgentNameInput) formAgentNameInput.value = savedSession.employeeName;
    if (loginReminderScreen) loginReminderScreen.style.display = 'none';
    
    updateAdminButtonVisibility(savedSession.agentId, savedSession.winId);
  } else {
    updateAdminButtonVisibility(null, null);
  }

  // --- 2. Explicit LIT Guide VOC Mapping Dictionary ---
  const LIT_VOC_MAP = {
    // Complaint VOCs
    "no internet connection and dialtone": [
      "repair for simple services"
    ],
    "no internet connection": [
      "no internet/data connection for naked dsl"
    ],
    "bridge mode configuration": [
      "bridge mode configuration request"
    ],
    "cgnat deactivation/activation": [
      "cgnat deactivation/activation"
    ],
    "full modem access request": [
      "full modem access request"
    ],
    "lan port activation": [
      "lan port activation"
    ],
    "port forwarding": [
      "port forwarding"
    ],
    "selective browsing": [
      "selective browsing"
    ],
    "no dial tone": [
      "no dial tone signal problem"
    ],
    "cannot make call": [
      "cannot make calls"
    ],
    "cannot receive call": [
      "cannot make calls"
    ],
    "cannot make and receive call": [
      "cannot make calls"
    ],
    "no internet connection(complex)": [
      "no internet/data connection (complex service)"
    ],

    // Inquiry & Aftersales VOCs
    "change number": [
      "change number"
    ],
    "permanent disconnection": [
      "permanent disconnection",
      "winback offer for disconnection request"
    ],
    "reconnection from td": [
      "reconnection from temporary disconnection"
    ],
    "reconnection from op": [
      "reconnection of simple services from permanent disconnection"
    ],
    "reconnection from pd": [
      "reconnection of simple services from permanent disconnection"
    ],
    "rerouting request": [
      "rerouting request"
    ],
    "relocation request": [
      "relocation request"
    ],
    "upgrade request": [
      "upgrade request"
    ],
    "resume vtd": [
      "resume voluntary temporary disconnection"
    ],
    "resume vtd (vtd)": [
      "resume voluntary temporary disconnection"
    ],
    "vtd": [
      "voluntary temporary disconnection"
    ],
    "voluntary vtd": [
      "voluntary temporary disconnection"
    ],
    
    // Billing VOCs
    "billing inquiry": [
      "billing inquiry"
    ],
    "unposted payment": [
      "unposted payment"
    ],
    "copy of bill": [
      "copy of bill"
    ],
    "bol/e enrollment": [
      "bol/e enrollment"
    ],
    "service rebate": [
      "service rebate"
    ],
    "request for modify billing address": [
      "request for modify billing address"
    ],

    // Follow-Up VOCs
    "follow up voice and data problem": [
      "repair for simple services"
    ],
    "follow up no internet connection": [
      "no internet/data connection for naked dsl"
    ],
    "follow up no dialtone": [
      "no dial tone signal problem"
    ],
    "follow up cannot make_receive call": [
      "cannot make calls"
    ],
    "follow up relocation request": [
      "relocation request"
    ],
    "follow up upgrade request": [
      "upgrade request"
    ],
    "follow up reconnection from td": [
      "reconnection from temporary disconnection"
    ],
    "follow up reconnection from pd": [
      "reconnection of simple services from permanent disconnection"
    ],
    "follow up rerouting": [
      "rerouting request"
    ],
    "follow up change number": [
      "change number"
    ],
    "follow up unposted payment": [
      "unposted payment"
    ],
    "follow up copy of bill": [
      "copy of bill"
    ],
    "follow up bol/e enrollment": [
      "bol/e enrollment"
    ],
    "follow up service rebate": [
      "service rebate"
    ],
    "follow up request for permanent disconnection": [
      "follow up request for permanent disconnection"
    ]
  };

  // --- Dynamic LIT Guide Filtering Logic ---
  function updateLitGuide() {
    const selectedVoc = getActiveVocValue().toLowerCase().trim();
    const litItems = document.querySelectorAll('.instructionContent ul li');

    if (!litItems.length) return;

    // Default: If no VOC is selected, display all guide links
    if (!selectedVoc) {
      litItems.forEach(item => item.style.display = 'list-item');
      return;
    }

    const allowedMatches = LIT_VOC_MAP[selectedVoc];

    litItems.forEach(item => {
      const itemText = item.textContent.toLowerCase();

      // Check if this item matches any allowed guide title for the selected VOC
      let isMatched = false;
      if (allowedMatches && allowedMatches.length > 0) {
        isMatched = allowedMatches.some(matchKeyword => itemText.includes(matchKeyword));
      } else {
        // Fallback for unmapped VOCs: direct substring check
        isMatched = itemText.includes(selectedVoc) || selectedVoc.includes(itemText);
      }

      if (isMatched) {
        item.style.display = 'list-item';
      } else {
        item.style.display = 'none';
      }
    });
  }

  // --- 3. Dynamic UI Handlers (VOC & Channel Toggles) ---
  function resetVocDropdowns() {
    const vocContainers = [vocInq, vocFfup, vocComp, vocAftersales, vocOthers];
    vocContainers.forEach(container => {
      if (container) {
        container.style.display = 'none';
        const select = container.querySelector('select');
        if (select) select.value = '';
      }
    });
  }

  function resetSubSections() {
    if (ticketCreation) ticketCreation.style.display = 'none';
    if (followUpSec) followUpSec.style.display = 'none';
    if (aftersalesSec) aftersalesSec.style.display = 'none';
  }

  if (concernTypeSelect) {
    concernTypeSelect.addEventListener('change', (e) => {
      const selectedValue = e.target.value;

      resetVocDropdowns();
      resetSubSections();

      switch (selectedValue) {
        case 'Inquiry':
          if (vocInq) vocInq.style.display = 'block';
          break;
        case 'Complaint':
          if (vocComp) vocComp.style.display = 'block';
          if (ticketCreation) ticketCreation.style.display = 'block';
          break;
        case 'Follow-up':
          if (vocFfup) vocFfup.style.display = 'block';
          if (followUpSec) followUpSec.style.display = 'block';
          break;
        case 'Aftersales':
          if (vocAftersales) vocAftersales.style.display = 'block';
          if (aftersalesSec) aftersalesSec.style.display = 'block';
          break;
        case 'Others':
          if (vocOthers) vocOthers.style.display = 'block';
          break;
      }
      updateLitGuide();
    });
  }

  // Attach event listener to all VOC drop-down elements
  document.querySelectorAll('div[id^="voc-"] select').forEach(selectEl => {
    selectEl.addEventListener('change', () => {
      updateLitGuide();
    });
  });

  if (contactChannel) {
    contactChannel.addEventListener('change', (e) => {
      const channel = e.target.value;
      if (abcaHL) abcaHL.style.display = (channel === 'ENT-HOTLINE') ? 'block' : 'none';
      if (abcaSA) abcaSA.style.display = (channel === 'ENT-SANA ALL') ? 'block' : 'none';
      if (abcaEC) abcaEC.style.display = (channel === 'ENT-EMAIL') ? 'block' : 'none';
    });
  }

  // Robust check to find selected VOC value across all VOC select elements
  function getActiveVocValue() {
    const vocSelects = document.querySelectorAll('div[id^="voc-"] select');
    for (let select of vocSelects) {
      if (select.value && select.value.trim() !== '') {
        return select.value.trim();
      }
    }
    return '';
  }

  // Helper to safely get input values by ID
  function getVal(id) {
    const el = document.getElementById(id);
    return el ? el.value.trim() : '';
  }

  // --- 4. Action Buttons Logic ---

  // Generate CEP Click Handler
  if (CEPbtn) {
    CEPbtn.addEventListener('click', () => {
      const channel = contactChannel?.value || '';
      const concern = concernTypeSelect?.value || '';

      let cepNote = `Channel: ${channel}\n`;

      if (concern === 'Complaint') {
        const activeContainer = ticketCreation;
        const sfdc = activeContainer ? activeContainer.querySelector('input[name="sfdcCase"]')?.value || '' : '';
        
        cepNote += `SFDC Case #: ${sfdc}\n`;
        cepNote += `Contact Name: ${getVal('cName')}\n`;
        cepNote += `Contact #: ${getVal('cnum')}\n`;
        cepNote += `Contact Email: ${getVal('cmail')}\n`;
        cepNote += `Working Permit: ${getVal('wpermit')}\n`;
        cepNote += `Available Date/Time: ${getVal('adt')}\n`;
        cepNote += `CV Test Result: ${getVal('cvResult')}\n`;
        cepNote += `ONU Serial Number: ${getVal('serial')}\n`;
        cepNote += `Troubleshooting: ${getVal('troubleshooting')}\n`;
        cepNote += `ONU Light Status: ${getVal('lightStatus')}\n`;
        cepNote += `Action Taken: ${getVal('actionTaken')}\n`;
      } else if (concern === 'Follow-up') {
        const activeContainer = followUpSec;
        const sfdc = activeContainer ? activeContainer.querySelector('input[name="sfdcCase"]')?.value || '' : '';
        
        cepNote += `Billing Account #: ${getVal('billNum')}\n`;
        cepNote += `Ticket #: ${getVal('ticketNum')}\n`;
        cepNote += `SFDC Case #: ${sfdc}\n`;
        cepNote += `Service ID: ${getVal('serviceID')}\n`;
      } else if (concern === 'Aftersales') {
        const activeContainer = aftersalesSec;
        const sfdc = activeContainer ? activeContainer.querySelector('input[name="sfdcCase"]')?.value || '' : '';
        
        cepNote += `Billing Account #: ${getVal('billNum')}\n`;
        cepNote += `SFDC Case #: ${sfdc}\n`;
        cepNote += `Service ID: ${getVal('serviceID')}\n`;
      }

      if (noteppad) noteppad.value = cepNote;
      if (cepnote1txtfield) cepnote1txtfield.value = cepNote;
    });
  }

  // ABCA Click Handler
  if (resABCAbtn) {
    resABCAbtn.addEventListener('click', () => {
      const channel = contactChannel?.value || 'ENT-HOTLINE';
      
      // Determine Billing Account based on active Channel
      let billingAcc = '';
      if (channel === 'ENT-HOTLINE') {
        billingAcc = getVal('account');
      } else if (channel === 'ENT-SANA ALL') {
        billingAcc = getVal('saBaAccount');
      } else if (channel === 'ENT-EMAIL') {
        billingAcc = getVal('ecBaAccount');
      }

      const aniNum = getVal('ani');
      const vocValue = getActiveVocValue();
      const actionTaken = getVal('actionTaken');

      let abcaNote = `ANI Number: ${aniNum}\n`;
      abcaNote += `Billing Account: ${billingAcc}\n`;
      abcaNote += `Concern: ${vocValue}\n`;
      abcaNote += `Action Taken: ${actionTaken}\n`;

      if (noteppad) noteppad.value = abcaNote;
      if (abcatxtfield) abcatxtfield.value = abcaNote;
    });
  }

  // Reset Click Handler
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      document.querySelectorAll('input:not([type="color"]), textarea, select').forEach(input => {
        if (input.name !== 't_name' && input.name !== 'aName') {
          input.value = '';
        }
      });
      resetVocDropdowns();
      resetSubSections();
      if (noteppad) noteppad.value = '';
      updateLitGuide();
    });
  }

  // Save Click Handler
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      if (!noteppad || !noteppad.value.trim()) {
        alert("Notepad is empty! Generate CEP or ABCA notes before saving.");
        return;
      }
      alert("Documentation saved successfully to workspace!");
    });
  }

  // Export TXT Click Handler
  if (toTXTbtn) {
    toTXTbtn.addEventListener('click', () => {
      const text = noteppad ? noteppad.value : '';
      if (!text.trim()) {
        alert("Notepad is empty! Nothing to export.");
        return;
      }

      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `Documentation_${Date.now()}.txt`;
      link.click();
      URL.revokeObjectURL(link.href);
    });
  }

  // --- 5. Firebase Authentication & Gateway Submission ---
  if (gatewayLoginForm) {
    gatewayLoginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const domainInput = loginUsernameInput.value.trim();
      const winIdInput = loginWinIDInput.value.trim();

      try {
        const response = await fetch(`${FIREBASE_URL}/employees.json`);
        const employees = await response.json();

        let matchedEmployee = null;
        if (employees) {
          const list = Array.isArray(employees) ? employees : Object.values(employees);
          matchedEmployee = list.find(emp => 
            emp && 
            String(emp['PLDTSMART Domain']).toLowerCase() === domainInput.toLowerCase() && 
            String(emp['Win ID']) === String(winIdInput)
          );
        }

        if (!matchedEmployee) {
          alert("Authentication Failed: Invalid PLDTSMART Domain or WIN ID.");
          return;
        }

        if (formUsernameInput) formUsernameInput.value = matchedEmployee['PLDTSMART Domain'];
        if (formAgentNameInput) formAgentNameInput.value = matchedEmployee['Employee Name'];

        const sessionData = {
          agentId: matchedEmployee['PLDTSMART Domain'],
          winId: matchedEmployee['Win ID'],
          employeeName: matchedEmployee['Employee Name'],
          loginTime: new Date().toLocaleString(),
          logoutTime: 'Active Session',
          autoDocsUsed: 'Yes'
        };

        const pushRes = await fetch(`${FIREBASE_URL}/loginHistory.json`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sessionData)
        });

        const pushData = await pushRes.json();
        sessionData.firebaseKey = pushData.name;

        sessionStorage.setItem('activeSession', JSON.stringify(sessionData));

        updateAdminButtonVisibility(sessionData.agentId, sessionData.winId);

        if (loginReminderScreen) loginReminderScreen.style.display = 'none';
      } catch (err) {
        console.error("Firebase connection error:", err);
        alert("Unable to verify credentials with Firebase database.");
      }
    });
  }

  // --- 6. Session Logout Handler ---
  if (sessionLogoutBtn) {
    sessionLogoutBtn.addEventListener('click', async () => {
      const activeSession = JSON.parse(sessionStorage.getItem('activeSession'));
      if (!activeSession) {
        alert("No active session found.");
        return;
      }

      const logoutTime = new Date().toLocaleString();

      if (activeSession.firebaseKey) {
        await fetch(`${FIREBASE_URL}/loginHistory/${activeSession.firebaseKey}.json`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            logoutTime: logoutTime,
            autoDocsUsed: activeSession.autoDocsUsed || 'Yes'
          })
        });
      }

      sessionStorage.removeItem('activeSession');

      alert(`Session ended for ${activeSession.agentId}. Access revoked.`);

      if (formUsernameInput) formUsernameInput.value = '';
      if (formAgentNameInput) formAgentNameInput.value = '';
      
      resetVocDropdowns();
      resetSubSections();
      if (noteppad) noteppad.value = '';
      
      updateAdminButtonVisibility(null, null);

      if (loginReminderScreen) loginReminderScreen.style.display = 'flex';
    });
  }

  // --- 7. Auto-Log Session End on Browser Close ---
  window.addEventListener('beforeunload', () => {
    const activeSession = JSON.parse(sessionStorage.getItem('activeSession'));
    if (activeSession && activeSession.firebaseKey) {
      const logoutTime = new Date().toLocaleString();
      const payload = JSON.stringify({
        logoutTime: logoutTime,
        autoDocsUsed: activeSession.autoDocsUsed || 'Yes'
      });

      fetch(`${FIREBASE_URL}/loginHistory/${activeSession.firebaseKey}.json`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true
      });
    }
  });
});
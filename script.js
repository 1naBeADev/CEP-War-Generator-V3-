document.addEventListener('DOMContentLoaded', () => {

  // --- Session State Tracking Data Architecture ---
  let currentSession = {
    agentId: '',
    loginTime: '',
    logoutTime: '',
    autoDocsUsed: 'No'
  };

  // --- Theme Mode State Management ---
  const themeToggle = document.getElementById('themeToggle');
  themeToggle.addEventListener('click', () => {
    const currentTheme = document.body.getAttribute('data-theme');
    const targetTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.body.setAttribute('data-theme', targetTheme);
    themeToggle.innerHTML = targetTheme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
  });

  const agentThemePicker = document.getElementById('agentThemePicker');
  agentThemePicker.addEventListener('input', (e) => {
    document.documentElement.style.setProperty('--primary', e.target.value);
  });

  // --- Overlay Modals Interactions & Session Management ---
  const loginReminderScreen = document.getElementById('loginReminderScreen');
  const gatewayLoginForm = document.getElementById('gatewayLoginForm');
  const loginUsernameInput = document.getElementById('loginUsername');
  const formUsernameInput = document.querySelector('input[name="t_name"]');
  const sessionLogoutBtn = document.getElementById('sessionLogoutBtn');

  if (gatewayLoginForm) {
    gatewayLoginForm.addEventListener('submit', (e) => {
      e.preventDefault(); 
      const username = loginUsernameInput.value;
      if (loginUsernameInput && formUsernameInput) {
        formUsernameInput.value = username;
      }
      
      // Initialize telemetry record tracking metrics
      currentSession.agentId = username;
      currentSession.loginTime = new Date().toLocaleString();
      currentSession.logoutTime = 'Active Session';
      currentSession.autoDocsUsed = 'No';

      const passwordField = document.getElementById('loginPassword');
      if (passwordField) passwordField.value = '';
      loginReminderScreen.style.display = 'none';
    });
  }

  // Handle Logout Action
  if (sessionLogoutBtn) {
    sessionLogoutBtn.addEventListener('click', () => {
      if (!currentSession.agentId) {
        alert("No active workspace session found.");
        return;
      }
      
      currentSession.logoutTime = new Date().toLocaleString();
      
      // Persist log entry history stack into localStorage archive
      let sessionLogs = JSON.parse(localStorage.getItem('adminAuditSessionLogs')) || [];
      sessionLogs.push({ ...currentSession });
      localStorage.setItem('adminAuditSessionLogs', JSON.stringify(sessionLogs));

      alert(`Session ended for ${currentSession.agentId}. Access revoked.`);
      
      // Reset layout variables and force re-authentication mask block overlay
      currentSession = { agentId: '', loginTime: '', logoutTime: '', autoDocsUsed: 'No' };
      if (formUsernameInput) formUsernameInput.value = '';
      document.getElementById('resetBtn').click();
      loginReminderScreen.style.display = 'flex';
    });
  }

  // --- Admin Audit Panel Panel View Module Engine ---
  const adminToggleBtn = document.getElementById('adminToggleBtn');
  const adminPanelScreen = document.getElementById('adminPanelScreen');
  const closeAdminBtn = document.getElementById('closeAdminBtn');
  const adminAuditLogBody = document.getElementById('adminAuditLogBody');

  function updateAdminAuditTable() {
    adminAuditLogBody.innerHTML = '';
    let sessionLogs = JSON.parse(localStorage.getItem('adminAuditSessionLogs')) || [];
    
    // Append active uncommitted tracking element to the audit matrix dynamically
    if (currentSession.agentId) {
      sessionLogs.unshift(currentSession);
    }

    if (sessionLogs.length === 0) {
      adminAuditLogBody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 15px; opacity: 0.6;">No database log files generated inside this system cluster.</td></tr>`;
      return;
    }

    sessionLogs.forEach(log => {
      const row = document.createElement('tr');
      row.style.borderBottom = '1px solid var(--border-color)';
      
      let badgeStyle = log.autoDocsUsed === 'Yes' ? 'background: #10b981; color: white;' : 'background: #ef4444; color: white;';
      if (log.logoutTime === 'Active Session') {
        row.style.background = 'rgba(37, 99, 235, 0.05)';
      }

      row.innerHTML = `
        <td style="padding: 10px; font-weight: 600;">${log.agentId}</td>
        <td style="padding: 10px;">${log.loginTime}</td>
        <td style="padding: 10px; font-style: ${log.logoutTime === 'Active Session' ? 'italic' : 'normal'}; color: ${log.logoutTime === 'Active Session' ? 'var(--primary)' : 'inherit'};">${log.logoutTime}</td>
        <td style="padding: 10px; text-align: center;">
          <span style="padding: 2px 8px; border-radius: 12px; font-size: 10px; font-weight: 700; ${badgeStyle}">${log.autoDocsUsed}</span>
        </td>
      `;
      adminAuditLogBody.appendChild(row);
    });
  }

  if (adminToggleBtn && adminPanelScreen && closeAdminBtn) {
    adminToggleBtn.addEventListener('click', () => {
      updateAdminAuditTable();
      adminPanelScreen.style.display = 'flex';
    });
    closeAdminBtn.addEventListener('click', () => {
      adminPanelScreen.style.display = 'none';
    });
  }

  // --- Priority Tracking Monitor Panel Elements ---
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
  const cepButton = document.getElementById('CEPbtn');

  if (concernType.value !== 'Complaint') {
    cepButton.disabled = true;
    cepButton.style.opacity = '0.5';
    cepButton.style.cursor = 'not-allowed';
  }

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

    if (val === 'Complaint') {
      cepButton.disabled = false;
      cepButton.style.opacity = '1';
      cepButton.style.cursor = 'pointer';
      
      vocComp.style.display = 'block';
      ticketCreation.style.display = 'block';
    } else {
      cepButton.disabled = true;
      cepButton.style.opacity = '0.5';
      cepButton.style.cursor = 'not-allowed';

      if (val === 'Inquiry') {
        vocInq.style.display = 'block';
      } else if (val === 'Follow-up') {
        vocFfup.style.display = 'block';
        followUpPanel.style.display = 'block';
      } else if (val === 'Aftersales') {
        vocAftersales.style.display = 'block';
        aftersalesPanel.style.display = 'block';
      } else if (val === 'Others') {
        vocOthers.style.display = 'block';
      }
    }
  });

  // --- Template Generators Core Engine Logic ---
  const noteppad = document.getElementById('noteppad');
  const abcatxtfield = document.getElementById('abcatxtfield');
  const cepnote1txtfield = document.getElementById('cepnote1txtfield');
  const sitxtfield = document.getElementById('sitxtfield');
  const metaOrbBadgeCount = document.getElementById('metaOrbBadgeCount');

  function getActiveVocValue() {
    const visibleSelect = Array.from(document.querySelectorAll('.concern')).find(select => {
      return select.parentElement.style.display !== 'none';
    });
    return visibleSelect ? visibleSelect.value : '';
  }

  // Generate CEP Action
  document.getElementById('CEPbtn').addEventListener('click', () => {
    const agentName = document.querySelector('input[name="aName"]').value;
    const channel = contactChannel.value;
    const concern = concernType.value;
    const wocas = document.getElementById('wocastxtarea').value;

    let compiledCEP = '';

    if (concern === 'Complaint') {
      compiledCEP = [
        `Channel: ${channel}`,
        `SFDC Case Number: ${document.querySelector('#ticketCreation input[name="sfdcCase"]').value}`,
        `Contact Person: ${document.querySelector('#ticketCreation input[name="cName"]').value}`,
        `Contact Number: ${document.querySelector('#ticketCreation input[name="cnum"]').value}`,
        `Contact Email: ${document.querySelector('#ticketCreation input[name="cmail"]').value}`,
        `Permit Required: ${document.querySelector('#ticketCreation input[name="wpermit"]').value}`,
        `Availability Time & Day: ${document.querySelector('#ticketCreation input[name="adt"]').value}`,
        `CV Reading: ${document.querySelector('#ticketCreation input[name="cvResult"]').value}`,
        `Serial Number: ${document.querySelector('#ticketCreation input[name="serial"]').value}`,
        `Troubleshooting: ${document.querySelector('#ticketCreation input[name="troubleshooting"]').value}`,
        `ONU Light Status: ${document.querySelector('#ticketCreation input[name="lightStatus"]').value}`,
        `Action Taken: ${document.querySelector('#ticketCreation textarea[name="actionTaken"]').value}`
      ].join('\n');
    } else if (concern === 'Follow-up') {
      compiledCEP = [
        `Channel: ${channel}`,
        `Billing Account: ${document.querySelector('#follow-up input[name="billNum"]').value}`,
        `Ticket Reference: ${document.querySelector('#follow-up input[name="ticketNum"]').value}`,
        `SFDC Case Number: ${document.querySelector('#follow-up input[name="sfdcCase"]').value}`,
        `Service ID: ${document.querySelector('#follow-up input[name="serviceID"]').value}`
      ].join('\n');
    } else if (concern === 'Aftersales') {
      compiledCEP = [
        `Channel: ${channel}`,
        `Billing Account: ${document.querySelector('#aftersales input[name="billNum"]').value}`,
        `SFDC Case Number: ${document.querySelector('#aftersales input[name="sfdcCase"]').value}`,
        `Service ID: ${document.querySelector('#aftersales input[name="serviceID"]').value}`
      ].join('\n');
    } else {
      compiledCEP = `Channel: ${channel}\nNo supplementary context tracking variables required for this structural profile.`;
    }

    noteppad.value = compiledCEP;
    cepnote1txtfield.value = `[${concern}] ${wocas ? wocas : '(No Summary Checked)'}`;
    sitxtfield.value = `Processed by ${agentName} at ${new Date().toLocaleTimeString()}`;
    metaOrbBadgeCount.textContent = "1";

    // Set auto documents engine trace tracking criteria to active verified state
    currentSession.autoDocsUsed = 'Yes';
  });

  // Generate ABCA Action
  document.getElementById('resABCAbtn').addEventListener('click', () => {
    const channel = contactChannel.value;
    const concern = concernType.value;
    const activeVoc = getActiveVocValue();
    
    const fullConcern = concern ? (activeVoc ? `${concern} - ${activeVoc}` : concern) : '';
    let abcaParameters = '';

    if (channel === 'ENT-HOTLINE') {
      abcaParameters = [
        `Channel: ${channel}`,
        `Ani: ${document.getElementById('ani').value}`,
        `Billing Account Number: ${document.getElementById('account').value}`,
        `Concern: ${fullConcern}`,
        `Action taken: ${document.getElementById('actionTaken').value}`
      ].join('\n');
    } else if (channel === 'ENT-EMAIL') {
      abcaParameters = [
        `Channel: ${channel}`,
        `Ani: ${document.getElementById('ecDated').value}`, 
        `Billing Account Number: ${document.getElementById('ecBaAccount').value}`,
        `Concern: ${fullConcern}`,
        `Action taken: ${document.getElementById('actionTaken').value}`
      ].join('\n');
    } else if (channel === 'ENT-SANA ALL') {
      abcaParameters = [
        `Channel: ${channel}`,
        `Ani: ${document.getElementById('ritm').value}`,
        `Billing Account Number: ${document.getElementById('saBaAccount').value}`,
        `Concern: ${fullConcern}`,
        `Action taken: ${document.getElementById('actionTaken').value}`
      ].join('\n');
    }

    noteppad.value = abcaParameters;
    abcatxtfield.value = `Active Context Block: Channel [${channel}] Configuration Validated.`;
    metaOrbBadgeCount.textContent = "2";

    // Set auto documents engine trace tracking criteria to active verified state
    currentSession.autoDocsUsed = 'Yes';
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
    
    cepButton.disabled = true;
    cepButton.style.opacity = '0.5';
    cepButton.style.cursor = 'not-allowed';
    
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
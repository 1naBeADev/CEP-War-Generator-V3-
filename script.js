document.addEventListener('DOMContentLoaded', () => {

  // Whitelisted Admin Credentials
  const AUTHORIZED_ADMINS = [
    { winId: '52499941', username: 'T-JRCOTE' },
    { winId: '52385305', username: 't-jtagores' }
  ];

  // Helper check function for admin authentication
  function isAuthorizedAdmin(winId, username) {
    if (!winId || !username) return false;
    return AUTHORIZED_ADMINS.some(admin => 
      admin.winId === String(winId).trim() && 
      admin.username.toLowerCase() === String(username).trim().toLowerCase()
    );
  }

  // Dynamic Injection: Only create & append the Admin Button if authorized
  function checkAndSetAdminAccess(winId, username) {
    let adminBtn = document.getElementById('adminBtn');

    if (isAuthorizedAdmin(winId, username)) {
      if (!adminBtn) {
        const headerControls = document.querySelector('.header-control-actions');
        if (headerControls) {
          adminBtn = document.createElement('button');
          adminBtn.id = 'adminBtn';
          adminBtn.className = 'header-action-btn';
          adminBtn.title = 'Open Admin Audit Logs';
          adminBtn.innerHTML = '<i class="fas fa-user-shield"></i>';

          adminBtn.addEventListener('click', openAdminPanel);

          const themeToggle = document.getElementById('themeToggle');
          if (themeToggle) {
            headerControls.insertBefore(adminBtn, themeToggle);
          } else {
            headerControls.appendChild(adminBtn);
          }
        }
      }
    } else {
      // Completely remove element from DOM if user is unauthorized
      if (adminBtn) {
        adminBtn.remove();
      }
    }
  }

  // Check existing login session on load
  const sessionData = sessionStorage.getItem('activeAgentSession');
  if (sessionData) {
    const loginOverlay = document.getElementById('loginReminderScreen');
    if (loginOverlay) loginOverlay.style.display = 'none';

    const agent = JSON.parse(sessionData);
    const tNameInput = document.getElementById('t_name');
    if (tNameInput) tNameInput.value = agent.username || '';

    checkAndSetAdminAccess(agent.winId, agent.username);
  } else {
    checkAndSetAdminAccess(null, null);
  }

  // --- LOGIN EVENT ---
  const gatewayLoginForm = document.getElementById('gatewayLoginForm');
  if (gatewayLoginForm) {
    gatewayLoginForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const username = document.getElementById('loginUsername').value.trim();
      const winId = document.getElementById('loginWinID').value.trim();

      if (!username || !winId) {
        alert('Please fill out all required login fields.');
        return;
      }

      const activeSession = {
        username: username,
        winId: winId,
        sessionStartTime: new Date().toISOString()
      };

      sessionStorage.setItem('activeAgentSession', JSON.stringify(activeSession));

      // Populate PLDT username field automatically
      const tNameInput = document.getElementById('t_name');
      if (tNameInput) tNameInput.value = username;

      // Inject or Remove Admin Button based on active credentials
      checkAndSetAdminAccess(winId, username);

      // Hide login screen
      const loginOverlay = document.getElementById('loginReminderScreen');
      if (loginOverlay) loginOverlay.style.display = 'none';
    });
  }

  // --- SAVE BUTTON EVENT ---
  const saveBtn = document.getElementById('saveBtn');
  if (saveBtn) {
    saveBtn.addEventListener('click', async () => {
      const rawSession = sessionStorage.getItem('activeAgentSession');

      if (!rawSession) {
        alert('No active login session found. Please log in first.');
        const loginOverlay = document.getElementById('loginReminderScreen');
        if (loginOverlay) loginOverlay.style.display = 'flex';
        return;
      }

      const session = JSON.parse(rawSession);

      const payload = {
        agent: {
          username: session.username,
          winId: session.winId,
          sessionStartTime: session.sessionStartTime
        },
        savedAt: new Date().toISOString(),
        formData: {
          agentName: document.getElementById('aName')?.value || '',
          teamLead: document.getElementById('teamLead')?.value || '',
          pldtUsername: document.getElementById('t_name')?.value || '',
          channel: document.getElementById('contactChannel')?.value || '',
          concernType: document.getElementById('concernType')?.value || '',
          wocasSummary: document.getElementById('wocastxtarea')?.value || '',
          notesOutput: document.getElementById('noteppad')?.value || ''
        }
      };

      try {
        const response = await fetch('/api/save-agent-work', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          saveToLocalAuditLogs(payload);
          alert('Work and agent session saved successfully to the database!');
        } else {
          saveToLocalAuditLogs(payload);
          alert('Work saved to workspace database (Local Mode)!');
        }
      } catch (error) {
        console.warn('API error encountered, persisting locally:', error);
        saveToLocalAuditLogs(payload);
        alert('Work and session successfully saved locally!');
      }
    });
  }

  function saveToLocalAuditLogs(entry) {
    const logs = JSON.parse(localStorage.getItem('auditLogs') || '[]');
    logs.push(entry);
    localStorage.setItem('auditLogs', JSON.stringify(logs));
  }

  // --- LOGOUT EVENT ---
  const logoutBtn = document.getElementById('sessionLogoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to end your active session?')) {
        sessionStorage.removeItem('activeAgentSession');
        checkAndSetAdminAccess(null, null);

        const loginOverlay = document.getElementById('loginReminderScreen');
        if (loginOverlay) loginOverlay.style.display = 'flex';

        const loginUser = document.getElementById('loginUsername');
        const loginWin = document.getElementById('loginWinID');
        if (loginUser) loginUser.value = '';
        if (loginWin) loginWin.value = '';
      }
    });
  }

  // --- CONCERN TYPE DROPDOWN TOGGLES ---
  const concernTypeSelect = document.getElementById('concernType');
  const vocInq = document.getElementById('voc-inq');
  const vocFfup = document.getElementById('voc-ffup');
  const vocComp = document.getElementById('voc-comp');
  const vocAftersales = document.getElementById('voc-aftersales');
  const vocOthers = document.getElementById('voc-others');

  const ticketCreation = document.getElementById('ticketCreation');
  const followUpSection = document.getElementById('follow-up');
  const aftersalesSection = document.getElementById('aftersales');

  if (concernTypeSelect) {
    concernTypeSelect.addEventListener('change', (e) => {
      const val = e.target.value;

      [vocInq, vocFfup, vocComp, vocAftersales, vocOthers].forEach(el => { if (el) el.style.display = 'none'; });
      [ticketCreation, followUpSection, aftersalesSection].forEach(el => { if (el) el.style.display = 'none'; });

      if (val === 'Inquiry' && vocInq) {
        vocInq.style.display = 'block';
      } else if (val === 'Follow-up') {
        if (vocFfup) vocFfup.style.display = 'block';
        if (followUpSection) followUpSection.style.display = 'block';
      } else if (val === 'Complaint') {
        if (vocComp) vocComp.style.display = 'block';
        if (ticketCreation) ticketCreation.style.display = 'block';
      } else if (val === 'Aftersales') {
        if (vocAftersales) vocAftersales.style.display = 'block';
        if (aftersalesSection) aftersalesSection.style.display = 'block';
      } else if (val === 'Others' && vocOthers) {
        vocOthers.style.display = 'block';
      }
    });
  }

  // --- CHANNEL SELECTOR TOGGLES ---
  const contactChannel = document.getElementById('contactChannel');
  const abcaHL = document.getElementById('abcaHL');
  const abcaSA = document.getElementById('abcaSA');
  const abcaEC = document.getElementById('abcaEC');

  if (contactChannel) {
    contactChannel.addEventListener('change', (e) => {
      const val = e.target.value;
      if (abcaHL) abcaHL.style.display = 'none';
      if (abcaSA) abcaSA.style.display = 'none';
      if (abcaEC) abcaEC.style.display = 'none';

      if (val === 'ENT-HOTLINE' && abcaHL) {
        abcaHL.style.display = 'block';
      } else if (val === 'ENT-SANA ALL' && abcaSA) {
        abcaSA.style.display = 'block';
      } else if (val === 'ENT-EMAIL' && abcaEC) {
        abcaEC.style.display = 'block';
      }
    });
  }

  // --- RESET BUTTON EVENT ---
  const resetBtn = document.getElementById('resetBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (confirm('Clear all input fields?')) {
        const inputs = document.querySelectorAll('main input, main textarea, main select');
        inputs.forEach(input => {
          if (input.id !== 't_name') {
            input.value = '';
          }
        });
        [vocInq, vocFfup, vocComp, vocAftersales, vocOthers, ticketCreation, followUpSection, aftersalesSection].forEach(el => {
          if (el) el.style.display = 'none';
        });
      }
    });
  }

  // --- EXPORT TO TXT ---
  const toTXTbtn = document.getElementById('toTXTbtn');
  if (toTXTbtn) {
    toTXTbtn.addEventListener('click', () => {
      const notesContent = document.getElementById('noteppad')?.value || '';
      if (!notesContent.trim()) {
        alert('Notepad is empty!');
        return;
      }
      const blob = new Blob([notesContent], { type: 'text/plain;charset=utf-8' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `Agent_Notes_${Date.now()}.txt`;
      link.click();
    });
  }

  // --- THEME TOGGLE ---
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
      const icon = themeToggle.querySelector('i');
      if (icon) {
        if (document.body.classList.contains('dark-mode')) {
          icon.className = 'fas fa-sun';
        } else {
          icon.className = 'fas fa-moon';
        }
      }
    });
  }

  // --- COLOR ACCENT PICKER ---
  const agentThemePicker = document.getElementById('agentThemePicker');
  if (agentThemePicker) {
    agentThemePicker.addEventListener('input', (e) => {
      document.documentElement.style.setProperty('--primary-color', e.target.value);
    });
  }

  // --- ADMIN PANEL MODAL CONTROLS ---
  function openAdminPanel() {
    const adminPanelScreen = document.getElementById('adminPanelScreen');
    const adminAuditLogBody = document.getElementById('adminAuditLogBody');
    if (!adminAuditLogBody) return;

    adminAuditLogBody.innerHTML = '';
    const logs = JSON.parse(localStorage.getItem('auditLogs') || '[]');

    if (logs.length === 0) {
      adminAuditLogBody.innerHTML = `<tr><td colspan="4" style="padding:15px; text-align:center; opacity: 0.7;">No saved records in database yet.</td></tr>`;
    } else {
      logs.forEach(item => {
        const tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid var(--border-color)';
        tr.innerHTML = `
          <td style="padding: 10px;">${item.agent ? item.agent.username : 'N/A'} (${item.agent ? item.agent.winId : ''})</td>
          <td style="padding: 10px;">${item.agent && item.agent.sessionStartTime ? new Date(item.agent.sessionStartTime).toLocaleString() : 'N/A'}</td>
          <td style="padding: 10px;">${new Date(item.savedAt).toLocaleString()}</td>
          <td style="padding: 10px; text-align: center;">Yes</td>
        `;
        adminAuditLogBody.appendChild(tr);
      });
    }
    if (adminPanelScreen) adminPanelScreen.style.display = 'flex';
  }

  const closeAdminBtn = document.getElementById('closeAdminBtn');
  if (closeAdminBtn) {
    closeAdminBtn.addEventListener('click', () => {
      const adminPanelScreen = document.getElementById('adminPanelScreen');
      if (adminPanelScreen) adminPanelScreen.style.display = 'none';
    });
  }

});
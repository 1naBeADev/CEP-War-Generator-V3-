document.addEventListener('DOMContentLoaded', () => {

  const FIREBASE_URL = 'https://autodocs-a12f0-default-rtdb.firebaseio.com';

  const AUTHORIZED_ADMINS = [
    { winId: '52499941', username: 't-jrcote' },
    { winId: '52385305', username: 't-jtagores' }
  ];

  function isAuthorizedAdmin(winId, username) {
    if (!winId || !username) return false;
    const targetWinId = String(winId).trim();
    const targetUser = String(username).trim().toLowerCase();
    return AUTHORIZED_ADMINS.some(admin => 
      admin.winId === targetWinId && 
      admin.username.toLowerCase() === targetUser
    );
  }

  function setAdminVisibility(winId, username) {
    let adminBtn = document.getElementById('adminBtn');
    if (isAuthorizedAdmin(winId, username)) {
      if (!adminBtn) {
        const headerControls = document.querySelector('.header-control-actions');
        if (headerControls) {
          adminBtn = document.createElement('a');
          adminBtn.id = 'adminBtn';
          adminBtn.href = 'admin.html';
          adminBtn.className = 'header-action-btn';
          adminBtn.title = 'Open Admin Audit Logs';
          adminBtn.innerHTML = '<i class="fas fa-user-shield"></i>';

          const themeToggle = document.getElementById('themeToggle');
          if (themeToggle) {
            headerControls.insertBefore(adminBtn, themeToggle);
          } else {
            headerControls.appendChild(adminBtn);
          }
        }
      }
    } else if (adminBtn) {
      adminBtn.remove();
    }
  }

  // Populate fields dynamically by matching text inputs or layout position
  function populateUserFields(userRecord, usernameFallback) {
    const pldtUserInput = document.getElementById('t_name') || document.querySelector('input[placeholder*="USERNAME" i]');
    if (pldtUserInput && usernameFallback) {
      pldtUserInput.value = usernameFallback;
    }

    if (!userRecord || typeof userRecord !== 'object') return;

    const empName = userRecord.employee_name || userRecord["Employee Name"] || userRecord.employeeName || userRecord.name || '';
    const supName = userRecord.supervisor_name || userRecord["Supervisor Name"] || userRecord.supervisorName || userRecord.team_lead || userRecord.teamLead || '';

    // Query standard inputs for Agent Name and Team Lead
    const agentInputs = [
      document.getElementById('agent_name'),
      document.getElementById('agentName'),
      document.getElementById('a_name'),
      document.querySelector('input[name="agent_name"]'),
      document.querySelector('input[name="agentName"]'),
      document.querySelectorAll('.header-control-actions ~ * input[type="text"], main input[type="text"]')[0]
    ];

    const teamLeadInputs = [
      document.getElementById('team_lead'),
      document.getElementById('teamLead'),
      document.getElementById('tl_name'),
      document.querySelector('input[name="team_lead"]'),
      document.querySelector('input[name="teamLead"]'),
      document.querySelectorAll('.header-control-actions ~ * input[type="text"], main input[type="text"]')[1]
    ];

    const agentInput = agentInputs.find(el => el !== null && el !== undefined);
    const teamLeadInput = teamLeadInputs.find(el => el !== null && el !== undefined);

    if (agentInput && empName) agentInput.value = empName;
    if (teamLeadInput && supName) teamLeadInput.value = supName;
  }

  async function authenticateWithFirebase(winId, username) {
    if (!winId || !username) return false;

    try {
      const response = await fetch(`${FIREBASE_URL}/.json`);
      const rootData = await response.json();
      if (!rootData) return false;

      const targetWin = String(winId).trim();
      const targetUser = String(username).trim().toLowerCase();

      const flattenRecords = (obj) => {
        let acc = [];
        if (!obj || typeof obj !== 'object') return acc;
        if (Array.isArray(obj)) {
          obj.forEach(item => { acc = acc.concat(flattenRecords(item)); });
        } else {
          const keys = Object.keys(obj);
          const looksLikeUser = keys.some(k => ['win_id', 'winId', 'Win ID', 'username', 'pldt_smart_domain'].includes(k));
          if (looksLikeUser) {
            acc.push(obj);
          } else {
            keys.forEach(k => { acc = acc.concat(flattenRecords(obj[k])); });
          }
        }
        return acc;
      };

      const allRecords = flattenRecords(rootData);

      const matchedRecord = allRecords.find(user => {
        if (!user || typeof user !== 'object') return false;

        const uWin = String(
          user.win_id || user["Win ID"] || user.winId || user.winID || user.agentId || ''
        ).trim();

        const uDomain = String(
          user.pldt_smart_domain || user["PLDTSMART Domain"] || user.username || user.agentName || ''
        ).trim().toLowerCase();

        return (uWin === targetWin && uDomain === targetUser);
      });

      if (matchedRecord) {
        populateUserFields(matchedRecord, username);
        return true;
      }

      return false;

    } catch (err) {
      console.error("Firebase Auth Error:", err);
      return false;
    }
  }

  // Active Session Restore
  const sessionData = sessionStorage.getItem('activeAgentSession');
  if (sessionData) {
    const agent = JSON.parse(sessionData);

    authenticateWithFirebase(agent.winId, agent.username).then(isValid => {
      if (isValid) {
        const loginOverlay = document.getElementById('loginReminderScreen');
        if (loginOverlay) loginOverlay.style.display = 'none';
        setAdminVisibility(agent.winId, agent.username);
      } else {
        sessionStorage.removeItem('activeAgentSession');
        const loginOverlay = document.getElementById('loginReminderScreen');
        if (loginOverlay) loginOverlay.style.display = 'flex';
        setAdminVisibility(null, null);
      }
    });
  } else {
    setAdminVisibility(null, null);
  }

  // Gateway Login Submit Handler
  const gatewayLoginForm = document.getElementById('gatewayLoginForm');
  if (gatewayLoginForm) {
    gatewayLoginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const username = document.getElementById('loginUsername').value.trim();
      const winId = document.getElementById('loginWinID').value.trim();

      if (!username || !winId) {
        alert('Please fill out all required login fields.');
        return;
      }

      const isAuthenticated = await authenticateWithFirebase(winId, username);

      if (!isAuthenticated) {
        alert('Access Denied: Invalid WinID or Username combination.');
        return;
      }

      const loginTimeFormatted = new Date().toLocaleString();
      const sessionStartIso = new Date().toISOString();

      let logKey = null;
      try {
        const logPayload = {
          agentId: `${username} (${winId})`,
          loginTime: loginTimeFormatted,
          logoutTime: 'Active Session',
          autoDocsUsed: 'No',
          createdAt: sessionStartIso
        };

        const res = await fetch(`${FIREBASE_URL}/loginHistory.json`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(logPayload)
        });
        
        const logData = await res.json();
        logKey = logData ? logData.name : null;
      } catch (err) {
        console.warn('Could not record login log to Firebase:', err);
      }

      const activeSession = {
        username: username,
        winId: winId,
        sessionStartTime: sessionStartIso,
        firebaseLogKey: logKey
      };

      sessionStorage.setItem('activeAgentSession', JSON.stringify(activeSession));
      setAdminVisibility(winId, username);

      const loginOverlay = document.getElementById('loginReminderScreen');
      if (loginOverlay) loginOverlay.style.display = 'none';
    });
  }

  // Save Button
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

      try {
        if (session.firebaseLogKey) {
          await fetch(`${FIREBASE_URL}/loginHistory/${session.firebaseLogKey}.json`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ autoDocsUsed: 'Yes' })
          });
        } else {
          const logPayload = {
            agentId: `${session.username} (${session.winId})`,
            loginTime: new Date(session.sessionStartTime).toLocaleString(),
            logoutTime: 'Active Session',
            autoDocsUsed: 'Yes',
            createdAt: new Date().toISOString()
          };

          const res = await fetch(`${FIREBASE_URL}/loginHistory.json`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(logPayload)
          });

          if (res.ok) {
            const logData = await res.json();
            session.firebaseLogKey = logData.name;
            sessionStorage.setItem('activeAgentSession', JSON.stringify(session));
          }
        }

        alert('Work saved successfully!');
      } catch (err) {
        console.error('Error saving session status:', err);
        alert('Work saved locally, but failed to sync with database.');
      }
    });
  }

  // Session Logout
  const logoutBtn = document.getElementById('sessionLogoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      if (confirm('Are you sure you want to end your active session?')) {
        const rawSession = sessionStorage.getItem('activeAgentSession');
        if (rawSession) {
          const session = JSON.parse(rawSession);
          if (session.firebaseLogKey) {
            try {
              await fetch(`${FIREBASE_URL}/loginHistory/${session.firebaseLogKey}.json`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ logoutTime: new Date().toLocaleString() })
              });
            } catch (err) {
              console.warn('Failed to update logout time in Firebase.', err);
            }
          }
        }

        sessionStorage.removeItem('activeAgentSession');
        setAdminVisibility(null, null);

        const loginOverlay = document.getElementById('loginReminderScreen');
        if (loginOverlay) loginOverlay.style.display = 'flex';

        const loginUser = document.getElementById('loginUsername');
        const loginWin = document.getElementById('loginWinID');
        if (loginUser) loginUser.value = '';
        if (loginWin) loginWin.value = '';
      }
    });
  }

  // Dynamic Form Sections
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

      if (val === 'Inquiry' && vocInq) vocInq.style.display = 'block';
      else if (val === 'Follow-up') {
        if (vocFfup) vocFfup.style.display = 'block';
        if (followUpSection) followUpSection.style.display = 'block';
      } else if (val === 'Complaint') {
        if (vocComp) vocComp.style.display = 'block';
        if (ticketCreation) ticketCreation.style.display = 'block';
      } else if (val === 'Aftersales') {
        if (vocAftersales) vocAftersales.style.display = 'block';
        if (aftersalesSection) aftersalesSection.style.display = 'block';
      } else if (val === 'Others' && vocOthers) vocOthers.style.display = 'block';
    });
  }

  const contactChannel = document.getElementById('contactChannel');
  const abcaHL = document.getElementById('abcaHL');
  const abcaSA = document.getElementById('abcaSA');
  const abcaEC = document.getElementById('abcaEC');
  const instructionContentHL = document.querySelector('.instructionContentHL');
  const instructionContentEMAIL = document.querySelector('.instructionContentEMAIL');

  if (contactChannel) {
    contactChannel.addEventListener('change', (e) => {
      const val = e.target.value;
      if (abcaHL) abcaHL.style.display = 'none';
      if (abcaSA) abcaSA.style.display = 'none';
      if (abcaEC) abcaEC.style.display = 'none';

      if (val === 'ENT-HOTLINE') {
        if (abcaHL) abcaHL.style.display = 'block';
        if (instructionContentHL) instructionContentHL.style.display = 'block';
        if (instructionContentEMAIL) instructionContentEMAIL.style.display = 'none';
      } else if (val === 'ENT-SANA ALL') {
        if (abcaSA) abcaSA.style.display = 'block';
        if (instructionContentHL) instructionContentHL.style.display = 'none';
        if (instructionContentEMAIL) instructionContentEMAIL.style.display = 'none';
      } else if (val === 'ENT-EMAIL') {
        if (abcaEC) abcaEC.style.display = 'block';
        if (instructionContentHL) instructionContentHL.style.display = 'none';
        if (instructionContentEMAIL) instructionContentEMAIL.style.display = 'block';
      }
    });
  }

  // --- Feedback Form Handling ---
  const feedbackForm = document.getElementById('feedbackForm') || document.querySelector('form[id*="feedback" i]');
  if (feedbackForm) {
    feedbackForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const feedbackText = document.getElementById('feedbackMessage')?.value || feedbackForm.querySelector('textarea')?.value || '';
      
      if (!feedbackText.trim()) {
        alert('Please enter your feedback before submitting.');
        return;
      }

      const rawSession = sessionStorage.getItem('activeAgentSession');
      const session = rawSession ? JSON.parse(rawSession) : { username: 'Anonymous', winId: 'N/A' };

      try {
        const payload = {
          agent: `${session.username} (${session.winId})`,
          message: feedbackText,
          submittedAt: new Date().toISOString()
        };

        const res = await fetch(`${FIREBASE_URL}/feedback.json`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          alert('Thank you! Your feedback has been submitted.');
          feedbackForm.reset();
          const feedbackDrawer = document.getElementById('feedbackDrawer');
          if (feedbackDrawer) feedbackDrawer.classList.remove('open');
        } else {
          alert('Failed to submit feedback. Please try again.');
        }
      } catch (err) {
        console.error('Feedback Submission Error:', err);
        alert('An error occurred while submitting feedback.');
      }
    });
  }

  const resetBtn = document.getElementById('resetBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (confirm('Clear all input fields?')) {
        const inputs = document.querySelectorAll('main input, main textarea, main select');
        inputs.forEach(input => {
          if (input.id !== 't_name') input.value = '';
        });
        [vocInq, vocFfup, vocComp, vocAftersales, vocOthers, ticketCreation, followUpSection, aftersalesSection].forEach(el => {
          if (el) el.style.display = 'none';
        });
      }
    });
  }

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

  // --- Theme Toggle Support (Corrected for [data-theme] CSS matching) ---
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const root = document.documentElement;
      const currentTheme = root.getAttribute('data-theme') || 'light';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

      // Set the data-theme attribute used by your CSS
      root.setAttribute('data-theme', newTheme);
      document.body.setAttribute('data-theme', newTheme);

      // Update button icon dynamically
      const icon = themeToggle.querySelector('i');
      if (icon) {
        icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
      }
    });
  }

  // --- Theme Color Picker Support ---
  const agentThemePicker = document.getElementById('agentThemePicker');
  if (agentThemePicker) {
    agentThemePicker.addEventListener('input', (e) => {
      document.documentElement.style.setProperty('--primary', e.target.value);
      document.documentElement.style.setProperty('--primary-color', e.target.value);
    });
  }

});

// Feedback Drawer Toggle Logic
const feedbackBtn = document.getElementById('feedbackOrbBtn');
const feedbackDrawer = document.getElementById('feedbackDrawer');
const closeFeedbackBtn = document.getElementById('closeFeedbackDrawerBtn');

if (feedbackBtn && feedbackDrawer) {
  feedbackBtn.addEventListener('click', () => {
    feedbackDrawer.classList.toggle('open');
  });
}

if (closeFeedbackBtn && feedbackDrawer) {
  closeFeedbackBtn.addEventListener('click', () => {
    feedbackDrawer.classList.remove('open');
  });
}

// Tab Switching Script Utility
function switchAdminTab(tabName) {
    const auditSec = document.getElementById('auditSection');
    const feedbackSec = document.getElementById('feedbackSection');
    const tabAuditBtn = document.getElementById('tabAuditBtn');
    const tabFeedbackBtn = document.getElementById('tabFeedbackBtn');

    if (tabName === 'audit') {
        auditSec.style.display = 'block';
        feedbackSec.style.display = 'none';
        tabAuditBtn.style.background = 'var(--primary, #2563eb)';
        tabAuditBtn.style.color = 'white';
        tabFeedbackBtn.style.background = 'transparent';
        tabFeedbackBtn.style.color = 'inherit';
    } else {
        auditSec.style.display = 'none';
        feedbackSec.style.display = 'block';
        tabFeedbackBtn.style.background = 'var(--primary, #2563eb)';
        tabFeedbackBtn.style.color = 'white';
        tabAuditBtn.style.background = 'transparent';
        tabAuditBtn.style.color = 'inherit';
    }
}

const resABCAbtn = document.getElementById('resABCAbtn');
  if (resABCAbtn) {
    resABCAbtn.addEventListener('click', () => {
      const notepad = document.getElementById('noteppad');
      if (!notepad) return;

      const getConcernValue = () => {
        const concernType = document.getElementById('concernType')?.value || '';
        let vocVal = '';
        const vocSelectors = ['vocD_inq', 'vocD_ffup', 'vocD_comp', 'vocD_aftersales', 'vocD_others'];
        for (const id of vocSelectors) {
          const el = document.getElementById(id);
          if (el && el.offsetParent !== null && el.value) {
            vocVal = el.value;
            break;
          }
        }
        if (concernType && vocVal) {
          return `${concernType} | ${vocVal}`;
        }
        return concernType || vocVal;
      };

      const updateRealTime = () => {
        const curAni = document.getElementById('ani')?.value || '';
        const curAccount = document.getElementById('account')?.value || document.getElementById('saBaAccount')?.value || document.getElementById('ecBaAccount')?.value || '';
        const curConcern = getConcernValue();
        const curAction = document.getElementById('actionTaken')?.value || '';

        notepad.value = `Ani: ${curAni}\nBilling Account Number: ${curAccount}\nConcern: ${curConcern}\nAction Taken: ${curAction}`;
      };

      updateRealTime();

      ['ani', 'account', 'saBaAccount', 'ecBaAccount', 'concernType', 'vocD_inq', 'vocD_ffup', 'vocD_comp', 'vocD_aftersales', 'vocD_others', 'actionTaken'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
          el.removeEventListener('input', el._abcaListener);
          el.removeEventListener('change', el._abcaListener);
          el._abcaListener = updateRealTime;
          el.addEventListener('input', updateRealTime);
          el.addEventListener('change', updateRealTime);
        }
      });
    });
  }


  // CEP Generation Format Logic Update
const cepBtn = document.getElementById('CEPbtn');
  if (cepBtn) {
    cepBtn.addEventListener('click', () => {
      const notepad = document.getElementById('noteppad');
      if (!notepad) return;

      const updateCEPRealTime = () => {
        const channel = document.getElementById('contactChannel')?.value || '';
        const sfdcCase = document.getElementById('sfdcCase')?.value || '';
        const cName = document.getElementById('cName')?.value || '';
        const cnum = document.getElementById('cnum')?.value || '';
        const cmail = document.getElementById('cmail')?.value || '';
        const wpermit = document.getElementById('wpermit')?.value || '';
        const adt = document.getElementById('adt')?.value || '';
        const cvResult = document.getElementById('cvResult')?.value || '';
        const troubleshooting = document.getElementById('troubleshooting')?.value || '';
        const lightStatus = document.getElementById('lightStatus')?.value || '';
        const wocas = document.getElementById('wocastxtarea')?.value || '';

        notepad.value = 
`Contact channel Vendor: ${channel} - CND
SFDC Case Number: ${sfdcCase}
Additional contact person: ${cName}
Additional contact number: ${cnum}
Additional contact email address: ${cmail}
Working permit needed (Y/N): ${wpermit}
Available date and time: ${adt}
Clearview Test Result: ${cvResult}
Troubleshooting: ${troubleshooting}
Light status: ${lightStatus}
Complaint Remarks/WOCAS: ${wocas}`;
      };

      updateCEPRealTime();

      ['contactChannel', 'sfdcCase', 'cName', 'cnum', 'cmail', 'wpermit', 'adt', 'cvResult', 'troubleshooting', 'lightStatus', 'wocastxtarea'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
          el.removeEventListener('input', el._cepListener);
          el.removeEventListener('change', el._cepListener);
          el._cepListener = updateCEPRealTime;
          el.addEventListener('input', updateCEPRealTime);
          el.addEventListener('change', updateCEPRealTime);
        }
      });
    });
  }
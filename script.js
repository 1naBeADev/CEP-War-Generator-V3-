document.addEventListener('DOMContentLoaded', () => {
  const FIREBASE_URL = 'https://autodocs-a12f0-default-rtdb.firebaseio.com';

  const loginReminderScreen = document.getElementById('loginReminderScreen');
  const gatewayLoginForm = document.getElementById('gatewayLoginForm');
  const loginUsernameInput = document.getElementById('loginUsername');
  const loginWinIDInput = document.getElementById('loginWinID');
  const formUsernameInput = document.querySelector('input[name="t_name"]');
  const formAgentNameInput = document.querySelector('input[name="aName"]');
  const sessionLogoutBtn = document.getElementById('sessionLogoutBtn');
  const adminBtn = document.getElementById('adminBtn'); // Select Admin Button

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
      if (isAuthorizedAdmin(domain, winId)) {
        adminBtn.style.display = 'inline-block'; // Show if admin
      } else {
        adminBtn.style.display = 'none'; // Hide if not admin
      }
    }
  }

  // --- 1. Check for Active Session in sessionStorage on Load ---
  let savedSession = JSON.parse(sessionStorage.getItem('activeSession'));

  if (savedSession && savedSession.firebaseKey) {
    if (formUsernameInput) formUsernameInput.value = savedSession.agentId;
    if (formAgentNameInput) formAgentNameInput.value = savedSession.employeeName;
    if (loginReminderScreen) loginReminderScreen.style.display = 'none';
    
    // Set initial visibility of Admin Button
    updateAdminButtonVisibility(savedSession.agentId, savedSession.winId);
  } else {
    updateAdminButtonVisibility(null, null);
  }

  // --- 2. Handle Login Submission ---
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

        // Update Admin Button Visibility
        updateAdminButtonVisibility(sessionData.agentId, sessionData.winId);

        loginReminderScreen.style.display = 'none';
      } catch (err) {
        console.error("Firebase connection error:", err);
        alert("Unable to verify credentials with Firebase database.");
      }
    });
  }

  // --- 3. Explicit Manual Logout Handler ---
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
      
      const resetBtn = document.getElementById('resetBtn');
      if (resetBtn) resetBtn.click();
      
      // Hide Admin Button on Logout
      updateAdminButtonVisibility(null, null);

      if (loginReminderScreen) loginReminderScreen.style.display = 'flex';
    });
  }

  // --- 4. Auto-Log Session End on Browser Close / Shutdown ---
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
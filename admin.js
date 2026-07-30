document.addEventListener('DOMContentLoaded', () => {
  const FIREBASE_URL = 'https://autodocs-a12f0-default-rtdb.firebaseio.com';
  const adminAuditLogBody = document.getElementById('adminAuditLogBody');
  const exportExcelBtn = document.getElementById('exportExcelBtn');
  const clearLogsBtn = document.getElementById('clearLogsBtn');

  async function renderAuditLogs() {
    if (!adminAuditLogBody) return;
    adminAuditLogBody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 24px;">Loading Firebase records...</td></tr>`;

    try {
      const response = await fetch(`${FIREBASE_URL}/loginHistory.json`);
      const data = await response.json();

      adminAuditLogBody.innerHTML = '';

      if (!data) {
        adminAuditLogBody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 24px; opacity: 0.6;">No database log records found in Firebase.</td></tr>`;
        return;
      }

      const logs = Object.values(data);

      logs.reverse().forEach(log => {
        const row = document.createElement('tr');
        if (log.logoutTime === 'Active Session') {
          row.classList.add('active-row');
        }

        const autoDocsUsed = log.autoDocsUsed || 'No';

        row.innerHTML = `
          <td style="font-weight: 600;">${log.agentId || 'N/A'}</td>
          <td>${log.loginTime || 'N/A'}</td>
          <td style="color: ${log.logoutTime === 'Active Session' ? 'var(--primary)' : 'inherit'}; font-style: ${log.logoutTime === 'Active Session' ? 'italic' : 'normal'};">${log.logoutTime || 'N/A'}</td>
          <td class="text-center">
            <span class="badge ${autoDocsUsed.toLowerCase()}">${autoDocsUsed}</span>
          </td>
        `;
        adminAuditLogBody.appendChild(row);
      });
    } catch (err) {
      console.error("Error fetching logs from Firebase:", err);
      adminAuditLogBody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 24px; color: var(--danger);">Failed to load records from Firebase.</td></tr>`;
    }
  }

  // Export to Excel
  if (exportExcelBtn) {
    exportExcelBtn.addEventListener('click', async () => {
      try {
        const response = await fetch(`${FIREBASE_URL}/loginHistory.json`);
        const data = await response.json();

        if (!data) {
          alert("No records available to export.");
          return;
        }

        const logs = Object.values(data);
        let csvContent = "Agent ID\tSession Start\tSession End\tAuto-Docs Used?\n";

        logs.forEach(log => {
          csvContent += `${log.agentId || ''}\t${log.loginTime || ''}\t${log.logoutTime || ''}\t${log.autoDocsUsed || 'No'}\n`;
        });

        const blob = new Blob([csvContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Agent_Session_Logs_${new Date().toISOString().slice(0, 10)}.xls`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch (err) {
        alert("Failed to export logs from Firebase.");
      }
    });
  }

  // Clear Logs
  if (clearLogsBtn) {
    clearLogsBtn.addEventListener('click', async () => {
      if (confirm("Are you sure you want to permanently delete all session logs from Firebase?")) {
        try {
          await fetch(`${FIREBASE_URL}/loginHistory.json`, { method: 'DELETE' });
          renderAuditLogs();
        } catch (err) {
          alert("Failed to clear Firebase logs.");
        }
      }
    });
  }

  renderAuditLogs();
});
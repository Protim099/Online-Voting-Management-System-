requireAdmin();
document.getElementById('adminName').textContent = getUser()?.name || 'Admin';

async function loadDashboard() {
  try {
    const stats = await apiRequest('/elections/stats');

    document.getElementById('statsGrid').innerHTML = `
      <div class="stat-card"><div class="label">Total Elections</div><div class="value">${stats.totalElections}</div></div>
      <div class="stat-card"><div class="label">Ongoing</div><div class="value">${stats.ongoing}</div></div>
      <div class="stat-card"><div class="label">Upcoming</div><div class="value">${stats.upcoming}</div></div>
      <div class="stat-card"><div class="label">Ended</div><div class="value">${stats.ended}</div></div>
      <div class="stat-card"><div class="label">Total Voters</div><div class="value">${stats.totalVoters}</div></div>
      <div class="stat-card"><div class="label">Turnout</div><div class="value">${stats.turnoutPercent}%</div></div>
    `;

    new Chart(document.getElementById('barChart'), {
      type: 'bar',
      data: {
        labels: ['Total', 'Ongoing', 'Upcoming', 'Ended'],
        datasets: [{
          label: 'Elections',
          data: [stats.totalElections, stats.ongoing, stats.upcoming, stats.ended],
          backgroundColor: ['#2f5fd6', '#1fa971', '#f59e0b', '#e14b4b'],
          borderRadius: 6,
        }],
      },
      options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { precision: 0 } } } },
    });

    new Chart(document.getElementById('doughnutChart'), {
      type: 'doughnut',
      data: {
        labels: ['Voted', 'Not Voted'],
        datasets: [{
          data: [stats.totalVotes, Math.max(stats.totalVoters - stats.totalVotes, 0)],
          backgroundColor: ['#1fa971', '#e14b4b'],
        }],
      },
    });

    const elections = await apiRequest('/elections');
    const tbody = document.getElementById('electionsTbody');
    tbody.innerHTML = elections.length
      ? elections.slice(0, 6).map(e => `
        <tr>
          <td>${e.title}</td>
          <td>${fmtDate(e.startDate)}</td>
          <td>${fmtDate(e.endDate)}</td>
          <td><span class="badge ${e.status}">${e.status}</span></td>
        </tr>`).join('')
      : '<tr><td colspan="4" class="empty-state">No elections yet. Create one from the Elections page.</td></tr>';
  } catch (err) {
    alert(err.message);
  }
}

loadDashboard();

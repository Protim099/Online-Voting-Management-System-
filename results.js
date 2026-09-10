requireAdmin();
document.getElementById('adminName').textContent = getUser()?.name || 'Admin';

let currentElectionId = null;
let barChartInstance = null;
let pieChartInstance = null;
let refreshTimer = null;

async function loadElectionOptions() {
  const select = document.getElementById('electionSelect');
  try {
    const elections = await apiRequest('/elections');
    if (!elections.length) {
      select.innerHTML = '<option value="">No elections found</option>';
      return;
    }
    select.innerHTML = elections.map(e => `<option value="${e._id}">${e.title}</option>`).join('');
    currentElectionId = select.value;
    loadResults();
    if (refreshTimer) clearInterval(refreshTimer);
    refreshTimer = setInterval(loadResults, 8000); // live refresh every 8s
  } catch (err) {
    alert(err.message);
  }
}

document.getElementById('electionSelect').addEventListener('change', (e) => {
  currentElectionId = e.target.value;
  loadResults();
});

async function loadResults() {
  if (!currentElectionId) return;
  try {
    const data = await apiRequest(`/results/${currentElectionId}`);

    document.getElementById('statsGrid').innerHTML = `
      <div class="stat-card"><div class="label">Total Votes</div><div class="value">${data.totalVotes}</div></div>
      <div class="stat-card"><div class="label">Total Voters</div><div class="value">${data.totalVoters}</div></div>
      <div class="stat-card"><div class="label">Turnout</div><div class="value">${data.turnoutPercent}%</div></div>
      <div class="stat-card"><div class="label">Candidates</div><div class="value">${data.candidates.length}</div></div>
    `;

    const labels = data.candidates.map(c => c.name);
    const votes = data.candidates.map(c => c.votes);
    const colors = ['#2f5fd6', '#1fa971', '#f59e0b', '#e14b4b', '#9333ea', '#0891b2'];

    if (barChartInstance) barChartInstance.destroy();
    barChartInstance = new Chart(document.getElementById('barChart'), {
      type: 'bar',
      data: { labels, datasets: [{ label: 'Votes', data: votes, backgroundColor: colors, borderRadius: 6 }] },
      options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { precision: 0 } } } },
    });

    if (pieChartInstance) pieChartInstance.destroy();
    pieChartInstance = new Chart(document.getElementById('pieChart'), {
      type: 'pie',
      data: { labels, datasets: [{ data: votes, backgroundColor: colors }] },
    });

    const tbody = document.getElementById('resultsTbody');
    tbody.innerHTML = data.candidates.length
      ? data.candidates.map(c => `
        <tr>
          <td>${c.name}</td><td>${c.party || '-'}</td><td>${c.position || '-'}</td>
          <td>${c.votes}</td><td>${c.percentage}%</td>
        </tr>`).join('')
      : '<tr><td colspan="5" class="empty-state">No votes cast yet</td></tr>';
  } catch (err) {
    console.error(err);
  }
}

loadElectionOptions();

requireAdmin();
document.getElementById('adminName').textContent = getUser()?.name || 'Admin';

let currentElectionId = null;

async function loadElectionOptions() {
  const select = document.getElementById('electionSelect');
  try {
    const elections = await apiRequest('/elections');
    if (!elections.length) {
      select.innerHTML = '<option value="">No elections found — create one first</option>';
      return;
    }
    select.innerHTML = elections.map(e => `<option value="${e._id}">${e.title} (${e.status})</option>`).join('');
    currentElectionId = select.value;
    loadCandidates();
  } catch (err) {
    alert(err.message);
  }
}

document.getElementById('electionSelect').addEventListener('change', (e) => {
  currentElectionId = e.target.value;
  loadCandidates();
});

async function loadCandidates() {
  const tbody = document.getElementById('candidatesTbody');
  if (!currentElectionId) {
    tbody.innerHTML = '<tr><td colspan="5" class="empty-state">Select an election above</td></tr>';
    return;
  }
  try {
    const candidates = await apiRequest(`/candidates/election/${currentElectionId}`);
    tbody.innerHTML = candidates.length
      ? candidates.map(c => `
        <tr>
          <td>${c.name}</td>
          <td>${c.party || '-'}</td>
          <td>${c.position || '-'}</td>
          <td>${c.votesCount}</td>
          <td><button class="btn btn-danger btn-sm" onclick="deleteCandidate('${c._id}')">Delete</button></td>
        </tr>`).join('')
      : '<tr><td colspan="5" class="empty-state">No candidates yet for this election</td></tr>';
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="5" class="empty-state">${err.message}</td></tr>`;
  }
}

async function deleteCandidate(id) {
  if (!confirm('Remove this candidate?')) return;
  try {
    await apiRequest(`/candidates/${id}`, 'DELETE');
    loadCandidates();
  } catch (err) {
    alert(err.message);
  }
}

document.getElementById('candidateForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!currentElectionId) return alert('Select an election first');
  try {
    await apiRequest('/candidates', 'POST', {
      name: document.getElementById('name').value,
      party: document.getElementById('party').value,
      position: document.getElementById('position').value,
      election: currentElectionId,
    });
    e.target.reset();
    loadCandidates();
  } catch (err) {
    alert(err.message);
  }
});

loadElectionOptions();

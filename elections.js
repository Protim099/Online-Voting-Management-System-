requireAdmin();
document.getElementById('adminName').textContent = getUser()?.name || 'Admin';

function openModal() { document.getElementById('modalOverlay').classList.add('open'); }
function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
  document.getElementById('electionForm').reset();
  document.getElementById('modalError').style.display = 'none';
}

async function loadElections() {
  const tbody = document.getElementById('electionsTbody');
  try {
    const elections = await apiRequest('/elections');
    tbody.innerHTML = elections.length
      ? elections.map(e => `
        <tr>
          <td>${e.title}</td>
          <td>${fmtDate(e.startDate)}</td>
          <td>${fmtDate(e.endDate)}</td>
          <td><span class="badge ${e.status}">${e.status}</span></td>
          <td><button class="btn btn-danger btn-sm" onclick="deleteElection('${e._id}')">Delete</button></td>
        </tr>`).join('')
      : '<tr><td colspan="5" class="empty-state">No elections yet — click "Create Election" to add one.</td></tr>';
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="5" class="empty-state">${err.message}</td></tr>`;
  }
}

async function deleteElection(id) {
  if (!confirm('Delete this election and all its candidates?')) return;
  try {
    await apiRequest(`/elections/${id}`, 'DELETE');
    loadElections();
  } catch (err) {
    alert(err.message);
  }
}

document.getElementById('electionForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const errEl = document.getElementById('modalError');
  errEl.style.display = 'none';
  try {
    await apiRequest('/elections', 'POST', {
      title: document.getElementById('title').value,
      description: document.getElementById('description').value,
      startDate: document.getElementById('startDate').value,
      endDate: document.getElementById('endDate').value,
    });
    closeModal();
    loadElections();
  } catch (err) {
    errEl.textContent = err.message;
    errEl.style.display = 'block';
  }
});

loadElections();

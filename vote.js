requireAuth();
document.getElementById('voterName').textContent = getUser()?.name || 'Voter';

let selectedCandidateId = null;
let currentElectionId = null;

async function loadElections() {
  const select = document.getElementById('electionSelect');
  try {
    const elections = await apiRequest('/elections');
    const ongoing = elections.filter(e => e.status === 'ongoing');
    if (!ongoing.length) {
      select.innerHTML = '<option value="">No active elections right now</option>';
      document.getElementById('ballotArea').innerHTML = '<div class="card empty-state">There are no ongoing elections at the moment. Please check back later.</div>';
      return;
    }
    select.innerHTML = ongoing.map(e => `<option value="${e._id}">${e.title}</option>`).join('');
    currentElectionId = select.value;
    loadBallot();
  } catch (err) {
    alert(err.message);
  }
}

document.getElementById('electionSelect').addEventListener('change', (e) => {
  currentElectionId = e.target.value;
  loadBallot();
});

async function loadBallot() {
  const area = document.getElementById('ballotArea');
  if (!currentElectionId) return;

  try {
    const { voted } = await apiRequest(`/votes/status/${currentElectionId}`);
    if (voted) {
      area.innerHTML = '<div class="card empty-state">✅ You have already voted in this election. Thank you for participating!</div>';
      return;
    }

    const candidates = await apiRequest(`/candidates/election/${currentElectionId}`);
    if (!candidates.length) {
      area.innerHTML = '<div class="card empty-state">No candidates have been added for this election yet.</div>';
      return;
    }

    selectedCandidateId = null;
    area.innerHTML = `
      <div class="card">
        <h2>Ballot Card</h2>
        <div id="candidateList"></div>
        <button class="btn btn-primary" style="width:100%;margin-top:10px" id="submitVoteBtn" disabled>Submit Vote</button>
      </div>
    `;

    document.getElementById('candidateList').innerHTML = candidates.map(c => `
      <div class="ballot-card" data-id="${c._id}" onclick="selectCandidate('${c._id}')">
        <div class="info">
          <strong>${c.name}</strong>
          <span>${c.party || 'Independent'} • ${c.position || 'General'}</span>
        </div>
        <input type="radio" name="candidate" ${''} />
      </div>
    `).join('');

    document.getElementById('submitVoteBtn').addEventListener('click', submitVote);
  } catch (err) {
    area.innerHTML = `<div class="card empty-state">${err.message}</div>`;
  }
}

function selectCandidate(id) {
  selectedCandidateId = id;
  document.querySelectorAll('.ballot-card').forEach(card => {
    const isSelected = card.dataset.id === id;
    card.classList.toggle('selected', isSelected);
    card.querySelector('input[type=radio]').checked = isSelected;
  });
  document.getElementById('submitVoteBtn').disabled = false;
}

async function submitVote() {
  if (!selectedCandidateId) return;
  if (!confirm('Submit your vote? This cannot be undone.')) return;

  const btn = document.getElementById('submitVoteBtn');
  btn.disabled = true;
  btn.textContent = 'Submitting…';

  try {
    const result = await apiRequest('/votes', 'POST', {
      electionId: currentElectionId,
      candidateId: selectedCandidateId,
    });
    document.getElementById('receiptCode').textContent = result.receiptCode;
    document.getElementById('receiptOverlay').classList.add('open');
  } catch (err) {
    alert(err.message);
    btn.disabled = false;
    btn.textContent = 'Submit Vote';
  }
}

function closeReceipt() {
  document.getElementById('receiptOverlay').classList.remove('open');
  loadBallot();
}

loadElections();

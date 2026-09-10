document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const errEl = document.getElementById('errorMsg');
  errEl.style.display = 'none';

  try {
    const data = await apiRequest('/auth/login', 'POST', { email, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data));
    window.location.href = data.role === 'admin' ? 'dashboard.html' : 'vote.html';
  } catch (err) {
    errEl.textContent = err.message;
    errEl.style.display = 'block';
  }
});

document.getElementById('registerForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const errEl = document.getElementById('errorMsg');
  errEl.style.display = 'none';

  try {
    const data = await apiRequest('/auth/register', 'POST', { name, email, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data));
    window.location.href = 'vote.html';
  } catch (err) {
    errEl.textContent = err.message;
    errEl.style.display = 'block';
  }
});

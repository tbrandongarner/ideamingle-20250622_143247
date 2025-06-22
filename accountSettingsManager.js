const apiBase = '/api/user';

async function apiRequest(path, method = 'GET', data = null) {
  const headers = { 'Content-Type': 'application/json' };
  const token = localStorage.getItem('authToken');
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const options = { method, headers };
  if (data) options.body = JSON.stringify(data);

  let response;
  try {
    response = await fetch(`${apiBase}${path}`, options);
  } catch (networkError) {
    const err = new Error(networkError.message || 'Network error');
    err.status = null;
    err.data = {};
    throw err;
  }

  let json = {};
  try {
    json = await response.json();
  } catch {
    json = {};
  }

  if (!response.ok) {
    const message = json.message || response.statusText || 'Request failed';
    const err = new Error(message);
    err.status = response.status;
    err.data = json;
    throw err;
  }

  return json;
}

function showMessage(form, message, type = 'success') {
  let msgEl = form.querySelector('.form-message');
  if (!msgEl) {
    msgEl = document.createElement('div');
    msgEl.className = 'form-message';
    form.prepend(msgEl);
  }
  msgEl.textContent = message;
  msgEl.classList.toggle('error', type === 'error');
  msgEl.classList.toggle('success', type === 'success');
}

function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function isStrongPassword(pw) {
  // Minimum 8 chars, at least one letter and one number
  const re = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
  return re.test(pw);
}

async function handleProfileUpdate(e) {
  e.preventDefault();
  const form = e.currentTarget;
  const name = form.querySelector('input[name="name"]').value.trim();
  const username = form.querySelector('input[name="username"]').value.trim();

  if (!name || !username) {
    return showMessage(form, 'Name and username cannot be empty.', 'error');
  }

  try {
    await apiRequest('/profile', 'PUT', { name, username });
    showMessage(form, 'Profile updated successfully.');
  } catch (err) {
    const msg = err.data?.message || err.message || 'Failed to update profile.';
    showMessage(form, msg, 'error');
  }
}

async function handleEmailChange(e) {
  e.preventDefault();
  const form = e.currentTarget;
  const email = form.querySelector('input[name="email"]').value.trim();

  if (!isValidEmail(email)) {
    return showMessage(form, 'Invalid email format.', 'error');
  }

  try {
    await apiRequest('/email', 'PUT', { email });
    showMessage(form, 'Email change link sent. Please check your inbox.');
  } catch (err) {
    const msg = err.data?.message || err.message || 'Failed to change email.';
    showMessage(form, msg, 'error');
  }
}

async function handlePasswordChange(e) {
  e.preventDefault();
  const form = e.currentTarget;
  const currentPassword = form.querySelector('input[name="currentPassword"]').value;
  const newPassword = form.querySelector('input[name="newPassword"]').value;
  const confirmPassword = form.querySelector('input[name="confirmPassword"]').value;

  if (!currentPassword) {
    return showMessage(form, 'Current password is required.', 'error');
  }
  if (newPassword !== confirmPassword) {
    return showMessage(form, 'New passwords do not match.', 'error');
  }
  if (!isStrongPassword(newPassword)) {
    return showMessage(form, 'Password must be at least 8 characters with letters and numbers.', 'error');
  }

  try {
    await apiRequest('/password', 'PUT', { currentPassword, newPassword });
    showMessage(form, 'Password changed successfully.');
    form.reset();
  } catch (err) {
    const msg = err.data?.message || err.message || 'Failed to change password.';
    showMessage(form, msg, 'error');
  }
}

async function handleNotificationsUpdate(e) {
  e.preventDefault();
  const form = e.currentTarget;
  const settings = Array.from(form.querySelectorAll('input[type="checkbox"]')).reduce((opts, cb) => {
    opts[cb.name] = cb.checked;
    return opts;
  }, Object.create(null));

  try {
    await apiRequest('/notifications', 'PUT', settings);
    showMessage(form, 'Notification settings updated.');
  } catch (err) {
    const msg = err.data?.message || err.message || 'Failed to update notifications.';
    showMessage(form, msg, 'error');
  }
}

async function handleAccountDeletion(e) {
  e.preventDefault();
  const form = e.currentTarget;
  if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) return;

  try {
    await apiRequest('', 'DELETE');
    localStorage.removeItem('authToken');
    window.location.href = '/goodbye';
  } catch (err) {
    const msg = err.data?.message || err.message || 'Failed to delete account.';
    showMessage(form, msg, 'error');
  }
}

function initAccountSettingsManager() {
  const profileForm = document.getElementById('profile-form');
  const emailForm = document.getElementById('email-form');
  const passwordForm = document.getElementById('password-form');
  const notificationsForm = document.getElementById('notifications-form');
  const deleteForm = document.getElementById('delete-account-form');

  if (profileForm) profileForm.addEventListener('submit', handleProfileUpdate);
  if (emailForm) emailForm.addEventListener('submit', handleEmailChange);
  if (passwordForm) passwordForm.addEventListener('submit', handlePasswordChange);
  if (notificationsForm) notificationsForm.addEventListener('submit', handleNotificationsUpdate);
  if (deleteForm) deleteForm.addEventListener('submit', handleAccountDeletion);
}

document.addEventListener('DOMContentLoaded', initAccountSettingsManager);
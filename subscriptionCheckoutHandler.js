export async function createCheckoutSession(planId, timeout = 30000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch('/api/subscription/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ planId }),
      signal: controller.signal
    });
    if (!response.ok) {
      let errorMessage = 'Failed to create checkout session';
      try {
        const errorData = await response.json();
        if (errorData && errorData.message) errorMessage = errorData.message;
      } catch {}
      throw new Error(errorMessage);
    }
    return await response.json();
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

function showToast(message, duration = 5000) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.setAttribute('aria-live', 'polite');
    container.style.position = 'fixed';
    container.style.top = '1rem';
    container.style.right = '1rem';
    container.style.zIndex = '1000';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  toast.style.background = 'rgba(0, 0, 0, 0.7)';
  toast.style.color = '#fff';
  toast.style.padding = '0.5rem 1rem';
  toast.style.marginBottom = '0.5rem';
  toast.style.borderRadius = '4px';
  container.appendChild(toast);
  setTimeout(() => {
    toast.remove();
    if (!container.hasChildNodes()) {
      container.remove();
    }
  }, duration);
}

export function initSubscriptionCheckout(buttonSelector = '.subscribe-button') {
  document.addEventListener('click', async event => {
    const button = event.target.closest(buttonSelector);
    if (!button) return;
    event.preventDefault();
    const planId = button.dataset.planId;
    if (!planId) return;
    const originalText = button.textContent;
    button.disabled = true;
    button.setAttribute('aria-busy', 'true');
    button.setAttribute('aria-disabled', 'true');
    button.textContent = 'Processing...';
    try {
      const session = await createCheckoutSession(planId);
      if (session.url) {
        window.location.href = session.url;
      } else {
        throw new Error('Invalid session response');
      }
    } catch (error) {
      console.error('Subscription checkout error:', error);
      showToast(error.message || 'Subscription checkout failed. Please try again.');
    } finally {
      button.disabled = false;
      button.removeAttribute('aria-busy');
      button.removeAttribute('aria-disabled');
      button.textContent = originalText;
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initSubscriptionCheckout();
});
/**
 * Contact form.
 *
 * Submits to the NestJS endpoint over fetch and renders field-level errors
 * returned by the server. The form still works without JavaScript — the
 * markup keeps its action and method — this only removes the page reload.
 */

export function initContactForm() {
  const form = document.querySelector('[data-contact-form]');
  if (!form) return;

  const status = form.querySelector('[data-form-status]');
  const submit = form.querySelector('[data-form-submit]');

  const clearErrors = () => {
    form.querySelectorAll('.field.has-error').forEach((field) => {
      field.classList.remove('has-error');
      const message = field.querySelector('.field__error');
      if (message) message.textContent = '';
    });
  };

  const showError = (name, message) => {
    const input = form.elements.namedItem(name);
    if (!(input instanceof HTMLElement)) return;
    const field = input.closest('.field');
    if (!field) return;
    field.classList.add('has-error');
    const target = field.querySelector('.field__error');
    if (target) target.textContent = message;
  };

  const setStatus = (tone, heading, body) => {
    if (!status) return;
    status.dataset.tone = tone;
    status.classList.add('is-visible');
    status.innerHTML = '';
    const wrap = document.createElement('p');
    const strong = document.createElement('b');
    strong.textContent = heading;
    wrap.append(strong, document.createTextNode(body));
    status.append(wrap);
  };

  // Clear a field's error as soon as the visitor starts fixing it.
  form.addEventListener('input', (event) => {
    const field = event.target instanceof HTMLElement ? event.target.closest('.field') : null;
    if (!field?.classList.contains('has-error')) return;
    field.classList.remove('has-error');
    const message = field.querySelector('.field__error');
    if (message) message.textContent = '';
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearErrors();

    const payload = Object.fromEntries(new FormData(form).entries());

    submit?.setAttribute('aria-busy', 'true');
    if (status) status.classList.remove('is-visible');

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        form.reset();
        setStatus(
          'ok',
          'Enquiry received. ',
          data.message?.replace(/^Thanks — your enquiry is with us\. /, '') ??
            'We reply within one working day.',
        );
        status?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      if (response.status === 429) {
        setStatus(
          'error',
          'Too many submissions. ',
          `Try again later, or email us directly at ${form.dataset.email ?? 'dailyjugandhar@gmail.com'}.`,
        );
        return;
      }

      if (data.fields && typeof data.fields === 'object') {
        Object.entries(data.fields).forEach(([name, message]) => showError(name, String(message)));
        const first = form.querySelector('.field.has-error input, .field.has-error select, .field.has-error textarea');
        if (first instanceof HTMLElement) first.focus();
        setStatus('error', 'Some details need another look. ', 'The fields are marked below.');
        return;
      }

      setStatus(
        'error',
        'That did not send. ',
        `Try again, or email us directly at ${form.dataset.email ?? 'dailyjugandhar@gmail.com'}.`,
      );
    } catch {
      setStatus(
        'error',
        'No connection. ',
        `The message did not leave your browser. Check your connection, or email ${form.dataset.email ?? 'dailyjugandhar@gmail.com'}.`,
      );
    } finally {
      submit?.removeAttribute('aria-busy');
    }
  });
}

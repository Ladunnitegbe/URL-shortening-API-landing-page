(function () {
  'use strict';


  const API_BASE = 'https://api-ssl.bitly.com/v4/shorten';


  const BITLY_TOKEN = '4249d47e68a100bdf34b41b61c3fcfd912794d30';


  const form        = document.getElementById('shortenerForm');
  const urlInput    = document.getElementById('urlInput');
  const errorMsg    = document.getElementById('errorMsg');
  const resultsList = document.getElementById('resultsList');
  const shortenBtn  = form.querySelector('.btn-shorten');

  let isLoading = false;

  function isValidUrl(str) {
    try {
      const url = new URL(str);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  }

  function showError(message) {
    errorMsg.textContent = message;
    errorMsg.classList.add('visible');
    urlInput.classList.add('is-error');
    urlInput.setAttribute('aria-invalid', 'true');
  }

  function clearError() {
    errorMsg.textContent = '';
    errorMsg.classList.remove('visible');
    urlInput.classList.remove('is-error');
    urlInput.removeAttribute('aria-invalid');
  }

  function setLoading(state) {
    isLoading = state;
    if (state) {
      shortenBtn.classList.add('loading');
      shortenBtn.disabled = true;
      urlInput.disabled = true;
    } else {
      shortenBtn.classList.remove('loading');
      shortenBtn.disabled = false;
      urlInput.disabled = false;
    }
  }

  function createResultItem(original, shortened) {
    const li = document.createElement('li');
    li.className = 'result-item';

    const originalSpan = document.createElement('span');
    originalSpan.className = 'result-original';
    originalSpan.textContent = original;

    const rightDiv = document.createElement('div');
    rightDiv.className = 'result-right';

    const shortLink = document.createElement('a');
    shortLink.className = 'result-short';
    shortLink.href = shortened;
    shortLink.target = '_blank';
    shortLink.rel = 'noopener noreferrer';
    shortLink.textContent = shortened;

    const copyBtn = document.createElement('button');
    copyBtn.className = 'btn-copy';
    copyBtn.textContent = 'Copy';
    copyBtn.addEventListener('click', () => handleCopy(shortened, copyBtn));

    rightDiv.appendChild(shortLink);
    rightDiv.appendChild(copyBtn);

    li.appendChild(originalSpan);
    li.appendChild(rightDiv);

    return li;
  }

  function handleCopy(text, btn) {
    document.querySelectorAll('.btn-copy.copied').forEach(b => {
      if (b !== btn) {
        b.textContent = 'Copy';
        b.classList.remove('copied');
      }
    });

    navigator.clipboard.writeText(text).then(() => {
      btn.textContent = 'Copied!';
      btn.classList.add('copied');
    });
  }


  async function shortenUrl(url) {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: {
      
        'Authorization': `Bearer ${BITLY_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        long_url: url
      })
    });

    const data = await response.json().catch(() => ({}));


    console.log('Bitly response:', response.status, data);

    if (!response.ok) {
      throw new Error(
        data.message ||
        data.description ||
        `Server error: ${response.status}`
      );
    }

    return data.link;
  }



  async function handleSubmit(event) {
    event.preventDefault();
    if (isLoading) return;

    let raw = urlInput.value.trim();

    if (raw && !/^https?:\/\//i.test(raw)) {
      raw = 'https://' + raw;
    }

    if (!raw) {
      showError('Please add a link');
      return;
    }

    if (!isValidUrl(raw)) {
      showError('Please enter a valid URL');
      return;
    }

    clearError();
    setLoading(true);

    try {
      const shortened = await shortenUrl(raw);
      const item = createResultItem(raw, shortened);
      resultsList.prepend(item);

      urlInput.value = '';

    } catch (err) {
      showError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  urlInput.addEventListener('input', function () {
    if (this.classList.contains('is-error') && this.value.trim()) {
      clearError();
    }
  });

  form.addEventListener('submit', handleSubmit);

})();
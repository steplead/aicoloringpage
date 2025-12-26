document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('open-btn');
    if (btn) {
        btn.addEventListener('click', () => {
            chrome.tabs.create({ url: 'https://ai-coloringpage.com/?utm_source=chrome_extension&utm_medium=popup_cta' });
        });
    }
});

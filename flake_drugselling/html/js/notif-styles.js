// Apply persisted card style once the body is available
document.addEventListener('DOMContentLoaded', function () {
    var saved = localStorage.getItem('flake_notif_style') || 'classic';
    if (saved !== 'classic') document.body.classList.add('notif-' + saved);
});

window.addEventListener('message', function (event) {
    var data = event.data;
    if (data.action !== 'setNotifStyle') return;

    var style = data.style || 'classic';
    // Strip any existing notif- class
    document.body.className = document.body.className
        .split(' ')
        .filter(function (c) { return c.indexOf('notif-') !== 0; })
        .join(' ');

    if (style !== 'classic') document.body.classList.add('notif-' + style);
    localStorage.setItem('flake_notif_style', style);
});

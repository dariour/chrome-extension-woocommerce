// Saves options to chrome.storage
function saveOptions() {
	let consumer_key = document.getElementById('consumer-key').value;
	let consumer_secret = document.getElementById('consumer-secret').value;
    let site_url = document.getElementById('site-url').value;
    let options = {
        "consumerKey": consumer_key,
        'consumerSecret': consumer_secret,
        'siteURL': site_url
    };
	chrome.storage.sync.set({
		'options': options
	}, function() {
    let status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
		status.textContent = '';
    }, 750);
  });
}

// Restores options frome chrome.storage
function restoreOptions() {
	chrome.storage.sync.get(
		'options'
	, function (items) {
	document.getElementById('consumer-key').value = items.options.consumerKey;
	document.getElementById('consumer-secret').value = items.options.consumerSecret;
	document.getElementById('site-url').value = items.options.siteURL;
	});
}
document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);
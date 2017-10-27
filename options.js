function setURL(http_protocol, site_url, consumer_key, consumer_secret){
	return "https://" + site_url + "/wp-json/wc/v2/orders/?consumer_key=" + consumer_key + "&consumer_secret=" + consumer_secret;
}

function verify_url(url){
	
}
// Saves options to chrome.storage
function saveOptions() {
	let http_protocol = document.getElementById('http_protocol').value;
	let consumer_key = document.getElementById('consumer_key').value;
	let consumer_secret = document.getElementById('consumer_secret').value;
	let site_url = document.getElementById('site_url').value;
	let complete_url = setURL(site_url, consumer_key, consumer_secret);  
	chrome.storage.sync.set({
		'consumerKey': consumer_key,
		'consumerSecret': consumer_secret,
		'siteUrl': site_url,
		'completeUrl': complete_url,
	}, function() {
    // Update status to let user know options were saved.
    let status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
		status.textContent = '';
    }, 750);
  });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restoreOptions() {
	chrome.storage.sync.get({
		'consumerKey': consumer_key,
		'consumerSecret': consumer_secret,
		'siteUrl': site_url,
		'completeUrl': complete_url,
	}, function(items) {
	document.getElementById('consumer_key').value = items.consumerKey;
	document.getElementById('consumer_secret').value = items.consumerSecret;
	document.getElementById('site_url').value = items.siteUrl;
	document.getElementById('complete_url').value = items.completeUrl;
	});
};
document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);
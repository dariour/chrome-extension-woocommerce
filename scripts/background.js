function downloadOrders() {
  chrome.storage.sync.get(
	'options'
      , function (items) {
        let URL = "https://" + items.options.siteURL + "/wp-json/wc/v2/orders/?consumer_key=" + items.options.consumerKey + "&consumer_secret=" + items.options.consumerSecret;
        loadJSON('jconfig.json', URL, function printJSONObject(result) {         
            saveOrders(result);
		});
	});
}

function saveOrders(allOrders) {
	chrome.storage.local.clear();
	chrome.storage.local.set({
		'allOrders': allOrders
    }, function () {
  });
}

function loadJSON(path, url, callback) {
	var result;
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState == XMLHttpRequest.DONE && xhr.status == "200") {
			result = JSON.parse(xhr.responseText);
			callback(result);
        }
    };
    xhr.open("GET", url, true);
    xhr.send();
    return xhr.onreadystatechange();
}

(function loop() {
  setTimeout(function () {
    chrome.storage.sync.get(
	'options',
    function (items) {
        refreshRate = items.options.refreshRate;
        let URL = "https://" + items.options.siteURL + "/wp-json/wc/v2/orders/?consumer_key=" + items.options.consumerKey + "&consumer_secret=" + items.options.consumerSecret;
        loadJSON('jconfig.json', URL, function printJSONObject(result) {
			saveOrders(result);				
		});
	});
    loop();
  }, 6000);
}());
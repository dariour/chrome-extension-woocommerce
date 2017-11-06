var lastOrderNumber = 0;

// Gets options frome chrome.storage
function downloadOrders() {
  chrome.storage.sync.get(
	'options'
      , function (items) {
        let URL = "https://" + items.options.siteURL + "/wp-json/wc/v2/orders/?consumer_key=" + items.options.consumerKey + "&consumer_secret=" + items.options.consumerSecret;
        loadJSON('jconfig.json', URL, function saveJSON(result) {  
            saveOrders(result);
		});
	});
}

// Saves JSON data to chrome.storage
function saveOrders(allOrders) {
	chrome.storage.local.clear();
	chrome.storage.local.set({
		'allOrders': allOrders
    }, function () {
        console.log(parseInt(lastOrderNumber));
        if (parseInt(lastOrderNumber) < parseInt(allOrders[0].id)) {
            if (allOrders[0].status === "pending"){
                chrome.browserAction.setBadgeBackgroundColor({ color: [255, 0, 0, 255] });
                chrome.browserAction.setBadgeText({ text: 'New' });
                lastOrderNumber = allOrders[0].id;
            }
        }
  });
}

// Get request to server
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

// Periodically checking for new data
(function loop() {
  setTimeout(function () {
    chrome.storage.sync.get(
	'options',
    function (items) {
        let URL = "https://" + items.options.siteURL + "/wp-json/wc/v2/orders/?consumer_key=" + items.options.consumerKey + "&consumer_secret=" + items.options.consumerSecret;
        loadJSON('jconfig.json', URL, function saveJSON(result) {
			saveOrders(result);				
		});
	});
    loop();
  }, 60000);
}());
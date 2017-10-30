function downloadOrders() {
  chrome.storage.sync.get(
	'completeUrl',
	function(items) {
		loadJSON('jconfig.json', items.completeUrl, function printJSONObject(result){
			saveOrders(result);
		});
	});
};

function saveOrders(allOrders) {
	chrome.storage.local.clear();
	chrome.storage.local.set({
		'allOrders': allOrders,
	}, function() {
		console.log(allOrders);
  });
}

function loadJSON(path, url, callback) {
	var result;
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE && xhr.status == "200") {
			result = JSON.parse(xhr.responseText);
			callback(result);
        }
    };
    xhr.open("GET", url, true);
    xhr.send();
    return xhr.onreadystatechange();
}

(function initialize(){
	chrome.storage.sync.get(
		'completeUrl',
		function(items) {
			loadJSON('jconfig.json', items.completeUrl, function printJSONObject(result){
				saveOrders(result);
			});
		});	
})();

(function loop() {
  setTimeout(function () {
    chrome.storage.sync.get(
	'completeUrl',
	function(items) {
		loadJSON('jconfig.json', items.completeUrl, function printJSONObject(result){
			saveOrders(result);				
		});
	});
    loop()
  }, 60000);
}());
var url2 = "https://testna.com.hr/testinstall/wp-json/wc/v2/orders/?consumer_key=ck_e233e3244ecf0e71a3ce3d74198dc2d52be36b0f&consumer_secret=cs_18785bcbfd8eabd6b1e7a4e0bc84aed8d39dbdce";
var lastCheckedTime;

function create_element(){
	var table_column = document.createElement("TD");
	var text_node;
	for(let i = 0; i < arguments.length; i++){
		text_node = document.createTextNode(arguments[i]);
		table_column.appendChild(text_node);
	}
	return table_column ;
}

function setLastCheckedTime(){
	lastCheckedTime = Date.now();
}
document.addEventListener('DOMContentLoaded', function() {
    setLastCheckedTime();
});

function loadOrdersFromStorage() {
  chrome.storage.local.get(
	'allOrders',
	function printJSONObject(result){
		console.log(result);
	});
};

function changeOrderStatus(path, url, newStatus){
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE && xhr.status == "200") {
        }
    };
    xhr.open("PUT", url, true);
	xhr.setRequestHeader('Content-type','application/json; charset=utf-8');
    xhr.send(JSON.stringify(newStatus));
    return xhr.onreadystatechange();
}

function completeOrder(id){
	let url = "https://testna.com.hr/testinstall/wp-json/wc/v2/orders/" + id + "/?consumer_key=ck_7dafbac6e59b7ffdd0f1208e27292c231119c6c5&consumer_secret=cs_bb466f26c0adfd2f43ec9874ca80b34969a04753";
	changeOrderStatus('jconfig.json', url, {status: "completed"});
}

function processingOrder(){
	let url = "https://testna.com.hr/testinstall/wp-json/wc/v2/orders/" + id + "/?consumer_key=ck_7dafbac6e59b7ffdd0f1208e27292c231119c6c5&consumer_secret=cs_bb466f26c0adfd2f43ec9874ca80b34969a04753";
	changeOrderStatus('jconfig.json', url, {status: "processing"});
}

// ADD EVENT LISTENERS TO COMPLETE ORDER BUTTONS
document.addEventListener('DOMContentLoaded', function() {
    let completeOrderButtons = document.getElementsByClassName("complete-order-button");
	for (var i = 0; i < completeOrderButtons.length; i++){
		console.log(completeOrderButtons.item(i));
		let completeOrderButton = completeOrderButtons.item(i);
		completeOrderButton.addEventListener('click', function() {
			completeOrder(completeOrderButton.id);
    });
	}
});

// ADD EVENT LISTENERS TO COMPLETE PROCESSING BUTTONS
document.addEventListener('DOMContentLoaded', function() {
    let processingOrderButtons = document.getElementsByClassName("processing-order-button");
	for (var i = 0; i < processingOrderButtons.length; i++){
		console.log(processingOrderButtons.item(i));
		let processingOrderButton = processingOrderButtons.item(i);
		processingOrderButton.addEventListener('click', function() {
			processingOrder(processingOrderButton.id);
    });
	}
});

loadOrdersFromStorage();

(function initialize(){
	loadOrdersFromStorage();
});

(function loop() {
  setTimeout(function () {
    loadOrdersFromStorage();
    loop()
  }, 60000);
}());












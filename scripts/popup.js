var ordersRowTemplate = '<tr><td><p>Pending</p></td><td><p class="order-number">Narudžba #order_number</p><p class="first-last-name">order_name</p><p><a class="email" href="mail:order_email">order_email</a></p></td><td><p class="date">order_date</p></td><td><p class="total">order_total</p><p class="payment-method">order_payment_method</p></td><td><div><button class="processing-order-button update-order-button" id="order_number-processing" title="Processing"></button><button class="complete-order-button update-order-button" id="order_number-complete" title="Complete"></button><button class="view-order-button update-order-button" id="order_number-view" title="View"></button></div></td></tr>';

//------------------------------------------------------
// LOAD ORDERS FROM STORAGE AND INSERT INTO POPUP TABLE
//------------------------------------------------------

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

function loadOrdersFromStorage() {
	chrome.storage.local.get(
		'allOrders',
		function (result){
			console.log(result);
			insertData(result);
	});
};

function insertData(result, data){
	for(let i = 0; i < result.allOrders.length; i++) {
		let orderRow = ordersRowTemplate
			.replaceAll("order_number", result.allOrders[i].number)
			.replaceAll("order_name", result.allOrders[i].billing.first_name + " " + result.allOrders[i].billing.last_name)
			.replaceAll("order_email", result.allOrders[i].billing.email)
			.replaceAll("order_date", result.allOrders[i].date_created.slice(0, 10) + "<br>" + result.allOrders[i].date_created.slice(11, 19))
			.replaceAll("order_total", result.allOrders[i].total + " " + result.allOrders[i].currency)
			.replaceAll("order_payment_method", result.allOrders[i].payment_method);
		$("#order-table-body").append(orderRow);
		$( "#" + result.allOrders[i].number + "-view" ).bind("click", function() {
			initializeChangeOrder("vieworder", result.allOrders[i].number);
		});
		$( "#" + result.allOrders[i].number + "-complete" ).bind("click", function() {
			initializeChangeOrder("completeorder", result.allOrders[i].number);
		});
		$( "#" + result.allOrders[i].number + "-processing" ).bind("click", function() {
			initializeChangeOrder("processorder", result.allOrders[i].number);
		});
	}
}

//-------------------------------------
//FUNCTIONS FOR CHANGING ORDER STATUS
//-------------------------------------

function initializeChangeOrder(action, id){
	chrome.storage.sync.get(
		'options'
	, function(items) {
		console.log(items);
		let updateURL = "https://" + items.options.siteUrl + "/wp-json/wc/v2/orders/" + id + "?consumer_key=" + items.options.consumerKey + "&consumer_secret=" + items.options.consumerSecret;
		let viewURL = "http://" + items.options.siteUrl + "/wp-admin/post.php?post=" + id + "&action=edit";
		if (action == "processorder"){processingOrder(updateURL, id);}
		else if (action == "completeorder"){completeOrder(updateURL, id);}
		else {viewOrder(viewURL, id);}
	});	
}

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

function completeOrder(url, id){
	console.log(url);
	changeOrderStatus('jconfig.json', url, {status: "completed"});
}

function processingOrder(url, id){
	changeOrderStatus('jconfig.json', url, {status: "processing"});
}

function viewOrder(viewURL, id){
	var win = window.open(viewURL, '_blank');
	win.focus();
}

//--------------------------------------------------------------------

(function initialize(){
	loadOrdersFromStorage();
})();

(function loop() {
  setTimeout(function () {
    loadOrdersFromStorage();
    loop()
  }, 60000);
}());









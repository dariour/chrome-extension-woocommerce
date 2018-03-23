// Table row template with placeholders
var ordersRowTemplate = '<tr><td><img class="order-status-icon" title="order_status_title" src="order_status_icon"></td><td><p class="order-number">Narudžba <strong>#order_number</strong> by</p><p class="first-last-name">order_name</p><p><a class="email" href="mailto:order_email">order_email</a></p></td><td><p class="date">order_date</p></td><td><p class="total">order_total</p><p class="payment-method">order_payment_method</p></td><td><div><button class="processing-order-button update-order-button" id="order_number-processing" title="Processing"></button><button class="complete-order-button update-order-button" id="order_number-complete" title="Complete"></button><button class="view-order-button update-order-button" id="order_number-view" title="View"></button></div></td></tr>';

//------------------------------------------------------
// LOAD ORDERS FROM STORAGE AND INSERT INTO POPUP TABLE
//------------------------------------------------------

// For replacing all string instances in the template
String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

// Loads saved data from chrome storage
function loadOrdersFromStorage() {
	chrome.storage.local.get(
		'allOrders',
        function (result) {
		insertData(result);
	});
}

// Manipulate loaded data and insert it into template/HTML
function insertData(result) {
    let orderRow = "";
    console.log(result);
    // Remove old data
    $("#order-table-body tr").remove();

    for (let i = 0; i < result.allOrders.length; i++) {
        // Dont display order if completed
        if (result.allOrders[i].status === "completed" || result.allOrders[i].status === "canceled" || result.allOrders[i].status === "refunded" || result.allOrders[i].status === "failed") continue;

        // Insert data into template by replacing placeholders with actual data
        orderRow = ordersRowTemplate
			.replaceAll("order_number", result.allOrders[i].number)
			.replaceAll("order_name", result.allOrders[i].billing.first_name + " " + result.allOrders[i].billing.last_name)
			.replaceAll("order_email", result.allOrders[i].billing.email)
			.replaceAll("order_date", result.allOrders[i].date_created.slice(0, 10) + "<br>" + result.allOrders[i].date_created.slice(11, 19))
			.replaceAll("order_total", result.allOrders[i].total + " " + result.allOrders[i].currency)
            .replaceAll("order_payment_method", result.allOrders[i].payment_method);

        // Insert images into template
        switch (result.allOrders[i].status) {
            case "processing":
                orderRow = orderRow
                    .replaceAll("order_status_icon", "/icons/icon-processed.png")
                    .replaceAll("order_status_title", "Processing");
                break;
            case "completed":
                orderRow = orderRow
                    .replaceAll("order_status_icon", "/icons/icon-completed.png")
                    .replaceAll("order_status_title", "Completed");
                break;
            case "pending":
                orderRow = orderRow
                    .replaceAll("order_status_icon", "/icons/icon-pending-payment.png")
                    .replaceAll("order_status_title", "Pending Payment");
                break;
            case "on-hold":
                orderRow = orderRow
                    .replaceAll("order_status_icon", "/icons/icon-on-hold.png")
                    .replaceAll("order_status_title", "On hold");
                break;
            default:
                break;
        }

        // Insert row into HTML
        $("#order-table-body").append(orderRow);

        // Add listeners to update buttons
		$( "#" + result.allOrders[i].number + "-view" ).bind("click", function() {
			initializeChangeOrder("vieworder", result.allOrders[i].number);
		});
		$( "#" + result.allOrders[i].number + "-complete" ).bind("click", function() {
			initializeChangeOrder("completeorder", result.allOrders[i].number);
		});
		$( "#" + result.allOrders[i].number + "-processing" ).bind("click", function() {
			initializeChangeOrder("processorder", result.allOrders[i].number);
        });

        // Hide unnecessary update buttons
        switch (result.allOrders[i].status) {
            case "processing":
                $("#" + result.allOrders[i].number + "-processing").css("visibility", "hidden");
                break;
            case "completed":
                $("#" + result.allOrders[i].number + "-complete").css("visibility", "hidden");
                break;
            default:
                break;
        }
	}
}

//-------------------------------------
// 
//-------------------------------------

function initializeChangeOrder(action, id) {
    $(".popup-notification").append("<span>Loading. Please wait.</span>");
	chrome.storage.sync.get(
		'options'
	, function(items) {
		let updateURL = "https://" + items.options.siteURL + "/wp-json/wc/v2/orders/" + id + "?consumer_key=" + items.options.consumerKey + "&consumer_secret=" + items.options.consumerSecret;
        let viewURL = "https://" + items.options.siteURL + "/wp-admin/post.php?post=" + id + "&action=edit";
		if (action === "processorder"){processingOrder(updateURL, id);}
		else if (action === "completeorder"){completeOrder(updateURL, id);}
        else if (action === "vieworder") { viewOrder(viewURL, id); }
	});	
}

function changeOrderStatus(path, url, newStatus) {
    var xhr = new XMLHttpRequest ();
    xhr.onreadystatechange = function () {
        if (xhr.readyState == XMLHttpRequest.DONE && xhr.status == "200") {
            reloadItems();
        }
    };
    xhr.open("PUT", url, true);
	xhr.setRequestHeader('Content-type','application/json; charset=utf-8');
    xhr.send(JSON.stringify(newStatus));
    return xhr.onreadystatechange();
}

function completeOrder(url, id) {
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
// GET REQUEST TO SERVER
//--------------------------------------------------------------------

function reloadItems() {
    chrome.storage.sync.get(
        'options',
        function (items) {
            let URL = "https://" + items.options.siteURL + "/wp-json/wc/v2/orders/?consumer_key=" + items.options.consumerKey + "&consumer_secret=" + items.options.consumerSecret;
            loadJSON('jconfig.json', URL, function saveJSON(result) {
                saveOrdersToStorage(result, function call() {
                    location.reload();
                    notify();
                });
            });
        }
    );
}

function saveOrdersToStorage(allOrders, callback) {
    chrome.storage.local.clear();
    chrome.storage.local.set({
        'allOrders': allOrders
    }, function () {
        });
	callback();
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

//--------------------------------------------------------------------
// MISC WORK
//--------------------------------------------------------------------

// Add href attr to link
chrome.storage.sync.get(
    'options'
    , function (items) {
        let URL = "https://" + items.options.siteURL + "/wp-admin/edit.php?post_type=shop_order";
        $("#popup-see-all-orders").attr("href", URL);
    });

//----------------------------------------------------------------------


(function initialize() {
    chrome.browserAction.setBadgeText({ text: '' });
    chrome.storage.sync.get(
        'options'
        , function (items) {
            let URL = "https://" + items.options.siteURL + "/wp-json/wc/v2/orders/?consumer_key=" + items.options.consumerKey + "&consumer_secret=" + items.options.consumerSecret;
            loadJSON('jconfig.json', URL, function saveJSON(result) {
                saveOrdersToStorage(result, function callback(){});
            });
        });
	loadOrdersFromStorage();
})();

// periodically check for new data
(function loop() {
    setTimeout(function () {
    loadOrdersFromStorage();
    loop();
  }, 60000);
}());









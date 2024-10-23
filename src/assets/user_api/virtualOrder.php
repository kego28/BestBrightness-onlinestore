<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Max-Age: 3600");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit();
}

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "best";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die(json_encode(array("success" => false, "message" => "Connection failed: " . $conn->connect_error)));
}

// Handle POST request for inserting a new order
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = file_get_contents("php://input");
    $data = json_decode($input);

    if (json_last_error() !== JSON_ERROR_NONE) {
        error_log("Invalid JSON: " . json_last_error_msg());
        die(json_encode(array("success" => false, "message" => "Invalid JSON: " . json_last_error_msg())));
    }

    // Prepare and bind for virtualOrder table
    $stmt = $conn->prepare("INSERT INTO virtualOrder (user_id, total_amount, order_type, status, name, price, quantity, orderNumber, product_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    if (!$stmt) {
        error_log("Prepare failed: " . $conn->connect_error);
        die(json_encode(array("success" => false, "message" => "Prepare failed: " . $conn->error)));
    }

    // Loop through items to insert into virtualOrder table
    foreach ($data->items as $item) {
        $stmt->bind_param("idsssdids",
            $data->user_id,  
            $data->total_amount, 
            $data->order_type, 
            $data->status, 
            $item->name, 
            $item->price,  
            $item->quantity, 
            $data->orderNumber,
            $item->product_id
        );

        // Execute the statement
        if (!$stmt->execute()) {
            error_log("Failed to place order: " . $stmt->error);
            echo json_encode(array("success" => false, "message" => "Failed to place order: " . $stmt->error));
            exit; // Exit if execution fails
        }
    }

    $order_id = $conn->insert_id; // Capture the last inserted order_id

    // Insert order items separately
    $stmt_items = $conn->prepare("INSERT INTO ORDER_ITEMS (order_id, product_id, quantity, price_per_unit) VALUES (?, ?, ?, ?)");
    if (!$stmt_items) {
        error_log("Prepare items failed: " . $conn->error);
        die(json_encode(array("success" => false, "message" => "Prepare items failed: " . $conn->error)));
    }

    foreach ($data->items as $item) {
        $stmt_items->bind_param("iiid", $order_id, $item->product_id, $item->quantity, $item->price);
        if (!$stmt_items->execute()) {
            error_log("Execute items failed: " . $stmt_items->error);
            die(json_encode(array("success" => false, "message" => "Execute items failed: " . $stmt_items->error)));
        }
    }

    $stmt_items->close();
    echo json_encode(array("success" => true, "message" => "Order placed successfully", "order_id" => $order_id));
    $stmt->close();
}

// Handle GET request for a specific order
else if (isset($_GET['orderNumber'])) {
    $order_number = $_GET['orderNumber'];
    $sql = "SELECT * FROM VIRTUALORDER WHERE orderNumber = ?"; 
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $order_number);
    $stmt->execute();
    $result = $stmt->get_result();

    $orders = [];
    if ($result->num_rows > 0) {
        while ($order = $result->fetch_assoc()) {
            $orders[] = $order;
        }
        echo json_encode(array("success" => true, "orders" => $orders));
    } else {
        echo json_encode(array("success" => false, "message" => "No orders found"));
    }
}

// Handle GET request for all virtual orders
else if ($_SERVER['REQUEST_METHOD'] === 'GET' && !isset($_GET['orderNumber'])) {
    $sql = "SELECT * FROM VIRTUALORDER"; // Select all records from the VIRTUALORDER table
    $result = $conn->query($sql);

    $orders = [];
    if ($result->num_rows > 0) {
        while ($order = $result->fetch_assoc()) {
            $orders[] = $order;
        }
        echo json_encode(array("success" => true, "orders" => $orders));
    } else {
        echo json_encode(array("success" => true, "orders" => [])); // Return empty array if no orders found
    }
}

$conn->close();
?>

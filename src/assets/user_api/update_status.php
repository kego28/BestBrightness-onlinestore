<?php
header("Access-Control-Allow-Origin: http://localhost:8100");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Max-Age: 3600");
header("Content-Type: application/json; charset=UTF-8");

// Database connection
$conn = new mysqli('localhost', 'root', '', 'best');

if ($conn->connect_error) {
    die(json_encode(["success" => false, "message" => "Connection failed: " . $conn->connect_error]));
}

// Check if request data contains orderNumber and status
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents("php://input"), true);
    $orderNumber = isset($input['orderNumber']) ? $input['orderNumber'] : null;
    $status = isset($input['status']) ? $input['status'] : null;

    if ($orderNumber && $status) {
        // Prepare the SQL statement to update the status
        $stmt = $conn->prepare("UPDATE virtualorder SET status = ? WHERE orderNumber = ?");
        $stmt->bind_param("ss", $status, $orderNumber);

        if ($stmt->execute()) {
            // If update was successful
            echo json_encode(["success" => true, "message" => "Order status updated successfully."]);
        } else {
            // If there was an error updating the status
            echo json_encode(["success" => false, "message" => "Failed to update order status."]);
        }

        $stmt->close();
    } else {
        // If required data is missing
        echo json_encode(["success" => false, "message" => "Missing order number or status."]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Invalid request method."]);
}

$conn->close();
?>

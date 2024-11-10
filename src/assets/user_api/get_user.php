<?php
// Allow CORS for your specific domain
header("Access-Control-Allow-Origin: http://localhost:8100");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit();
}

// Database connection
$conn = new mysqli('localhost', 'root', '', 'best');

// Check connection
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["error" => "Database connection failed: " . $conn->connect_error]);
    exit();
}

// Get and validate user ID
$user_id = isset($_GET['user_id']) ? (int) $_GET['user_id'] : null;

if ($user_id === null || $user_id <= 0) {
    http_response_code(400);
    echo json_encode(["error" => "Invalid or missing user_id parameter"]);
    exit();
}

// Prepare and execute query
$query = "SELECT user_id, username, email, first_name, last_name, role, created_at, updated_at FROM users WHERE user_id = ?";
$stmt = $conn->prepare($query);
$stmt->bind_param("i", $user_id);

if ($stmt->execute()) {
    $result = $stmt->get_result();
    $data = $result->fetch_assoc();
    
    if ($data) {
        // Exclude the password_hash field from the response
        unset($data['password_hash']);
        echo json_encode($data);
    } else {
        http_response_code(404);
        echo json_encode(["error" => "User not found"]);
    }
} else {
    http_response_code(500);
    echo json_encode(["error" => "Query execution failed"]);
}

$stmt->close();
$conn->close();
?>

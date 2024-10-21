<?php
session_start();
header("Access-Control-Allow-Origin: http://localhost:8100");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "best";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (isset($_SESSION['user_id'])) {
        $user_id = mysqli_real_escape_string($conn, $_SESSION['user_id']);
        
        $sql = "SELECT user_id, username, first_name, last_name, email, role FROM users WHERE user_id = '$user_id'";
        $result = $conn->query($sql);

        if ($result->num_rows > 0) {
            $user = $result->fetch_assoc();
            unset($user['password_hash']);
            echo json_encode($user);
        } else {
            http_response_code(404);
            echo json_encode(['status' => 0, 'message' => 'User not found']);
        }
    } else {
        http_response_code(401);
        echo json_encode(['status' => 0, 'message' => 'User not logged in']);
    }
    exit();
}

$conn->close();

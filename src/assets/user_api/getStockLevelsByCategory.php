<?php
header("Access-Control-Allow-Origin: http://localhost:8100");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Max-Age: 3600");
header("Content-Type: application/json; charset=UTF-8");

$conn = new mysqli('localhost', 'root', '', 'best');

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$query = "SELECT category, SUM(stock_quantity) AS total_stock 
          FROM products 
          GROUP BY category 
          ORDER BY total_stock DESC";

$result = $conn->query($query);

$data = [];
while ($row = $result->fetch_assoc()) {
    $data[] = $row;
}

echo json_encode($data);
$conn->close();
?>

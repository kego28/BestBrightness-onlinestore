<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

$conn = new mysqli("localhost", "root", "", "best");
$sql = "SELECT DATE(order_date) as date, SUM(total_amount) as revenue FROM ORDERS GROUP BY DATE(order_date)";
$result = $conn->query($sql);

$data = [];
while ($row = $result->fetch_assoc()) {
    $data[] = $row;
}
echo json_encode($data);
$conn->close();
?>

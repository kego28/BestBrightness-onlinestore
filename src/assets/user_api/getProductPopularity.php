<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

$conn = new mysqli("localhost", "root", "", "best");
$sql = "SELECT product_name, SUM(quantity) as quantity FROM PRODUCTS GROUP BY product_name";
$result = $conn->query($sql);

$data = [];
while ($row = $result->fetch_assoc()) {
    $data[] = $row;
}
echo json_encode($data);
$conn->close();
?>

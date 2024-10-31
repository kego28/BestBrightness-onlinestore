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

$chartType = $_GET['chart'] ?? '';

// Initialize response data
$data = [];

// Query data based on chart type
switch ($chartType) {
    case 'orders_by_status':
        $query = "SELECT status, COUNT(*) AS total_orders FROM ORDERS GROUP BY status";
        break;

    case 'sales_by_payment_method':
        $query = "SELECT payment_method, COUNT(*) AS total_sales FROM SALES GROUP BY payment_method";
        break;

    case 'top_selling_products':
        $query = "SELECT P.name, SUM(OI.quantity) AS total_quantity_sold 
                  FROM ORDER_ITEMS OI 
                  JOIN PRODUCTS P ON OI.product_id = P.product_id 
                  GROUP BY P.name 
                  ORDER BY total_quantity_sold DESC 
                  LIMIT 10";
        break;

    case 'orders_by_type':
        $query = "SELECT order_type, COUNT(*) AS total_orders FROM ORDERS GROUP BY order_type";
        break;

    case 'product_ratings':
        $query = "SELECT P.name, AVG(UR.rating) AS average_rating 
                  FROM USER_RATING UR 
                  JOIN PRODUCTS P ON UR.product_id = P.product_id 
                  GROUP BY P.name 
                  ORDER BY average_rating DESC";
        break;

    case 'promotions_usage':
        $query = "SELECT 
                    CASE 
                        WHEN PP.promotion_id IS NOT NULL THEN 'With Promotion' 
                        ELSE 'Without Promotion' 
                    END AS promotion_status, 
                    COUNT(O.order_id) AS total_orders 
                  FROM ORDERS O 
                  LEFT JOIN PRODUCT_PROMOTIONS PP ON O.order_id = PP.product_id 
                  GROUP BY promotion_status";
        break;

    default:
        echo json_encode(["error" => "Invalid chart type"]);
        exit;
}

// Execute the query
$result = $conn->query($query);

if ($result) {
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }
    echo json_encode($data);
} else {
    echo json_encode(["error" => "Query failed"]);
}

$conn->close();
?>

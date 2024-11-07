// File: api/sales.php
<?php
require 'database.php';
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: http://localhost:8100");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

$period = $_GET['period'] ?? 'day'; 

try {
    switch ($period) {
        case 'day':
            $stmt = $conn->prepare("
                SELECT DATE(sale_date) AS period, SUM(total_amount) AS total 
                FROM SALES 
                GROUP BY period 
                ORDER BY period DESC 
                LIMIT 7
            ");
            break;

        case 'week':
            $stmt = $conn->prepare("
                SELECT WEEK(sale_date) AS period, YEAR(sale_date) AS year, SUM(total_amount) AS total 
                FROM SALES 
                GROUP BY year, period 
                ORDER BY year DESC, period DESC 
                LIMIT 4
            ");
            break;

        case 'month':
            $stmt = $conn->prepare("
                SELECT MONTH(sale_date) AS period, YEAR(sale_date) AS year, SUM(total_amount) AS total 
                FROM SALES 
                GROUP BY year, period 
                ORDER BY year DESC, period DESC 
                LIMIT 12
            ");
            break;

        default:
            echo json_encode(["status" => "error", "message" => "Invalid period specified"]);
            exit;
    }

 
    $stmt->execute();
    $result = $stmt->fetchAll(PDO::FETCH_ASSOC);

    
    echo json_encode([
        "status" => "success",
        "data" => $result,
        "message" => "Fetched sales data for the specified period: $period"
    ]);

} catch (PDOException $e) {

    echo json_encode([
        "status" => "error",
        "message" => "Database query failed: " . $e->getMessage()
    ]);
}

$conn = null; 
?>

<?php
// get_products.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

include 'db.php';

// LEFT JOIN ke sath query taake category_name bhi dynamic fetched response ka hissa ban jaye
$sql = "SELECT 
            p.*, 
            c.name AS category_name 
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id 
        ORDER BY p.id DESC";

$result = $conn->query($sql);
$products = [];

if ($result) {
    if ($result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            // Types strict parsing for react states compatibility
            $row['id'] = intval($row['id']);
            $row['category_id'] = intval($row['category_id']);
            $row['price'] = floatval($row['price']);
            $row['stock_qty'] = intval($row['stock_qty']);
            $row['min_stock'] = isset($row['min_stock']) ? intval($row['min_stock']) : 10;
            
            $products[] = $row;
        }
    }
} else {
    echo json_encode(["success" => false, "error" => $conn->error]);
    exit;
}

echo json_encode($products);
$conn->close();
?>
<?php
// get_low_stock.php
include 'db.php';

// Wo products nikalenge jinki quantity min_stock se kam ya barabar hai
$sql = "SELECT p.*, c.name AS category_name 
        FROM products p 
        LEFT JOIN categories c ON p.category_id = c.id 
        WHERE p.stock_qty <= p.min_stock 
        ORDER BY p.stock_qty ASC";

$result = $conn->query($sql);
$products = [];

if ($result && $result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $products[] = $row;
    }
}
echo json_encode($products);
?>
<?php
// get_products_for_order.php
include 'db.php';

$sql = "SELECT id, name, price, stock_qty FROM products WHERE stock_qty > 0 ORDER BY name ASC";
$result = $conn->query($sql);
$products = [];

if ($result && $result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $products[] = $row;
    }
}
echo json_encode($products);
?>
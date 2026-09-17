<?php
// get_stock_in.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include 'db.php';

$sql = "SELECT id, product_name AS product, supplier_name AS supplier, category, 
               quantity AS qty, price, DATE(stock_date) AS date, status, remarks 
        FROM stock_in 
        ORDER BY id DESC";

$result = $conn->query($sql);
$stocks = [];

if ($result && $result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $row['id'] = intval($row['id']);
        $row['qty'] = intval($row['qty']);
        $row['price'] = floatval($row['price']);
        $stocks[] = $row;
    }
}

echo json_encode($stocks);
$conn->close();
?>
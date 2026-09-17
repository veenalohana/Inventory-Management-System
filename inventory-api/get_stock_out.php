<?php
// get_stock_out.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include 'db.php';

$sql = "SELECT so.id, pr.name AS product, so.customer_name AS customer, 
               so.quantity AS qty, so.price, DATE(so.stock_date) AS date, 
               so.status, so.remarks 
        FROM stock_out so
        JOIN products pr ON so.product_id = pr.id
        ORDER BY so.id DESC";

$result = $conn->query($sql);
$stockOutList = [];

if ($result && $result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $row['id'] = intval($row['id']);
        $row['qty'] = intval($row['qty']);
        $row['price'] = floatval($row['price']);
        $stockOutList[] = $row;
    }
}

echo json_encode($stockOutList);
$conn->close();
?>
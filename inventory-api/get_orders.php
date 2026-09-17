<?php
// get_orders.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

include 'db.php';

// SQL query jo stock_out table se data utha kar Orders page ke layout ke mutabiq convert karegi
$sql = "SELECT 
            id, 
            customer_name AS customer, 
            quantity AS products, 
            (quantity * price) AS amount, 
            DATE(stock_date) AS date,
            'Paid' AS paymentStatus, 
            status AS orderStatus 
        FROM stock_out
        ORDER BY id DESC";

$result = $conn->query($sql);
$orders = [];

if ($result && $result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        // Data casting taake React components crash na hon
        $row['id'] = intval($row['id']);
        $row['products'] = intval($row['products']);
        $row['amount'] = floatval($row['amount']);
        $orders[] = $row;
    }
}

echo json_encode($orders);
$conn->close();
?>
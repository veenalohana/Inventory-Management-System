<?php
// get_purchases.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include 'db.php';

// Ab hum safe tarike se status column database se fetch kar rahe hain!
$sql = "SELECT p.id, p.supplier_name AS supplier, 'INV-Auto' AS invoice, 
               IFNULL(pr.name, 'Unknown Product') AS product, pi.quantity, pi.purchase_price AS price, 
               (pi.quantity * pi.purchase_price) AS total, 
               DATE(p.purchase_date) AS date,
               p.status AS status
        FROM purchases p
        JOIN purchase_items pi ON p.id = pi.purchase_id
        LEFT JOIN products pr ON pi.product_id = pr.id
        ORDER BY p.id DESC";

$result = $conn->query($sql);
$purchases = [];

if ($result && $result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        // Agar kisi wajah se database mein status NULL ho, toh fallback default 'Received' ho jaye
        $row['status'] = !empty($row['status']) ? $row['status'] : 'Received';
        $purchases[] = $row;
    }
}

echo json_encode($purchases);
$conn->close();
?>
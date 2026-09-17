<?php
// get_suppliers.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include 'db.php';

$sql = "SELECT id, name, company, contact, phone, email, address, city, status, DATE(supplier_date) AS date FROM suppliers ORDER BY id DESC";
$result = $conn->query($sql);
$suppliers = [];

if ($result && $result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $row['id'] = intval($row['id']);
        $suppliers[] = $row;
    }
}

echo json_encode($suppliers);
$conn->close();
?>
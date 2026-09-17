<?php
// place_purchase.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

include 'db.php';

$data = json_decode(file_get_contents('php://input'), true);

if (!empty($data['supplier_name']) && !empty($data['items'])) {
    $supplier_name = $conn->real_escape_string($data['supplier_name']);
    $total_amount = floatval($data['total_amount']);
    $items = $data['items'];
    $status = isset($data['status']) ? $conn->real_escape_string($data['status']) : 'Received';

    $conn->begin_transaction();

    try {
        // 1. Insert into purchases table
        $sql1 = "INSERT INTO purchases (supplier_name, total_amount, status) VALUES ('$supplier_name', $total_amount, '$status')";
        if (!$conn->query($sql1)) {
            $sql1 = "INSERT INTO purchases (supplier_name, total_amount) VALUES ('$supplier_name', $total_amount)";
            $conn->query($sql1);
        }
        
        $purchase_id = $conn->insert_id;

        // 2. Loop through items
        foreach ($items as $item) {
            $product_id = intval($item['product_id']);
            $quantity = intval($item['quantity']);
            $purchase_price = floatval($item['price']);

            // Fixed Syntax: Slash "\"" ko hata kar proper string format kiya hai
            $sql2 = "INSERT INTO purchase_items (purchase_id, product_id, quantity, purchase_price) VALUES ($purchase_id, $product_id, $quantity, $purchase_price)";
            $conn->query($sql2);

            // 3. Update stock quantity
            $sql3 = "UPDATE products SET stock_qty = stock_qty + $quantity WHERE id = $product_id";
            $conn->query($sql3);
        }

        $conn->commit();
        echo json_encode(["success" => true, "message" => "Purchase logged successfully!"]);

    } catch (Exception $e) {
        $conn->rollback();
        echo json_encode(["success" => false, "message" => "Transaction failed: " . $e->getMessage()]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Incomplete request payload data."]);
}

$conn->close();
?>
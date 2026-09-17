<?php
// delete_stock_out.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

include 'db.php';

$data = json_decode(file_get_contents('php://input'), true);

if (!empty($data['id'])) {
    $log_id = intval($data['id']);

    // Pehle log details nikalte hain taake inventory wapas add kar saken
    $check = $conn->query("SELECT product_id, quantity FROM stock_out WHERE id = $log_id");
    if ($check && $check->num_rows > 0) {
        $row = $check->fetch_assoc();
        $pId = intval($row['product_id']);
        $pQty = intval($row['quantity']);
        
        $conn->begin_transaction();

        try {
            // 1. Stock wapas barhayen (+ kar dein)
            $conn->query("UPDATE products SET stock_qty = stock_qty + $pQty WHERE id = $pId");

            // 2. Record delete karein
            $conn->query("DELETE FROM stock_out WHERE id = $log_id");

            $conn->commit();
            echo json_encode(["success" => true, "message" => "Stock out record deleted and inventory restored!"]);
        } catch (Exception $e) {
            $conn->rollback();
            echo json_encode(["success" => false, "message" => "Deletion process failed: " . $e->getMessage()]);
        }
    } else {
        echo json_encode(["success" => false, "message" => "Record log not found."]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Invalid reference identifier."]);
}

$conn->close();
?>
<?php
// delete_order.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

include 'db.php';

// Frontend se aane wale data (JSON) ko receive karna
$data = json_decode(file_get_contents('php://input'), true);

if (!empty($data['id'])) {
    $order_id = intval($data['id']);

    // Database safe transaction start karte hain taake dono tables se data sahi se remove ho
    $conn->begin_transaction();

    try {
        // 1. Pehle order_items table se us order ke saare items delete karenge (Foreign key constraint se bachne ke liye)
        $sql1 = "DELETE FROM order_items WHERE order_id = $order_id";
        $conn->query($sql1);

        // 2. Phir main orders table se us order ki main row delete karenge
        $sql2 = "DELETE FROM orders WHERE id = $order_id";
        $conn->query($sql2);

        // Agar dono queries bina kisi error ke chal gayin, to changes save kar do
        $conn->commit();
        echo json_encode(["success" => true, "message" => "Order dropped successfully from database."]);

    } catch (Exception $e) {
        // Agar koi error aaye to roll back kar do (taake adha data delete na ho)
        $conn->rollback();
        echo json_encode(["success" => false, "message" => "Transaction failed: " . $e->getMessage()]);
    }

} else {
    echo json_encode(["success" => false, "message" => "Missing order identifier reference ID."]);
}

$conn->close();
?>
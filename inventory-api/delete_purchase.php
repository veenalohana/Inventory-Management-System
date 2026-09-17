<?php
// delete_purchase.php
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
    $purchase_id = intval($data['id']);

    // Main purchase delete karenge, cascading se purchase_items khud delete ho jayenge
    $sql = "DELETE FROM purchases WHERE id = $purchase_id";

    if ($conn->query($sql) === TRUE) {
        echo json_encode(["success" => true, "message" => "Acquisition trace successfully dropped from logs."]);
    } else {
        echo json_encode(["success" => false, "message" => "Error removing record: " . $conn->error]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Invalid reference payload execution identifier."]);
}

$conn->close();
?>
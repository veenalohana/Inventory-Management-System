<?php
// delete_supplier.php
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
    $id = intval($data['id']);
    
    $sql = "DELETE FROM suppliers WHERE id = $id";
    
    if ($conn->query($sql) === TRUE) {
        echo json_encode(["success" => true, "message" => "Supplier wiped successfully from database logging system."]);
    } else {
        echo json_encode(["success" => false, "message" => "Database Deletion Error: " . $conn->error]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Invalid reference identifier payload."]);
}

$conn->close();
?>
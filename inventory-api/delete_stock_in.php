<?php
// delete_stock_in.php
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
    $stock_id = intval($data['id']);

    // Pehle stock data nikalte hain taake inventory count adjust ho sake (Minus adjustment)
    $check = $conn->query("SELECT product_name, quantity FROM stock_in WHERE id = $stock_id");
    if ($check && $check->num_rows > 0) {
        $row = $check->fetch_assoc();
        $pName = $row['product_name'];
        $pQty = intval($row['quantity']);
        
        // Products table se stock wapas utna kam karenge
        @$conn->query("UPDATE products SET stock_qty = stock_qty - $pQty WHERE name = '$pName'");
    }

    $sql = "DELETE FROM stock_in WHERE id = $stock_id";

    if ($conn->query($sql) === TRUE) {
        echo json_encode(["success" => true, "message" => "Stock log removed successfully."]);
    } else {
        echo json_encode(["success" => false, "message" => "Error removing record: " . $conn->error]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Invalid reference identifier."]);
}

$conn->close();
?>
<?php
// restock_product.php
include 'db.php';

$data = json_decode(file_get_contents('php://input'), true);

if (!empty($data['id']) && isset($data['quantity'])) {
    $id = intval($data['id']);
    $quantity_to_add = intval($data['quantity']);
    
    // Database mein current quantity ke andar new quantity plus (ADD) kar rahe hain
    $sql = "UPDATE products SET stock_qty = stock_qty + $quantity_to_add WHERE id = $id";
    
    if ($conn->query($sql)) {
        echo json_encode(["success" => true, "message" => "Product restocked successfully!"]);
    } else {
        echo json_encode(["success" => false, "message" => "Error: " . $conn->error]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Missing required fields."]);
}
?>
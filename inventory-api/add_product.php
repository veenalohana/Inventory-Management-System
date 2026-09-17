<?php
include 'db.php';

$data = json_decode(file_get_contents('php://input'), true);

if (!empty($data['name']) && !empty($data['category_id'])) {
    $name = $conn->real_escape_string($data['name']);
    $category_id = intval($data['category_id']);
    $supplier_name = isset($data['supplier_name']) ? $conn->real_escape_string($data['supplier_name']) : '';
    $stock_qty = isset($data['stock_qty']) ? intval($data['stock_qty']) : 0;
    $min_stock = isset($data['min_stock']) ? intval($data['min_stock']) : 10;
    $price = isset($data['price']) ? floatval($data['price']) : 0.00;
    $status = isset($data['status']) ? $conn->real_escape_string($data['status']) : 'Active';

    $sql = "INSERT INTO products (name, category_id, supplier_name, stock_qty, min_stock, price, status) 
            VALUES ('$name', $category_id, '$supplier_name', $stock_qty, $min_stock, $price, '$status')";

    if ($conn->query($sql)) {
        echo json_encode(["success" => true, "message" => "Product added successfully!"]);
    } else {
        echo json_encode(["success" => false, "message" => "Error: " . $conn->error]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Required fields missing."]);
}
?>
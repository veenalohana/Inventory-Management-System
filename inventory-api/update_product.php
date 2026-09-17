<?php
include 'db.php';

$data = json_decode(file_get_contents('php://input'), true);

if (!empty($data['id']) && !empty($data['name'])) {
    $id = intval($data['id']);
    $name = $conn->real_escape_string($data['name']);
    $category_id = intval($data['category_id']);
    $supplier_name = $conn->real_escape_string($data['supplier_name']);
    $stock_qty = intval($data['stock_qty']);
    $min_stock = intval($data['min_stock']);
    $price = floatval($data['price']);
    $status = $conn->real_escape_string($data['status']);

    $sql = "UPDATE products SET 
            name='$name', category_id=$category_id, supplier_name='$supplier_name', 
            stock_qty=$stock_qty, min_stock=$min_stock, price=$price, status='$status' 
            WHERE id=$id";

    if ($conn->query($sql)) {
        echo json_encode(["success" => true, "message" => "Product updated successfully!"]);
    } else {
        echo json_encode(["success" => false, "message" => "Error: " . $conn->error]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Required fields missing."]);
}
?>
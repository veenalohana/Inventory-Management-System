<?php
// save_stock_in.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

include 'db.php';

$data = json_decode(file_get_contents('php://input'), true);

if (!empty($data['product']) && !empty($data['supplier']) && !empty($data['qty']) && !empty($data['price'])) {
    
    $product = $conn->real_escape_string($data['product']);
    $supplier = $conn->real_escape_string($data['supplier']);
    $category = !empty($data['category']) ? $conn->real_escape_string($data['category']) : 'General';
    $qty = intval($data['qty']);
    $price = floatval($data['price']);
    $date = $conn->real_escape_string($data['date']);
    $remarks = !empty($data['remarks']) ? $conn->real_escape_string($data['remarks']) : '';

    $conn->begin_transaction();

    try {
        // 1. Insert into stock_in table
        $sql1 = "INSERT INTO stock_in (product_name, supplier_name, category, quantity, price, stock_date, status, remarks) 
                 VALUES ('$product', '$supplier', '$category', $qty, $price, '$date', 'Received', '$remarks')";
        $conn->query($sql1);

        // 2. Optional Stock Update Logic: (Agar products table bani hui hai toh wahan bhi stock barha dega)
        $sql2 = "UPDATE products SET stock_qty = stock_qty + $qty WHERE name = '$product'";
        @$conn->query($sql2); // @ lagaya hai taake agar table name different ho toh crash na kare

        $conn->commit();
        echo json_encode(["success" => true, "message" => "Stock added successfully!"]);
    } catch (Exception $e) {
        $conn->rollback();
        echo json_encode(["success" => false, "message" => "Failed to save: " . $e->getMessage()]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Please fill all required parameters."]);
}

$conn->close();
?>
<?php
// save_stock_out.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

include 'db.php';

$data = json_decode(file_get_contents('php://input'), true);

if (!empty($data['product_id']) && !empty($data['customer_name']) && !empty($data['qty']) && !empty($data['price'])) {
    
    $product_id = intval($data['product_id']);
    $customer_name = $conn->real_escape_string($data['customer_name']);
    $qty = intval($data['qty']);
    $price = floatval($data['price']);
    $total_amount = $qty * $price; // Total calculation for orders table
    $date = $conn->real_escape_string($data['date']);
    $remarks = !empty($data['remarks']) ? $conn->real_escape_string($data['remarks']) : '';

    // Check stock availability pehle
    $checkStock = $conn->query("SELECT stock_qty FROM products WHERE id = $product_id");
    if ($checkStock && $checkStock->num_rows > 0) {
        $prod = $checkStock->fetch_assoc();
        $available_stock = intval($prod['stock_qty']);

        if ($available_stock < $qty) {
            echo json_encode(["success" => false, "message" => "Insufficient stock! Only $available_stock units available."]);
            exit;
        }
    } else {
        echo json_encode(["success" => false, "message" => "Product not found."]);
        exit;
    }

    $conn->begin_transaction();

    try {
        // 1. Insert into stock_out table (Aapki Stock Out screen ke liye)
        $sql1 = "INSERT INTO stock_out (product_id, customer_name, quantity, price, stock_date, status, remarks) 
                 VALUES ($product_id, '$customer_name', $qty, $price, '$date', 'Completed', '$remarks')";
        $conn->query($sql1);

        // 2. Insert into orders table (Backend phpMyAdmin database sync ke liye)
        // Note: Agar aapke orders table mein payment_status ya order_status ke column names alag hain, toh unhe database ke mutabiq match kar lein.
        $sqlOrders = "INSERT INTO orders (customer_name, total_amount, order_date) 
                      VALUES ('$customer_name', $total_amount, '$date')";
        $conn->query($sqlOrders);
        $new_order_id = $conn->insert_id; // Naye bane hue order ki ID mil gayi

        // 3. Insert into order_items table (Order ke items ki detail track karne ke liye)
        $sqlOrderItems = "INSERT INTO order_items (order_id, product_id, quantity, price) 
                          VALUES ($new_order_id, $product_id, $qty, $price)";
        $conn->query($sqlOrderItems);

        // 4. Update/Reduce stock in products table
        $sql2 = "UPDATE products SET stock_qty = stock_qty - $qty WHERE id = $product_id";
        $conn->query($sql2);

        $conn->commit();
        echo json_encode(["success" => true, "message" => "Stock out processed and fully mirrored to backend orders tables!"]);
    } catch (Exception $e) {
        $conn->rollback();
        echo json_encode(["success" => false, "message" => "Transaction error: " . $e->getMessage()]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Missing core required input values."]);
}

$conn->close();
?>
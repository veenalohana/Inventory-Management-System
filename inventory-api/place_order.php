<?php
// place_order.php
include 'db.php';

$data = json_decode(file_get_contents('php://input'), true);

if (!empty($data['customer_name']) && !empty($data['items'])) {
    $customer_name = $conn->real_escape_string($data['customer_name']);
    $customer_phone = $conn->real_escape_string($data['customer_phone'] ?? '');
    $total_amount = floatval($data['total_amount']);
    $items = $data['items']; // Array of items

    // Transaction shuru karte hain taake agar ek bhi query fail ho to poora order cancel ho jaye
    $conn->begin_transaction();

    try {
        // 1. Insert into orders table
        $sqlOrder = "INSERT INTO orders (customer_name, customer_phone, total_amount) VALUES ('$customer_name', '$customer_phone', $total_amount)";
        $conn->query($sqlOrder);
        $order_id = $conn->insert_id; // Naye order ki ID mil gayi

        // 2. Loop through items to insert details and deduct stock
        foreach ($items as $item) {
            $product_id = intval($item['product_id']);
            $quantity = intval($item['quantity']);
            $price = floatval($item['price']);

            // Insert item details
            $sqlItem = "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($order_id, $product_id, $quantity, $price)";
            $conn->query($sqlItem);

            // Deduct stock from products table
            $sqlDeduct = "UPDATE products SET stock_qty = stock_qty - $quantity WHERE id = $product_id";
            $conn->query($sqlDeduct);
        }

        // Agar sab sahi raha to save kar do
        $conn->commit();
        echo json_encode(["success" => true, "message" => "Order placed successfully!", "order_id" => $order_id]);

    } catch (Exception $e) {
        // Agar koi bhi error aaye to changes rollback (cancel) kar do
        $conn->rollback();
        echo json_encode(["success" => false, "message" => "Transaction Failed: " . $e->getMessage()]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Incomplete order details."]);
}
?>
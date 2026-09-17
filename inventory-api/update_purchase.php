<?php
// update_purchase.php
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
    
    // Status sanitize karein agar bheja gaya ho
    $status = isset($data['status']) ? $conn->real_escape_string($data['status']) : 'Received';
    
    $conn->begin_transaction();

    try {
        // 1. Purchases table mein status aur total_amount update karein
        if (isset($data['total_amount'])) {
            $total_amount = floatval($data['total_amount']);
            $sql1 = "UPDATE purchases SET total_amount = $total_amount, status = '$status' WHERE id = $purchase_id";
            if (!$conn->query($sql1)) {
                $sql1 = "UPDATE purchases SET total_amount = $total_amount WHERE id = $purchase_id";
                $conn->query($sql1);
            }
        } else {
            $sql1 = "UPDATE purchases SET status = '$status' WHERE id = $purchase_id";
            @$conn->query($sql1);
        }

        // 2. Quantity aur price update logic aur stock balance adjustment
        if (isset($data['quantity']) && isset($data['price']) && isset($data['product_id'])) {
            $quantity = intval($data['quantity']);
            $price = floatval($data['price']);
            $product_id = intval($data['product_id']);

            // Pehle database mein maujood purani quantity aur product ID fetch karein
            $stockCheck = $conn->query("SELECT quantity, product_id FROM purchase_items WHERE purchase_id = $purchase_id");
            if ($stockCheck && $stockCheck->num_rows > 0) {
                $oldData = $stockCheck->fetch_assoc();
                $oldQty = intval($oldData['quantity']);
                $productId = intval($oldData['product_id']);

                // Agar status Received hai, toh products table ka stock adjust karenge
                if ($status === 'Received') {
                    $qtyDiff = $quantity - $oldQty;
                    $conn->query("UPDATE products SET stock_qty = stock_qty + $qtyDiff WHERE id = $productId");
                }
            }

            // Purchase items ko update karein
            $sql2 = "UPDATE purchase_items SET quantity = $quantity, purchase_price = $price, product_id = $product_id WHERE purchase_id = $purchase_id";
            $conn->query($sql2);
        }

        $conn->commit();
        echo json_encode(["success" => true, "message" => "Purchase record updated successfully!"]);

    } catch (Exception $e) {
        $conn->rollback();
        echo json_encode(["success" => false, "message" => "Update failed: " . $e->getMessage()]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Missing core identification parameter."]);
}

$conn->close();
?>
<?php
// get_dashboard_counts.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

include 'db.php';

$counts = [
    "users" => 0,
    "categories" => 0,
    "products" => 0,
    "orders" => 0
];

// 1. Total System Users Count
$resUsers = $conn->query("SHOW TABLES LIKE 'users'");
if ($resUsers && $resUsers->num_rows > 0) {
    $userQuery = $conn->query("SELECT COUNT(*) AS total FROM users");
    if ($userQuery) {
        $counts['users'] = intval($userQuery->fetch_assoc()['total']);
    }
} else {
    $counts['users'] = 1; // Default fallback
}

// 2. Total Categories Count
$resCat = $conn->query("SELECT COUNT(*) AS total FROM categories");
if ($resCat) {
    $counts['categories'] = intval($resCat->fetch_assoc()['total']);
}

// 3. Total Products Count
$resProd = $conn->query("SELECT COUNT(*) AS total FROM products");
if ($resProd) {
    $counts['products'] = intval($resProd->fetch_assoc()['total']);
}

// 4. Total Orders Count
$resOrders = $conn->query("SHOW TABLES LIKE 'stock_out'");
if ($resOrders && $resOrders->num_rows > 0) {
    $orderQuery = $conn->query("SELECT COUNT(*) AS total FROM stock_out");
    if ($orderQuery) {
        $counts['orders'] = intval($orderQuery->fetch_assoc()['total']);
    }
} else {
    // Agar custom orders ya store management table structured ho
    $resAltOrders = $conn->query("SHOW TABLES LIKE 'orders'");
    if ($resAltOrders && $resAltOrders->num_rows > 0) {
        $altQuery = $conn->query("SELECT COUNT(*) AS total FROM orders");
        if ($altQuery) $counts['orders'] = intval($altQuery->fetch_assoc()['total']);
    }
}

echo json_encode($counts);
$conn->close();
?>
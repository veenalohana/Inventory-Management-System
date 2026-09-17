<?php
// get_reports.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

include 'db.php';

$response = [
    "success" => true,
    "financials" => [],
    "stock_distribution" => [
        "labels" => [],
        "counts" => []
    ]
];

// 1. Purchases table se month-wise total cost fetch karna
$financial_sql = "
    SELECT 
        DATE_FORMAT(purchase_date, '%M %Y') as month_name,
        DATE_FORMAT(purchase_date, '%Y-%m') as month_key,
        SUM(total_amount) as total_purchases
    FROM purchases
    GROUP BY DATE_FORMAT(purchase_date, '%Y-%m')
    ORDER BY DATE_FORMAT(purchase_date, '%Y-%m') ASC
    LIMIT 6
";

$fin_result = $conn->query($financial_sql);
$purchase_map = [];

if ($fin_result && $fin_result->num_rows > 0) {
    while($row = $fin_result->fetch_assoc()) {
        $purchase_map[$row['month_key']] = [
            "month" => $row['month_name'],
            "purchases" => floatval($row['total_purchases'])
        ];
    }
}

// Last 6 months structure initialize karna
$last_6_months = [];
for ($i = 5; $i >= 0; $i--) {
    $monthKey = date('Y-m', strtotime("-$i months"));
    $monthName = date('F Y', strtotime("-$i months"));
    $last_6_months[$monthKey] = [
        "month" => $monthName,
        "purchases" => 0
    ];
}

// Database purchases map karna
foreach ($purchase_map as $key => $val) {
    if (isset($last_6_months[$key])) {
        $last_6_months[$key]['purchases'] = $val['purchases'];
    }
}

// Financial metrics compile karna
foreach ($last_6_months as $key => $data) {
    $purchases = $data['purchases'];
    
    // Profit margin aur operating expenses auto calculation parameters
    $sales = $purchases > 0 ? $purchases * 1.35 : 0; 
    $expenses = $purchases > 0 ? $purchases * 0.08 : 0; 
    $profit = $sales - $purchases - $expenses;

    $response['financials'][] = [
        "month" => $data['month'],
        "sales" => round($sales, 2),
        "purchases" => round($purchases, 2),
        "expenses" => round($expenses, 2),
        "profit" => round($profit, 2)
    ];
}

// 2. Categories ke join ke sath category-wise stock sum fetch karna
// Is query mein 'categories' table join ho raha hai taake correct category_name mil sake!
$stock_sql = "
    SELECT 
        IFNULL(c.name, 'Uncategorized') AS category_name, 
        SUM(p.stock_qty) AS total_stock 
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    GROUP BY p.category_id
";

$stock_result = $conn->query($stock_sql);

if ($stock_result && $stock_result->num_rows > 0) {
    while($row = $stock_result->fetch_assoc()) {
        $response['stock_distribution']['labels'][] = $row['category_name'];
        $response['stock_distribution']['counts'][] = intval($row['total_stock']);
    }
} else {
    $response['stock_distribution']['labels'] = ['No Data Available'];
    $response['stock_distribution']['counts'] = [0];
}

echo json_encode($response);
$conn->close();
?>
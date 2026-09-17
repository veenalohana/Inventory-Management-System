<?php
// get_users.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

include 'db.php';

if ($conn->connect_error) {
    echo json_encode(["error" => "Database connection failed"]);
    exit();
}

// Pehle check karte hain columns kya hain taake crash na ho
$result = $conn->query("SELECT * FROM users LIMIT 1");
$users = [];

if ($result) {
    // Agar custom columns ban chuke hain toh ye chalega
    $sql = "SELECT id, 
                   IFNULL(name, '') as name, 
                   email, 
                   IFNULL(phone, '') as phone, 
                   password, 
                   IFNULL(role, 'Staff') as role, 
                   IFNULL(status, 'Active') as status, 
                   IFNULL(date, CURRENT_TIMESTAMP) as date 
            FROM users ORDER BY id DESC";
            
    // Agar 'name' column nahi mila toh fallback to 'username'
    $columns = $result->fetch_fields();
    $hasName = false;
    foreach ($columns as $col) {
        if ($col->name == 'name') $hasName = true;
    }
    
    if (!$hasName) {
        $sql = "SELECT id, username as name, email, '' as phone, password, 'Admin' as role, 'Active' as status, created_at as date FROM users ORDER BY id DESC";
    }

    $resData = $conn->query($sql);
    if ($resData && $resData->num_rows > 0) {
        while($row = $resData->fetch_assoc()) {
            $users[] = $row;
        }
    }
}

echo json_encode($users);
$conn->close();
?>
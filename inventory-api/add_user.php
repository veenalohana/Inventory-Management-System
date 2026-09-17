<?php
// add_user.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

include 'db.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!empty($data['name']) && !empty($data['email']) && !empty($data['phone']) && !empty($data['password']) && !empty($data['role'])) {
    
    $name = $conn->real_escape_string($data['name']);
    $email = $conn->real_escape_string($data['email']);
    $phone = $conn->real_escape_string($data['phone']);
    $password = $conn->real_escape_string($data['password']);
    $role = $conn->real_escape_string($data['role']);
    $status = isset($data['status']) ? $conn->real_escape_string($data['status']) : 'Active';

    $query = "INSERT INTO users (name, email, phone, password, role, status) VALUES ('$name', '$email', '$phone', '$password', '$role', '$status')";
    
    if ($conn->query($query)) {
        echo json_encode(["success" => true, "message" => "User added successfully"]);
    } else {
        echo json_encode(["success" => false, "message" => "Database insert failed: " . $conn->error]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Incomplete form fields sent"]);
}

$conn->close();
?>
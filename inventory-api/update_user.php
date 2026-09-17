<?php
// update_user.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

include 'db.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!empty($data['id']) && !empty($data['name']) && !empty($data['email']) && !empty($data['phone']) && !empty($data['role'])) {
    
    $id = intval($data['id']);
    $name = $conn->real_escape_string($data['name']);
    $email = $conn->real_escape_string($data['email']);
    $phone = $conn->real_escape_string($data['phone']);
    $password = $conn->real_escape_string($data['password']);
    $role = $conn->real_escape_string($data['role']);
    $status = $conn->real_escape_string($data['status']);

    $query = "UPDATE users SET name='$name', email='$email', phone='$phone', password='$password', role='$role', status='$status' WHERE id=$id";
    
    if ($conn->query($query)) {
        echo json_encode(["success" => true, "message" => "User updated successfully"]);
    } else {
        echo json_encode(["success" => false, "message" => "Database update failed: " . $conn->error]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Required data missing for update"]);
}

$conn->close();
?>
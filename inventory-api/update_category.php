<?php
// update_category.php
include 'db.php';

$data = json_decode(file_get_contents('php://input'), true);

if (!empty($data['id']) && !empty($data['name'])) {
    $id = intval($data['id']);
    $name = $conn->real_escape_string($data['name']);
    $status = $conn->real_escape_string($data['status']);
    
    $sql = "UPDATE categories SET name = '$name', status = '$status' WHERE id = $id";
    
    if ($conn->query($sql)) {
        echo json_encode(["success" => true, "message" => "Category updated successfully!"]);
    } else {
        echo json_encode(["success" => false, "message" => "Error: " . $conn->error]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Missing required fields."]);
}
?>
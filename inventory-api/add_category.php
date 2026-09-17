<?php
include 'db.php';

// React hamesha json format mein data bhejta hai, use read karne ke liye:
$data = json_decode(file_get_contents('php://input'), true);

if (!empty($data['name'])) {
    $name = $conn->real_escape_string($data['name']);
    $status = isset($data['status']) ? $conn->real_escape_string($data['status']) : 'Active';
    
    $sql = "INSERT INTO categories (name, status) VALUES ('$name', '$status')";
    
    if ($conn->query($sql)) {
        echo json_encode(["success" => true, "message" => "Category added successfully!"]);
    } else {
        echo json_encode(["success" => false, "message" => "Error: " . $conn->error]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Category name is required."]);
}
?>
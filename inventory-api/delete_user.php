<?php
// delete_user.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

include 'db.php';

if (isset($_GET['id'])) {
    $id = intval($_GET['id']);
    
    $query = "DELETE FROM users WHERE id = $id";
    
    if ($conn->query($query)) {
        echo json_encode(["success" => true, "message" => "User deleted successfully"]);
    } else {
        echo json_encode(["success" => false, "message" => "Deletion failed: " . $conn->error]);
    }
} else {
    echo json_encode(["success" => false, "message" => "No ID provided for deletion"]);
}

$conn->close();
?>
<?php
include 'db.php';

$sql = "SELECT * FROM categories ORDER BY id DESC";
$result = $conn->query($sql);

$categories = [];

if ($result && $result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $categories[] = $row;
    }
}

// React ko data JSON string format mein return karenge
echo json_encode($categories);
?>
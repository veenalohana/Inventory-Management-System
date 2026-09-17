<?php
// save_supplier.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

include 'db.php';

$data = json_decode(file_get_contents('php://input'), true);

if (!empty($data['name']) && !empty($data['company']) && !empty($data['phone']) && !empty($data['city'])) {
    
    $name = $conn->real_escape_string($data['name']);
    $company = $conn->real_escape_string($data['company']);
    $contact = isset($data['contact']) ? $conn->real_escape_string($data['contact']) : '';
    $phone = $conn->real_escape_string($data['phone']);
    $email = isset($data['email']) ? $conn->real_escape_string($data['email']) : '';
    $address = isset($data['address']) ? $conn->real_escape_string($data['address']) : '';
    $city = $conn->real_escape_string($data['city']);
    $status = $conn->real_escape_string($data['status']);
    $date = $conn->real_escape_string($data['date']);
    
    if (!empty($data['id'])) {
        // Edit Mode: Update existing supplier
        $id = intval($data['id']);
        $sql = "UPDATE suppliers SET 
                name='$name', 
                company='$company', 
                contact='$contact', 
                phone='$phone', 
                email='$email', 
                address='$address', 
                city='$city', 
                status='$status', 
                supplier_date='$date' 
                WHERE id=$id";
                
        if ($conn->query($sql) === TRUE) {
            echo json_encode(["success" => true, "message" => "Supplier details synchronized successfully!"]);
        } else {
            echo json_encode(["success" => false, "message" => "Database Update Error: " . $conn->error]);
        }
    } else {
        // Add Mode: Insert new supplier
        $sql = "INSERT INTO suppliers (name, company, contact, phone, email, address, city, status, supplier_date) 
                VALUES ('$name', '$company', '$contact', '$phone', '$email', '$address', '$city', '$status', '$date')";
                
        if ($conn->query($sql) === TRUE) {
            echo json_encode(["success" => true, "message" => "Supplier added successfully!"]);
        } else {
            echo json_encode(["success" => false, "message" => "Database Insert Error: " . $conn->error]);
        }
    }
} else {
    echo json_encode(["success" => false, "message" => "Please fulfill all critical required variables."]);
}

$conn->close();
?>
<?php
// db.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: *");
header("Content-Type: application/json; charset=UTF-8");

$host = "bolwt9qitpbm8xpw6jty-mysql.services.clever-cloud.com";
$user = "ufvwbkngshyvdiya";
$password = "AYzU147UV4kvu6EzSIAR";
$dbname = "bolwt9qitpbm8xpw6jty";
$port = 3306;

$conn = new mysqli($host, $user, $password, $dbname, $port);

if ($conn->connect_error) {
    die(json_encode(["error" => "Connection failed: " . $conn->connect_error]));
}
?>
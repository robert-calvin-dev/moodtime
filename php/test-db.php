// /Users/robertmitchell/Desktop/Wordpress/moodtime/php/test-db.php
<?php
$conn = new mysqli("localhost", "root", "root", "moodtime_db");
if ($conn->connect_error) {
  die("Connection failed: " . $conn->connect_error);
}
echo "✅ Connection successful!";
?>

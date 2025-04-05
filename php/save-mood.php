<?php
$host = 'localhost';
$db = 'moodtime_db';
$user = 'root';
$pass = 'root'; // Change this to your actual DB password

$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) {
  http_response_code(500);
  echo "Database connection failed.";
  exit;
}

$mood = $_POST['mood'] ?? '';
$mood = trim($mood);
$mood = $conn->real_escape_string($mood);

if (!in_array($mood, ['lightest', 'lighter', 'light', 'heavy', 'heavier'])) {
  http_response_code(400);
  echo "Invalid mood.";
  exit;
}

$sql = "INSERT INTO moods (mood) VALUES ('$mood')";
if ($conn->query($sql) === TRUE) {
  echo "Mood saved successfully.";
} else {
  http_response_code(500);
  echo "Failed to save mood.";
}

$conn->close();
?>

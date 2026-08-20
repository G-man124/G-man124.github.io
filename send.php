<?php
require 'db.php';
if (isset($_POST['username']) && isset($_POST['message'])) {
    $stmt = $pdo->prepare("INSERT INTO messages (username, message) VALUES (?, ?)");
    $stmt->execute([$_POST['username'], $_POST['message']]);
}
?>

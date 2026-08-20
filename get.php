<?php
require 'db.php';
$stmt = $pdo->query("SELECT * FROM messages ORDER BY id DESC LIMIT 20");
$messages = array_reverse($stmt->fetchAll(PDO::FETCH_ASSOC));

foreach ($messages as $msg) {
    echo "<p><strong>" . htmlspecialchars($msg['username']) . ":</strong> " . htmlspecialchars($msg['message']) . "</p>";
}
?>

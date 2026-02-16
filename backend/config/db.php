<?php
// Dados de ligação à base de dados
$host = 'localhost';
$dbname = 'football_quiz';
$username = 'root';
$password = '';


// Ligação ao MYSQL por PDO
try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_EMULATE_PREPARES, true);
} catch (PDOException $e) {
  // Se a ligação falhar, devolve um erro em JSON com código 500
    http_response_code(500);
    echo json_encode(['error' => 'Ligação à base de dados falhou']);
    exit;
}
?>
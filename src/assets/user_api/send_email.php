<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
session_start();

$subject = $_POST['subject'];
$email = $_POST['recipient'];
$body = $_POST['body'];

// Include required PHPMailer files
require 'PHPMailer.php';
require 'SMTP.php';
require 'Exception.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

$mail = new PHPMailer();
$mail->isSMTP();
$mail->Host = "smtp.gmail.com";
$mail->SMTPAuth = true;
$mail->SMTPSecure = "tls";
$mail->Port = "587";
$mail->Username = "marashapatience8@gmail.com"; 
$mail->Password = "nldzcvenrdqkpsvb"; 
$mail->setFrom('marashapatience8@gmail.com');
$mail->addAddress($email);
$mail->Subject = $subject;
$mail->isHTML(true);
$mail->Body = "<p>$body</p>";

// Check if a file was uploaded
if (isset($_FILES['pdf']['tmp_name'])) {
    $fileContent = file_get_contents($_FILES['pdf']['tmp_name']);
    $fileName = $_FILES['pdf']['name'];
    $mail->addStringAttachment($fileContent, $fileName, 'base64', 'application/pdf');
} else {
    error_log("No PDF file received.");
}

// Send the email
if ($mail->send()) {
    $response = ["message" => "Email sent successfully!!!."];
} else {
    $response = ["error" => "Mailer Error: " . $mail->ErrorInfo];
}

header('Content-Type: application/json');
echo json_encode($response);

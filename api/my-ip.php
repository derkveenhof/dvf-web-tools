<?php

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, max-age=0');

function normalizeIpCandidate(string $value): string
{
    $candidate = trim($value, " \t\n\r\0\x0B\"");

    if (str_starts_with($candidate, '::ffff:')) {
        $candidate = substr($candidate, 7);
    }

    if (str_starts_with($candidate, '[') && str_contains($candidate, ']')) {
        $candidate = substr($candidate, 1, strpos($candidate, ']') - 1);
    }

    if (str_contains($candidate, '%')) {
        $candidate = explode('%', $candidate, 2)[0];
    }

    if (substr_count($candidate, ':') === 1 && str_contains($candidate, '.')) {
        $candidate = explode(':', $candidate, 2)[0];
    }

    return filter_var($candidate, FILTER_VALIDATE_IP) !== false ? $candidate : '';
}

function parseForwardedFor(string $value): array
{
    if ($value === '') {
        return [];
    }

    return array_values(array_filter(array_map(
        static fn(string $candidate): string => normalizeIpCandidate($candidate),
        explode(',', $value),
    )));
}

$forwardedFor = parseForwardedFor($_SERVER['HTTP_X_FORWARDED_FOR'] ?? '');
$realIp = normalizeIpCandidate($_SERVER['HTTP_X_REAL_IP'] ?? '');
$remoteAddress = normalizeIpCandidate($_SERVER['REMOTE_ADDR'] ?? '');

if ($forwardedFor !== []) {
    $ip = $forwardedFor[0];
    $source = 'x-forwarded-for';
} elseif ($realIp !== '') {
    $ip = $realIp;
    $source = 'x-real-ip';
} else {
    $ip = $remoteAddress;
    $source = $remoteAddress !== '' ? 'remoteAddress' : 'unknown';
}

echo json_encode([
    'ip' => $ip,
    'source' => $source,
    'forwardedFor' => $forwardedFor,
    'userAgent' => $_SERVER['HTTP_USER_AGENT'] ?? '',
    'timestampUtc' => gmdate('c'),
], JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);
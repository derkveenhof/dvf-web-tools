import net from 'node:net';

function getHeaderValue(req, name) {
  const value = req.headers[name];
  if (Array.isArray(value)) {
    return value[0] || '';
  }
  return value || '';
}

function normalizeIpCandidate(value) {
  if (!value) {
    return '';
  }

  let candidate = String(value).trim().replace(/^"|"$/g, '');

  if (!candidate) {
    return '';
  }

  if (candidate.startsWith('::ffff:')) {
    candidate = candidate.slice(7);
  }

  if (candidate.startsWith('[') && candidate.includes(']')) {
    candidate = candidate.slice(1, candidate.indexOf(']'));
  }

  if (candidate.includes('%')) {
    candidate = candidate.split('%')[0];
  }

  const singleColonCount = (candidate.match(/:/g) || []).length;
  if (singleColonCount === 1 && candidate.includes('.')) {
    const [ipPart] = candidate.split(':');
    candidate = ipPart;
  }

  return net.isIP(candidate) ? candidate : '';
}

function parseForwardedFor(headerValue) {
  if (!headerValue) {
    return [];
  }

  return headerValue
    .split(',')
    .map((part) => normalizeIpCandidate(part))
    .filter(Boolean);
}

export default function handler(req, res) {
  const xForwardedForRaw = getHeaderValue(req, 'x-forwarded-for');
  const xRealIpRaw = getHeaderValue(req, 'x-real-ip');
  const userAgent = getHeaderValue(req, 'user-agent');

  const forwardedFor = parseForwardedFor(xForwardedForRaw);
  const xRealIp = normalizeIpCandidate(xRealIpRaw);
  const socketIp = normalizeIpCandidate(req.socket && req.socket.remoteAddress ? req.socket.remoteAddress : '');

  let ip = '';
  let source = 'unknown';

  if (forwardedFor.length > 0) {
    ip = forwardedFor[0];
    source = 'x-forwarded-for';
  } else if (xRealIp) {
    ip = xRealIp;
    source = 'x-real-ip';
  } else if (socketIp) {
    ip = socketIp;
    source = 'remoteAddress';
  }

  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.status(200).json({
    ip,
    source,
    forwardedFor,
    userAgent,
    timestampUtc: new Date().toISOString(),
    vercel: {
      country: getHeaderValue(req, 'x-vercel-ip-country'),
      region: getHeaderValue(req, 'x-vercel-ip-country-region'),
      city: getHeaderValue(req, 'x-vercel-ip-city'),
    },
  });
}
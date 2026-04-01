/**
 * Salesforce 인증 + SOQL 쿼리 유틸리티
 */
const axios = require('axios');
const { salesforceLimiter } = require('./rate-limiter');

// 토큰 캐시 (1시간 유효)
let tokenCache = {
  accessToken: null,
  instanceUrl: null,
  expiresAt: 0,
};
const TOKEN_TTL = 55 * 60 * 1000; // 55분 (여유 5분)

async function getSalesforceToken() {
  // 캐시된 토큰이 유효하면 재사용
  if (tokenCache.accessToken && Date.now() < tokenCache.expiresAt) {
    return { accessToken: tokenCache.accessToken, instanceUrl: tokenCache.instanceUrl };
  }

  const url = `${process.env.SF_LOGIN_URL}/services/oauth2/token`;
  const params = new URLSearchParams();
  params.append('grant_type', 'password');
  params.append('client_id', process.env.SF_CLIENT_ID);
  params.append('client_secret', process.env.SF_CLIENT_SECRET);
  params.append('username', process.env.SF_USERNAME);
  params.append('password', decodeURIComponent(process.env.SF_PASSWORD));
  const res = await axios.post(url, params);

  // 캐시 저장
  tokenCache = {
    accessToken: res.data.access_token,
    instanceUrl: res.data.instance_url,
    expiresAt: Date.now() + TOKEN_TTL,
  };
  console.log('[SF] 새 토큰 발급');

  return { accessToken: tokenCache.accessToken, instanceUrl: tokenCache.instanceUrl };
}

// 토큰 캐시 무효화
function invalidateToken() {
  tokenCache = { accessToken: null, instanceUrl: null, expiresAt: 0 };
}

async function soqlQuery(instanceUrl, accessToken, query) {
  await salesforceLimiter.acquire();
  const url = `${instanceUrl}/services/data/v59.0/query`;
  try {
    const res = await axios.get(url, {
      headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      params: { q: query },
    });
    return res.data;
  } catch (err) {
    // 401 Unauthorized → 토큰 만료, 캐시 무효화 후 재시도
    if (err.response?.status === 401) {
      console.log('[SF] 토큰 만료, 재발급 후 재시도');
      invalidateToken();
      const { accessToken: newToken, instanceUrl: newUrl } = await getSalesforceToken();
      const res = await axios.get(`${newUrl}/services/data/v59.0/query`, {
        headers: { 'Authorization': `Bearer ${newToken}`, 'Content-Type': 'application/json' },
        params: { q: query },
      });
      return res.data;
    }
    throw err;
  }
}

module.exports = { getSalesforceToken, soqlQuery, invalidateToken };

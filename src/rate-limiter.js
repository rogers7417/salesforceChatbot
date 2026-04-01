/**
 * 간단한 Rate Limiter (토큰 버킷 방식)
 */

class RateLimiter {
  constructor(maxRequests, windowMs) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = [];
  }

  async acquire() {
    const now = Date.now();
    // 윈도우 밖의 요청 제거
    this.requests = this.requests.filter(t => now - t < this.windowMs);

    if (this.requests.length >= this.maxRequests) {
      // 대기 시간 계산
      const oldestRequest = this.requests[0];
      const waitTime = this.windowMs - (now - oldestRequest) + 10;
      console.log(`[RateLimit] ${waitTime}ms 대기`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      return this.acquire(); // 재시도
    }

    this.requests.push(now);
    return true;
  }

  getRemaining() {
    const now = Date.now();
    this.requests = this.requests.filter(t => now - t < this.windowMs);
    return this.maxRequests - this.requests.length;
  }
}

// Claude API: 분당 60 요청 (여유있게 50으로 설정)
const claudeLimiter = new RateLimiter(50, 60 * 1000);

// Salesforce API: 분당 100 요청 (여유있게 80으로 설정)
const salesforceLimiter = new RateLimiter(80, 60 * 1000);

module.exports = { claudeLimiter, salesforceLimiter, RateLimiter };

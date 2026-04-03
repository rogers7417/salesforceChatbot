/**
 * 사용자별 대화 메모리 관리 (BufferWindowMemory)
 * - k: 5 (최근 5쌍 = 10개 메시지)
 * - 30분 TTL, 만료 시 자동 정리
 */

const WINDOW_SIZE = 5;         // 최근 5쌍 (user + assistant)
const TTL_MS = 30 * 60 * 1000; // 30분

// 사용자별 메모리 저장소
// { slackUserId: { messages: [{role, content}], lastAccess: timestamp } }
const memoryStore = new Map();

/**
 * 만료된 메모리 정리
 */
function cleanExpired() {
  const now = Date.now();
  for (const [userId, mem] of memoryStore.entries()) {
    if (now - mem.lastAccess > TTL_MS) {
      memoryStore.delete(userId);
    }
  }
}

// 5분마다 만료 체크
setInterval(cleanExpired, 5 * 60 * 1000).unref();

/**
 * 사용자의 대화 히스토리 가져오기
 * @param {string} userId - Slack 사용자 ID
 * @returns {{ messages: Array<{role: string, content: string}>, addMessage: function, getMessages: function }}
 */
function getMemory(userId) {
  cleanExpired();

  if (!memoryStore.has(userId)) {
    memoryStore.set(userId, {
      messages: [],
      lastAccess: Date.now(),
    });
  }

  const mem = memoryStore.get(userId);
  mem.lastAccess = Date.now();

  return {
    /**
     * 메시지 추가 (window size 유지)
     */
    addMessage(role, content) {
      mem.messages.push({ role, content });
      // 최근 k쌍(= 2*k 메시지)만 유지
      const maxMessages = WINDOW_SIZE * 2;
      if (mem.messages.length > maxMessages) {
        mem.messages = mem.messages.slice(-maxMessages);
      }
      mem.lastAccess = Date.now();
    },

    /**
     * 현재 저장된 메시지 반환
     */
    getMessages() {
      mem.lastAccess = Date.now();
      return [...mem.messages];
    },
  };
}

/**
 * 사용자의 메모리 초기화
 * @param {string} userId - Slack 사용자 ID
 */
function clearMemory(userId) {
  memoryStore.delete(userId);
}

module.exports = { getMemory, clearMemory };

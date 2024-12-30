interface CacheEntry<T> {
    data: T;
    timestamp: number;
  }
  
  class ServerMemoryCache {
    private cache: Map<string, CacheEntry<any>> = new Map();
    private CACHE_DURATION = 24 * 60 * 60 * 1000; // 24시간
  
    set<T>(key: string, data: T) {
      this.cache.set(key, {
        data,
        timestamp: Date.now()
      });
    }
  
    get<T>(key: string): T | null {
      const entry = this.cache.get(key);
      
      if (!entry) return null;
  
      // 캐시 만료 확인
      if (Date.now() - entry.timestamp > this.CACHE_DURATION) {
        this.cache.delete(key);
        return null;
      }
  
      return entry.data;
    }
  
    // 특정 키 삭제
    delete(key: string) {
      this.cache.delete(key);
    }
  
    // 모든 캐시 초기화
    clear() {
      this.cache.clear();
    }
  }
  
  export const serverCache = new ServerMemoryCache();
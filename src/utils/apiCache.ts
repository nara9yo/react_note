/**
 * API 캐싱 및 최적화 유틸리티
 * - 메모리 기반 캐싱 시스템
 * - TTL(Time To Live) 지원
 * - 요청 중복 제거 (Request Deduplication)
 * - 선택적 캐시 무효화
 */

import { PERFORMANCE } from '../constants/uiConstants';

// 캐시 엔트리 인터페이스
interface CacheEntry<T> {
    data: T;
    timestamp: number;
    ttl: number;
    promise?: Promise<T>; // 진행 중인 요청 추적
}

// 캐시 설정 인터페이스
interface CacheOptions {
    ttl?: number; // Time To Live (ms)
    key?: string; // 커스텀 캐시 키
    forceRefresh?: boolean; // 캐시 무시하고 새로 요청
}

// 메모리 캐시 저장소
class MemoryCache {
    private cache = new Map<string, CacheEntry<any>>();
    private pendingRequests = new Map<string, Promise<any>>();

    /**
     * 캐시에서 데이터 가져오기
     * @param key - 캐시 키
     * @returns 캐시된 데이터 또는 null
     */
    get<T>(key: string): T | null {
        const entry = this.cache.get(key);

        if (!entry) {
            return null;
        }

        // TTL 확인
        const now = Date.now();
        if (now - entry.timestamp > entry.ttl) {
            this.cache.delete(key);
            return null;
        }

        return entry.data;
    }

    /**
     * 캐시에 데이터 저장
     * @param key - 캐시 키
     * @param data - 저장할 데이터
     * @param ttl - Time To Live (ms)
     */
    set<T>(key: string, data: T, ttl: number = PERFORMANCE.CACHE_DURATION): void {
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            ttl
        });
    }

    /**
     * 캐시에서 특정 키 삭제
     * @param key - 삭제할 캐시 키
     */
    delete(key: string): void {
        this.cache.delete(key);
        this.pendingRequests.delete(key);
    }

    /**
     * 패턴에 맞는 캐시 키들 삭제
     * @param pattern - 삭제할 키 패턴 (정규식)
     */
    deleteByPattern(pattern: RegExp): void {
        const keysToDelete: string[] = [];

        for (const key of this.cache.keys()) {
            if (pattern.test(key)) {
                keysToDelete.push(key);
            }
        }

        keysToDelete.forEach(key => {
            this.cache.delete(key);
            this.pendingRequests.delete(key);
        });
    }

    /**
     * 전체 캐시 삭제
     */
    clear(): void {
        this.cache.clear();
        this.pendingRequests.clear();
    }

    /**
     * 진행 중인 요청 추가
     * @param key - 요청 키
     * @param promise - 진행 중인 Promise
     */
    setPendingRequest<T>(key: string, promise: Promise<T>): void {
        this.pendingRequests.set(key, promise);
    }

    /**
     * 진행 중인 요청 가져오기
     * @param key - 요청 키
     * @returns 진행 중인 Promise 또는 null
     */
    getPendingRequest<T>(key: string): Promise<T> | null {
        return this.pendingRequests.get(key) || null;
    }

    /**
     * 진행 중인 요청 완료 처리
     * @param key - 요청 키
     */
    completePendingRequest(key: string): void {
        this.pendingRequests.delete(key);
    }

    /**
     * 캐시 상태 정보
     */
    getStats() {
        return {
            cacheSize: this.cache.size,
            pendingRequests: this.pendingRequests.size,
            keys: Array.from(this.cache.keys())
        };
    }
}

// 전역 캐시 인스턴스
const apiCache = new MemoryCache();

/**
 * 캐시된 API 호출 래퍼
 * @param key - 캐시 키
 * @param apiCall - API 호출 함수
 * @param options - 캐시 옵션
 * @returns Promise<T>
 */
export async function cachedApiCall<T>(
    key: string,
    apiCall: () => Promise<T>,
    options: CacheOptions = {}
): Promise<T> {
    const {
        ttl = PERFORMANCE.CACHE_DURATION,
        forceRefresh = false
    } = options;

    // 강제 새로고침이 아닌 경우 캐시 확인
    if (!forceRefresh) {
        const cachedData = apiCache.get<T>(key);
        if (cachedData !== null) {
            return cachedData;
        }

        // 진행 중인 요청이 있는지 확인 (요청 중복 제거)
        const pendingRequest = apiCache.getPendingRequest<T>(key);
        if (pendingRequest) {
            return pendingRequest;
        }
    }

    // 새로운 API 호출
    const promise = apiCall();

    // 진행 중인 요청으로 등록
    apiCache.setPendingRequest(key, promise);

    try {
        const data = await promise;

        // 성공 시 캐시에 저장
        apiCache.set(key, data, ttl);

        return data;
    } catch (error) {
        // 실패 시 캐시에서 제거
        apiCache.delete(key);
        throw error;
    } finally {
        // 진행 중인 요청 완료 처리
        apiCache.completePendingRequest(key);
    }
}

/**
 * 캐시 무효화 함수들
 */
export const invalidateCache = {
    /**
     * 모든 노트 관련 캐시 무효화
     */
    notes: () => {
        apiCache.deleteByPattern(/^notes/);
    },

    /**
     * 특정 노트 캐시 무효화
     * @param noteId - 노트 ID
     */
    note: (noteId: string) => {
        apiCache.deleteByPattern(new RegExp(`^notes.*${noteId}`));
    },

    /**
     * 모든 태그 관련 캐시 무효화
     */
    tags: () => {
        apiCache.deleteByPattern(/^tags/);
    },

    /**
     * 특정 태그 캐시 무효화
     * @param tagId - 태그 ID
     */
    tag: (tagId: string) => {
        apiCache.deleteByPattern(new RegExp(`^tags.*${tagId}`));
    },

    /**
     * 전체 캐시 무효화
     */
    all: () => {
        apiCache.clear();
    }
};

/**
 * 캐시 키 생성 헬퍼
 */
export const cacheKeys = {
    /**
     * 전체 노트 목록 캐시 키
     */
    allNotes: () => 'notes:all',

    /**
     * 특정 노트 캐시 키
     * @param noteId - 노트 ID
     */
    note: (noteId: string) => `notes:${noteId}`,

    /**
     * 전체 태그 목록 캐시 키
     */
    allTags: () => 'tags:all',

    /**
     * 특정 태그 캐시 키
     * @param tagId - 태그 ID
     */
    tag: (tagId: string) => `tags:${tagId}`,

    /**
     * 태그 사용량 캐시 키
     * @param tagId - 태그 ID
     */
    tagUsage: (tagId: string) => `tags:usage:${tagId}`,

    /**
     * 전체 태그 사용량 캐시 키
     */
    allTagsUsage: () => 'tags:usage:all'
};

/**
 * 개발 환경에서 캐시 상태 디버깅
 */
if (import.meta.env.MODE === 'development') {
    (window as any).__API_CACHE__ = {
        cache: apiCache,
        invalidate: invalidateCache,
        keys: cacheKeys,
        stats: () => apiCache.getStats()
    };
}

export default apiCache;

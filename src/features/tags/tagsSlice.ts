import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { db } from '../../firebase';
import type { Tag } from '../../types';

// Firebase 컬렉션 이름
const TAGS_COLLECTION = 'tags';

// 태그 상태 인터페이스
interface TagsState {
  tags: Tag[];
  loading: boolean;
  error: string | null;
}

// 초기 상태
const initialState: TagsState = {
  tags: [],
  loading: false,
  error: null,
};

// Firebase에서 태그 목록 가져오기
export const fetchTags = createAsyncThunk(
  'tags/fetchTags',
  async () => {
    try {
      const tagsCollection = collection(db, TAGS_COLLECTION);
      const querySnapshot = await getDocs(tagsCollection);
      
      if (querySnapshot.empty) {
        return [];
      }
      
      const tags: Tag[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        tags.push({
          id: doc.id,
          name: data.name,
          color: data.color,
          usageCount: data.usageCount || 0,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        });
      });
      
      return tags;
    } catch (error) {
      console.error('태그 목록 가져오기 중 오류 발생:', error);
      // 오류 발생 시 빈 배열 반환
      return [];
    }
  }
);

// 새 태그 추가
export const addTag = createAsyncThunk(
  'tags/addTag',
  async (tag: Omit<Tag, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const tagData = {
      ...tag,
      createdAt: now,
      updatedAt: now,
    };
    
    const docRef = await addDoc(collection(db, TAGS_COLLECTION), tagData);
    
    return {
      id: docRef.id,
      ...tagData,
    };
  }
);

// 태그 업데이트
export const updateTag = createAsyncThunk(
  'tags/updateTag',
  async (tag: Pick<Tag, 'id'> & Partial<Omit<Tag, 'id' | 'createdAt'>>) => {
    const now = new Date().toISOString();
    const updateData = {
      ...tag,
      updatedAt: now,
    };
    
    const tagRef = doc(db, TAGS_COLLECTION, tag.id);
    await updateDoc(tagRef, updateData);
    
    return {
      ...tag,
      updatedAt: now,
    };
  }
);

// 태그 삭제
export const deleteTag = createAsyncThunk(
  'tags/deleteTag',
  async (tagId: string) => {
    const tagRef = doc(db, TAGS_COLLECTION, tagId);
    await deleteDoc(tagRef);
    
    return tagId;
  }
);

// 태그 사용량 업데이트
export const updateTagUsageCount = createAsyncThunk(
  'tags/updateTagUsageCount',
  async (tagId: string) => {
    // 해당 태그를 사용하는 활성 노트 수를 계산 (삭제되지 않고 보관되지 않은 노트만)
    const notesQuery = query(
      collection(db, 'notes'),
      where('tags', 'array-contains', { id: tagId })
    );
    
    const notesSnapshot = await getDocs(notesQuery);
    let usageCount = 0;
    
    notesSnapshot.forEach((doc) => {
      const note = doc.data();
      // 삭제되지 않고 보관되지 않은 노트만 카운트
      if (!note.deleted && !note.archived) {
        usageCount++;
      }
    });
    
    // 태그 사용량 업데이트
    const tagRef = doc(db, TAGS_COLLECTION, tagId);
    await updateDoc(tagRef, { 
      usageCount,
      updatedAt: new Date().toISOString()
    });
    
    return { tagId, usageCount };
  }
);

// 모든 태그의 사용량을 업데이트
export const updateAllTagsUsageCount = createAsyncThunk(
  'tags/updateAllTagsUsageCount',
  async () => {
    try {
      // 모든 노트를 가져와서 태그별 사용량 계산
      const notesSnapshot = await getDocs(collection(db, 'notes'));
      const tagUsageMap = new Map<string, number>();
      
      notesSnapshot.forEach((doc) => {
        const note = doc.data();
        // 삭제되지 않고 보관되지 않은 노트만 카운트
        if (!note.deleted && !note.archived) {
          note.tags.forEach((tag: { id: string }) => {
            tagUsageMap.set(tag.id, (tagUsageMap.get(tag.id) || 0) + 1);
          });
        }
      });
      
      // 태그 컬렉션이 비어있는지 확인
      let tagsSnapshot;
      try {
        tagsSnapshot = await getDocs(collection(db, TAGS_COLLECTION));
      } catch (queryError) {
        // BloomFilter 오류나 기타 쿼리 오류 처리
        if (queryError instanceof Error && queryError.name === 'BloomFilterError') {
          console.warn('BloomFilter 오류 발생 - 태그 사용량 업데이트 건너뜀');
          return [];
        }
        throw queryError; // 다른 오류는 다시 던지기
      }
      
      // 태그가 없으면 빈 배열 반환
      if (tagsSnapshot.empty) {
        return [];
      }
      
      const updatePromises = tagsSnapshot.docs.map(async (doc) => {
        const tagId = doc.id;
        const usageCount = tagUsageMap.get(tagId) || 0;
        
        await updateDoc(doc.ref, {
          usageCount,
          updatedAt: new Date().toISOString()
        });
        
        return { tagId, usageCount };
      });
      
      const results = await Promise.all(updatePromises);
      return results;
    } catch (error) {
      // BloomFilter 오류나 기타 Firestore 오류 처리
      if (error instanceof Error && error.name === 'BloomFilterError') {
        console.warn('BloomFilter 오류 발생 - 태그 사용량 업데이트 건너뜀:', error);
        return [];
      }
      console.error('태그 사용량 업데이트 중 오류 발생:', error);
      // 오류 발생 시 빈 배열 반환하여 앱이 중단되지 않도록 함
      return [];
    }
  }
);



// 태그 slice 생성
const tagsSlice = createSlice({
  name: 'tags',
  initialState,
  reducers: {
    // 로컬에서 태그 추가 (임시)
    addLocalTag: (state, action: PayloadAction<Tag>) => {
      state.tags.push(action.payload);
    },
    
    // 로컬에서 태그 업데이트 (임시)
    updateLocalTag: (state, action: PayloadAction<Partial<Tag> & { id: string }>) => {
      const index = state.tags.findIndex(tag => tag.id === action.payload.id);
      if (index !== -1) {
        state.tags[index] = { ...state.tags[index], ...action.payload };
      }
    },
    
    // 로컬에서 태그 삭제 (임시)
    deleteLocalTag: (state, action: PayloadAction<string>) => {
      state.tags = state.tags.filter(tag => tag.id !== action.payload);
    },
    
    // 에러 초기화
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchTags
      .addCase(fetchTags.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTags.fulfilled, (state, action) => {
        state.loading = false;
        state.tags = action.payload;
      })
      .addCase(fetchTags.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '태그를 불러오는데 실패했습니다.';
      })
      
      // addTag
      .addCase(addTag.fulfilled, (state, action) => {
        state.tags.push(action.payload);
      })
      
      // updateTag
      .addCase(updateTag.fulfilled, (state, action) => {
        const index = state.tags.findIndex(tag => tag.id === action.payload.id);
        if (index !== -1) {
          state.tags[index] = { ...state.tags[index], ...action.payload };
        }
      })
      
      // deleteTag
      .addCase(deleteTag.fulfilled, (state, action) => {
        state.tags = state.tags.filter(tag => tag.id !== action.payload);
      })
      
             // updateTagUsageCount
       .addCase(updateTagUsageCount.fulfilled, (state, action) => {
         const index = state.tags.findIndex(tag => tag.id === action.payload.tagId);
         if (index !== -1) {
           state.tags[index].usageCount = action.payload.usageCount;
         }
       })
       
               // updateAllTagsUsageCount
        .addCase(updateAllTagsUsageCount.fulfilled, (state, action) => {
          action.payload.forEach(({ tagId, usageCount }) => {
            const index = state.tags.findIndex(tag => tag.id === tagId);
            if (index !== -1) {
              state.tags[index].usageCount = usageCount;
            }
          });
        })

  },
});

export const { 
  addLocalTag, 
  updateLocalTag, 
  deleteLocalTag, 
  clearError 
} = tagsSlice.actions;

export default tagsSlice.reducer;

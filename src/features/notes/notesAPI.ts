import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  getDoc,
  orderBy,
  query
} from 'firebase/firestore';
import { getFirestoreInstance } from '../../firebase';
import i18n from '../../i18n';
import type { Note, CreateNoteData, UpdateNoteData } from '../../types';
import { cachedApiCall, invalidateCache, cacheKeys } from '../../utils/apiCache';

// Firestore 컬렉션 이름
const COLLECTION_NAME = 'notes';

// 모든 노트를 불러오는 함수 (캐싱 적용)
export const fetchNotesAPI = async (forceRefresh = false): Promise<Note[]> => {
  return cachedApiCall(
    cacheKeys.allNotes(),
    async () => {
      try {
        const db = getFirestoreInstance();
        const notesRef = collection(db, COLLECTION_NAME);
        const q = query(notesRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);

        const notes: Note[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          notes.push({
            id: doc.id,
            title: data.title,
            content: data.content,
            tags: data.tags || [],
            priority: data.priority || 'medium',
            backgroundColor: data.backgroundColor || '#ffffff',
            createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
            updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
            archived: data.archived || false,
            deleted: data.deleted || false,
            pinned: data.pinned || false,
          });
        });

        return notes;
      } catch (error) {
        console.error(i18n.t('error.fetchNotesFailed'), error);
        throw new Error(i18n.t('message.loadNotesFailed'));
      }
    },
    { forceRefresh }
  );
};

// 새 노트를 추가하는 함수
export const addNoteAPI = async (noteData: CreateNoteData): Promise<Note> => {
  try {
    const now = new Date().toISOString();
    const noteToAdd = {
      ...noteData,
      tags: noteData.tags || [],
      priority: noteData.priority || 'medium',
      backgroundColor: noteData.backgroundColor || '#ffffff',
      createdAt: now,
      updatedAt: now,
    };

    const db = getFirestoreInstance();
    const docRef = await addDoc(collection(db, COLLECTION_NAME), noteToAdd);

    const newNote = {
      id: docRef.id,
      ...noteToAdd,
    };

    // 캐시 무효화 (새 노트가 추가되었으므로)
    invalidateCache.notes();

    return newNote;
  } catch (error) {
    console.error(i18n.t('error.noteCreateFailed'), error);
    throw new Error(i18n.t('message.createFailed'));
  }
};

// 노트를 삭제하는 함수
export const deleteNoteAPI = async (noteId: string): Promise<void> => {
  try {
    const db = getFirestoreInstance();
    await deleteDoc(doc(db, COLLECTION_NAME, noteId));

    // 캐시 무효화 (노트가 삭제되었으므로)
    invalidateCache.note(noteId);
    invalidateCache.notes();
  } catch (error) {
    console.error(i18n.t('error.deleteFailed'), error);
    throw new Error(i18n.t('message.deleteFailed'));
  }
};

// 노트를 수정하는 함수 (최적화된 버전)
export const updateNoteAPI = async (noteData: UpdateNoteData): Promise<Note> => {
  try {
    const { id, ...updateData } = noteData;
    const now = new Date().toISOString();

    const db = getFirestoreInstance();

    // 1. 업데이트 실행
    await updateDoc(doc(db, COLLECTION_NAME, id), {
      ...updateData,
      updatedAt: now,
    });

    // 2. 개별 노트만 다시 가져오기 (전체 노트 조회 대신)
    const noteDocRef = doc(db, COLLECTION_NAME, id);
    const noteSnapshot = await getDoc(noteDocRef);

    if (!noteSnapshot.exists()) {
      throw new Error(i18n.t('message.noteNotFound'));
    }

    const data = noteSnapshot.data();
    const updatedNote: Note = {
      id: noteSnapshot.id,
      title: data.title,
      content: data.content,
      tags: data.tags || [],
      priority: data.priority || 'medium',
      backgroundColor: data.backgroundColor || '#ffffff',
      createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
      updatedAt: data.updatedAt?.toDate?.()?.toISOString() || now,
      archived: data.archived || false,
      deleted: data.deleted || false,
      pinned: data.pinned || false,
    };

    // 3. 캐시 무효화 (해당 노트와 전체 노트 목록)
    invalidateCache.note(id);
    invalidateCache.notes();

    return updatedNote;
  } catch (error) {
    console.error(i18n.t('error.noteUpdateFailed'), error);
    throw new Error(i18n.t('message.updateFailed'));
  }
};

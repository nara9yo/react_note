import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  orderBy,
  query
} from 'firebase/firestore';
import { db } from '../../firebase';
import i18n from '../../i18n';
import type { Note, CreateNoteData, UpdateNoteData } from '../../types';

// Firestore 컬렉션 이름
const COLLECTION_NAME = 'notes';

// 모든 노트를 불러오는 함수
export const fetchNotesAPI = async (): Promise<Note[]> => {
  try {
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

    const docRef = await addDoc(collection(db, COLLECTION_NAME), noteToAdd);

    return {
      id: docRef.id,
      ...noteToAdd,
    };
  } catch (error) {
    console.error(i18n.t('error.noteCreateFailed'), error);
    throw new Error(i18n.t('message.createFailed'));
  }
};

// 노트를 삭제하는 함수
export const deleteNoteAPI = async (noteId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, noteId));
  } catch (error) {
    console.error(i18n.t('error.deleteFailed'), error);
    throw new Error(i18n.t('message.deleteFailed'));
  }
};

// 노트를 수정하는 함수
export const updateNoteAPI = async (noteData: UpdateNoteData): Promise<Note> => {
  try {
    const { id, ...updateData } = noteData;
    const now = new Date().toISOString();

    await updateDoc(doc(db, COLLECTION_NAME, id), {
      ...updateData,
      updatedAt: now,
    });

    // 업데이트된 노트 정보를 반환하기 위해 전체 노트를 다시 가져옴
    const updatedNote = await getDocs(query(collection(db, COLLECTION_NAME)));
    const noteDoc = updatedNote.docs.find(doc => doc.id === id);

    if (!noteDoc) {
      throw new Error(i18n.t('message.noteNotFound'));
    }

    const data = noteDoc.data();
    return {
      id: noteDoc.id,
      title: data.title,
      content: data.content,
      tags: data.tags || [],
      priority: data.priority || 'medium',
      backgroundColor: data.backgroundColor || '#ffffff',
      createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
      updatedAt: now,
      archived: data.archived || false,
      deleted: data.deleted || false,
      pinned: data.pinned || false,
    };
  } catch (error) {
    console.error(i18n.t('error.noteUpdateFailed'), error);
    throw new Error(i18n.t('message.updateFailed'));
  }
};

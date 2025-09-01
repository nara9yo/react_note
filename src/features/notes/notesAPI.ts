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
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
      });
    });
    
    return notes;
  } catch (error) {
    console.error('Error fetching notes:', error);
    throw new Error('노트를 불러오는데 실패했습니다.');
  }
};

// 새 노트를 추가하는 함수
export const addNoteAPI = async (noteData: CreateNoteData): Promise<Note> => {
  try {
    const now = new Date().toISOString();
    const noteToAdd = {
      ...noteData,
      createdAt: now,
      updatedAt: now,
    };
    
    const docRef = await addDoc(collection(db, COLLECTION_NAME), noteToAdd);
    
    return {
      id: docRef.id,
      ...noteToAdd,
    };
  } catch (error) {
    console.error('Error adding note:', error);
    throw new Error('노트 추가에 실패했습니다.');
  }
};

// 노트를 삭제하는 함수
export const deleteNoteAPI = async (noteId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, noteId));
  } catch (error) {
    console.error('Error deleting note:', error);
    throw new Error('노트 삭제에 실패했습니다.');
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
      throw new Error('노트를 찾을 수 없습니다.');
    }
    
    const data = noteDoc.data();
    return {
      id: noteDoc.id,
      title: data.title,
      content: data.content,
      createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
      updatedAt: now,
    };
  } catch (error) {
    console.error('Error updating note:', error);
    throw new Error('노트 수정에 실패했습니다.');
  }
};

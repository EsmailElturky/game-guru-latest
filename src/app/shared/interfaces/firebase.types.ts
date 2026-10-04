import type {
  DocumentData,
  QueryConstraint,
  WithFieldValue,
} from 'firebase/firestore';

/** Firestore document with its document id. */
export type FirebaseDocument<T extends DocumentData = DocumentData> = T & { id: string };

export type FirebaseWriteData<T extends DocumentData = DocumentData> = WithFieldValue<T>;

export interface FirebaseListenOptions {
  queryConstraints?: QueryConstraint[];
}

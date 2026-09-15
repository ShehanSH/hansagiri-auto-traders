import { collection, doc, setDoc, type DocumentData, type QuerySnapshot } from "firebase/firestore";
import { getDb } from "@/lib/firebase/client";

export async function createDocument<T extends object>(
  collectionName: string,
  data: T,
): Promise<string> {
  const ref = doc(collection(getDb(), collectionName));
  await setDoc(ref, { ...data, id: ref.id } as DocumentData);
  return ref.id;
}

export function mapDocs<T>(snapshot: QuerySnapshot): T[] {
  return snapshot.docs.map((item) => ({ ...item.data(), id: item.id }) as T);
}

export function clipMessage(value: string, max = 2000): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return trimmed.length <= max ? trimmed : trimmed.slice(0, max);
}

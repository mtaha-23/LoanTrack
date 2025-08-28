import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore'
import { db, auth } from './firebase'
import { Person, PersonInsert, PersonUpdate, Transaction, TransactionInsert, TransactionUpdate } from './types'

// People operations
export const getPeople = async (): Promise<Person[]> => {
  const user = auth.currentUser
  if (!user) throw new Error('User not authenticated')

  const q = query(
    collection(db, 'people'),
    where('userId', '==', user.uid),
    orderBy('name')
  )
  
  const querySnapshot = await getDocs(q)
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate() || new Date(),
    updatedAt: doc.data().updatedAt?.toDate() || new Date()
  })) as Person[]
}

export const getPerson = async (id: string): Promise<Person | null> => {
  const docRef = doc(db, 'people', id)
  const docSnap = await getDoc(docRef)
  
  if (!docSnap.exists()) return null
  
  const data = docSnap.data()
  return {
    id: docSnap.id,
    ...data,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date()
  } as Person
}

export const addPerson = async (personData: PersonInsert): Promise<string> => {
  const user = auth.currentUser
  if (!user) throw new Error('User not authenticated')

  const docRef = await addDoc(collection(db, 'people'), {
    ...personData,
    userId: user.uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  })
  
  return docRef.id
}

export const updatePerson = async (id: string, personData: PersonUpdate): Promise<void> => {
  const user = auth.currentUser
  if (!user) throw new Error('User not authenticated')

  const docRef = doc(db, 'people', id)
  await updateDoc(docRef, {
    ...personData,
    updatedAt: serverTimestamp()
  })
}

export const deletePerson = async (id: string): Promise<void> => {
  const user = auth.currentUser
  if (!user) throw new Error('User not authenticated')

  // First, delete all transactions for this person
  const transactionsQuery = query(
    collection(db, 'transactions'),
    where('userId', '==', user.uid),
    where('personId', '==', id)
  )
  
  const transactionsSnapshot = await getDocs(transactionsQuery)
  const deletePromises = transactionsSnapshot.docs.map(doc => deleteDoc(doc.ref))
  
  // Delete all transactions first
  await Promise.all(deletePromises)
  
  // Then delete the person
  const personRef = doc(db, 'people', id)
  await deleteDoc(personRef)
}

// Transactions operations
export const getTransactions = async (): Promise<Transaction[]> => {
  const user = auth.currentUser
  if (!user) throw new Error('User not authenticated')

  const q = query(
    collection(db, 'transactions'),
    where('userId', '==', user.uid),
    orderBy('date', 'desc')
  )
  
  const querySnapshot = await getDocs(q)
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate() || new Date(),
    updatedAt: doc.data().updatedAt?.toDate() || new Date()
  })) as Transaction[]
}

export const getTransactionsForPerson = async (personId: string): Promise<Transaction[]> => {
  const user = auth.currentUser
  if (!user) throw new Error('User not authenticated')

  const q = query(
    collection(db, 'transactions'),
    where('userId', '==', user.uid),
    where('personId', '==', personId),
    orderBy('date', 'desc')
  )
  
  const querySnapshot = await getDocs(q)
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate() || new Date(),
    updatedAt: doc.data().updatedAt?.toDate() || new Date()
  })) as Transaction[]
}

export const addTransaction = async (transactionData: TransactionInsert): Promise<string> => {
  const user = auth.currentUser
  if (!user) throw new Error('User not authenticated')

  const docRef = await addDoc(collection(db, 'transactions'), {
    ...transactionData,
    userId: user.uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  })
  
  return docRef.id
}

export const updateTransaction = async (id: string, transactionData: TransactionUpdate): Promise<void> => {
  const user = auth.currentUser
  if (!user) throw new Error('User not authenticated')

  const docRef = doc(db, 'transactions', id)
  await updateDoc(docRef, {
    ...transactionData,
    updatedAt: serverTimestamp()
  })
}

export const deleteTransaction = async (id: string): Promise<void> => {
  const user = auth.currentUser
  if (!user) throw new Error('User not authenticated')

  const docRef = doc(db, 'transactions', id)
  await deleteDoc(docRef)
}

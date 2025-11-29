import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Profile } from '../types';

const COLLECTION_NAME = 'profiles';

export const firestoreService = {
  // Create a new profile
  async createProfile(profile: Omit<Profile, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...profile,
        createdAt: Timestamp.now().toMillis(),
        updatedAt: Timestamp.now().toMillis(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating profile:', error);
      throw error;
    }
  },

  // Get all profiles
  async getAllProfiles(): Promise<Profile[]> {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Profile[];
    } catch (error) {
      console.error('Error getting profiles:', error);
      throw error;
    }
  },

  // Update a profile
  async updateProfile(id: string, profile: Partial<Profile>): Promise<void> {
    try {
      const profileRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(profileRef, {
        ...profile,
        updatedAt: Timestamp.now().toMillis(),
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  // Delete a profile
  async deleteProfile(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, id));
    } catch (error) {
      console.error('Error deleting profile:', error);
      throw error;
    }
  },

  // Get a single profile by ID
  async getProfileById(id: string): Promise<Profile | null> {
    try {
      const allProfiles = await this.getAllProfiles();
      return allProfiles.find(p => p.id === id) || null;
    } catch (error) {
      console.error('Error getting profile:', error);
      throw error;
    }
  },
};


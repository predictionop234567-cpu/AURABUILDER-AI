import { create } from 'zustand';
import { auth, db } from '../firebase/config';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';

interface UserProfile {
  id: string;
  email: string;
  plan: 'free' | 'pro';
}

interface Project {
  id: string;
  name: string;
  prompt: string;
  html: string;
  settings_json: any;
  pages_json: any[];
  updated_at: string;
  userId: string;
}

interface AppState {
  user: UserProfile | null;
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  setUser: (user: UserProfile | null) => void;
  setProjects: (projects: Project[]) => void;
  setCurrentProject: (project: Project | null) => void;
  fetchProjects: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  user: null,
  projects: [],
  currentProject: null,
  isLoading: false,
  setUser: (user) => set({ user }),
  setProjects: (projects) => set({ projects }),
  setCurrentProject: (project) => set({ currentProject: project }),
  fetchProjects: async () => {
    const { user } = get();
    if (!user) return;
    set({ isLoading: true });
    try {
      const q = query(
        collection(db, 'projects'),
        where('userId', '==', user.id),
        orderBy('updated_at', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const projectsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Project[];
      set({ projects: projectsData });
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      set({ isLoading: false });
    }
  },
  logout: async () => {
    await auth.signOut();
    set({ user: null, projects: [], currentProject: null });
  },
}));

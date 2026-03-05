import { create } from 'zustand';
import { auth, db } from '../firebase/config';
import { ref, get, query, orderByChild, equalTo } from 'firebase/database';

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

export const useStore = create<AppState>((set, getStore) => ({
  user: null,
  projects: [],
  currentProject: null,
  isLoading: false,
  setUser: (user) => set({ user }),
  setProjects: (projects) => set({ projects }),
  setCurrentProject: (project) => set({ currentProject: project }),
  fetchProjects: async () => {
    const { user } = getStore();
    if (!user) return;
    set({ isLoading: true });
    try {
      const projectsRef = ref(db, 'projects');
      const projectsQuery = query(projectsRef, orderByChild('userId'), equalTo(user.id));
      const snapshot = await get(projectsQuery);
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        const projectsData = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        })) as Project[];
        
        // Sort manually by updated_at descending as RTDB doesn't support multiple orderings easily
        projectsData.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
        
        set({ projects: projectsData });
      } else {
        set({ projects: [] });
      }
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

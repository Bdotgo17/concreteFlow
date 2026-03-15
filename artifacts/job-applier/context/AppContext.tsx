import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export type JobStatus =
  | "saved"
  | "applied"
  | "screening"
  | "interview"
  | "offer"
  | "rejected"
  | "withdrawn";

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary?: string;
  jobType: "full-time" | "part-time" | "contract" | "remote" | "hybrid";
  status: JobStatus;
  appliedDate?: string;
  lastUpdated: string;
  description?: string;
  url?: string;
  notes?: string;
  tags?: string[];
  logoColor?: string;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  location: string;
  title: string;
  summary: string;
  skills: string[];
  experience: string;
  education: string;
  linkedIn?: string;
  github?: string;
  portfolio?: string;
  resumeText?: string;
  preferredRoles: string[];
  preferredLocations: string[];
  salaryMin?: string;
  salaryMax?: string;
  remoteOnly: boolean;
  autoApplyEnabled: boolean;
}

const defaultProfile: UserProfile = {
  name: "",
  email: "",
  phone: "",
  location: "",
  title: "",
  summary: "",
  skills: [],
  experience: "",
  education: "",
  preferredRoles: [],
  preferredLocations: [],
  remoteOnly: false,
  autoApplyEnabled: false,
};

interface AppContextType {
  jobs: Job[];
  profile: UserProfile;
  addJob: (job: Omit<Job, "id" | "lastUpdated">) => void;
  updateJob: (id: string, updates: Partial<Job>) => void;
  deleteJob: (id: string) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  getJobsByStatus: (status: JobStatus) => Job[];
  isLoading: boolean;
}

const AppContext = createContext<AppContextType | null>(null);

const JOBS_KEY = "autoapply_jobs";
const PROFILE_KEY = "autoapply_profile";

const LOGO_COLORS = [
  "#1B4FFF",
  "#7C3AED",
  "#DC2626",
  "#059669",
  "#D97706",
  "#DB2777",
  "#0891B2",
  "#4F46E5",
];

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [savedJobs, savedProfile] = await Promise.all([
          AsyncStorage.getItem(JOBS_KEY),
          AsyncStorage.getItem(PROFILE_KEY),
        ]);
        if (savedJobs) setJobs(JSON.parse(savedJobs));
        if (savedProfile)
          setProfile({ ...defaultProfile, ...JSON.parse(savedProfile) });
      } catch (e) {
        console.error("Failed to load data", e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const saveJobs = useCallback(async (updatedJobs: Job[]) => {
    await AsyncStorage.setItem(JOBS_KEY, JSON.stringify(updatedJobs));
  }, []);

  const addJob = useCallback(
    (job: Omit<Job, "id" | "lastUpdated">) => {
      const newJob: Job = {
        ...job,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        lastUpdated: new Date().toISOString(),
        logoColor:
          LOGO_COLORS[Math.floor(Math.random() * LOGO_COLORS.length)],
      };
      setJobs((prev) => {
        const updated = [newJob, ...prev];
        saveJobs(updated);
        return updated;
      });
    },
    [saveJobs]
  );

  const updateJob = useCallback(
    (id: string, updates: Partial<Job>) => {
      setJobs((prev) => {
        const updated = prev.map((job) =>
          job.id === id
            ? { ...job, ...updates, lastUpdated: new Date().toISOString() }
            : job
        );
        saveJobs(updated);
        return updated;
      });
    },
    [saveJobs]
  );

  const deleteJob = useCallback(
    (id: string) => {
      setJobs((prev) => {
        const updated = prev.filter((job) => job.id !== id);
        saveJobs(updated);
        return updated;
      });
    },
    [saveJobs]
  );

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    setProfile((prev) => {
      const updated = { ...prev, ...updates };
      AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const getJobsByStatus = useCallback(
    (status: JobStatus) => jobs.filter((j) => j.status === status),
    [jobs]
  );

  return (
    <AppContext.Provider
      value={{
        jobs,
        profile,
        addJob,
        updateJob,
        deleteJob,
        updateProfile,
        getJobsByStatus,
        isLoading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

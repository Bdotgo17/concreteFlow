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

export type ContactRelationship =
  | "recruiter"
  | "hiring-manager"
  | "colleague"
  | "mentor"
  | "referral"
  | "friend"
  | "other";

export interface Contact {
  id: string;
  name: string;
  company: string;
  role: string;
  email?: string;
  phone?: string;
  linkedIn?: string;
  relationship: ContactRelationship;
  notes?: string;
  tags?: string[];
  avatarColor: string;
  createdAt: string;
  lastContactedAt?: string;
  followUpDate?: string;
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
  contacts: Contact[];
  profile: UserProfile;
  addJob: (job: Omit<Job, "id" | "lastUpdated">) => void;
  updateJob: (id: string, updates: Partial<Job>) => void;
  deleteJob: (id: string) => void;
  addContact: (contact: Omit<Contact, "id" | "createdAt" | "avatarColor">) => void;
  updateContact: (id: string, updates: Partial<Contact>) => void;
  deleteContact: (id: string) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  getJobsByStatus: (status: JobStatus) => Job[];
  isLoading: boolean;
}

const AppContext = createContext<AppContextType | null>(null);

const JOBS_KEY = "autoapply_jobs";
const PROFILE_KEY = "autoapply_profile";
const CONTACTS_KEY = "autoapply_contacts";

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

const AVATAR_COLORS = [
  "#1B4FFF",
  "#7C3AED",
  "#059669",
  "#D97706",
  "#DB2777",
  "#0891B2",
  "#DC2626",
  "#4F46E5",
  "#0D9488",
  "#9333EA",
];

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [savedJobs, savedProfile, savedContacts] = await Promise.all([
          AsyncStorage.getItem(JOBS_KEY),
          AsyncStorage.getItem(PROFILE_KEY),
          AsyncStorage.getItem(CONTACTS_KEY),
        ]);
        if (savedJobs) setJobs(JSON.parse(savedJobs));
        if (savedProfile)
          setProfile({ ...defaultProfile, ...JSON.parse(savedProfile) });
        if (savedContacts) setContacts(JSON.parse(savedContacts));
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

  const saveContacts = useCallback(async (updatedContacts: Contact[]) => {
    await AsyncStorage.setItem(CONTACTS_KEY, JSON.stringify(updatedContacts));
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

  const addContact = useCallback(
    (contact: Omit<Contact, "id" | "createdAt" | "avatarColor">) => {
      const newContact: Contact = {
        ...contact,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString(),
        avatarColor:
          AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
      };
      setContacts((prev) => {
        const updated = [newContact, ...prev];
        saveContacts(updated);
        return updated;
      });
    },
    [saveContacts]
  );

  const updateContact = useCallback(
    (id: string, updates: Partial<Contact>) => {
      setContacts((prev) => {
        const updated = prev.map((c) =>
          c.id === id ? { ...c, ...updates } : c
        );
        saveContacts(updated);
        return updated;
      });
    },
    [saveContacts]
  );

  const deleteContact = useCallback(
    (id: string) => {
      setContacts((prev) => {
        const updated = prev.filter((c) => c.id !== id);
        saveContacts(updated);
        return updated;
      });
    },
    [saveContacts]
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
        contacts,
        profile,
        addJob,
        updateJob,
        deleteJob,
        addContact,
        updateContact,
        deleteContact,
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

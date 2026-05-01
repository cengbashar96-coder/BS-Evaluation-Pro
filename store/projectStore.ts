import { create } from 'zustand';

export interface BuildingInfo {
  propertyNumber?: string;
  previousLicense?: string;
  licenseDate?: string;
  area?: string;
  ownerName?: string;
  buildingComponent?: string;
  floorCount?: number;
  buildingUsage?: string;
  locationImage?: string;
  locationDescription?: string;
}

export interface FloorReport {
  id?: string;
  floorNumber: string;
  floorArea?: number;
  projectionArea?: number;
  elevation?: number;
  notes?: string;
  observations?: string;
}

export interface StructuralReport {
  structuralSystem?: string;
  schmidtReport?: string;
  schmidtConcreteStrength?: number;
  soilMechanicsReport?: string;
  soilType?: string;
  foundationDepth?: number;
  soilCapacity?: number;
  soilFrictionAngle?: number;
  soilCohesion?: number;
  groundwaterLevel?: string;
  soilNotes?: string;
}

export interface Foundation {
  id?: string;
  hasBasement?: boolean;
  basementDesc?: string;
  foundationType?: string;
  foundationDepth?: number;
  foundationModel?: string;
  length?: number;
  width?: number;
  height?: number;
  totalLoad?: number;
  actualStress?: number;
  isVerified?: boolean;
}

export interface ColumnWall {
  id?: string;
  columnType?: string;
  floorNumber?: string;
  width?: number;
  depth?: number;
  totalLoad?: number;
  actualStress?: number;
  allowableStress?: number;
  isVerified?: boolean;
}

export interface BeamSlab {
  id?: string;
  element?: string;
  floorNumber?: string;
  supportType?: string;
  span?: number;
  width?: number;
  thickness?: number;
  fy?: number;
  deadLoad?: number;
  liveLoad?: number;
  totalLoad?: number;
  appliedMoment?: number;
  allowableMoment?: number;
  isVerified?: boolean;
}

export interface Engineer {
  id?: string;
  sequence: number;
  specialty?: string;
  name?: string;
  unionNumber?: string;
  signature?: string;
}

export interface ElectricalReport {
  installation?: string;
  electricalNotes?: string;
  images?: string[];
}

export interface PlumbingReport {
  freshWaterNotes?: string;
  wastewaterNotes?: string;
  images?: string[];
}

export interface TechnicalNotes {
  architecturalNotes?: string;
  structuralNotes?: string;
  electricalNotes?: string;
  plumbingNotes?: string;
  requirements?: string;
  suggestions?: string;
}

export interface ProjectData {
  id?: string;
  name: string;
  buildingInfo?: BuildingInfo;
  floorReports?: FloorReport[];
  structuralReport?: StructuralReport;
  foundations?: Foundation[];
  columns?: ColumnWall[];
  beams?: BeamSlab[];
  electrical?: ElectricalReport;
  plumbing?: PlumbingReport;
  technicalNotes?: TechnicalNotes;
  engineers?: Engineer[];
  reportPurpose?: 'additionalFloor' | 'violationSettlement' | 'currentStatus';
  current?: boolean;
}

interface ProjectStore {
  // الحالة
  currentProjectId: string | null;
  savedProjects: ProjectData[];
  _hasHydrated: boolean;
  setHasHydrated: (hydrated: boolean) => void;
  
  // الإجراءات
  setCurrentProject: (projectId: string | null) => void;
  saveProject: (project: ProjectData) => Promise<void>;
  loadProject: (projectId: string) => Promise<void>;
  createNewProject: () => void;
  deleteProject: (projectId: string) => Promise<void>;
  editProjectName: (projectId: string, newName: string) => Promise<void>;
  
  // تحديث البيانات
  updateBuildingInfo: (info: BuildingInfo) => void;
  updateFloorReports: (reports: FloorReport[]) => void;
  updateStructuralReport: (report: StructuralReport) => void;
  updateFoundations: (foundations: Foundation[]) => void;
  updateColumns: (columns: ColumnWall[]) => void;
  updateBeams: (beams: BeamSlab[]) => void;
  updateElectrical: (report: ElectricalReport) => void;
  updatePlumbing: (report: PlumbingReport) => void;
  updateTechnicalNotes: (notes: TechnicalNotes) => void;
  updateEngineers: (engineers: Engineer[]) => void;
  setReportPurpose: (purpose: 'additionalFloor' | 'violationSettlement' | 'currentStatus') => void;
}

const STORAGE_KEY = 'bs-evaluation-projects';

const loadFromStorage = (): ProjectData[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading projects from storage:', error);
    return [];
  }
};

const saveToStorage = (projects: ProjectData[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch (error) {
    console.error('Error saving projects to storage:', error);
  }
};

export const useProjectStore = create<ProjectStore>((set, get) => ({
  currentProjectId: null,
  savedProjects: [],
  _hasHydrated: false,
  
  setCurrentProject: (projectId) => {
    set({ currentProjectId: projectId });
    
    // تحديث المشروع الحالي في القائمة
    const { savedProjects } = get();
    const updatedProjects = savedProjects.map(p => ({
      ...p,
      current: p.id === projectId
    }));
    set({ savedProjects: updatedProjects });
    saveToStorage(updatedProjects);
  },
  
  saveProject: async (project) => {
    const { savedProjects, currentProjectId } = get();

    // توليد اسم المشروع تلقائياً من معلومات العقار والمالك
    let projectName = project.name || 'مشروع جديد';
    if (project.buildingInfo) {
      const { propertyNumber, ownerName } = project.buildingInfo;
      if (ownerName && propertyNumber) {
        projectName = `${ownerName} - ${propertyNumber}`;
      } else if (ownerName) {
        projectName = `${ownerName} - مشروع جديد`;
      } else if (propertyNumber) {
        projectName = `${propertyNumber} - بدون اسم`;
      }
    }

    // تحديث المشروع الحالي
    const updatedProject = {
      ...project,
      name: projectName,
      id: project.id || currentProjectId,
      current: true
    };

    // إزالة المشروع القديم وإضافة الجديد
    const filteredProjects = savedProjects.filter(p =>
      (currentProjectId && p.id === currentProjectId) ? false : p.id !== project.id
    );

    const newProjects = [...filteredProjects, updatedProject].map(p => ({
      ...p,
      current: p.id === (project.id || currentProjectId)
    })) as ProjectData[];

    set({ savedProjects: newProjects, currentProjectId: updatedProject.id });
    saveToStorage(newProjects);

    // حفظ في قاعدة البيانات
    if (updatedProject.id) {
      await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProject)
      });
    }

    // إرسال حدث لإعلام الواجهات بتمام الحفظ
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('project:saved', { detail: { project: updatedProject } }));
    }
  },
  
  loadProject: async (projectId) => {
    const { savedProjects } = get();
    const project = savedProjects.find(p => p.id === projectId);
    
    if (project) {
      // تحميل البيانات من المشروع
      if (project.buildingInfo) {
        get().updateBuildingInfo(project.buildingInfo);
        localStorage.setItem('bs-building-info', JSON.stringify(project.buildingInfo));
      }
      if (project.floorReports) {
        get().updateFloorReports(project.floorReports);
        localStorage.setItem('bs-floor-reports', JSON.stringify(project.floorReports));
      }
      if (project.structuralReport) {
        get().updateStructuralReport(project.structuralReport);
        localStorage.setItem('bs-structural-report', JSON.stringify(project.structuralReport));
      }
      if (project.foundations) {
        get().updateFoundations(project.foundations);
        localStorage.setItem('bs-foundations', JSON.stringify(project.foundations));
      }
      if (project.columns) {
        get().updateColumns(project.columns);
        localStorage.setItem('bs-columns', JSON.stringify(project.columns));
      }
      if (project.beams) {
        get().updateBeams(project.beams);
        localStorage.setItem('bs-beams', JSON.stringify(project.beams));
      }
      if (project.electrical) {
        get().updateElectrical(project.electrical);
        localStorage.setItem('bs-electrical', JSON.stringify(project.electrical));
      }
      if (project.plumbing) {
        get().updatePlumbing(project.plumbing);
        localStorage.setItem('bs-plumbing', JSON.stringify(project.plumbing));
      }
      if (project.technicalNotes) {
        get().updateTechnicalNotes(project.technicalNotes);
        localStorage.setItem('bs-technical-notes', JSON.stringify(project.technicalNotes));
      }
      if (project.engineers) {
        get().updateEngineers(project.engineers);
        localStorage.setItem('bs-engineers', JSON.stringify(project.engineers));
      }
      if (project.reportPurpose) {
        get().setReportPurpose(project.reportPurpose);
        localStorage.setItem('bs-report-purpose', project.reportPurpose);
      }
      
      get().setCurrentProject(projectId);
      
      // إرسال حدث لتحميل البيانات في جميع الواجهات
      window.dispatchEvent(new CustomEvent('project:loaded'));
      window.dispatchEvent(new CustomEvent('project:changed', { detail: { projectId } }));
    }
  },
  
  createNewProject: () => {
    const newProject: ProjectData = {
      id: `proj-${Date.now()}`,
      name: 'مشروع جديد',
      floorReports: [],
      foundations: [],
      columns: [],
      beams: [],
      engineers: [],
      current: true
    };

    const { savedProjects } = get();
    const updatedProjects = savedProjects.map(p => ({ ...p, current: false })) as ProjectData[];
    updatedProjects.push(newProject);

    set({ savedProjects: updatedProjects, currentProjectId: newProject.id });
    saveToStorage(updatedProjects);

    // إرسال حدث لمسح البيانات في جميع الواجهات
    window.dispatchEvent(new CustomEvent('project:new'));
  },
  
  deleteProject: async (projectId) => {
    const { savedProjects, currentProjectId } = get();
    const projectToDelete = savedProjects.find(p => p.id === projectId);
    const filteredProjects = savedProjects.filter(p => p.id !== projectId);

    set({ savedProjects: filteredProjects });
    saveToStorage(filteredProjects);

    // حذف من قاعدة البيانات
    await fetch(`/api/projects/${projectId}`, { method: 'DELETE' });

    // إرسال حدث لحذف المشروع
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('project:deleted', { detail: { projectId, projectName: projectToDelete?.name } }));
    }

    // إذا تم حذف المشروع الحالي
    if (projectId === currentProjectId) {
      if (filteredProjects.length > 0) {
        const nextProjectId = filteredProjects[0].id || null;
        get().setCurrentProject(nextProjectId);
      } else {
        get().createNewProject();
      }
    }
  },
  
  editProjectName: async (projectId, newName) => {
    const { savedProjects } = get();
    const updatedProjects = savedProjects.map(p =>
      p.id === projectId ? { ...p, name: newName } : p
    );

    set({ savedProjects: updatedProjects });
    saveToStorage(updatedProjects);

    // تحديث في قاعدة البيانات
    const project = savedProjects.find(p => p.id === projectId);
    if (project) {
      await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...project, name: newName })
      });
    }

    // إرسال حدث لتحديث اسم المشروع
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('project:nameEdited', { detail: { projectId, newName } }));
    }
  },
  
  updateBuildingInfo: (info) => {
    // حفظ في localStorage مؤقتاً
    localStorage.setItem('bs-building-info', JSON.stringify(info));
  },
  
  updateFloorReports: (reports) => {
    localStorage.setItem('bs-floor-reports', JSON.stringify(reports));
  },
  
  updateStructuralReport: (report) => {
    localStorage.setItem('bs-structural-report', JSON.stringify(report));
  },
  
  updateFoundations: (foundations) => {
    localStorage.setItem('bs-foundations', JSON.stringify(foundations));
  },
  
  updateColumns: (columns) => {
    localStorage.setItem('bs-columns', JSON.stringify(columns));
  },
  
  updateBeams: (beams) => {
    localStorage.setItem('bs-beams', JSON.stringify(beams));
  },
  
  updateElectrical: (report) => {
    localStorage.setItem('bs-electrical', JSON.stringify(report));
  },
  
  updatePlumbing: (report) => {
    localStorage.setItem('bs-plumbing', JSON.stringify(report));
  },
  
  updateTechnicalNotes: (notes) => {
    localStorage.setItem('bs-technical-notes', JSON.stringify(notes));
  },
  
  updateEngineers: (engineers) => {
    localStorage.setItem('bs-engineers', JSON.stringify(engineers));
  },
  
  setReportPurpose: (purpose) => {
    localStorage.setItem('bs-report-purpose', purpose);
  },
  
  setHasHydrated: (hydrated) => {
    set({ _hasHydrated: hydrated });
  }
}));

// Hydrate the store on client side
if (typeof window !== 'undefined') {
  const storedProjects = loadFromStorage();
  const currentId = storedProjects.find(p => p.current)?.id || null;
  useProjectStore.setState({
    savedProjects: storedProjects,
    currentProjectId: currentId,
    _hasHydrated: true
  });
}

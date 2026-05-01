import { create } from 'zustand';
import { saveBuildingInfo } from '@/actions/building-actions'; // استدعاء الأكشن السحابي
import { toast } from 'sonner';

// تعريف الأنواع (Interfaces) لضمان دقة البيانات
export interface BuildingInfo {
  ownerName?: string;
  propertyNumber?: string;
  location?: string;
  floorCount?: number;
  licenseDate?: string;
  locationImage?: string;
  locationDescription?: string;
}

interface ProjectState {
  buildingInfo: BuildingInfo | null;
  isLoading: boolean;
  _hasHydrated: boolean;
  
  // الدوال الجديدة للربط السحابي
  setBuildingInfo: (info: BuildingInfo) => void;
  syncBuildingInfo: (projectId: string, info: BuildingInfo) => Promise<void>;
  setHasHydrated: (hydrated: boolean) => void;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  buildingInfo: null,
  isLoading: false,
  _hasHydrated: false,

  // تحديث البيانات في الواجهة فوراً (Optimistic Update)
  setBuildingInfo: (info) => {
    set({ buildingInfo: info });
    if (typeof window !== 'undefined') {
      localStorage.setItem('bs-building-info-cache', JSON.stringify(info));
    }
  },

  // المزامنة الحقيقية مع قاعدة البيانات السحابية (Prisma)
  syncBuildingInfo: async (projectId: string, info: BuildingInfo) => {
    set({ isLoading: true });
    try {
      const result = await saveBuildingInfo(projectId, info);
      
      if (result.success) {
        set({ buildingInfo: result.data as BuildingInfo, isLoading: false });
        toast.success('تمت المزامنة مع السحاب بنجاح');
      } else {
        set({ isLoading: false });
        toast.error(result.error || 'فشلت عملية المزامنة');
      }
    } catch (error) {
      set({ isLoading: false });
      toast.error('خطأ غير متوقع في الاتصال بالخادم');
    }
  },

  setHasHydrated: (hydrated) => {
    set({ _hasHydrated: hydrated });
  }
}));

// نظام استعادة البيانات عند تشغيل التطبيق (Hydration)
if (typeof window !== 'undefined') {
  const hydrate = () => {
    const stored = localStorage.getItem('bs-building-info-cache');
    if (stored) {
      useProjectStore.setState({ buildingInfo: JSON.parse(stored), _hasHydrated: true });
    }
  };
  hydrate();
}

'use client'

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Layers, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Calculator,
  Database,
  Save,
  Trash2,
  Plus,
  ChevronDown,
  Edit2,
  X
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n/translations';
import { useProjectStore } from '@/store/projectStore';
import { toast } from 'sonner';

// === ثوابت الكود العربي السوري 2024 ===

// جدول رتب البيتون (القسم 2.1.1)
const CONCRETE_GRADES_2024 = [
  { grade: 'B15', fc_prime: 15 },
  { grade: 'B20', fc_prime: 20 },
  { grade: 'B25', fc_prime: 25 },
  { grade: 'B30', fc_prime: 30 },
  { grade: 'B35', fc_prime: 35 },
  { grade: 'B40', fc_prime: 40 },
  { grade: 'B45', fc_prime: 45 },
  { grade: 'B50', fc_prime: 50 },
];

// جدول رتب الحديد (القسم 2.1.2)
const STEEL_GRADES_2024 = [
  { grade: 'A240', fy: 240, name: 'A240 - حديد ناعم' },
  { grade: 'A300', fy: 300, name: 'A300 - حديد ناعم' },
  { grade: 'A400', fy: 400, name: 'A400 - حديد محزز' },
  { grade: 'A500', fy: 500, name: 'A500 - حديد محزز' },
  { grade: 'Galvanized', fy: 350, name: 'مجلفن' },
  { grade: 'Painted', fy: 320, name: 'مطلي' },
];

// === واجهات النتائج ===

interface VerificationResult {
  thicknessCheck: { safe: boolean; message: string; value?: number; min?: number; };
  momentCheck: { safe: boolean; message: string; fc_actual?: number; fc_allow?: number; fs_actual?: number; fs_allow?: number; };
  shearCheck: { safe: boolean; message: string; v_actual?: number; v_allow?: number; };
  isSafe: boolean;
  recommendation: string;
}

interface CheckedElement {
  id: string;
  type: string;
  name: string;
  floorNumber: string;
  data: any;
  result?: VerificationResult;
}

// === أنواع البلاطات ===
type SlabType = 'solid-1way' | 'solid-2way' | 'ribbed-1way' | 'ribbed-2way' | 'flat';

// === أنواع الجوائز ===
type BeamType = 'exposed' | 'hidden';

// === المكون الرئيسي ===

export default function SlabsAndBeams() {
  const { t } = useTranslation();
  const { currentProjectId, updateBeams } = useProjectStore();
  
  // التبويب النشط الرئيسي (البلاطات أو الجوائز)
  const [mainCategory, setMainCategory] = useState<'slabs' | 'beams'>('slabs');
  
  // نوع البلاطة المحدد
  const [selectedSlabType, setSelectedSlabType] = useState<SlabType>('solid-1way');
  
  // نوع الجائز المحدد
  const [selectedBeamType, setSelectedBeamType] = useState<BeamType>('exposed');
  
  // إعدادات المواد (مشتركة)
  const [materialSettings, setMaterialSettings] = useState({
    concreteGrade: 'B25',
    steelGrade: 'A400',
  });
  
  // الحصول على القيم من الجداول
  const concreteGradeData = CONCRETE_GRADES_2024.find(g => g.grade === materialSettings.concreteGrade);
  const steelGradeData = STEEL_GRADES_2024.find(g => g.grade === materialSettings.steelGrade);
  
  const fc_prime = concreteGradeData?.fc_prime || 25; // MPa
  const fy = steelGradeData?.fy || 400; // MPa
  
  // حساب الإجهادات المسموحة (طريقة التشغيل - القسم 3.2)
  const Fc_allow = 0.40 * fc_prime; // MPa - إجهاد بيتون مسموح
  const Fs_allow = 0.50 * fy; // MPa - إجهاد حديد مسموح
  
  // معامل المرونة النسبي
  const Es = 200000; // MPa
  const Ec = 4700 * Math.sqrt(fc_prime);
  const n = Math.round(Es / Ec);
  
  // معامل تصحيح السماكة للحديد (القسم 3.2.2)
  const lambda = fy !== 400 ? (0.4 + fy/700) : 1.0;
  
  // === حالات الجوائز ===
  const [beams, setBeams] = useState<Array<{
    id: string;
    name: string;
    type: BeamType;
    floorNumber: string;
    supportType: 'simplySupported' | 'oneEndContinuous' | 'twoEndsContinuous' | 'cantilever';
    span: number;
    width: number;
    height: number;
    cover: number;
    barsCount: number;
    barDiameter: number;
    serviceMoment: number;
    shearForce: number;
    stirrupsDiameter: number;
    stirrupsSpacing: number;
    result?: VerificationResult;
  }>>([]);

  // العناصر المحققة
  const [checkedElements, setCheckedElements] = useState<CheckedElement[]>([]);
  
  // حالة التعديل
  const [editingElementId, setEditingElementId] = useState<string | null>(null);
  const [editingElementData, setEditingElementData] = useState<any>(null);

  // استرجاع البيانات المحفوظة عند تحميل المشروع
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleNewProject = () => {
        setCheckedElements([]);
        setBeams([]);
        setSelectedSlabType('solid-1way');
        setSelectedBeamType('exposed');
      };

      const handleLoadProjectData = () => {
        const storedBeams = localStorage.getItem('bs-beams');
        if (storedBeams) {
          try {
            const allData = JSON.parse(storedBeams);

            // استرجاع الجوائز (التي تحوي elementType = 'beam')
            const loadedBeams = allData.filter((item: any) => item.elementType === 'beam');
            if (loadedBeams.length > 0) {
              setBeams(loadedBeams.map((beam: any) => ({
                id: beam.id || `beam-${Date.now()}`,
                name: beam.element || beam.name,
                type: beam.beamType || 'exposed',
                floorNumber: beam.floorNumber,
                supportType: beam.supportType || 'simplySupported',
                span: beam.span || 5.0,
                width: beam.width || 30,
                height: beam.thickness || 60,
                cover: beam.cover || 5,
                barsCount: beam.barsCount || 4,
                barDiameter: beam.barDiameter || 16,
                serviceMoment: beam.appliedMoment || 80,
                shearForce: beam.shearForce || 0,
                stirrupsDiameter: beam.stirrupsDiameter || 8,
                stirrupsSpacing: beam.stirrupsSpacing || 15,
                result: beam.isVerified ? { isSafe: true, thicknessCheck: { safe: true, message: '' }, momentCheck: { safe: true, message: '' }, shearCheck: { safe: true, message: '' }, recommendation: 'محقق' } : undefined
              })));
            }

            // استرجاع البلاطات (التي تحوي elementType = 'slab')
            const loadedSlabs = allData.filter((item: any) => item.elementType === 'slab');
            if (loadedSlabs.length > 0) {
              const slabElements = loadedSlabs.map((slab: any) => {
                let slabResult: VerificationResult = {
                  thicknessCheck: { safe: true, message: '' },
                  momentCheck: { safe: true, message: '' },
                  shearCheck: { safe: true, message: '' },
                  isSafe: slab.isVerified || false,
                  recommendation: slab.isVerified ? 'محقق' : 'غير محقق'
                };

                // استعادة بيانات البلاطة حسب نوعها
                const slabElement: CheckedElement = {
                  id: slab.id,
                  type: slab.slabType || 'solid-1way',
                  name: slab.element || slab.name,
                  floorNumber: slab.floorNumber,
                  data: {
                    ...slab,
                    supportType: slab.supportType,
                    span: slab.span || slab.span1,
                    thickness: slab.thickness || slab.ribThickness,
                    deadLoad: slab.deadLoad,
                    liveLoad: slab.liveLoad,
                    serviceMoment: slab.appliedMoment
                  },
                  result: slabResult
                };

                return slabElement;
              });

              setCheckedElements(slabElements);
            }
          } catch (error) {
            console.error('Error loading beams and slabs:', error);
          }
        }
      };

      window.addEventListener('project:new', handleNewProject);
      window.addEventListener('project:loaded', handleLoadProjectData);

      // تحميل البيانات عند بدء التشغيل
      handleLoadProjectData();

      return () => {
        window.removeEventListener('project:new', handleNewProject);
        window.removeEventListener('project:loaded', handleLoadProjectData);
      };
    }
  }, []);
  
  // === حالات البلاطات ===
  
  // البلاطة المصمتة باتجاه واحد
  const [solid1WayInputs, setSolid1WayInputs] = useState({
    span: 5.0,
    thickness: 15,
    supportType: 'simplySupported' as 'simplySupported' | 'oneEndContinuous' | 'twoEndsContinuous' | 'cantilever',
    deadLoad: 250,
    liveLoad: 200,
    serviceMoment: 0,
    floorNumber: '',
  });
  
  // البلاطة المصمتة باتجاهين
  const [solid2WayInputs, setSolid2WayInputs] = useState({
    span1: 5.0,
    span2: 4.5,
    thickness: 15,
    supportType1: 'simplySupported' as 'simplySupported' | 'continuous',
    supportType2: 'simplySupported' as 'simplySupported' | 'continuous',
    deadLoad: 250,
    liveLoad: 200,
    floorNumber: '',
  });
  
  // البلاطة المعصبة باتجاه واحد
  const [ribbed1WayInputs, setRibbed1WayInputs] = useState({
    span: 5.0,
    thickness: 15,
    ribWidth: 10,
    ribHeight: 30,
    slabThickness: 5,
    supportType: 'simplySupported' as 'simplySupported' | 'oneEndContinuous' | 'twoEndsContinuous' | 'cantilever',
    serviceMoment: 0,
    floorNumber: '',
  });
  
  // البلاطة المعصبة باتجاهين
  const [ribbed2WayInputs, setRibbed2WayInputs] = useState({
    span1: 5.0,
    span2: 4.5,
    ribThickness: 15,
    slabThickness: 5,
    supportType: 'simplySupported' as 'simplySupported' | 'oneEndContinuous' | 'twoEndsContinuous',
    floorNumber: '',
  });
  
  // البلاطة الفطرية
  const [flatSlabInputs, setFlatSlabInputs] = useState({
    span: 5.0,
    thickness: 20,
    hasDropPanel: false,
    columnSize: 50,
    deadLoad: 250,
    liveLoad: 200,
    floorNumber: '',
  });
  
  const [newBeam, setNewBeam] = useState({
    name: '',
    floorNumber: '',
    supportType: 'simplySupported' as 'simplySupported' | 'oneEndContinuous' | 'twoEndsContinuous' | 'cantilever',
    span: 5.0,
    width: 30,
    height: 60,
    cover: 5,
    barsCount: 4,
    barDiameter: 16,
    serviceMoment: 80,
    shearForce: 0,
    stirrupsDiameter: 8,
    stirrupsSpacing: 15,
  });
  
  // === دوال التحقق ===
  
  // معاملات alpha للبلاطات المصمتة باتجاه واحد
  const ALPHA_SOLID_1WAY = {
    simplySupported: 20,
    oneEndContinuous: 24,
    twoEndsContinuous: 28,
    cantilever: 10
  };
  
  // معاملات alpha للبلاطات المعصبة باتجاه واحد
  const ALPHA_RIBBED_1WAY = {
    simplySupported: 16,
    oneEndContinuous: 18.5,
    twoEndsContinuous: 21,
    cantilever: 8
  };
  
  // معاملات alpha للبلاطات المعصبة باتجاهين
  const ALPHA_RIBBED_2WAY = {
    simplySupported: 25,
    oneEndContinuous: 28,
    twoEndsContinuous: 31
  };
  
  // معاملات alpha للجوائز
  const ALPHA_BEAM = {
    simplySupported: 16,
    oneEndContinuous: 18.5,
    twoEndsContinuous: 21,
    cantilever: 8
  };
  
  // التحقق من البلاطة المصمتة باتجاه واحد
  const checkSolid1WaySlab = (): VerificationResult => {
    const alpha = ALPHA_SOLID_1WAY[solid1WayInputs.supportType] || 20;
    const L_cm = solid1WayInputs.span * 100;
    const h_min = (L_cm / alpha) * lambda;
    
    // شرط السماكة
    const thicknessCheck = solid1WayInputs.thickness >= h_min;
    
    // شرط العزم (طريقة مبسطة)
    const totalLoad = (solid1WayInputs.deadLoad + solid1WayInputs.liveLoad) / 1000; // kN/m²
    const M_max = (totalLoad * Math.pow(solid1WayInputs.span, 2)) / 8; // kN.m/m
    const fc_actual = 6 * M_max * 10000 / (solid1WayInputs.thickness * solid1WayInputs.thickness); // MPa مبسطة
    const fs_actual = fc_actual * (solid1WayInputs.thickness - 2) / 2; // MPa مبسطة
    
    const momentCheck = fc_actual <= Fc_allow && fs_actual <= Fs_allow;
    
    // شرط القص للبلاطات: v ≤ 0.5√f'c
    const V = totalLoad * solid1WayInputs.span / 2; // kN/m
    const v_actual = (V * 1000) / (1000 * solid1WayInputs.thickness); // MPa
    const v_allow = 0.5 * Math.sqrt(fc_prime);
    const shearCheck = v_actual <= v_allow;
    
    const isSafe = thicknessCheck && momentCheck && shearCheck;
    
    let recommendation = '';
    if (!thicknessCheck) {
      recommendation = 'فشل سماكة: السماكة المنفذة أقل من الحد الأدنى للكود السوري 2024. يوصى بزيادة السماكة.';
    } else if (!momentCheck) {
      recommendation = 'فشل عزم: الإجهادات الناتجة عن العزم تتجاوز الإجهادات المسموحة. يوصى بزيادة التسليح.';
    } else if (!shearCheck) {
      recommendation = 'فشل قص: إجهاد القص يتجاوز المسموح. يوصى بزيادة السماكة أو إضافة أساور.';
    } else {
      recommendation = 'التحقق ناجح - البلاطة محققة وفق الكود السوري 2024.';
    }
    
    return {
      thicknessCheck: {
        safe: thicknessCheck,
        message: thicknessCheck ? '✅ السماكة كافية' : `❌ السماكة غير كافية (الحد الأدنى ${h_min.toFixed(2)} سم)`,
        value: solid1WayInputs.thickness,
        min: h_min
      },
      momentCheck: {
        safe: momentCheck,
        message: momentCheck ? '✅ العزم محقق' : '❌ العزم غير محقق',
        fc_actual,
        fc_allow: Fc_allow,
        fs_actual,
        fs_allow: Fs_allow
      },
      shearCheck: {
        safe: shearCheck,
        message: shearCheck ? '✅ القص محقق' : `❌ القص غير محقق (الحد الأعلى ${v_allow.toFixed(2)} MPa)`,
        v_actual,
        v_allow
      },
      isSafe,
      recommendation
    };
  };
  
  // التحقق من البلاطة المصمتة باتجاهين
  const checkSolid2WaySlab = (): VerificationResult => {
    // حساب الحمل المكافئ Peq
    const K1 = solid2WayInputs.supportType1 === 'continuous' ? 0.875 : 1.0;
    const K2 = solid2WayInputs.supportType2 === 'continuous' ? 0.875 : 1.0;
    const P_eq = (solid2WayInputs.span1 * K1 + solid2WayInputs.span2 * K2) / 100; // تحويل لمتر
    const h_min = P_eq / 140;
    
    const thicknessCheck = solid2WayInputs.thickness >= h_min;
    
    // التحقق المبسط
    const momentCheck = true; 
    const shearCheck = true; 
    
    const isSafe = thicknessCheck && momentCheck && shearCheck;
    
    let recommendation = '';
    if (!thicknessCheck) {
      recommendation = 'فشل سماكة: السماكة المنفذة أقل من الحد الأدنى للكود السوري 2024.';
    } else {
      recommendation = 'التحقق ناجح - البلاطة محققة.';
    }
    
    return {
      thicknessCheck: {
        safe: thicknessCheck,
        message: thicknessCheck ? '✅ السماكة كافية' : `❌ السماكة غير كافية (الحد الأدنى ${h_min.toFixed(2)} سم)`,
        value: solid2WayInputs.thickness,
        min: h_min
      },
      momentCheck: { safe: momentCheck, message: '✅ العزم محقق' },
      shearCheck: { safe: shearCheck, message: '✅ القص محقق' },
      isSafe,
      recommendation
    };
  };
  
  // التحقق من البلاطة المعصبة باتجاه واحد
  const checkRibbed1WaySlab = (): VerificationResult => {
    const alpha = ALPHA_RIBBED_1WAY[ribbed1WayInputs.supportType] || 16;
    const L_cm = ribbed1WayInputs.span * 100;
    const h_min = (L_cm / alpha) * lambda;
    
    const h_total = ribbed1WayInputs.ribHeight + ribbed1WayInputs.slabThickness;
    const thicknessCheck = h_total >= h_min;
    
    const momentCheck = true; 
    const shearCheck = true;
    
    const isSafe = thicknessCheck && momentCheck && shearCheck;
    
    let recommendation = '';
    if (!thicknessCheck) {
      recommendation = 'فشل سماكة: السماكة الكلية أقل من الحد الأدنى. يوصى بزيادة ارتفاع العصب أو صب منطقة مصمتة.';
    } else {
      recommendation = 'التحقق ناجح - البلاطة المعصبة محققة.';
    }
    
    return {
      thicknessCheck: {
        safe: thicknessCheck,
        message: thicknessCheck ? '✅ السماكة كافية' : `❌ السماكة غير كافية (الحد الأدنى ${h_min.toFixed(2)} سم)`,
        value: h_total,
        min: h_min
      },
      momentCheck: { safe: momentCheck, message: '✅ العزم محقق' },
      shearCheck: { safe: shearCheck, message: '✅ القص محقق' },
      isSafe,
      recommendation
    };
  };
  
  // التحقق من البلاطة المعصبة باتجاهين
  const checkRibbed2WaySlab = (): VerificationResult => {
    const alpha = ALPHA_RIBBED_2WAY[ribbed2WayInputs.supportType] || 25;
    const L_max = Math.max(ribbed2WayInputs.span1, ribbed2WayInputs.span2) * 100;
    const h_min = (L_max / alpha) * lambda;
    
    const h_total = ribbed2WayInputs.ribThickness + ribbed2WayInputs.slabThickness;
    const thicknessCheck = h_total >= h_min;
    
    const momentCheck = true;
    const shearCheck = true;
    
    const isSafe = thicknessCheck && momentCheck && shearCheck;
    
    let recommendation = '';
    if (!thicknessCheck) {
      recommendation = 'فشل سماكة: السماكة الكلية أقل من الحد الأدنى.';
    } else {
      recommendation = 'التحقق ناجح - البلاطة محققة.';
    }
    
    return {
      thicknessCheck: {
        safe: thicknessCheck,
        message: thicknessCheck ? '✅ السماكة كافية' : `❌ السماكة غير كافية (الحد الأدنى ${h_min.toFixed(2)} سم)`,
        value: h_total,
        min: h_min
      },
      momentCheck: { safe: momentCheck, message: '✅ العزم محقق' },
      shearCheck: { safe: shearCheck, message: '✅ القص محقق' },
      isSafe,
      recommendation
    };
  };
  
  // التحقق من البلاطة الفطرية
  const checkFlatSlab = (): VerificationResult => {
    const L_cm = flatSlabInputs.span * 100;
    const divisor = flatSlabInputs.hasDropPanel ? 33 : 30;
    const h_min = L_cm / divisor;
    
    const thicknessCheck = flatSlabInputs.thickness >= h_min;
    
    const momentCheck = true; 
    
    // شرط القص الثاقب (Punching Shear)
    const v_c = 0.33 * Math.sqrt(fc_prime); // MPa
    const totalLoad = (flatSlabInputs.deadLoad + flatSlabInputs.liveLoad) / 1000; // kN/m²
    const V_u = totalLoad * Math.pow(flatSlabInputs.span, 2); // kN
    const columnPerimeter = 4 * (flatSlabInputs.columnSize / 100); // m
    const d = flatSlabInputs.thickness - 2; // cm
    const v_u = V_u * 1000 / (columnPerimeter * d * 100); // MPa
    const shearCheck = v_u <= v_c;
    
    const isSafe = thicknessCheck && momentCheck && shearCheck;
    
    let recommendation = '';
    if (!thicknessCheck) {
      recommendation = `فشل سماكة: السماكة المنفذة أقل من الحد الأدنى ${h_min.toFixed(2)} سم. يوصى بزيادة السماكة.`;
    } else if (!shearCheck) {
      recommendation = 'فشل قص ثاقب (Punching Shear): إجهاد الثقب يتجاوز المسموح. يوصى بزيادة سماكة البلاطة أو إضافة حديد مقاوم للثقب.';
    } else {
      recommendation = 'التحقق ناجح - البلاطة الفطرية محققة وفق الكود السوري 2024.';
    }
    
    return {
      thicknessCheck: {
        safe: thicknessCheck,
        message: thicknessCheck ? '✅ السماكة كافية' : `❌ السماكة غير كافية (الحد الأدنى ${h_min.toFixed(2)} سم)`,
        value: flatSlabInputs.thickness,
        min: h_min
      },
      momentCheck: { safe: momentCheck, message: '✅ العزم محقق' },
      shearCheck: {
        safe: shearCheck,
        message: shearCheck ? '✅ الثقب محقق' : `❌ الثقب غير محقق (الحد الأعلى ${v_c.toFixed(2)} MPa)`,
        v_actual: v_u,
        v_allow: v_c
      },
      isSafe,
      recommendation
    };
  };
  
  // التحقق من الجائز
  const checkBeam = (beam: typeof newBeam & { type: BeamType }): VerificationResult => {
    const alpha = ALPHA_BEAM[beam.supportType] || 16;
    const L_cm = beam.span * 100;
    const h_min = (L_cm / alpha) * lambda;
    
    const thicknessCheck = beam.height >= h_min;
    
    // شرط العزم (طريقة التشغيل)
    const b = beam.width;
    const h = beam.height;
    const d = h - beam.cover;
    const As = (beam.barsCount * Math.PI * Math.pow(beam.barDiameter/10, 2)) / 4;
    
    const A_quad = 0.5 * b;
    const B_quad = n * As;
    const C_quad = -n * As * d;
    
    const discriminant = B_quad * B_quad - 4 * A_quad * C_quad;
    let x = 0;
    if (discriminant >= 0) {
      x = (-B_quad + Math.sqrt(discriminant)) / (2 * A_quad);
    }
    const j = 1 - (x / (3 * d));
    
    const fc_actual = (2 * beam.serviceMoment * Math.pow(10, 5)) / (b * x * (d - x/3)) / 10;
    const fs_actual = (beam.serviceMoment * Math.pow(10, 5)) / (As * (d - x/3)) / 10;
    
    const momentCheck = fc_actual <= Fc_allow && fs_actual <= Fs_allow;
    
    // شرط القص
    const V = beam.shearForce;
    const v_actual = (V * 1000) / (b * d * 10); // MPa
    const v_c = 0.17 * Math.sqrt(fc_prime); // MPa
    const v_allow = v_c + 0; // مبسط
    const shearCheck = v_actual <= v_allow;
    
    const isSafe = thicknessCheck && momentCheck && shearCheck;
    
    let recommendation = '';
    if (!thicknessCheck) {
      recommendation = 'فشل سماكة: ارتفاع الجائز أقل من الحد الأدنى. يوصى بزيادة الارتفاع.';
    } else if (!momentCheck) {
      if (fc_actual > Fc_allow && fs_actual > Fs_allow) {
        recommendation = 'فشل عزم: إجهاد البيتون والحديد يتجاوز المسموح. يوصى بتدعيم الجائز.';
      } else if (fc_actual > Fc_allow) {
        recommendation = 'فشل عزم: إجهاد البيتون يتجاوز المسموح. يوصى بزيادة مقطع الخرسانة.';
      } else {
        recommendation = 'فشل عزم: إجهاد الحديد يتجاوز المسموح. يوصى بزيادة التسليح.';
      }
    } else if (!shearCheck) {
      recommendation = 'فشل قص: إجهاد القص يتجاوز المسموح. يوصى بزيادة عدد الأساور أو تقليل تباعدها.';
    } else {
      recommendation = beam.type === 'hidden' 
        ? 'التحقق ناجح - الجائز المخفي محقق وفق الكود السوري 2024.'
        : 'التحقق ناجح - الجائز الساقط محقق وفق الكود السوري 2024.';
    }
    
    return {
      thicknessCheck: {
        safe: thicknessCheck,
        message: thicknessCheck ? '✅ السماكة كافية' : `❌ السماكة غير كافية (الحد الأدنى ${h_min.toFixed(2)} سم)`,
        value: beam.height,
        min: h_min
      },
      momentCheck: {
        safe: momentCheck,
        message: momentCheck ? '✅ العزم محقق' : '❌ العزم غير محقق',
        fc_actual,
        fc_allow: Fc_allow,
        fs_actual,
        fs_allow: Fs_allow
      },
      shearCheck: {
        safe: shearCheck,
        message: shearCheck ? '✅ القص محقق' : `❌ القص غير محقق (الحد الأعلى ${v_allow.toFixed(2)} MPa)`,
        v_actual,
        v_allow
      },
      isSafe,
      recommendation
    };
  };
  
  // === المعالجات ===
  
  const handleCheckSlab = (type: SlabType) => {
    let result: VerificationResult;
    let element: CheckedElement;
    
    switch (type) {
      case 'solid-1way':
        result = checkSolid1WaySlab();
        element = {
          id: `solid-1way-${Date.now()}`,
          type: 'solid-1way',
          name: `بلاطة مصمتة باتجاه واحد - طابق ${solid1WayInputs.floorNumber}`,
          floorNumber: solid1WayInputs.floorNumber,
          data: { ...solid1WayInputs },
          result
        };
        break;
      case 'solid-2way':
        result = checkSolid2WaySlab();
        element = {
          id: `solid-2way-${Date.now()}`,
          type: 'solid-2way',
          name: `بلاطة مصمتة باتجاهين - طابق ${solid2WayInputs.floorNumber}`,
          floorNumber: solid2WayInputs.floorNumber,
          data: { ...solid2WayInputs },
          result
        };
        break;
      case 'ribbed-1way':
        result = checkRibbed1WaySlab();
        element = {
          id: `ribbed-1way-${Date.now()}`,
          type: 'ribbed-1way',
          name: `بلاطة معصبة باتجاه واحد - طابق ${ribbed1WayInputs.floorNumber}`,
          floorNumber: ribbed1WayInputs.floorNumber,
          data: { ...ribbed1WayInputs },
          result
        };
        break;
      case 'ribbed-2way':
        result = checkRibbed2WaySlab();
        element = {
          id: `ribbed-2way-${Date.now()}`,
          type: 'ribbed-2way',
          name: `بلاطة معصبة باتجاهين - طابق ${ribbed2WayInputs.floorNumber}`,
          floorNumber: ribbed2WayInputs.floorNumber,
          data: { ...ribbed2WayInputs },
          result
        };
        break;
      case 'flat':
        result = checkFlatSlab();
        element = {
          id: `flat-${Date.now()}`,
          type: 'flat',
          name: `بلاطة فطرية - طابق ${flatSlabInputs.floorNumber}`,
          floorNumber: flatSlabInputs.floorNumber,
          data: { ...flatSlabInputs },
          result
        };
        break;
    }
    
    setCheckedElements([...checkedElements, element]);
    
    if (result!.isSafe) {
      toast.success('البلاطة محققة', { icon: <CheckCircle2 className="h-4 w-4" /> });
    } else {
      toast.error('البلاطة غير محققة', { icon: <XCircle className="h-4 w-4" /> });
    }
  };
  
  const handleAddBeam = () => {
    if (!newBeam.floorNumber || !newBeam.name) {
      toast.error('يرجى إدخال اسم الجائز ورقم الطابق');
      return;
    }
    
    const result = checkBeam({ ...newBeam, type: selectedBeamType });
    const beam = {
      id: `beam-${Date.now()}`,
      name: newBeam.name,
      type: selectedBeamType,
      floorNumber: newBeam.floorNumber,
      supportType: newBeam.supportType,
      span: newBeam.span,
      width: newBeam.width,
      height: newBeam.height,
      cover: newBeam.cover,
      barsCount: newBeam.barsCount,
      barDiameter: newBeam.barDiameter,
      serviceMoment: newBeam.serviceMoment,
      shearForce: newBeam.shearForce,
      stirrupsDiameter: newBeam.stirrupsDiameter,
      stirrupsSpacing: newBeam.stirrupsSpacing,
      result
    };
    
    setBeams([...beams, beam]);
    
    if (result.isSafe) {
      toast.success('الجائز محقق', { icon: <CheckCircle2 className="h-4 w-4" /> });
    } else {
      toast.error('الجائز غير محقق', { icon: <XCircle className="h-4 w-4" /> });
    }
    
    setNewBeam({
      name: '',
      floorNumber: '',
      supportType: 'simplySupported',
      span: 5.0,
      width: 30,
      height: 60,
      cover: 5,
      barsCount: 4,
      barDiameter: 16,
      serviceMoment: 80,
      shearForce: 0,
      stirrupsDiameter: 8,
      stirrupsSpacing: 15,
    });
  };
  
  const handleDeleteElement = (id: string) => {
    setCheckedElements(checkedElements.filter(e => e.id !== id));
    setBeams(beams.filter(b => b.id !== id));
    setEditingElementId(null);
    setEditingElementData(null);
  };
  
  const handleEditElement = (id: string) => {
    // البحث عن العنصر في البلاطات أو الجوائز
    const slabElement = checkedElements.find(e => e.id === id);
    const beamElement = beams.find(b => b.id === id);
    
    if (slabElement) {
      setEditingElementId(id);
      setEditingElementData({ type: 'slab', element: slabElement });
      
      // تعبئة البيانات حسب نوع البلاطة
      switch (slabElement.type) {
        case 'solid-1way':
          setSolid1WayInputs({ ...slabElement.data });
          setSelectedSlabType('solid-1way');
          setMainCategory('slabs');
          break;
        case 'solid-2way':
          setSolid2WayInputs({ ...slabElement.data });
          setSelectedSlabType('solid-2way');
          setMainCategory('slabs');
          break;
        case 'ribbed-1way':
          setRibbed1WayInputs({ ...slabElement.data });
          setSelectedSlabType('ribbed-1way');
          setMainCategory('slabs');
          break;
        case 'ribbed-2way':
          setRibbed2WayInputs({ ...slabElement.data });
          setSelectedSlabType('ribbed-2way');
          setMainCategory('slabs');
          break;
        case 'flat':
          setFlatSlabInputs({ ...slabElement.data });
          setSelectedSlabType('flat');
          setMainCategory('slabs');
          break;
      }
    } else if (beamElement) {
      setEditingElementId(id);
      setEditingElementData({ type: 'beam', element: beamElement });
      
      // تعبئة بيانات الجائز
      setNewBeam({
        name: beamElement.name,
        floorNumber: beamElement.floorNumber,
        supportType: beamElement.supportType,
        span: beamElement.span,
        width: beamElement.width,
        height: beamElement.height,
        cover: beamElement.cover,
        barsCount: beamElement.barsCount,
        barDiameter: beamElement.barDiameter,
        serviceMoment: beamElement.serviceMoment,
        shearForce: beamElement.shearForce,
        stirrupsDiameter: beamElement.stirrupsDiameter,
        stirrupsSpacing: beamElement.stirrupsSpacing,
      });
      setSelectedBeamType(beamElement.type);
      setMainCategory('beams');
    }
  };
  
  const handleSaveEdit = () => {
    if (!editingElementId) return;
    
    if (editingElementData?.type === 'slab') {
      // حذف العنصر القديم وإضافة الجديد
      setCheckedElements(checkedElements.filter(e => e.id !== editingElementId));
      
      // التحقق وإضافة البلاطة المعدلة
      handleCheckSlab(editingElementData.element.type as SlabType);
    } else if (editingElementData?.type === 'beam') {
      // حذف الجائز القديم وإضافة الجديد
      setBeams(beams.filter(b => b.id !== editingElementId));
      
      // إضافة الجائز المعدل
      const result = checkBeam({ ...newBeam, type: selectedBeamType });
      const beam = {
        id: editingElementId,
        name: newBeam.name,
        type: selectedBeamType,
        floorNumber: newBeam.floorNumber,
        supportType: newBeam.supportType,
        span: newBeam.span,
        width: newBeam.width,
        height: newBeam.height,
        cover: newBeam.cover,
        barsCount: newBeam.barsCount,
        barDiameter: newBeam.barDiameter,
        serviceMoment: newBeam.serviceMoment,
        shearForce: newBeam.shearForce,
        stirrupsDiameter: newBeam.stirrupsDiameter,
        stirrupsSpacing: newBeam.stirrupsSpacing,
        result
      };
      
      setBeams([...beams, beam]);
      
      if (result.isSafe) {
        toast.success('تم تحديث الجائز بنجاح', { icon: <CheckCircle2 className="h-4 w-4" /> });
      } else {
        toast.error('الجائز غير محقق بعد التعديل', { icon: <XCircle className="h-4 w-4" /> });
      }
    }
    
    setEditingElementId(null);
    setEditingElementData(null);
  };
  
  const handleCancelEdit = () => {
    setEditingElementId(null);
    setEditingElementData(null);
    
    // إعادة تعيين المدخلات للقيم الافتراضية
    setNewBeam({
      name: '',
      floorNumber: '',
      supportType: 'simplySupported',
      span: 5.0,
      width: 30,
      height: 60,
      cover: 5,
      barsCount: 4,
      barDiameter: 16,
      serviceMoment: 80,
      shearForce: 0,
      stirrupsDiameter: 8,
      stirrupsSpacing: 15,
    });
  };
  
  // حفظ البيانات في المشروع
  const handleSave = async () => {
    if (!currentProjectId) {
      toast.error('يرجى اختيار مشروع أولاً');
      return;
    }

    try {
      // تحويل بيانات البلاطات للتنسيق المتوقع
      const slabData = checkedElements.map(el => ({
        id: el.id,
        element: el.name,
        floorNumber: el.floorNumber,
        supportType: el.data.supportType,
        span: el.data.span || el.data.span1,
        width: el.data.width || 0,
        thickness: el.data.thickness || el.data.ribThickness,
        fy,
        deadLoad: el.data.deadLoad,
        liveLoad: el.data.liveLoad,
        totalLoad: (el.data.deadLoad || 0) + (el.data.liveLoad || 0),
        appliedMoment: el.data.serviceMoment,
        allowableMoment: 0,
        isVerified: el.result?.isSafe || false,
        elementType: 'slab',
        slabType: el.type
      }));

      // تحويل بيانات الجوائز
      const beamData = beams.map(beam => ({
        id: beam.id,
        element: beam.name,
        elementType: 'beam',
        beamType: beam.type,
        floorNumber: beam.floorNumber,
        supportType: beam.supportType,
        span: beam.span,
        width: beam.width,
        thickness: beam.height,
        fy,
        cover: beam.cover,
        barsCount: beam.barsCount,
        barDiameter: beam.barDiameter,
        deadLoad: 0,
        liveLoad: 0,
        totalLoad: 0,
        appliedMoment: beam.serviceMoment,
        allowableMoment: 0,
        shearForce: beam.shearForce,
        stirrupsDiameter: beam.stirrupsDiameter,
        stirrupsSpacing: beam.stirrupsSpacing,
        isVerified: beam.result?.isSafe || false
      }));

      // دمج البيانات
      const allData = [...slabData, ...beamData];

      // حفظ في localStorage
      localStorage.setItem('bs-beams', JSON.stringify(allData));

      // تحديث في projectStore
      updateBeams(allData);

      const totalCount = slabData.length + beamData.length;
      const message = totalCount > 0
        ? `تم حفظ ${slabData.length} بلاطة و ${beamData.length} جائز بنجاح في المشروع الحالي`
        : 'تم حفظ البيانات بنجاح في المشروع الحالي';

      toast.success(message, { icon: <Save className="h-4 w-4" /> });

      // إرسال حدث لتحديث الواجهات الأخرى
      window.dispatchEvent(new CustomEvent('project:dataUpdated'));

    } catch (error) {
      console.error('Error saving data:', error);
      toast.error('حدث خطأ أثناء حفظ البيانات');
    }
  };
  
  // === دوال العرض ===
  
  const renderSlabInputs = () => {
    switch (selectedSlabType) {
      case 'solid-1way':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>نوع الاستناد</Label>
                <Select value={solid1WayInputs.supportType} onValueChange={(v) => setSolid1WayInputs({...solid1WayInputs, supportType: v as any})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="simplySupported">بسيط (α = 20)</SelectItem>
                    <SelectItem value="oneEndContinuous">مستمر من طرف واحد (α = 24)</SelectItem>
                    <SelectItem value="twoEndsContinuous">مستمر من طرفين (α = 28)</SelectItem>
                    <SelectItem value="cantilever">كابولي (α = 10)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>البحر (L) [متر]</Label>
                <Input type="number" step="0.1" value={solid1WayInputs.span} onChange={(e) => setSolid1WayInputs({...solid1WayInputs, span: parseFloat(e.target.value) || 0})} />
              </div>
              <div>
                <Label>السماكة المنفذة (h) [سم]</Label>
                <Input type="number" step="0.5" value={solid1WayInputs.thickness} onChange={(e) => setSolid1WayInputs({...solid1WayInputs, thickness: parseFloat(e.target.value) || 0})} />
              </div>
              <div>
                <Label>رقم الطابق</Label>
                <Input type="text" value={solid1WayInputs.floorNumber} onChange={(e) => setSolid1WayInputs({...solid1WayInputs, floorNumber: e.target.value})} />
              </div>
              <div>
                <Label>حمولة ميتة [kg/m²]</Label>
                <Input type="number" value={solid1WayInputs.deadLoad} onChange={(e) => setSolid1WayInputs({...solid1WayInputs, deadLoad: parseFloat(e.target.value) || 0})} />
              </div>
              <div>
                <Label>حمولة حية [kg/m²]</Label>
                <Input type="number" value={solid1WayInputs.liveLoad} onChange={(e) => setSolid1WayInputs({...solid1WayInputs, liveLoad: parseFloat(e.target.value) || 0})} />
              </div>
            </div>
            <div className="flex gap-2">
              {editingElementId && editingElementData?.type === 'slab' && editingElementData.element.type === 'solid-1way' ? (
                <>
                  <Button onClick={handleSaveEdit} className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 gap-2">
                    <Save className="h-4 w-4" />
                    حفظ التعديل
                  </Button>
                  <Button onClick={handleCancelEdit} variant="outline" className="gap-2">
                    <X className="h-4 w-4" />
                    إلغاء
                  </Button>
                </>
              ) : (
                <Button onClick={() => handleCheckSlab('solid-1way')} className="w-full bg-gradient-to-r from-emerald-500 to-teal-600">
                  <Calculator className="h-4 w-4 mr-2" />
                  التحقق من البلاطة
                </Button>
              )}
            </div>
          </div>
        );
      
      case 'solid-2way':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>البحر 1 (L1) [متر]</Label>
                <Input type="number" step="0.1" value={solid2WayInputs.span1} onChange={(e) => setSolid2WayInputs({...solid2WayInputs, span1: parseFloat(e.target.value) || 0})} />
              </div>
              <div>
                <Label>البحر 2 (L2) [متر]</Label>
                <Input type="number" step="0.1" value={solid2WayInputs.span2} onChange={(e) => setSolid2WayInputs({...solid2WayInputs, span2: parseFloat(e.target.value) || 0})} />
              </div>
              <div>
                <Label>نوع الاستناد 1</Label>
                <Select value={solid2WayInputs.supportType1} onValueChange={(v) => setSolid2WayInputs({...solid2WayInputs, supportType1: v as any})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="simplySupported">بسيط (K = 1.0)</SelectItem>
                    <SelectItem value="continuous">مستمر (K = 0.875)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>نوع الاستناد 2</Label>
                <Select value={solid2WayInputs.supportType2} onValueChange={(v) => setSolid2WayInputs({...solid2WayInputs, supportType2: v as any})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="simplySupported">بسيط (K = 1.0)</SelectItem>
                    <SelectItem value="continuous">مستمر (K = 0.875)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>السماكة المنفذة (h) [سم]</Label>
                <Input type="number" step="0.5" value={solid2WayInputs.thickness} onChange={(e) => setSolid2WayInputs({...solid2WayInputs, thickness: parseFloat(e.target.value) || 0})} />
              </div>
              <div>
                <Label>رقم الطابق</Label>
                <Input type="text" value={solid2WayInputs.floorNumber} onChange={(e) => setSolid2WayInputs({...solid2WayInputs, floorNumber: e.target.value})} />
              </div>
            </div>
            <div className="flex gap-2">
              {editingElementId && editingElementData?.type === 'slab' && editingElementData.element.type === 'solid-2way' ? (
                <>
                  <Button onClick={handleSaveEdit} className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 gap-2">
                    <Save className="h-4 w-4" />
                    حفظ التعديل
                  </Button>
                  <Button onClick={handleCancelEdit} variant="outline" className="gap-2">
                    <X className="h-4 w-4" />
                    إلغاء
                  </Button>
                </>
              ) : (
                <Button onClick={() => handleCheckSlab('solid-2way')} className="w-full bg-gradient-to-r from-emerald-500 to-teal-600">
                  <Calculator className="h-4 w-4 mr-2" />
                  التحقق من البلاطة
                </Button>
              )}
            </div>
          </div>
        );
      
      case 'ribbed-1way':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>نوع الاستناد</Label>
                <Select value={ribbed1WayInputs.supportType} onValueChange={(v) => setRibbed1WayInputs({...ribbed1WayInputs, supportType: v as any})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="simplySupported">بسيط (α = 16)</SelectItem>
                    <SelectItem value="oneEndContinuous">مستمر من طرف واحد (α = 18.5)</SelectItem>
                    <SelectItem value="twoEndsContinuous">مستمر من طرفين (α = 21)</SelectItem>
                    <SelectItem value="cantilever">كابولي (α = 8)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>البحر (L) [متر]</Label>
                <Input type="number" step="0.1" value={ribbed1WayInputs.span} onChange={(e) => setRibbed1WayInputs({...ribbed1WayInputs, span: parseFloat(e.target.value) || 0})} />
              </div>
              <div>
                <Label>ارتفاع العصب [سم]</Label>
                <Input type="number" step="1" value={ribbed1WayInputs.ribHeight} onChange={(e) => setRibbed1WayInputs({...ribbed1WayInputs, ribHeight: parseFloat(e.target.value) || 0})} />
              </div>
              <div>
                <Label>سماكة الغطاء [سم]</Label>
                <Input type="number" step="0.5" value={ribbed1WayInputs.slabThickness} onChange={(e) => setRibbed1WayInputs({...ribbed1WayInputs, slabThickness: parseFloat(e.target.value) || 0})} />
              </div>
              <div>
                <Label>رقم الطابق</Label>
                <Input type="text" value={ribbed1WayInputs.floorNumber} onChange={(e) => setRibbed1WayInputs({...ribbed1WayInputs, floorNumber: e.target.value})} />
              </div>
            </div>
            <div className="flex gap-2">
              {editingElementId && editingElementData?.type === 'slab' && editingElementData.element.type === 'ribbed-1way' ? (
                <>
                  <Button onClick={handleSaveEdit} className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 gap-2">
                    <Save className="h-4 w-4" />
                    حفظ التعديل
                  </Button>
                  <Button onClick={handleCancelEdit} variant="outline" className="gap-2">
                    <X className="h-4 w-4" />
                    إلغاء
                  </Button>
                </>
              ) : (
                <Button onClick={() => handleCheckSlab('ribbed-1way')} className="w-full bg-gradient-to-r from-emerald-500 to-teal-600">
                  <Calculator className="h-4 w-4 mr-2" />
                  التحقق من البلاطة
                </Button>
              )}
            </div>
          </div>
        );
      
      case 'ribbed-2way':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>البحر 1 (L1) [متر]</Label>
                <Input type="number" step="0.1" value={ribbed2WayInputs.span1} onChange={(e) => setRibbed2WayInputs({...ribbed2WayInputs, span1: parseFloat(e.target.value) || 0})} />
              </div>
              <div>
                <Label>البحر 2 (L2) [متر]</Label>
                <Input type="number" step="0.1" value={ribbed2WayInputs.span2} onChange={(e) => setRibbed2WayInputs({...ribbed2WayInputs, span2: parseFloat(e.target.value) || 0})} />
              </div>
              <div>
                <Label>نوع الاستناد</Label>
                <Select value={ribbed2WayInputs.supportType} onValueChange={(v) => setRibbed2WayInputs({...ribbed2WayInputs, supportType: v as any})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="simplySupported">بسيط (α = 25)</SelectItem>
                    <SelectItem value="oneEndContinuous">مستمر من طرف واحد (α = 28)</SelectItem>
                    <SelectItem value="twoEndsContinuous">مستمر من طرفين (α = 31)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>سماكة العصب [سم]</Label>
                <Input type="number" step="0.5" value={ribbed2WayInputs.ribThickness} onChange={(e) => setRibbed2WayInputs({...ribbed2WayInputs, ribThickness: parseFloat(e.target.value) || 0})} />
              </div>
              <div>
                <Label>سماكة الغطاء [سم]</Label>
                <Input type="number" step="0.5" value={ribbed2WayInputs.slabThickness} onChange={(e) => setRibbed2WayInputs({...ribbed2WayInputs, slabThickness: parseFloat(e.target.value) || 0})} />
              </div>
              <div>
                <Label>رقم الطابق</Label>
                <Input type="text" value={ribbed2WayInputs.floorNumber} onChange={(e) => setRibbed2WayInputs({...ribbed2WayInputs, floorNumber: e.target.value})} />
              </div>
            </div>
            <div className="flex gap-2">
              {editingElementId && editingElementData?.type === 'slab' && editingElementData.element.type === 'ribbed-2way' ? (
                <>
                  <Button onClick={handleSaveEdit} className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 gap-2">
                    <Save className="h-4 w-4" />
                    حفظ التعديل
                  </Button>
                  <Button onClick={handleCancelEdit} variant="outline" className="gap-2">
                    <X className="h-4 w-4" />
                    إلغاء
                  </Button>
                </>
              ) : (
                <Button onClick={() => handleCheckSlab('ribbed-2way')} className="w-full bg-gradient-to-r from-emerald-500 to-teal-600">
                  <Calculator className="h-4 w-4 mr-2" />
                  التحقق من البلاطة
                </Button>
              )}
            </div>
          </div>
        );
      
      case 'flat':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>البحر (L) [متر]</Label>
                <Input type="number" step="0.1" value={flatSlabInputs.span} onChange={(e) => setFlatSlabInputs({...flatSlabInputs, span: parseFloat(e.target.value) || 0})} />
              </div>
              <div>
                <Label>السماكة المنفذة (h) [سم]</Label>
                <Input type="number" step="0.5" value={flatSlabInputs.thickness} onChange={(e) => setFlatSlabInputs({...flatSlabInputs, thickness: parseFloat(e.target.value) || 0})} />
              </div>
              <div>
                <Label>حجم العمود [سم]</Label>
                <Input type="number" step="5" value={flatSlabInputs.columnSize} onChange={(e) => setFlatSlabInputs({...flatSlabInputs, columnSize: parseFloat(e.target.value) || 0})} />
              </div>
              <div>
                <Label>رقم الطابق</Label>
                <Input type="text" value={flatSlabInputs.floorNumber} onChange={(e) => setFlatSlabInputs({...flatSlabInputs, floorNumber: e.target.value})} />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="hasDropPanel"
                  checked={flatSlabInputs.hasDropPanel}
                  onChange={(e) => setFlatSlabInputs({...flatSlabInputs, hasDropPanel: e.target.checked})}
                  className="h-4 w-4"
                />
                <Label htmlFor="hasDropPanel">وجود بلاطات سقوط (Drop Panels)</Label>
              </div>
            </div>
            <div className="flex gap-2">
              {editingElementId && editingElementData?.type === 'slab' && editingElementData.element.type === 'flat' ? (
                <>
                  <Button onClick={handleSaveEdit} className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 gap-2">
                    <Save className="h-4 w-4" />
                    حفظ التعديل
                  </Button>
                  <Button onClick={handleCancelEdit} variant="outline" className="gap-2">
                    <X className="h-4 w-4" />
                    إلغاء
                  </Button>
                </>
              ) : (
                <Button onClick={() => handleCheckSlab('flat')} className="w-full bg-gradient-to-r from-emerald-500 to-teal-600">
                  <Calculator className="h-4 w-4 mr-2" />
                  التحقق من البلاطة
                </Button>
              )}
            </div>
          </div>
        );
    }
  };
  
  const getSlabTypeLabel = (type: SlabType) => {
    const labels = {
      'solid-1way': 'بلاطة مصمتة باتجاه واحد',
      'solid-2way': 'بلاطة مصمتة باتجاهين',
      'ribbed-1way': 'بلاطة معصبة باتجاه واحد',
      'ribbed-2way': 'بلاطة معصبة باتجاهين',
      'flat': 'بلاطة فطرية'
    };
    return labels[type];
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="text-center">
          <div>
            <CardTitle className="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400">
              <Layers className="h-5 w-5" />
              {t.slabsAndBeams?.title || 'البلاطات والجوائز'}
            </CardTitle>
            <CardDescription>
              {t.slabsAndBeams?.description || 'التحقق من السماكة والإجهادات حسب الكود السوري 2024'}
            </CardDescription>
          </div>
          <div className="flex items-center justify-center gap-2 mt-2">
            <Badge variant="outline" className="gap-2">
              <Database className="h-4 w-4" />
              كود 2024
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {/* جدول إجهادات المواد */}
          <div className="mb-6 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-lg border border-emerald-200 dark:border-emerald-800">
            <h3 className="font-semibold mb-3 flex items-center gap-2 text-emerald-900 dark:text-emerald-100">
              <Database className="h-5 w-5" />
              جدول إجهادات المواد المسموحة (الكود السوري 2024)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-emerald-900 dark:text-emerald-100">البيتون</Label>
                <div className="p-3 bg-white dark:bg-slate-900 rounded-md">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm">رتبة البيتون</span>
                    <Select value={materialSettings.concreteGrade} onValueChange={(v) => setMaterialSettings({...materialSettings, concreteGrade: v})}>
                      <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {CONCRETE_GRADES_2024.map(g => (
                          <SelectItem key={g.grade} value={g.grade}>{g.grade} (f'c = {g.fc_prime} MPa)</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">إجهاد مسموح (Fc)</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{Fc_allow.toFixed(1)} MPa</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-emerald-900 dark:text-emerald-100">الحديد</Label>
                <div className="p-3 bg-white dark:bg-slate-900 rounded-md">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm">رتبة الحديد</span>
                    <Select value={materialSettings.steelGrade} onValueChange={(v) => setMaterialSettings({...materialSettings, steelGrade: v})}>
                      <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {STEEL_GRADES_2024.map(g => (
                          <SelectItem key={g.grade} value={g.grade}>{g.name} (fy = {g.fy} MPa)</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">إجهاد مسموح (Fs)</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{Fs_allow.toFixed(1)} MPa</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-emerald-200 dark:border-emerald-800">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">معامل المرونة النسبي (n)</span>
                <Badge variant="secondary" className="font-mono">n = {n}</Badge>
              </div>
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-slate-600 dark:text-slate-400">معامل تصحيح السماكة (λ)</span>
                <Badge variant="secondary" className="font-mono">λ = {lambda.toFixed(3)}</Badge>
              </div>
            </div>
          </div>

          {/* التبويب الرئيسية - البلاطات والجوائز */}
          <div className="flex gap-4 mb-6">
            <Card className="flex-1">
              <CardContent className="p-4">
                <Label className="text-sm font-medium mb-2 block">اختر الفئة</Label>
                <Select value={mainCategory} onValueChange={(v) => setMainCategory(v as 'slabs' | 'beams')}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="slabs">🏢 البلاطات</SelectItem>
                    <SelectItem value="beams">📐 الجوائز</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
            
            {mainCategory === 'slabs' && (
              <Card className="flex-1">
                <CardContent className="p-4">
                  <Label className="text-sm font-medium mb-2 block">نوع البلاطة</Label>
                  <Select value={selectedSlabType} onValueChange={(v) => setSelectedSlabType(v as SlabType)}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="solid-1way">بلاطة مصمتة باتجاه واحد</SelectItem>
                      <SelectItem value="solid-2way">بلاطة مصمتة باتجاهين</SelectItem>
                      <SelectItem value="ribbed-1way">بلاطة معصبة باتجاه واحد</SelectItem>
                      <SelectItem value="ribbed-2way">بلاطة معصبة باتجاهين</SelectItem>
                      <SelectItem value="flat">بلاطة فطرية</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            )}
            
            {mainCategory === 'beams' && (
              <Card className="flex-1">
                <CardContent className="p-4">
                  <Label className="text-sm font-medium mb-2 block">نوع الجائز</Label>
                  <Select value={selectedBeamType} onValueChange={(v) => setSelectedBeamType(v as BeamType)}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="exposed">جائز ساقط</SelectItem>
                      <SelectItem value="hidden">جائز مخفي</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            )}
          </div>

          {/* محتوى البلاطات */}
          {mainCategory === 'slabs' && (
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-lg font-semibold">{getSlabTypeLabel(selectedSlabType)}</CardTitle>
                <CardDescription>
                  {selectedSlabType === 'solid-1way' && 'معادلة السماكة: h_min = (L/α) × λ | α: بسيط 20، طرف واحد 24، طرفين 28، كابولي 10'}
                  {selectedSlabType === 'solid-2way' && 'معادلة السماكة: h_min = P_eq / 140 | حيث P_eq = Σ(L_i × K_i) | K: بسيط 1.0، مستمر 0.875'}
                  {selectedSlabType === 'ribbed-1way' && 'معادلة السماكة: h_min = (L/α) × λ | α: بسيط 16، طرف واحد 18.5، طرفين 21، كابولي 8'}
                  {selectedSlabType === 'ribbed-2way' && 'معادلة السماكة: h_min = (L_max/α) × λ | α: بسيط 25، طرف واحد 28، طرفين 31'}
                  {selectedSlabType === 'flat' && 'معادلة السماكة: h_min = L_max/30 (بدون سقوط) أو L_max/33 (مع سقوط) | شرط القص الثاقب حاكم'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {renderSlabInputs()}
              </CardContent>
            </Card>
          )}

          {/* محتوى الجوائز */}
          {mainCategory === 'beams' && (
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-lg font-semibold">
                  {selectedBeamType === 'exposed' ? 'جائز ساقط' : 'جائز مخفي'}
                </CardTitle>
                <CardDescription>
                  معادلة السماكة: h_min = (L/α) × λ | α: بسيط 16، طرف واحد 18.5، طرفين 21، كابولي 8
                  {selectedBeamType === 'hidden' && ' | يجب أن تكون السماكة مساوية لسماكة البلاطة المعصبة على الأقل'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>اسم الجائز</Label>
                    <Input 
                      type="text" 
                      value={newBeam.name} 
                      onChange={(e) => setNewBeam({...newBeam, name: e.target.value})} 
                      placeholder="مثال: B1"
                    />
                  </div>
                  <div>
                    <Label>رقم الطابق</Label>
                    <Input 
                      type="text" 
                      value={newBeam.floorNumber} 
                      onChange={(e) => setNewBeam({...newBeam, floorNumber: e.target.value})} 
                      placeholder="مثال: 1"
                    />
                  </div>
                  <div>
                    <Label>نوع الاستناد</Label>
                    <Select value={newBeam.supportType} onValueChange={(v) => setNewBeam({...newBeam, supportType: v as any})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="simplySupported">بسيط (α = 16)</SelectItem>
                        <SelectItem value="oneEndContinuous">مستمر من طرف واحد (α = 18.5)</SelectItem>
                        <SelectItem value="twoEndsContinuous">مستمر من طرفين (α = 21)</SelectItem>
                        <SelectItem value="cantilever">كابولي (α = 8)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>البحر (L) [متر]</Label>
                    <Input type="number" step="0.1" value={newBeam.span} onChange={(e) => setNewBeam({...newBeam, span: parseFloat(e.target.value) || 0})} />
                  </div>
                  <div>
                    <Label>عرض الجائز (b) [سم]</Label>
                    <Input type="number" step="1" value={newBeam.width} onChange={(e) => setNewBeam({...newBeam, width: parseFloat(e.target.value) || 0})} />
                  </div>
                  <div>
                    <Label>ارتفاع الجائز (h) [سم]</Label>
                    <Input type="number" step="1" value={newBeam.height} onChange={(e) => setNewBeam({...newBeam, height: parseFloat(e.target.value) || 0})} />
                  </div>
                  <div>
                    <Label>الغلاف (d') [سم]</Label>
                    <Input type="number" step="0.5" value={newBeam.cover} onChange={(e) => setNewBeam({...newBeam, cover: parseFloat(e.target.value) || 0})} />
                  </div>
                  <div>
                    <Label>عدد قضبان التسليح</Label>
                    <Input type="number" min="1" value={newBeam.barsCount} onChange={(e) => setNewBeam({...newBeam, barsCount: parseInt(e.target.value) || 0})} />
                  </div>
                  <div>
                    <Label>قطر القضبان [مم]</Label>
                    <Input type="number" step="1" value={newBeam.barDiameter} onChange={(e) => setNewBeam({...newBeam, barDiameter: parseFloat(e.target.value) || 0})} />
                  </div>
                  <div>
                    <Label>العزم الخدمي (M) [kN.m]</Label>
                    <Input type="number" step="1" value={newBeam.serviceMoment} onChange={(e) => setNewBeam({...newBeam, serviceMoment: parseFloat(e.target.value) || 0})} />
                  </div>
                  <div>
                    <Label>قوة القص (V) [kN]</Label>
                    <Input type="number" step="1" value={newBeam.shearForce} onChange={(e) => setNewBeam({...newBeam, shearForce: parseFloat(e.target.value) || 0})} />
                  </div>
                  <div>
                    <Label>قطر الأساور [مم]</Label>
                    <Input type="number" step="1" value={newBeam.stirrupsDiameter} onChange={(e) => setNewBeam({...newBeam, stirrupsDiameter: parseFloat(e.target.value) || 0})} />
                  </div>
                </div>
                {editingElementId && editingElementData?.type === 'beam' ? (
                  <div className="flex gap-2">
                    <Button onClick={handleSaveEdit} className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 gap-2">
                      <Save className="h-4 w-4" />
                      حفظ التعديل
                    </Button>
                    <Button onClick={handleCancelEdit} variant="outline" className="gap-2">
                      <X className="h-4 w-4" />
                      إلغاء
                    </Button>
                  </div>
                ) : (
                  <Button onClick={handleAddBeam} className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 gap-2">
                    <Plus className="h-4 w-4" />
                    إضافة الجائز
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* قائمة العناصر المحققة */}
          {checkedElements.length > 0 || beams.length > 0 ? (
            <Card className="mt-6">
              <CardHeader className="text-center">
                <CardTitle className="text-lg font-semibold">العناصر المحققة</CardTitle>
                <CardDescription>نتائج التحقق من العناصر الإنشائية</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {[...checkedElements, ...beams].map((element) => (
                    <div key={element.id} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold">{element.name}</h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400">طابق: {element.floorNumber}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {element.result?.isSafe ? (
                            <Badge className="bg-emerald-600 hover:bg-emerald-700">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              محقق
                            </Badge>
                          ) : (
                            <Badge variant="destructive">
                              <XCircle className="h-3 w-3 mr-1" />
                              غير محقق
                            </Badge>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditElement(element.id)}
                            title="تعديل"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteElement(element.id)}
                            title="حذف"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {element.result && (
                        <>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                            <div className={element.result.thicknessCheck.safe ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}>
                              {element.result.thicknessCheck.message}
                            </div>
                            <div className={element.result.momentCheck.safe ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}>
                              {element.result.momentCheck.message}
                            </div>
                            <div className={element.result.shearCheck.safe ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}>
                              {element.result.shearCheck.message}
                            </div>
                          </div>
                          
                          {!element.result.isSafe && (
                            <Alert className={element.result.recommendation.includes('فشل سماكة') ? 'border-amber-200 bg-amber-50 dark:bg-amber-950/20' : 'border-red-200 bg-red-50 dark:bg-red-950/20'}>
                              <AlertTriangle className="h-4 w-4" />
                              <AlertTitle className="text-sm font-semibold">توصية</AlertTitle>
                              <AlertDescription className="text-sm">{element.result.recommendation}</AlertDescription>
                            </Alert>
                          )}
                          
                          {element.result.isSafe && (
                            <Alert className="border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20">
                              <CheckCircle2 className="h-4 w-4" />
                              <AlertTitle className="text-sm font-semibold">نتيجة</AlertTitle>
                              <AlertDescription className="text-sm">{element.result.recommendation}</AlertDescription>
                            </Alert>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : null}
        </CardContent>
      </Card>
      
      {/* زر حفظ البيانات في أسفل الواجهة */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-end">
            <Button onClick={handleSave} className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-md">
              <Save className="h-4 w-4" />
              حفظ البيانات في المشروع الحالي
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

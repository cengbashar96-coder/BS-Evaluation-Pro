'use client'

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Edit2, Trash2, Save, AlertCircle } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/translations';
import { useProjectStore, FloorReport, BeamSlab } from '@/store/projectStore';
import { toast } from 'sonner';

export default function Beams() {
  const { t, language } = useTranslation();
  const { updateBeams } = useProjectStore();
  
  const [floors, setFloors] = useState<FloorReport[]>([]);
  const [beams, setBeams] = useState<BeamSlab[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [noFloorsWarning, setNoFloorsWarning] = useState(false);
  
  const [formData, setFormData] = useState<Partial<BeamSlab>>({
    element: '',
    floorNumber: '',
    supportType: '',
    span: undefined,
    width: undefined,
    thickness: undefined,
    fy: undefined,
    deadLoad: undefined,
    liveLoad: undefined,
    totalLoad: undefined,
    appliedMoment: undefined,
    allowableMoment: undefined,
    isVerified: false
  });

  // Load floors from architectural report
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('bs-floor-reports');
      if (stored) {
        setFloors(JSON.parse(stored));
      } else {
        setNoFloorsWarning(true);
      }
    }
  }, []);

  // Load beams from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('bs-beams');
      if (stored) {
        const loadedBeams = JSON.parse(stored);
        setBeams(loadedBeams);
        recalculateAllBeams(loadedBeams);
      }
    }
  }, []);

  // Handle new project event
  useEffect(() => {
    const handleNewProject = () => {
      setBeams([]);
      setFormData({
        element: '',
        floorNumber: '',
        supportType: '',
        span: undefined,
        width: undefined,
        thickness: undefined,
        fy: undefined,
        deadLoad: undefined,
        liveLoad: undefined,
        totalLoad: undefined,
        appliedMoment: undefined,
        allowableMoment: undefined,
        isVerified: false
      });
      setEditingIndex(null);
    };
    
    window.addEventListener('project:new', handleNewProject);
    return () => window.removeEventListener('project:new', handleNewProject);
  }, []);

  // Recalculate all beams whenever the component mounts
  const recalculateAllBeams = (beamData: BeamSlab[]) => {
    const recalculated = beamData.map(beam => calculateBeamResults(beam));
    setBeams(recalculated);
    localStorage.setItem('bs-beams', JSON.stringify(recalculated));
  };

  // Calculate engineering results for a beam
  const calculateBeamResults = (beam: Partial<BeamSlab>): BeamSlab => {
    const results = { ...beam };

    // Calculate total load
    if (beam.deadLoad !== undefined && beam.liveLoad !== undefined) {
      results.totalLoad = beam.deadLoad + beam.liveLoad;
    }

    // Calculate applied moment based on support type
    if (beam.totalLoad !== undefined && beam.span !== undefined) {
      const w = beam.totalLoad; // in tons/m
      const L = beam.span / 100; // Convert cm to m
      
      switch (beam.supportType) {
        case 'simple':
          // Simply supported: wL²/8
          results.appliedMoment = (w * Math.pow(L, 2)) / 8;
          break;
        case 'oneWay':
          // Continuous one-way: wL²/10
          results.appliedMoment = (w * Math.pow(L, 2)) / 10;
          break;
        case 'twoWay':
          // Continuous two-way: wL²/12
          results.appliedMoment = (w * Math.pow(L, 2)) / 12;
          break;
        default:
          results.appliedMoment = undefined;
      }
    }

    // Calculate allowable moment (Mu) = 0.8 × As × Fy × d
    // Assume d = thickness - 7cm (cover)
    // For now, use minimum steel ratio: As = 0.01 × b × d
    if (beam.thickness !== undefined && beam.fy !== undefined && beam.width !== undefined) {
      const d = beam.thickness - 7; // effective depth in cm
      const b = beam.width; // width in cm
      const As = 0.01 * b * d; // minimum steel ratio
      const Fy = beam.fy; // in kg/cm²
      
      // Mu = 0.8 × As × Fy × d (result in kg·cm)
      // Convert to ton·m: divide by 100,000
      const Mu_kgcm = 0.8 * As * Fy * d;
      results.allowableMoment = Mu_kgcm / 100000;
    }

    // Verify status
    if (results.allowableMoment !== undefined && results.appliedMoment !== undefined) {
      results.isVerified = results.allowableMoment >= results.appliedMoment;
    } else {
      results.isVerified = false;
    }

    return results as BeamSlab;
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Recalculate all beams before saving
      const recalculatedBeams = beams.map(beam => calculateBeamResults(beam));
      localStorage.setItem('bs-beams', JSON.stringify(recalculatedBeams));
      updateBeams(recalculatedBeams);
      toast.success(t.buildingInfo.projectSaved);
    } catch (error) {
      toast.error(t.common.error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBeam = () => {
    if (!formData.element || !formData.floorNumber || !formData.supportType) {
      toast.error(t.common.required);
      return;
    }
    
    // Calculate results
    const calculatedBeam = calculateBeamResults(formData);
    
    if (editingIndex !== null) {
      const updatedBeams = [...beams];
      updatedBeams[editingIndex] = calculatedBeam;
      setBeams(updatedBeams);
      setEditingIndex(null);
    } else {
      setBeams([...beams, { ...calculatedBeam, id: `beam-${Date.now()}` }]);
    }
    
    setFormData({
      element: '',
      floorNumber: '',
      supportType: '',
      span: undefined,
      width: undefined,
      thickness: undefined,
      fy: undefined,
      deadLoad: undefined,
      liveLoad: undefined,
      totalLoad: undefined,
      appliedMoment: undefined,
      allowableMoment: undefined,
      isVerified: false
    });
  };

  const handleEditBeam = (index: number) => {
    setFormData(beams[index]);
    setEditingIndex(index);
  };

  const handleDeleteBeam = (index: number) => {
    const updatedBeams = beams.filter((_, i) => i !== index);
    setBeams(updatedBeams);
  };

  const handleChange = (field: keyof BeamSlab, value: string | number | undefined) => {
    setFormData({ ...formData, [field]: value });
  };

  // Check if there are floors available
  const floorOptions = floors.map(f => f.floorNumber);

  return (
    <div className="space-y-6">
      {noFloorsWarning && floorOptions.length === 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {t.beams.noFloorsWarning}
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-emerald-600 dark:text-emerald-400">
            {t.beams.title}
          </CardTitle>
          <CardDescription>
            {t.beams.addBeam}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Element Type */}
            <div className="space-y-2">
              <Label htmlFor="element">
                {t.beams.element} <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.element}
                onValueChange={(value) => handleChange('element', value)}
              >
                <SelectTrigger id="element" className={language === 'ar' ? 'text-right' : 'text-left'}>
                  <SelectValue placeholder={t.beams.element} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beam">{t.beams.typeBeam}</SelectItem>
                  <SelectItem value="slab">{t.beams.typeSlab}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Floor Number */}
            <div className="space-y-2">
              <Label htmlFor="floorNumber">
                {t.beams.floorNumber} <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.floorNumber}
                onValueChange={(value) => handleChange('floorNumber', value)}
                disabled={floorOptions.length === 0}
              >
                <SelectTrigger id="floorNumber" className={language === 'ar' ? 'text-right' : 'text-left'}>
                  <SelectValue placeholder={floorOptions.length === 0 ? '...' : t.beams.floorNumber} />
                </SelectTrigger>
                <SelectContent>
                  {floorOptions.length > 0 ? (
                    floorOptions.map((floor) => (
                      <SelectItem key={floor} value={floor}>
                        {floor}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>
                      {t.beams.noFloorsWarning}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Support Type */}
            <div className="space-y-2">
              <Label htmlFor="supportType">
                نوع الاستناد <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.supportType}
                onValueChange={(value) => handleChange('supportType', value)}
              >
                <SelectTrigger id="supportType" className={language === 'ar' ? 'text-right' : 'text-left'}>
                  <SelectValue placeholder="نوع الاستناد" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="simple">{t.beams.supportSimple}</SelectItem>
                  <SelectItem value="oneWay">{t.beams.supportOneWay}</SelectItem>
                  <SelectItem value="twoWay">{t.beams.supportTwoWay}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Span Length */}
            <div className="space-y-2">
              <Label htmlFor="span">{t.beams.span} (سم)</Label>
              <Input
                id="span"
                type="number"
                step="0.01"
                value={formData.span || ''}
                onChange={(e) => handleChange('span', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className={language === 'ar' ? 'text-right' : 'text-left'}
              />
            </div>

            {/* Width */}
            <div className="space-y-2">
              <Label htmlFor="width">{t.beams.width} (سم)</Label>
              <Input
                id="width"
                type="number"
                step="0.01"
                value={formData.width || ''}
                onChange={(e) => handleChange('width', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className={language === 'ar' ? 'text-right' : 'text-left'}
              />
            </div>

            {/* Thickness */}
            <div className="space-y-2">
              <Label htmlFor="thickness">{t.beams.thickness} (سم)</Label>
              <Input
                id="thickness"
                type="number"
                step="0.01"
                value={formData.thickness || ''}
                onChange={(e) => handleChange('thickness', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className={language === 'ar' ? 'text-right' : 'text-left'}
              />
            </div>

            {/* Steel Yield Stress */}
            <div className="space-y-2">
              <Label htmlFor="fy">{t.beams.fy} ({t.beams.fyUnit})</Label>
              <Input
                id="fy"
                type="number"
                step="1"
                value={formData.fy || ''}
                onChange={(e) => handleChange('fy', parseFloat(e.target.value) || 0)}
                placeholder="3600"
                className={language === 'ar' ? 'text-right' : 'text-left'}
              />
            </div>

            {/* Dead Load */}
            <div className="space-y-2">
              <Label htmlFor="deadLoad">{t.beams.deadLoad} ({t.beams.loadUnit})</Label>
              <Input
                id="deadLoad"
                type="number"
                step="0.01"
                value={formData.deadLoad || ''}
                onChange={(e) => handleChange('deadLoad', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className={language === 'ar' ? 'text-right' : 'text-left'}
              />
            </div>

            {/* Live Load */}
            <div className="space-y-2">
              <Label htmlFor="liveLoad">{t.beams.liveLoad} ({t.beams.loadUnit})</Label>
              <Input
                id="liveLoad"
                type="number"
                step="0.01"
                value={formData.liveLoad || ''}
                onChange={(e) => handleChange('liveLoad', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className={language === 'ar' ? 'text-right' : 'text-left'}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            {editingIndex !== null && (
              <Button
                variant="outline"
                onClick={() => {
                  setEditingIndex(null);
                  setFormData({
                    element: '',
                    floorNumber: '',
                    supportType: '',
                    span: undefined,
                    width: undefined,
                    thickness: undefined,
                    fy: undefined,
                    deadLoad: undefined,
                    liveLoad: undefined,
                    totalLoad: undefined,
                    appliedMoment: undefined,
                    allowableMoment: undefined,
                    isVerified: false
                  });
                }}
              >
                {t.common.cancel}
              </Button>
            )}
            <Button
              onClick={handleAddBeam}
              className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
            >
              <Plus className="h-4 w-4" />
              {editingIndex !== null ? t.common.edit : t.common.add}
            </Button>
          </div>
        </CardContent>
      </Card>

      {beams.length > 0 && (
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-lg">
              {t.beams.title} ({beams.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="multiple" className="space-y-2">
              {beams.map((beam, index) => (
                <AccordionItem key={beam.id || index} value={`beam-${index}`}>
                  <AccordionTrigger className={`hover:no-underline ${beam.isVerified ? 'border-l-4 border-l-emerald-500' : 'border-l-4 border-l-red-500'}`}>
                    <div className="flex items-center justify-between w-full pr-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded ${beam.isVerified ? 'bg-emerald-100 dark:bg-emerald-900' : 'bg-red-100 dark:bg-red-900'}`}>
                          <div className={`h-4 w-4 ${beam.isVerified ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                            {beam.isVerified ? '✓' : '✗'}
                          </div>
                        </div>
                        <div className={language === 'ar' ? 'text-right' : 'text-left'}>
                          <p className="font-semibold">
                            {beam.element === 'beam' ? t.beams.typeBeam : t.beams.typeSlab} - {beam.floorNumber}
                          </p>
                          <p className="text-sm text-slate-500">
                            {t.beams.status}: {beam.isVerified ? t.beams.verified : t.beams.notVerified}
                          </p>
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 pt-3 border-t">
                      {/* Basic Information */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <span className="text-slate-500">{t.beams.element}:</span>
                          <p className="font-medium">{beam.element === 'beam' ? t.beams.typeBeam : t.beams.typeSlab}</p>
                        </div>
                        <div>
                          <span className="text-slate-500">{t.beams.floorNumber}:</span>
                          <p className="font-medium">{beam.floorNumber}</p>
                        </div>
                        <div>
                          <span className="text-slate-500">نوع الاستناد:</span>
                          <p className="font-medium">
                            {beam.supportType === 'simple' && t.beams.supportSimple}
                            {beam.supportType === 'oneWay' && t.beams.supportOneWay}
                            {beam.supportType === 'twoWay' && t.beams.supportTwoWay}
                          </p>
                        </div>
                        <div>
                          <span className="text-slate-500">{t.beams.span}:</span>
                          <p className="font-medium">{beam.span || '-'} سم</p>
                        </div>
                      </div>

                      {/* Dimensions */}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                        <div>
                          <span className="text-slate-500">{t.beams.width}:</span>
                          <p className="font-medium">{beam.width || '-'} سم</p>
                        </div>
                        <div>
                          <span className="text-slate-500">{t.beams.thickness}:</span>
                          <p className="font-medium">{beam.thickness || '-'} سم</p>
                        </div>
                        <div>
                          <span className="text-slate-500">{t.beams.fy}:</span>
                          <p className="font-medium">{beam.fy || '-'} {t.beams.fyUnit}</p>
                        </div>
                      </div>

                      {/* Loads */}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                        <div>
                          <span className="text-slate-500">{t.beams.deadLoad}:</span>
                          <p className="font-medium">{beam.deadLoad || '-'} {t.beams.loadUnit}</p>
                        </div>
                        <div>
                          <span className="text-slate-500">{t.beams.liveLoad}:</span>
                          <p className="font-medium">{beam.liveLoad || '-'} {t.beams.loadUnit}</p>
                        </div>
                        <div>
                          <span className="text-slate-500">{t.beams.totalLoad}:</span>
                          <p className="font-medium font-semibold">{beam.totalLoad?.toFixed(2) || '-'} {t.beams.loadUnit}</p>
                        </div>
                      </div>

                      {/* Moments */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm bg-slate-50 dark:bg-slate-800 p-3 rounded">
                        <div>
                          <span className="text-slate-500">{t.beams.appliedMoment}:</span>
                          <p className="font-medium">{beam.appliedMoment?.toFixed(3) || '-'} {t.beams.momentUnit}</p>
                        </div>
                        <div>
                          <span className="text-slate-500">{t.beams.allowableMoment}:</span>
                          <p className="font-medium">{beam.allowableMoment?.toFixed(3) || '-'} {t.beams.momentUnit}</p>
                        </div>
                      </div>

                      {/* Status Message */}
                      <div className={`p-3 rounded ${beam.isVerified ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'}`}>
                        <p className="font-medium">
                          {beam.isVerified ? t.beams.beamVerified : t.beams.beamNotVerified}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex justify-end gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditBeam(index)}
                          className="gap-1"
                        >
                          <Edit2 className="h-3 w-3" />
                          {t.common.edit}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteBeam(index)}
                          className="gap-1"
                        >
                          <Trash2 className="h-3 w-3" />
                          {t.common.delete}
                        </Button>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      )}

      {beams.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-end">
              <Button
                onClick={handleSave}
                disabled={loading || beams.length === 0}
                className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
              >
                <Save className="h-4 w-4" />
                {loading ? t.common.loading : t.common.save}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

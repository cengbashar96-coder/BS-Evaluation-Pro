'use client'

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Plus, Edit2, Trash2, Save, Layers } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/translations';
import { useProjectStore, FloorReport } from '@/store/projectStore';
import { toast } from 'sonner';

export default function ArchitecturalReport() {
  const { t, language } = useTranslation();
  const { updateFloorReports } = useProjectStore();
  
  const [floors, setFloors] = useState<FloorReport[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState<FloorReport>({
    floorNumber: '',
    floorArea: undefined,
    projectionArea: undefined,
    elevation: undefined,
    notes: '',
    observations: ''
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('bs-floor-reports');
      if (stored) {
        setFloors(JSON.parse(stored));
      }
    }
  }, []);

  useEffect(() => {
    window.addEventListener('project:new', () => {
      setFloors([]);
      setFormData({
        floorNumber: '',
        floorArea: undefined,
        projectionArea: undefined,
        elevation: undefined,
        notes: '',
        observations: ''
      });
    });
    return () => window.removeEventListener('project:new', () => {});
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      localStorage.setItem('bs-floor-reports', JSON.stringify(floors));
      updateFloorReports(floors);
      toast.success(t.buildingInfo.projectSaved);
    } catch (error) {
      toast.error(t.common.error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFloor = () => {
    if (!formData.floorNumber) {
      toast.error(t.common.required);
      return;
    }
    
    if (editingIndex !== null) {
      const updatedFloors = [...floors];
      updatedFloors[editingIndex] = formData;
      setFloors(updatedFloors);
      setEditingIndex(null);
    } else {
      setFloors([...floors, { ...formData, id: `floor-${Date.now()}` }]);
    }
    
    setFormData({
      floorNumber: '',
      floorArea: undefined,
      projectionArea: undefined,
      elevation: undefined,
      notes: '',
      observations: ''
    });
  };

  const handleEditFloor = (index: number) => {
    setFormData(floors[index]);
    setEditingIndex(index);
  };

  const handleDeleteFloor = (index: number) => {
    const updatedFloors = floors.filter((_, i) => i !== index);
    setFloors(updatedFloors);
  };

  const handleChange = (field: keyof FloorReport, value: string | number | undefined) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400">
            <Layers className="h-5 w-5" />
            {t.architectural.title}
          </CardTitle>
          <CardDescription>
            {t.architectural.addFloor}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="floorNumber">
                {t.architectural.floorNumber} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="floorNumber"
                value={formData.floorNumber || ''}
                onChange={(e) => handleChange('floorNumber', e.target.value)}
                placeholder={t.architectural.floorNumber}
                className={language === 'ar' ? 'text-right' : 'text-left'}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="floorArea">{t.architectural.floorArea} (م²)</Label>
              <Input
                id="floorArea"
                type="number"
                step="0.01"
                value={formData.floorArea || ''}
                onChange={(e) => handleChange('floorArea', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className={language === 'ar' ? 'text-right' : 'text-left'}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="projectionArea">{t.architectural.projectionArea} (م²)</Label>
              <Input
                id="projectionArea"
                type="number"
                step="0.01"
                value={formData.projectionArea || ''}
                onChange={(e) => handleChange('projectionArea', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className={language === 'ar' ? 'text-right' : 'text-left'}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="elevation">{t.architectural.elevation} (م)</Label>
              <Input
                id="elevation"
                type="number"
                step="0.01"
                value={formData.elevation || ''}
                onChange={(e) => handleChange('elevation', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className={language === 'ar' ? 'text-right' : 'text-left'}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="notes">{t.architectural.notes}</Label>
              <Textarea
                id="notes"
                value={formData.notes || ''}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder={t.architectural.notes}
                rows={3}
                className={language === 'ar' ? 'text-right' : 'text-left'}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="observations">{t.architectural.observations}</Label>
              <Textarea
                id="observations"
                value={formData.observations || ''}
                onChange={(e) => handleChange('observations', e.target.value)}
                placeholder={t.architectural.observations}
                rows={3}
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
                    floorNumber: '',
                    floorArea: undefined,
                    projectionArea: undefined,
                    elevation: undefined,
                    notes: '',
                    observations: ''
                  });
                }}
              >
                {t.common.cancel}
              </Button>
            )}
            <Button
              onClick={handleAddFloor}
              className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
            >
              <Plus className="h-4 w-4" />
              {editingIndex !== null ? t.common.edit : t.common.add}
            </Button>
          </div>
        </CardContent>
      </Card>

      {floors.length > 0 && (
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-lg">
              {t.architectural.floorNumber} ({floors.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="multiple" className="space-y-2">
              {floors.map((floor, index) => (
                <AccordionItem key={floor.id || index} value={`floor-${index}`}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center justify-between w-full pr-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-emerald-100 dark:bg-emerald-900 p-2 rounded">
                          <Layers className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div className={language === 'ar' ? 'text-right' : 'text-left'}>
                          <p className="font-semibold">{floor.floorNumber}</p>
                          <p className="text-sm text-slate-500">
                            {floor.floorArea && `${t.architectural.floorArea}: ${floor.floorArea} م²`}
                          </p>
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 pt-3 border-t">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <span className="text-slate-500">{t.architectural.floorArea}:</span>
                          <p className="font-medium">{floor.floorArea || '-'} م²</p>
                        </div>
                        <div>
                          <span className="text-slate-500">{t.architectural.projectionArea}:</span>
                          <p className="font-medium">{floor.projectionArea || '-'} م²</p>
                        </div>
                        <div>
                          <span className="text-slate-500">{t.architectural.elevation}:</span>
                          <p className="font-medium">{floor.elevation || '-'} م</p>
                        </div>
                      </div>
                      {floor.notes && (
                        <div>
                          <span className="text-slate-500">{t.architectural.notes}:</span>
                          <p className="text-sm">{floor.notes}</p>
                        </div>
                      )}
                      {floor.observations && (
                        <div>
                          <span className="text-slate-500">{t.architectural.observations}:</span>
                          <p className="text-sm">{floor.observations}</p>
                        </div>
                      )}
                      <div className="flex justify-end gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditFloor(index)}
                          className="gap-1"
                        >
                          <Edit2 className="h-3 w-3" />
                          {t.common.edit}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteFloor(index)}
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

      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={loading || floors.length === 0}
              className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
            >
              <Save className="h-4 w-4" />
              {loading ? t.common.loading : t.common.save}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

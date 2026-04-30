'use client'

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Edit2, Trash2, Save, Upload, UserCheck, FileText } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/translations';
import { useProjectStore, Engineer } from '@/store/projectStore';
import { toast } from 'sonner';

export default function FinalReport() {
  const { t, language } = useTranslation();
  const { updateEngineers, setReportPurpose } = useProjectStore();

  const [engineers, setEngineers] = useState<Engineer[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [reportPurpose, setReportPurposeState] = useState<'additionalFloor' | 'violationSettlement' | 'currentStatus'>('currentStatus');
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<Engineer>({
    sequence: 1,
    specialty: '',
    name: '',
    unionNumber: '',
    signature: ''
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedEngineers = localStorage.getItem('bs-engineers');
      const storedPurpose = localStorage.getItem('bs-report-purpose');
      
      if (storedEngineers) {
        setEngineers(JSON.parse(storedEngineers));
      }
      
      if (storedPurpose) {
        setReportPurposeState(storedPurpose as any);
      }
    }
  }, []);

  useEffect(() => {
    const handleNewProject = () => {
      setEngineers([]);
      setReportPurposeState('currentStatus');
      setFormData({
        sequence: 1,
        specialty: '',
        name: '',
        unionNumber: '',
        signature: ''
      });
      setEditingIndex(null);
    };

    window.addEventListener('project:new', handleNewProject);
    return () => window.removeEventListener('project:new', handleNewProject);
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      localStorage.setItem('bs-engineers', JSON.stringify(engineers));
      localStorage.setItem('bs-report-purpose', reportPurpose);
      updateEngineers(engineers);
      setReportPurpose(reportPurpose);
      toast.success(t.buildingInfo.projectSaved);
    } catch (error) {
      toast.error(t.common.error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEngineer = () => {
    if (!formData.specialty || !formData.name || !formData.unionNumber) {
      toast.error(t.common.required);
      return;
    }

    if (editingIndex !== null) {
      const updatedEngineers = [...engineers];
      updatedEngineers[editingIndex] = formData;
      setEngineers(updatedEngineers);
      setEditingIndex(null);
    } else {
      const newSequence = engineers.length + 1;
      setEngineers([...engineers, { ...formData, id: `engineer-${Date.now()}`, sequence: newSequence }]);
    }

    setFormData({
      sequence: engineers.length + (editingIndex !== null ? 0 : 2),
      specialty: '',
      name: '',
      unionNumber: '',
      signature: ''
    });
  };

  const handleEditEngineer = (index: number) => {
    setFormData(engineers[index]);
    setEditingIndex(index);
  };

  const handleDeleteEngineer = (index: number) => {
    const updatedEngineers = engineers.filter((_, i) => i !== index);
    // Update sequence numbers
    const renumberedEngineers = updatedEngineers.map((eng, i) => ({
      ...eng,
      sequence: i + 1
    }));
    setEngineers(renumberedEngineers);
  };

  const handleChange = (field: keyof Engineer, value: string | number) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageData = reader.result as string;
        setFormData({ ...formData, signature: imageData });
      };
      reader.readAsDataURL(file);
    }
  };

  const getCertificateText = () => {
    switch (reportPurpose) {
      case 'additionalFloor':
        return t.final.additionalFloorCert;
      case 'violationSettlement':
        return t.final.violationCert;
      case 'currentStatus':
        return t.final.violationCert;
      default:
        return '';
    }
  };

  const specialties = [
    { value: 'معماري', label: 'معماري' },
    { value: 'إنشائي', label: 'إنشائي' },
    { value: 'كهربائي', label: 'كهربائي' },
    { value: 'صحي', label: 'صحي' },
    { value: 'مدني', label: 'مدني' }
  ];

  return (
    <div className="space-y-6">
      {/* Report Purpose Selection */}
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400">
            <FileText className="h-5 w-5" />
            {t.final.title}
          </CardTitle>
          <CardDescription>
            {t.final.reportPurpose}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reportPurpose">
                {t.final.reportPurpose} <span className="text-red-500">*</span>
              </Label>
              <Select
                value={reportPurpose}
                onValueChange={(value) => {
                  setReportPurposeState(value as any);
                  localStorage.setItem('bs-report-purpose', value);
                  setReportPurpose(value as any);
                }}
              >
                <SelectTrigger className={language === 'ar' ? 'text-right' : 'text-left'}>
                  <SelectValue placeholder={t.final.reportPurpose} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="additionalFloor">
                    {t.final.purposeAdditionalFloor}
                  </SelectItem>
                  <SelectItem value="violationSettlement">
                    {t.final.purposeViolationSettlement}
                  </SelectItem>
                  <SelectItem value="currentStatus">
                    {t.final.purposeCurrentStatus}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Certificate Text */}
          {reportPurpose && (
            <Card className="bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <p className="font-semibold text-lg text-emerald-800 dark:text-emerald-200">
                    {t.final.certificate}
                  </p>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {getCertificateText()}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Add Engineer Form */}
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400">
            <UserCheck className="h-5 w-5" />
            {t.final.addEngineer}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Sequence Number */}
            <div className="space-y-2">
              <Label htmlFor="sequence">
                {t.final.sequence}
              </Label>
              <Input
                id="sequence"
                type="number"
                min="1"
                value={formData.sequence}
                onChange={(e) => handleChange('sequence', parseInt(e.target.value) || 1)}
                disabled
                className="bg-slate-100 dark:bg-slate-800"
              />
            </div>

            {/* Specialty */}
            <div className="space-y-2">
              <Label htmlFor="specialty">
                {t.final.specialty} <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.specialty}
                onValueChange={(value) => handleChange('specialty', value)}
              >
                <SelectTrigger id="specialty" className={language === 'ar' ? 'text-right' : 'text-left'}>
                  <SelectValue placeholder={t.final.specialty} />
                </SelectTrigger>
                <SelectContent>
                  {specialties.map((spec) => (
                    <SelectItem key={spec.value} value={spec.value}>
                      {spec.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Engineer Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                {t.final.name} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder={t.final.name}
                className={language === 'ar' ? 'text-right' : 'text-left'}
              />
            </div>

            {/* Union Number */}
            <div className="space-y-2">
              <Label htmlFor="unionNumber">
                {t.final.unionNumber} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="unionNumber"
                value={formData.unionNumber || ''}
                onChange={(e) => handleChange('unionNumber', e.target.value)}
                placeholder={t.final.unionNumber}
                className={language === 'ar' ? 'text-right' : 'text-left'}
              />
            </div>

            {/* Signature Upload */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="signature">
                {t.final.signature}
              </Label>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:border-emerald-500 transition-colors cursor-pointer">
                    <input
                      type="file"
                      id="signature"
                      accept="image/*"
                      onChange={handleSignatureUpload}
                      className="hidden"
                    />
                    <label htmlFor="signature" className="cursor-pointer">
                      <Upload className="h-6 w-6 mx-auto mb-2 text-slate-400" />
                      <p className="text-sm text-slate-600">
                        {formData.signature ? t.common.upload : t.common.upload}
                      </p>
                    </label>
                  </div>
                </div>
                {formData.signature && (
                  <div className="w-32 h-20 rounded-lg overflow-hidden border shadow-sm bg-white">
                    <img
                      src={formData.signature}
                      alt={t.final.signature}
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            {editingIndex !== null && (
              <Button
                variant="outline"
                onClick={() => {
                  setEditingIndex(null);
                  setFormData({
                    sequence: engineers.length + 1,
                    specialty: '',
                    name: '',
                    unionNumber: '',
                    signature: ''
                  });
                }}
              >
                {t.common.cancel}
              </Button>
            )}
            <Button
              onClick={handleAddEngineer}
              className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
            >
              <Plus className="h-4 w-4" />
              {editingIndex !== null ? t.common.edit : t.common.add}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Engineers Table */}
      {engineers.length > 0 && (
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-lg">
              {t.final.name} ({engineers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className={language === 'ar' ? 'text-right' : 'text-left'}>
                    {t.final.sequence}
                  </TableHead>
                  <TableHead className={language === 'ar' ? 'text-right' : 'text-left'}>
                    {t.final.specialty}
                  </TableHead>
                  <TableHead className={language === 'ar' ? 'text-right' : 'text-left'}>
                    {t.final.name}
                  </TableHead>
                  <TableHead className={language === 'ar' ? 'text-right' : 'text-left'}>
                    {t.final.unionNumber}
                  </TableHead>
                  <TableHead className={language === 'ar' ? 'text-right' : 'text-left'}>
                    {t.final.signature}
                  </TableHead>
                  <TableHead className={language === 'ar' ? 'text-right' : 'text-left'}>
                    {t.buildingInfo.actions}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {engineers.map((engineer, index) => (
                  <TableRow key={engineer.id || index}>
                    <TableCell className={language === 'ar' ? 'text-right' : 'text-left'}>
                      {engineer.sequence}
                    </TableCell>
                    <TableCell className={language === 'ar' ? 'text-right' : 'text-left'}>
                      {engineer.specialty || '-'}
                    </TableCell>
                    <TableCell className={language === 'ar' ? 'text-right' : 'text-left'}>
                      {engineer.name || '-'}
                    </TableCell>
                    <TableCell className={language === 'ar' ? 'text-right' : 'text-left'}>
                      {engineer.unionNumber || '-'}
                    </TableCell>
                    <TableCell className={language === 'ar' ? 'text-right' : 'text-left'}>
                      {engineer.signature ? (
                        <div className="w-16 h-12 rounded overflow-hidden border bg-white">
                          <img
                            src={engineer.signature}
                            alt={t.final.signature}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell className={language === 'ar' ? 'text-right' : 'text-left'}>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditEngineer(index)}
                          className="gap-1"
                        >
                          <Edit2 className="h-3 w-3" />
                          {t.common.edit}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteEngineer(index)}
                          className="gap-1"
                        >
                          <Trash2 className="h-3 w-3" />
                          {t.common.delete}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Save Button */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={loading || engineers.length === 0}
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

export const translations = {
  ar: {
    // العنوان الرئيسي
    appName: 'B.S Evaluation',
    appSubtitle: 'تقييم الوضع الراهن القائم للمنشآت',
    appFullTitle: 'تقييم فني للوضع الراهن للمباني الخرسانية المسلحة',
    appCode: 'وفق اشتراطات ومعطيات الكود العربي السوري نسخة 2024',
    appDeveloper: 'المهندس الاستشاري المدني: بشار السليمان',
    appRights: 'المهندس الاستشاري: بشار السليمان - جميع الحقوق محفوظة © 2026',
    
    // التبويبات
    tabs: {
      building: 'بيانات المنشأة',
      architectural: 'التقرير المعماري',
      structural: 'التقرير الإنشائي',
      foundations: 'الأساسات',
      columns: 'الأعمدة والجدران',
      beams: 'البلاطات والجوائز',
      electrical: 'التمديدات الكهربائية',
      plumbing: 'التمديدات الصحية',
      notes: 'الملاحظات الفنية',
      final: 'التقرير النهائي',
      reports: 'توليد التقارير',
      settings: 'الإعدادات',
      about: 'حول التطبيق'
    },
    
    // الواجهة 1: بيانات المنشأة
    buildingInfo: {
      title: 'بيانات المنشأة',
      propertyNumber: 'رقم العقار',
      previousLicense: 'رقم الترخيص السابق',
      licenseDate: 'تاريخ الترخيص',
      area: 'المنطقة العقارية',
      ownerName: 'اسم صاحب المنشأة/الترخيص',
      buildingComponent: 'مكونات البناء القائم',
      floorCount: 'عدد الطوابق',
      buildingUsage: 'استخدام المنشأة',
      locationImage: 'صورة الموقع العام',
      locationDescription: 'وصف الموقع',
      
      // أزرار إدارة المشاريع
      savedProjects: 'مشاريع محفوظة',
      newProject: 'مشروع جديد',
      saveProject: 'حفظ المشروع',
      saveData: 'حفظ البيانات',
      
      // نافذة إدارة المشاريع
      manageProjects: 'إدارة المشاريع',
      projectName: 'اسم المشروع',
      actions: 'الإجراءات',
      view: 'عرض',
      load: 'استدعاء',
      delete: 'حذف',
      confirmDelete: 'هل أنت متأكد من حذف هذا المشروع؟',
      noProjects: 'لا توجد مشاريع محفوظة',
      
      // رسائل
      projectSaved: 'تم حفظ المشروع بنجاح',
      projectLoaded: 'تم استدعاء المشروع بنجاح',
      projectDeleted: 'تم حذف المشروع بنجاح',
      projectCreated: 'تم إنشاء مشروع جديد',
      
      // الحالة
      current: 'الحالي'
    },
    
    // الواجهة 2: التقرير المعماري
    architectural: {
      title: 'التقرير الوصفي المعماري للوضع الراهن',
      addFloor: 'إضافة طابق',
      floorNumber: 'رقم الطابق',
      floorArea: 'مساحة الطابق',
      projectionArea: 'مساحة البروزات',
      elevation: 'منسوب الطابق',
      notes: 'الملاحظات',
      observations: 'المشاهدات',
      noFloors: 'لا توجد طوابق مضافة',
      editFloor: 'تعديل',
      deleteFloor: 'حذف'
    },
    
    // الواجهة 3: التقرير الإنشائي
    structural: {
      title: 'التقرير الفني الإنشائي',
      
      structuralSystem: 'الجملة الإنشائية',
      structuralSystemDesc: 'وصف مختصر للجملة الإنشائية المعتمدة للمنشأة',
      
      // تقرير مطرقة شميدت
      schmidtReport: 'تقرير تجربة مطرقة شميدت',
      schmidtConcreteStrength: 'المقاومة الإسطوانية المميزة',
      schmidtUnit: 'كغ/سم²',
      
      // تقرير ميكانيك التربة
      soilMechanicsReport: 'تقرير ميكانيك التربة',
      soilType: 'نوع التربة',
      foundationDepth: 'عمق التأسيس',
      soilCapacity: 'تحمل التربة المسموح به',
      soilFrictionAngle: 'زاوية احتكاك التربة',
      soilCohesion: 'تماسك التربة',
      groundwaterLevel: 'منسوب المياه الجوفية',
      soilNotes: 'ملاحظات'
    },
    
    // الواجهة 4: الأساسات
    foundations: {
      title: 'الأساسات والقواعد',
      addFoundation: 'إضافة أساس',
      
      hasBasement: 'يوجد قبو/ملجأ',
      basementDesc: 'وصف القبو/الملجأ',
      
      foundationType: 'نوع الأساس',
      foundationDepth: 'عمق التأسيس',
      foundationModel: 'نموذج الأساس',
      
      // أنواع الأساسات
      typeIsolated: 'منفصلة',
      typeContinuous: 'مستمرة',
      typeCombined: 'مشتركة',
      typeMat: 'حصيرة',
      
      modelInterior: 'وسطي',
      modelExterior: 'طرفي',
      modelCorner: 'ركني',
      modelOther: 'غير ذلك',
      
      // الأبعاد
      length: 'الطول',
      width: 'العرض',
      height: 'الارتفاع',
      
      // الحمولات
      totalLoad: 'الحمولة الكلية',
      
      // الإجهاد
      actualStress: 'الإجهاد الفعلي',
      allowableStress: 'الإجهاد المسموح',
      stressUnit: 'كغ/سم²',
      
      // الحالة
      status: 'الحالة',
      verified: 'محقق ✓',
      notVerified: 'غير محقق ✗',
      
      // أزرار
      edit: 'تعديل',
      delete: 'حذف',
      noFoundations: 'لا توجد أساسات مضافة',
      
      // رسائل
      foundationVerified: 'الأساس محقق - الإجهاد الفعلي ≤ الإجهاد المسموح',
      foundationNotVerified: 'الأساس غير محقق - الإجهاد الفعلي > الإجهاد المسموح'
    },
    
    // الواجهة 5: الأعمدة والجدران
    columns: {
      title: 'الأعمدة والجدران الخرسانية الحاملة',
      addColumn: 'إضافة عمود/جدار',
      
      columnType: 'نوع العمود',
      floorNumber: 'الطابق',
      
      // أنواع الأعمدة
      typeInterior: 'وسطي',
      typeExterior: 'طرفي',
      typeCorner: 'ركني',
      typeWall: 'جدار',
      typeOther: 'أخرى',
      
      // أبعاد المقطع
      sectionWidth: 'عرض المقطع',
      sectionDepth: 'عمق المقطع',
      
      // الحمولات
      totalLoad: 'الحمولة الكلية',
      
      // الإجهاد
      actualStress: 'الإجهاد الفعلي',
      allowableStress: 'الإجهاد المسموح',
      stressUnit: 'كغ/سم²',
      
      // الحالة
      status: 'الحالة',
      verified: 'محقق ✓',
      notVerified: 'غير محقق ✗',
      
      // أزرار
      edit: 'تعديل',
      delete: 'حذف',
      noColumns: 'لا توجد أعمدة أو جدران مضافة',
      
      // رسائل
      columnVerified: 'العمود محقق - الإجهاد الفعلي ≤ الإجهاد المسموح',
      columnNotVerified: 'العمود غير محقق - الإجهاد الفعلي > الإجهاد المسموح',
      
      // تنبيه
      noFloorsWarning: 'يجب إضافة الطوابق أولاً من التقرير المعماري'
    },
    
    // الواجهة الجديدة: البلاطات والجوائز (Slabs & Beams)
    slabsAndBeams: {
      title: 'التحقق من السماكة والإجهادات',
      description: 'التحقق من السماكة والإجهادات حسب الكود السوري 2024'
    },
    
    // الواجهة 6: البلاطات والجوائز
    beams: {
      title: 'البلاطات والجوائز الخرسانية',
      addBeam: 'إضافة جائز/بلاطة',
      
      element: 'العنصر',
      floorNumber: 'الطابق',
      
      // العناصر
      typeBeam: 'جائز',
      typeSlab: 'بلاطة',
      
      // أنواع الاستناد
      supportSimple: 'بسيطة الاستناد',
      supportOneWay: 'مستمرة من جهة واحدة',
      supportTwoWay: 'مستمرة من جهتين',
      
      // معلومات الجائز
      span: 'طول الفتحة',
      width: 'العرض',
      thickness: 'السماكة',
      
      // إجهاد الحديد
      fy: 'إجهاد الخضوع لحديد التسليح',
      fyUnit: 'كغ/سم²',
      
      // الحمولات
      deadLoad: 'الحمولة الميتة',
      liveLoad: 'الحمولة الحية',
      totalLoad: 'الحمولة الكلية',
      loadUnit: 'طن',
      
      // العزوم
      appliedMoment: 'العزم المطبق',
      allowableMoment: 'العزم المسموح',
      momentUnit: 'طن·م',
      
      // الحالة
      status: 'الحالة',
      verified: 'محقق ✓',
      notVerified: 'غير محقق ✗',
      
      // أزرار
      edit: 'تعديل',
      delete: 'حذف',
      noBeams: 'لا توجد جوائز أو بلاطات مضافة',
      
      // رسائل
      beamVerified: 'الجائز محقق - Mu ≥ Mmax',
      beamNotVerified: 'الجائز غير محقق - Mu < Mmax',
      
      // تنبيه
      noFloorsWarning: 'يجب إضافة الطوابق أولاً من التقرير المعماري'
    },
    
    // الواجهة 7: التمديدات الكهربائية
    electrical: {
      title: 'التقرير الوضع الراهن - التمديدات الكهربائية',
      installation: 'التمديدات والتجهيزات الكهربائية',
      notes: 'الملاحظات والمشاهدات',
      images: 'الصور المرفقة'
    },
    
    // الواجهة 8: التمديدات الصحية
    plumbing: {
      title: 'التقرير الوضع الراهن - التمديدات الصحية',
      freshWater: 'التمديدات الصحية الحلوة',
      wastewater: 'التمديدات الصحية المالحة',
      images: 'الصور المرفقة'
    },
    
    // الواجهة 9: الملاحظات الفنية
    notes: {
      title: 'الملاحظات والمشاهدات الفنية',
      architecturalNotes: 'ملاحظات معمارية',
      structuralNotes: 'ملاحظات إنشائية',
      electricalNotes: 'ملاحظات كهربائية',
      plumbingNotes: 'ملاحظات صحية',
      requirements: 'المتطلبات',
      suggestions: 'المقترحات'
    },
    
    // الواجهة 10: التقرير النهائي
    final: {
      title: 'التقرير الفني النهائي',
      addEngineer: 'إضافة مهندس',
      
      sequence: 'التسلسل',
      specialty: 'الاختصاص',
      name: 'اسم المهندس',
      unionNumber: 'رقم المهندس النقابي',
      signature: 'التوقيع',
      
      // غرض التقرير
      reportPurpose: 'غرض التقرير',
      purposeAdditionalFloor: 'ترخيص طابق إضافي',
      purposeViolationSettlement: 'تسوية مخالفة',
      purposeCurrentStatus: 'وضع راهن فقط',
      
      // أزرار
      edit: 'تعديل',
      delete: 'حذف',
      noEngineers: 'لم يتم إضافة مهندسين بعد',
      
      // شهادة التقرير
      certificate: 'نحن المهندسون الموقعين أدناه نقر بأن المنشأة التالية',
      additionalFloorCert: 'بناءً على ما تقدم من كشوفات ومعاينات، نؤكد أن المنشأة سليمة ومستقرة من النواحي الإنشائية والمعمارية والكهربائية والصحية. كما أن إجهاد تربة التأسيس آمن ومحقق تحت تأثير مجمل الحمولات التصميمية والواقعية المطبقة، وذلك وفقاً للأبعاد والمخططات المعتمدة في إضبارة المنشأة المرفقة والمصدقة أصولاً، وهي قادرة على استيعاب الأحمال دون أي خطورة على السلامة العامة.',
      violationCert: 'من خلال الكشف الحسي والمعاينة الفنية، تبين أن المنشأة المنفذة بوضعها الراهن سليمة من الناحية الإنشائية والمعمارية والخدمية (كهرباء وصحية)، ولا تظهر عليها أي علامات خلل أو هبوط. ونؤكد أن تنفيذ المنشأة جاء متوافقاً مع اشتراطات الكود العربي السوري لجهة تحمل التربة والحمولات المطبقة، مما يجعلها قابلة للاستثمار بوضعها الحالي دون أي خطورة على السلامة العامة.',
      
      // التواقيع
      committeeApproval: 'تصديق لجنة المكاتب الهندسية',
      technicalApproval: 'إعتماد المدقق الفني'
    },
    
    // الواجهة 11: توليد التقارير
    reports: {
      title: 'توليد التقارير الرسمية',
      selectSections: 'اختيار الأقسام',
      
      // الأقسام
      sectionBuilding: 'بيانات المنشأة',
      sectionArchitectural: 'التقرير المعماري',
      sectionStructural: 'التقرير الإنشائي',
      sectionFoundations: 'الأساسات',
      sectionColumns: 'الأعمدة والجدران',
      sectionBeams: 'البلاطات والجوائز',
      sectionElectrical: 'التمديدات الكهربائية',
      sectionPlumbing: 'التمديدات الصحية',
      sectionNotes: 'الملاحظات الفنية',
      sectionFinal: 'التقرير النهائي',
      
      // أزرار التحكم
      selectAll: 'تحديد الكل',
      deselectAll: 'إلغاء الكل',
      
      // المعاينة
      preview: 'معاينة البيانات',
      
      // الأزرار
      generatePDF: 'تحميل PDF',
      generateWord: 'تحميل Word',
      printPreview: 'معاينة الطباعة',
      
      // رسائل
      loadingData: 'جاري تحميل البيانات...',
      noData: 'لا توجد بيانات متاحة',
      reportGenerated: 'تم إنشاء التقرير بنجاح'
    },
    
    // الواجهة 12: الإعدادات
    settings: {
      title: 'إعدادات التطبيق',
      
      // اللغة
      languageSection: 'اللغة',
      languageLabel: 'لغة التطبيق',
      languageAr: 'العربية',
      languageEn: 'الإنجليزية',
      
      // الوحدات
      unitsSection: 'الوحدات المستخدمة',
      lengthUnit: 'أبعاد المقطع وأطوال العناصر',
      lengthCm: 'سنتيمتر (سم)',
      lengthM: 'متر (م)',
      lengthMm: 'مليمتر (مم)',
      
      areaUnit: 'مساحة المقطع',
      areaCm2: 'سنتيمتر مربع (سم²)',
      areaMm2: 'مليمتر مربع (مم²)',
      areaM2: 'متر مربع (م²)',
      
      loadUnit: 'الحمولات (القوى)',
      loadTon: 'طن',
      loadKg: 'كيلوغرام (كغ)',
      loadKn: 'كيلونيوتن (كن)',
      
      stressUnit: 'الإجهادات',
      stressTonM2: 'طن/م²',
      stressKnM2: 'كن/م²',
      stressKgCm2: 'كغ/سم²',
      stressMpa: 'ميغاباسكال (نيوتن/مم²)',
      
      densityUnit: 'الكثافة والوزن الحجمي',
      densityTonM3: 'طن/م³',
      densityKnM3: 'كن/م³',
      densityKgCm3: 'كغ/سم³'
    },
    
    // واجهة حول التطبيق
    about: {
      title: 'حول التطبيق',
      
      appInfo: 'معلومات التطبيق',
      appDescription: 'تطبيق B.S Evaluation تقييم فني للوضع الراهن للمباني الخرسانية المسلحة وفق اشتراطات ومعطيات الكود العربي السوري نسخة 2024 (الطريقة الكلاسيكية)',
      appSeries: 'التطبيق هو أحد تطبيقات سلسلة تطبيقات B.S الإنشائية',
      version: 'الإصدار الأول 1.0',
      developer: 'مطور ومنشئ التطبيق: المهندس الاستشاري المدني: بشار السليمان',
      
      contact: 'معلومات التواصل مع المطور',
      mobile: 'جوال',
      whatsapp: 'واتساب',
      email: 'بريد إلكتروني',
      facebook: 'فيسبوك',
      
      mobileNumber: '00963944653699',
      emailAddress: 'basharsam76@gmail.com',
      facebookUrl: 'https://www.facebook.com/Eng.basharalsulieman',
      
      pwaInfo: 'يعمل على جميع المتصفحات الحديثة التي تدعم PWA'
    },
    
    // عام
    common: {
      save: 'حفظ',
      cancel: 'إلغاء',
      delete: 'حذف',
      edit: 'تعديل',
      add: 'إضافة',
      close: 'إغلاق',
      confirm: 'تأكيد',
      next: 'التالي',
      previous: 'السابق',
      loading: 'جاري التحميل...',
      error: 'حدث خطأ',
      success: 'تم بنجاح',
      required: 'مطلوب',
      optional: 'اختياري',
      upload: 'تحميل',
      download: 'تنزيل',
      preview: 'معاينة'
    }
  },
  
  en: {
    // Main Title
    appName: 'B.S Evaluation',
    appSubtitle: 'Evaluation of RC Structures',
    appFullTitle: 'Evaluation of Current State of Reinforced Concrete Structures',
    appCode: 'According to Syrian Arab Code 2024 Specifications',
    appDeveloper: 'Civil Consulting Engineer: Bashar Al-Suleiman',
    appRights: 'Consulting Engineer: Bashar Al-Suleiman - All Rights Reserved © 2026',
    
    // Tabs
    tabs: {
      building: 'Building Info',
      architectural: 'Architectural Report',
      structural: 'Structural Report',
      foundations: 'Foundations',
      columns: 'Columns & Walls',
      beams: 'Beams & Slabs',
      electrical: 'Electrical',
      plumbing: 'Plumbing',
      notes: 'Technical Notes',
      final: 'Final Report',
      reports: 'Generate Reports',
      settings: 'Settings',
      about: 'About'
    },
    
    // Interface 1: Building Info
    buildingInfo: {
      title: 'Building Information',
      propertyNumber: 'Property Number',
      previousLicense: 'Previous License Number',
      licenseDate: 'License Date',
      area: 'Real Estate Area',
      ownerName: 'Building/License Owner Name',
      buildingComponent: 'Existing Building Components',
      floorCount: 'Number of Floors',
      buildingUsage: 'Building Usage',
      locationImage: 'Location Image',
      locationDescription: 'Location Description',
      
      // Project Management Buttons
      savedProjects: 'Saved Projects',
      newProject: 'New Project',
      saveProject: 'Save Project',
      saveData: 'Save Data',
      
      // Project Management Modal
      manageProjects: 'Manage Projects',
      projectName: 'Project Name',
      actions: 'Actions',
      view: 'View',
      load: 'Load',
      delete: 'Delete',
      confirmDelete: 'Are you sure you want to delete this project?',
      noProjects: 'No saved projects',
      
      // Messages
      projectSaved: 'Project saved successfully',
      projectLoaded: 'Project loaded successfully',
      projectDeleted: 'Project deleted successfully',
      projectCreated: 'New project created',
      
      // Status
      current: 'Current'
    },
    
    // Interface 2: Architectural Report
    architectural: {
      title: 'Architectural Descriptive Report of Current State',
      addFloor: 'Add Floor',
      floorNumber: 'Floor Number',
      floorArea: 'Floor Area',
      projectionArea: 'Projection Area',
      elevation: 'Floor Elevation',
      notes: 'Notes',
      observations: 'Observations',
      noFloors: 'No floors added',
      editFloor: 'Edit',
      deleteFloor: 'Delete'
    },
    
    // Interface 3: Structural Report
    structural: {
      title: 'Technical Structural Report',
      
      structuralSystem: 'Structural System',
      structuralSystemDesc: 'Brief description of the approved structural system',
      
      // Schmidt Hammer Report
      schmidtReport: 'Schmidt Hammer Test Report',
      schmidtConcreteStrength: 'Characteristic Cylindrical Strength',
      schmidtUnit: 'kg/cm²',
      
      // Soil Mechanics Report
      soilMechanicsReport: 'Soil Mechanics Report',
      soilType: 'Soil Type',
      foundationDepth: 'Foundation Depth',
      soilCapacity: 'Allowable Soil Bearing Capacity',
      soilFrictionAngle: 'Soil Friction Angle',
      soilCohesion: 'Soil Cohesion',
      groundwaterLevel: 'Groundwater Level',
      soilNotes: 'Notes'
    },
    
    // Interface 4: Foundations
    foundations: {
      title: 'Foundations and Bases',
      addFoundation: 'Add Foundation',
      
      hasBasement: 'Has Basement/Shelter',
      basementDesc: 'Basement/Shelter Description',
      
      foundationType: 'Foundation Type',
      foundationDepth: 'Foundation Depth',
      foundationModel: 'Foundation Model',
      
      // Foundation Types
      typeIsolated: 'Isolated',
      typeContinuous: 'Continuous',
      typeCombined: 'Combined',
      typeMat: 'Mat',
      
      modelInterior: 'Interior',
      modelExterior: 'Exterior',
      modelCorner: 'Corner',
      modelOther: 'Other',
      
      // Dimensions
      length: 'Length',
      width: 'Width',
      height: 'Height',
      
      // Loads
      totalLoad: 'Total Load',
      
      // Stress
      actualStress: 'Actual Stress',
      allowableStress: 'Allowable Stress',
      stressUnit: 'kg/cm²',
      
      // Status
      status: 'Status',
      verified: 'Verified ✓',
      notVerified: 'Not Verified ✗',
      
      // Buttons
      edit: 'Edit',
      delete: 'Delete',
      noFoundations: 'No foundations added',
      
      // Messages
      foundationVerified: 'Foundation verified - Actual stress ≤ Allowable stress',
      foundationNotVerified: 'Foundation not verified - Actual stress > Allowable stress'
    },
    
    // Interface 5: Columns and Walls
    columns: {
      title: 'Load-Bearing RC Columns and Walls',
      addColumn: 'Add Column/Wall',
      
      columnType: 'Column Type',
      floorNumber: 'Floor',
      
      // Column Types
      typeInterior: 'Interior',
      typeExterior: 'Exterior',
      typeCorner: 'Corner',
      typeWall: 'Wall',
      typeOther: 'Other',
      
      // Section Dimensions
      sectionWidth: 'Section Width',
      sectionDepth: 'Section Depth',
      
      // Loads
      totalLoad: 'Total Load',
      
      // Stress
      actualStress: 'Actual Stress',
      allowableStress: 'Allowable Stress',
      stressUnit: 'kg/cm²',
      
      // Status
      status: 'Status',
      verified: 'Verified ✓',
      notVerified: 'Not Verified ✗',
      
      // Buttons
      edit: 'Edit',
      delete: 'Delete',
      noColumns: 'No columns or walls added',
      
      // Messages
      columnVerified: 'Column verified - Actual stress ≤ Allowable stress',
      columnNotVerified: 'Column not verified - Actual stress > Allowable stress',
      
      // Warning
      noFloorsWarning: 'Please add floors from the architectural report first'
    },
    
    // Interface 6: Beams and Slabs
    beams: {
      title: 'RC Beams and Slabs',
      addBeam: 'Add Beam/Slab',
      
      element: 'Element',
      floorNumber: 'Floor',
      
      // Elements
      typeBeam: 'Beam',
      typeSlab: 'Slab',
      
      // Support Types
      supportSimple: 'Simply Supported',
      supportOneWay: 'Continuous One-Way',
      supportTwoWay: 'Continuous Two-Way',
      
      // Beam Info
      span: 'Span Length',
      width: 'Width',
      thickness: 'Thickness',
      
      // Steel Stress
      fy: 'Steel Yield Stress',
      fyUnit: 'kg/cm²',
      
      // Loads
      deadLoad: 'Dead Load',
      liveLoad: 'Live Load',
      totalLoad: 'Total Load',
      loadUnit: 'tons',
      
      // Moments
      appliedMoment: 'Applied Moment',
      allowableMoment: 'Allowable Moment',
      momentUnit: 'ton·m',
      
      // Status
      status: 'Status',
      verified: 'Verified ✓',
      notVerified: 'Not Verified ✗',
      
      // Buttons
      edit: 'Edit',
      delete: 'Delete',
      noBeams: 'No beams or slabs added',
      
      // Messages
      beamVerified: 'Beam verified - Mu ≥ Mmax',
      beamNotVerified: 'Beam not verified - Mu < Mmax',
      
      // Warning
      noFloorsWarning: 'Please add floors from the architectural report first'
    },
    
    // Interface 7: Electrical
    electrical: {
      title: 'Current State Report - Electrical',
      installation: 'Electrical Installations and Equipment',
      notes: 'Notes and Observations',
      images: 'Attached Images'
    },
    
    // Interface 8: Plumbing
    plumbing: {
      title: 'Current State Report - Plumbing',
      freshWater: 'Fresh Water Plumbing',
      wastewater: 'Wastewater Plumbing',
      images: 'Attached Images'
    },
    
    // Interface 9: Technical Notes
    notes: {
      title: 'Technical Notes and Observations',
      architecturalNotes: 'Architectural Notes',
      structuralNotes: 'Structural Notes',
      electricalNotes: 'Electrical Notes',
      plumbingNotes: 'Plumbing Notes',
      requirements: 'Requirements',
      suggestions: 'Suggestions'
    },
    
    // Interface 10: Final Report
    final: {
      title: 'Final Technical Report',
      addEngineer: 'Add Engineer',
      
      sequence: 'Sequence',
      specialty: 'Specialty',
      name: 'Engineer Name',
      unionNumber: 'Union Number',
      signature: 'Signature',
      
      // Report Purpose
      reportPurpose: 'Report Purpose',
      purposeAdditionalFloor: 'Additional Floor License',
      purposeViolationSettlement: 'Violation Settlement',
      purposeCurrentStatus: 'Current Status Only',
      
      // Buttons
      edit: 'Edit',
      delete: 'Delete',
      noEngineers: 'No engineers added yet',
      
      // Report Certificate
      certificate: 'We, the undersigned engineers, certify that the following building',
      additionalFloorCert: 'Based on the provided inspections and reviews, we confirm that the building is structurally, architecturally, electrically, and plumbingly sound and stable. The foundation soil stress is safe and verified under the effect of design and applied loads, according to the approved dimensions and plans in the attached building file. It is capable of carrying loads without any risk to public safety.',
      violationCert: 'Through sensory inspection and technical review, it appears that the building in its current state is structurally, architecturally, and serviceably sound (electricity and plumbing), showing no signs of defects or settlement. We confirm that the building implementation complies with the Syrian Arab Code requirements regarding soil bearing capacity and applied loads, making it suitable for investment in its current state without any risk to public safety.',
      
      // Signatures
      committeeApproval: 'Engineering Offices Committee Approval',
      technicalApproval: 'Technical Reviewer Approval'
    },
    
    // Interface 11: Generate Reports
    reports: {
      title: 'Generate Official Reports',
      selectSections: 'Select Sections',
      
      // Sections
      sectionBuilding: 'Building Info',
      sectionArchitectural: 'Architectural Report',
      sectionStructural: 'Structural Report',
      sectionFoundations: 'Foundations',
      sectionColumns: 'Columns & Walls',
      sectionBeams: 'Beams & Slabs',
      sectionElectrical: 'Electrical',
      sectionPlumbing: 'Plumbing',
      sectionNotes: 'Technical Notes',
      sectionFinal: 'Final Report',
      
      // Control Buttons
      selectAll: 'Select All',
      deselectAll: 'Deselect All',
      
      // Preview
      preview: 'Preview Data',
      
      // Buttons
      generatePDF: 'Download PDF',
      generateWord: 'Download Word',
      printPreview: 'Print Preview',
      
      // Messages
      loadingData: 'Loading data...',
      noData: 'No data available',
      reportGenerated: 'Report generated successfully'
    },
    
    // Interface 12: Settings
    settings: {
      title: 'App Settings',
      
      // Language
      languageSection: 'Language',
      languageLabel: 'App Language',
      languageAr: 'Arabic',
      languageEn: 'English',
      
      // Units
      unitsSection: 'Units Used',
      lengthUnit: 'Section Dimensions & Element Lengths',
      lengthCm: 'Centimeter (cm)',
      lengthM: 'Meter (m)',
      lengthMm: 'Millimeter (mm)',
      
      areaUnit: 'Section Area',
      areaCm2: 'Square Centimeter (cm²)',
      areaMm2: 'Square Millimeter (mm²)',
      areaM2: 'Square Meter (m²)',
      
      loadUnit: 'Loads (Forces)',
      loadTon: 'ton',
      loadKg: 'kilogram (kg)',
      loadKn: 'kilonewton (kN)',
      
      stressUnit: 'Stresses',
      stressTonM2: 'ton/m²',
      stressKnM2: 'kN/m²',
      stressKgCm2: 'kg/cm²',
      stressMpa: 'Megapascal (N/mm²)',
      
      densityUnit: 'Density & Unit Weight',
      densityTonM3: 'ton/m³',
      densityKnM3: 'kN/m³',
      densityKgCm3: 'kg/cm³'
    },
    
    // About Interface
    about: {
      title: 'About',
      
      appInfo: 'App Information',
      appDescription: 'B.S Evaluation App - Technical evaluation of the current state of reinforced concrete buildings according to Syrian Arab Code 2024 specifications (Classical Method)',
      appSeries: 'This app is part of the B.S Structural Apps series',
      version: 'First Version 1.0',
      developer: 'Developer and Creator: Civil Consulting Engineer: Bashar Al-Suleiman',
      
      contact: 'Developer Contact Information',
      mobile: 'Mobile',
      whatsapp: 'WhatsApp',
      email: 'Email',
      facebook: 'Facebook',
      
      mobileNumber: '00963944653699',
      emailAddress: 'basharsam76@gmail.com',
      facebookUrl: 'https://www.facebook.com/Eng.basharalsulieman',
      
      pwaInfo: 'Works on all modern PWA-supported browsers'
    },
    
    // Common
    common: {
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      add: 'Add',
      close: 'Close',
      confirm: 'Confirm',
      next: 'Next',
      previous: 'Previous',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      required: 'Required',
      optional: 'Optional',
      upload: 'Upload',
      download: 'Download',
      preview: 'Preview'
    }
  }
};

export const useTranslation = () => {
  // First try to get language from settings store
  let language: 'ar' | 'en' = 'ar';

  if (typeof window !== 'undefined') {
    // Try bs-evaluation-settings first (from settingsStore)
    try {
      const settings = localStorage.getItem('bs-evaluation-settings');
      if (settings) {
        const parsed = JSON.parse(settings);
        language = parsed.language || 'ar';
      } else {
        // Fallback to bs-language for backward compatibility
        const langFromStorage = localStorage.getItem('bs-language');
        if (langFromStorage && (langFromStorage === 'ar' || langFromStorage === 'en')) {
          language = langFromStorage;
        }
      }
    } catch (error) {
      console.error('Error reading language from storage:', error);
      language = 'ar';
    }
  }

  return {
    language,
    t: translations[language]
  };
};

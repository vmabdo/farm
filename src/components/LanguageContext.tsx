'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

export const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  toggleLanguage: () => {},
  t: (key: string) => key,
});

const dictionary: Record<string, string> = {
  // Navigation & Globals
  "Farm ERP": "نظام مزرعة",
  "Dashboard": "لوحة القيادة",
  "Dashboard Overview": "نظرة عامة على لوحة القيادة",
  "Welcome to the Premium Cattle Feedlot ERP System": "مرحباً بك في نظام إدارة تسمين الماشية المتميز",
  "Premium Feedlot System": "نظام التسمين المتميز",
  "Settings": "الإعدادات",
  "Sign Out": "تسجيل الخروج",
  "Actions": "الإجراءات",
  "Cancel": "إلغاء",
  "Date *": "التاريخ *",
  "Notes": "ملاحظات",
  "Saving...": "جاري الحفظ...",
  "Logging...": "جاري التسجيل...",
  "Updating...": "جاري التحديث...",
  "Deleting...": "جاري الحذف...",
  "Authenticating...": "جاري المصادقة...",

  // Login
  "Feedlot ERP Secure Login": "تسجيل الدخول الآمن لنظام المزرعة",
  "If this is your first time, typing a username and password will auto-create the Admin account.": "إذا كانت هذه هي المرة الأولى، فإن إدخال اسم المستخدم وكلمة المرور سيقوم بإنشاء الحساب تلقائياً.",
  "Username": "اسم المستخدم",
  "Password": "كلمة المرور",
  "Secure Login Now": "تسجيل دخول آمن الآن",

  // Dashboard Stats
  "Total Cattle": "إجمالي الماشية",
  "Feed Stock Items": "عناصر العلف المخزنة",
  "Active Workers": "العمال النشطون",
  "Medical Records": "السجلات الطبية",
  "Transport Rents": "تأجير النقل",
  
  // Cattle
  "Cattle & Weights": "الماشية والأوزان",
  "Manage cattle records and track weight gain over time.": "إدارة سجلات الماشية ومتابعة زيادة الوزن بمرور الوقت.",
  "Add Cattle": "إضافة ماشية",
  "Cattle Directory": "دليل الماشية",
  "Tag Number": "رقم العلامة",
  "Breed": "السلالة",
  "Entry Date": "تاريخ الدخول",
  "Initial Wt (kg)": "الوزن الأولي (كجم)",
  "Current Wt (kg)": "الوزن الحالي (كجم)",
  "Variance": "الفرق (التغير)",
  "Status": "الحالة",
  "Record Weight": "تسجيل الوزن",
  "Update Cattle": "تحديث بيانات الماشية",
  "Edit Cattle Info": "تعديل بيانات الماشية",
  "Initial Weight (kg) *": "الوزن الأولي (كجم) *",
  "Tag Number *": "رقم العلامة *",
  "No cattle records found.": "لا توجد سجلات للماشية.",
  
  // Feed
  "Feed & Inventory": "الأعلاف والمخزون",
  "Track incoming feed orders and daily consumption.": "تتبع طلبات الأعلاف الواردة والاستهلاك اليومي.",
  "Feed Inventory": "مخزون العلف",
  "Feed Orders": "طلبات العلف",
  "Consumption Logs": "سجلات الاستهلاك",
  "Add Feed Item": "إضافة نوع علف",
  "Add Order": "إضافة طلبية",
  "Log Consumption": "تسجيل استهلاك",
  "Item Name": "اسم العنصر",
  "Feed Type": "نوع العلف",
  "Current Stock": "المخزون الحالي",
  "Unit": "الوحدة",
  "Supplier": "المورد",
  "Quantity": "الكمية",
  "Cost (EGP)": "التكلفة (ج.م)",
  "Date": "التاريخ",
  
  // Workers
  "Workers & Payroll": "العمال والرواتب",
  "Manage employee details and log payroll transactions.": "إدارة بيانات الموظفين وتسجيل حركات الرواتب.",
  "Workers Directory": "دليل العمال",
  "Payroll Logs": "سجلات الرواتب",
  "Add Worker": "إضافة عامل",
  "Log Payment": "تسجيل دفع",
  "Worker Name": "اسم العامل",
  "Worker Name *": "اسم العامل *",
  "Role": "المنصب",
  "Base Salary (EGP)": "الراتب الأساسي (ج.م)",
  "Phone": "الهاتف",
  "National ID": "الرقم القومي",
  "Payment Type": "نوع الدفع",
  "Amount (EGP)": "المبلغ (ج.م)",
  
  // Medical
  "Medical Care": "الرعاية الطبية",
  "Medical & Vaccinations": "الطبية واللقاحات",
  "Manage medical inventory and track physical treatments.": "إدارة المخزون الطبي وتتبع العلاجات.",
  "Medicine Inventory": "مخزون الأدوية",
  "Treatment Logs": "سجلات العلاج",
  "Add Medicine": "إضافة دواء",
  "Add Medicine/Vaccine": "إضافة دواء / لقاح",
  "Edit Medicine Info": "تعديل بيانات الدواء",
  "Log Treatment": "تسجيل علاج",
  "Log Treatment/Vaccine": "تسجيل علاج / لقاح",
  "Edit Treatment Log": "تعديل السجل الطبي",
  "Medicine Name": "اسم الدواء",
  "Medicine Name *": "اسم الدواء *",
  "Expiration": "تاريخ الانتهاء",
  "Expiration Date": "تاريخ الانتهاء",
  "Treatment Type *": "نوع العلاج *",
  "Dose Given *": "الجرعة المعطاة *",
  "Date Administered *": "تاريخ التقديم *",
  "Cattle (Tag Number) *": "الماشية (رقم العلامة) *",
  "Medicine/Vaccine *": "الدواء / اللقاح *",
  "Initial Stock Amount *": "كمية المخزون الأولية *",
  "Current Stock Amount *": "كمية المخزون الحالي *",
  "Unit of Measurement *": "وحدة القياس *",
  "Select cattle...": "اختر الماشية...",
  "Select medicine...": "اختر الدواء...",
  "Milliliters (ML)": "مليلتر (ML)",
  "Milligrams (MG)": "مليغرام (MG)",
  "Doses": "جرعات",
  "Bottles": "زجاجات",
  "No medical inventory found.": "لا يوجد مخزون طبي.",
  "No treatment records logged.": "لم يتم تسجيل أي سجلات علاج.",

  // Transport
  "Transport & Expenses": "النقل والمصروفات",
  "Transportation & Expenses": "النقل والمصروفات",
  "Log delivery vehicles, feed transport, and internal hauling expenses.": "تسجيل مركبات التوصيل ونقل الأعلاف ومصروفات النقل الداخلي.",
  "Log Transport": "تسجيل نقل",
  "Log Transport Expense": "تسجيل مصروف نقل",
  "Edit Transport Expense": "تعديل مصروف نقل",
  "Update Transport Log": "تحديث سجل النقل",
  "Driver Name *": "اسم السائق *",
  "Driver": "السائق",
  "Vehicle": "المركبة",
  "Vehicle Details *": "تفاصيل المركبة *",
  "Purpose": "الغرض",
  "Purpose *": "الغرض *",
  "Trip Cost (EGP) *": "تكلفة الرحلة (ج.م) *",
  "No transport records logged.": "لا توجد سجلات نقل.",
  
  // Settings
  "System Settings": "إعدادات النظام",
  "Manage your administrative credentials and secure access.": "إدارة بيانات الاعتماد الإدارية والوصول الآمن.",
  "Change Admin Password": "تغيير كلمة مرور المسؤول",
  "Update the login password for the system.": "تحديث كلمة مرور الدخول للنظام.",
  "Admin Username": "اسم مستخدم المسؤول",
  "Current Password *": "كلمة المرور الحالية *",
  "New Password *": "كلمة المرور الجديدة *",
  "Confirm New Password *": "تأكيد كلمة المرور الجديدة *",
  "Updating Credentials...": "جاري تحديث بيانات الاعتماد...",
  "Save New Password": "حفظ كلمة المرور الجديدة",

  // System Messages & Notifications
  "Invalid credentials.": "بيانات الاعتماد غير صالحة.",
  "Invalid username or password.": "اسم المستخدم أو كلمة المرور غير صحيحة.",
  "Username and password are required.": "اسم المستخدم وكلمة المرور مطلوبان.",
  "Authentication failed.": "فشلت المصادقة.",
  "All fields are required.": "جميع الحقول مطلوبة.",
  "User not found.": "المستخدم غير موجود.",
  "Invalid current password.": "كلمة المرور الحالية غير صحيحة.",
  "Password updated successfully.": "تم تحديث كلمة المرور بنجاح.",
  "New passwords do not match.": "كلمة المرور الجديدة غير متطابقة.",
  "Failed to update password.": "فشل تحديث كلمة المرور.",
  "Failed to update.": "فشل التحديث.",
  "A worker with this National ID already exists.": "يوجد عامل بهذا الرقم القومي بالفعل.",
  "Failed to create worker.": "فشل إنشاء العامل.",
  "Failed to update worker.": "فشل تحديث العامل.",
  "Failed to delete worker.": "فشل حذف العامل.",
  "Failed to log payroll payment.": "فشل تسجيل الدفع.",
  "Failed to update payroll payment.": "فشل تحديث الدفع.",
  "Failed to delete payroll payment.": "فشل حذف الدفع.",
  "Failed to create medicine item.": "فشل إنشاء عنصر الدواء.",
  "Failed to update medicine item.": "فشل تحديث عنصر الدواء.",
  "Failed to delete medicine item.": "فشل حذف عنصر الدواء.",
  "Failed to log treatment.": "فشل تسجيل العلاج.",
  "Failed to update treatment log.": "فشل تحديث سجل العلاج.",
  "Failed to delete treatment log.": "فشل حذف سجل العلاج.",
  "Failed to log transport expense.": "فشل تسجيل نقل.",
  "Failed to update transport log.": "فشل تحديث سجل النقل.",
  "Failed to delete transport log.": "فشل حذف سجل النقل.",
  "Failed to create feed item.": "فشل إنشاء عنصر العلف.",
  "Failed to update feed item.": "فشل تحديث عنصر العلف.",
  "Failed to delete feed item.": "فشل حذف عنصر العلف.",
  "Failed to create feed order.": "فشل إنشاء طلب العلف.",
  "Failed to update feed order.": "فشل تحديث طلب العلف.",
  "Failed to delete feed order.": "فشل حذف طلب العلف.",
  "Failed to log feed consumption.": "فشل تسجيل استهلاك العلف.",
  "Failed to update feed consumption.": "فشل تحديث استهلاك العلف.",
  "Failed to delete feed consumption.": "فشل حذف استهلاك العلف.",
  "Failed to create cattle record.": "فشل إنشاء سجل الماشية.",
  "Failed to update cattle record.": "فشل تحديث سجل الماشية.",
  "Failed to delete cattle record.": "فشل حذف سجل الماشية.",
  "Weight is required": "الوزن مطلوب",
  "Failed to add weight record.": "فشل إضافة سجل الوزن.",

  // Missing UI texts from auditing
  "Cattle Management": "إدارة الماشية",
  "Track livestock, entry details, and weight progression.": "تتبع الماشية وتفاصيل الدخول وتطور الوزن.",
  "Latest Diff(kg)": "أحدث فرق (كجم)",
  "Curr. Wt(kg)": "الوزن الحالي (كجم)",
  "Init. Wt(kg)": "الوزن الأولي (كجم)",
  "Manage feed stock, track purchases, and log daily consumption.": "إدارة مخزون الأعلاف، وتتبع المشتريات، وتسجيل الاستهلاك اليومي.",
  "Inventory Stock": "مخزون المستودع",
  "Add Feed Type": "إضافة نوع علف",
  "Feed Name": "اسم العلف",
  "Type": "النوع",
  "Manage employee records and track salary disbursements.": "إدارة سجلات الموظفين وتتبع صرف الرواتب.",
  "Worker Directory": "دليل العمال",
  "Base Salary": "الراتب الأساسي",
  "Job Role": "المسمى الوظيفي",
  "Name": "الاسم",
  "Present": "حاضر",
  "Inactive": "غير نشط",
  "Amount Paid": "المبلغ المدفوع",
  "SALARY": "راتب",
  "BONUS": "مكافأة",
  "DEDUCTION": "خصم",
  "Cattle Tag": "علامة الماشية",
  "Medicine": "الدواء",
  "Dose Given": "الجرعة المعطاة",
  "Quantity Added": "الكمية المضافة",
  "Quantity Used": "الكمية المستخدمة",

  // Modals, Dropdowns, Tooltips, Empty States & Placeholders
  "admin": "المدير",
  "No cattle records found. Add some to get started!": "لا توجد سجلات للماشية. أضف بعضها للبدء!",
  "Add New Cattle": "إضافة ماشية جديدة",
  "Entry Date *": "تاريخ الدخول *",
  "e.g. C-1024": "مثال C-1024",
  "e.g. Angus": "مثال أنجوس",
  "e.g. 250.5": "مثال 250.5",
  "Save Record": "حفظ السجل",
  "No feed items found. Add some to get started!": "لم يتم العثور على عناصر علف. أضف بعضها للبدء!",
  "No feed orders logged.": "لم يتم تسجيل أي طلبات علف.",
  "No feed consumption logged.": "لم يتم تسجيل أي استهلاك علف.",
  "Receive Order": "استلام الطلب",
  "Feed Name *": "اسم العلف *",
  "Type *": "النوع *",
  "Kilograms (KG)": "كيلوغرام (KG)",
  "e.g. Alfalfa Hay": "مثال برسيم",
  "e.g. Roughage": "مثال نخالة",
  "Log Feed Consumption": "تسجيل استهلاك العلف",
  "Feed Type *": "نوع العلف *",
  "Quantity Consumed *": "الكمية المستهلكة *",
  "Consumption Date *": "تاريخ الاستهلاك *",
  "Amount used...": "الكمية المستخدمة...",
  "e.g. Added supplements...": "مثال: مكملات مضافة...",
  "No workers found.": "لم يتم العثور على عمال.",
  "No payroll records logged.": "لم يتم تسجيل أي سجلات رواتب.",
  "Add New Worker": "إضافة عامل جديد",
  "Full Name *": "الاسم الكامل *",
  "National ID *": "الرقم القومي *",
  "Job Role *": "المسمى الوظيفي *",
  "Base Salary (EGP) *": "الراتب الأساسي (ج.م) *",
  "Phone Number": "رقم الهاتف",
  "Start Date *": "تاريخ البدء *",
  "e.g. John Doe": "مثال محمد",
  "e.g. 123456789": "مثال 123456789",
  "e.g. Farm Manager": "مثال مدير المزرعة",
  "Log Salary Payment": "تسجيل دفع الراتب",
  "Worker *": "العامل *",
  "Payment Type *": "نوع الدفع *",
  "Actual Amount Paid (EGP) *": "المبلغ الفعلي المدفوع (ج.م) *",
  "Payment Date *": "تاريخ الدفع *",
  "Regular Salary": "الراتب الأساسي",
  "Bonus": "مكافأة",
  "Deduction": "خصم",
  "Total amount distributed": "إجمالي المبلغ الموزع",
  "e.g. Penicillin": "مثال بنسيلين",
  "e.g. Vet Solutions Inc.": "مثال شركة الأدوية",
  "e.g. Vaccination, Antibiotic, Routine": "مثال: لقاح، مضاد حيوي، روتيني",
  "e.g. Mike Smith": "مثال محمد علي",
  "e.g. Truck AB-123": "مثال سيارة نقل AB-123",
  "e.g. Feed Delivery, Cattle Transport": "مثال: توصيل أعلاف، نقل ماشية",
  
  // New Missing Translations
  "Tons (TON)": "طن (TON)",
  "Bags (BAG)": "أكياس (BAG)",
  "Receive Feed Order": "استلام طلبية علف",
  "Save Order": "حفظ الطلب",
  "Quantity *": "الكمية *",
  "Date Received *": "تاريخ الاستلام *",
  "Processing...": "جاري المعالجة...",
  "Select feed type...": "اختر نوع العلف...",
  "Total Cost (EGP) *": "إجمالي التكلفة (ج.م) *",
  "Select worker...": "اختر العامل...",
  "Select a worker...": "اختر عاملاً...",
  "Base: ": "الأساسي: ",
  "Notes...": "ملاحظات...",
  "Reasons for bonus/deduction, or specific month...": "أسباب المكافأة / الخصم ، أو لشهر معين..."
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('erp_language') as Language;
    if (saved === 'ar') {
      setLanguage('ar');
    }
  }, []);

  // Whenever language changes, set HTML dir attribute and apply translations safely
  useEffect(() => {
    if (!mounted) return;
    
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';

    if (language === 'en') {
      // Refresh to flush strictly translated Virtual DOM overrides safely.
      // This guarantees no React hydration or Mutation issues going back to English.
      return;
    }

    // Dynamic Client-Side Dictionary Mutator for AR
    const translateNode = (node: Node) => {
      // 1. Traverse and Translate Text Nodes
      if (node.nodeType === Node.TEXT_NODE) {
        let text = node.nodeValue?.trim();
        if (text && dictionary[text]) {
          node.nodeValue = node.nodeValue?.replace(text, dictionary[text]) || '';
        }
      }
      
      // 2. Translate Input Placeholders
      if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        const ph = el.getAttribute('placeholder');
        if (ph && dictionary[ph]) {
          el.setAttribute('placeholder', dictionary[ph]);
        }
      }
    };

    const walk = (root: Node) => {
      translateNode(root);
      root.childNodes.forEach(child => {
        if (child.nodeName !== 'SCRIPT' && child.nodeName !== 'STYLE') {
          walk(child);
        }
      });
    };

    walk(document.body);

    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(node => {
            if (node.nodeName !== 'SCRIPT' && node.nodeName !== 'STYLE') {
              walk(node);
            }
          });
        } else if (mutation.type === 'characterData') {
           // Safely intercept React re-renders rewriting to English
           translateNode(mutation.target);
        }
      });
    });

    observer.observe(document.body, { childList: true, subtree: true, characterData: true });

    return () => observer.disconnect();
  }, [language, mounted]);

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'ar' : 'en';
    localStorage.setItem('erp_language', newLang);
    if (newLang === 'en') {
      window.location.reload(); // Hard reload required to restore pristine English DOM
    } else {
      setLanguage('ar');
    }
  };

  const t = (key: string): string => {
    if (language === 'ar') return dictionary[key] ?? key;
    return key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

const map = {
  // Common UI
  'Cancel': 'إلغاء',
  'Delete': 'حذف',
  'Save': 'حفظ',
  'Edit': 'تعديل',
  'Add': 'إضافة',
  'Submit': 'إرسال',
  'Actions': 'الإجراءات',
  'Status': 'الحالة',
  'Print Invoice': 'طباعة الفاتورة',
  'Processing...': 'جاري المعالجة...',

  // Modals & Forms
  'Add Cattle': 'إضافة عجل',
  'Edit Cattle': 'تعديل العجل',
  'Tag Number': 'رقم البطاقة',
  'e.g. A-123': 'مثال: A-123',
  'Breed': 'السلالة',
  'e.g. Angus, Holstein': 'مثال: هولشتاين، براون',
  'Entry Date': 'تاريخ الدخول',
  'Initial Weight (kg)': 'الوزن المبدئي (كجم)',
  'Notes': 'ملاحظات',

  'Add Weight Record': 'إضافة السجل الوزني',
  'Current Weight (kg)': 'الوزن الحالي (كجم)',
  'Weight Date': 'تاريخ الوزن',

  // Feed & Inventory
  'Feed & Inventory': 'الأعلاف والمخزون',
  'Add Feed Item': 'إضافة نوع علف',
  'Edit Feed Item': 'تعديل نوع علف',
  'Feed Name': 'اسم العلف',
  'e.g. Corn, Soy': 'مثال: ذرة، صويا',
  'Category': 'الفئة',
  'e.g. Grains, Supplements': 'مثال: حبوب، مكملات',
  'Unit of Measurement': 'وحدة القياس',
  'Daily Price (EGP)': 'سعر اليوم (ج.م)',
  'Current Stock': 'المخزون الحالي',
  
  'Log Order': 'تسجيل طلب',
  'Edit Order': 'تعديل الطلب',
  'Supplier Name': 'اسم المورد',
  'Quantity Expected': 'الكمية المتوقعة',
  'Order Status': 'حالة الطلب',
  'Order Date': 'تاريخ الطلب',
  'Total Cost (EGP)': 'التكلفة الإجمالية (ج.م)',

  'Log Consumption': 'سجل الاستهلاك',
  'Feed Type': 'نوع العلف',
  'Quantity Consumed': 'الكمية المستهلكة',
  'Consumption Date': 'تاريخ الاستهلاك',

  // Workers
  'Workers & HR': 'العمال والموارد البشرية',
  'Add Worker': 'إضافة عامل',
  'Edit Worker': 'تعديل عامل',
  'Full Name': 'الاسم الكامل',
  'Role / Position': 'الدور / الوظيفة',
  'Base Salary (EGP)': 'الراتب الأساسي (ج.م)',
  'Join Date': 'تاريخ التعيين',
  
  'Log Payment': 'تسجيل دفعة',
  'Worker': 'العامل',
  'Amount (EGP)': 'المبلغ (ج.م)',
  'Payment Type': 'نوع الدفعة',
  'Bonus': 'مكافأة',
  'Deduction': 'خصم',
  'Salary': 'راتب',
  'Payment Date': 'تاريخ الدفعة',

  // Medical
  'Medical Care': 'الرعاية الطبية',
  'Add Medicine': 'إضافة دواء',
  'Edit Medicine': 'تعديل الدواء',
  'Medicine Name': 'اسم الدواء',
  'Company / Brand': 'الشركة / العلامة التجارية',
  
  'Log Treatment': 'تسجيل علاج',
  'Dose Given': 'الجرعة المعطاة',
  'Treatment Date': 'تاريخ العلاج',

  // Transport
  'Transport Fees': 'النقل والمصروفات',
  'Log Transport': 'تسجيل مركبة ناقلة',
  'Driver Name': 'اسم السائق',
  'Vehicle Plate': 'رقم لوحة المركبة',
  'Trip Date': 'تاريخ الرحلة',
  'Cost (EGP)': 'التكلفة (ج.م)',

  // Equipment
  'Equipment & Machinery': 'المعدات والآلات',
  'Add Equipment': 'إضافة معدة',
  'Edit Equipment': 'تعديل معدة',
  'Equipment Name': 'اسم المعدة',
  'e.g. John Deere Tractor': 'مثال: جرار جون دير',
  'Type': 'النوع',
  'e.g. TRACTOR, LOADER': 'مثال: جرار، لودر',

  // Invoices
  'Invoices & Reports': 'الفواتير والتقارير',
  'Create Invoice': 'إنشاء فاتورة',
  'Client Name': 'اسم العميل',
  'Invoice Date': 'تاريخ الفاتورة',
  'Invoice Items': 'عناصر الفاتورة',
  'Add Item': 'إضافة عنصر',
  'Item Description': 'وصف العنصر',
  'Qty': 'الكمية',
  'Price': 'السعر',
  'Subtotal': 'المجموع الفرعي',
  'Discount in EGP': 'الخصم بالجنيه',
  'Total Due': 'الإجمالي المستحق',
  'Save & Generate Invoice': 'حفظ وإنشاء الفاتورة',
};

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      let modified = false;

      // Special handling:
      // We will perform naive text replacing.
      // E.g. replace >Cancel< with >إلغاء< or "Cancel" with "إلغاء"
      for (const [en, ar] of Object.entries(map)) {
        // Find literal string in TSX text nodes: e.g. >Cancel<
        let r1 = new RegExp(`>\\s*${en}\\s*<`, 'g');
        if (r1.test(content)) {
          content = content.replace(r1, `>${ar}<`);
          modified = true;
        }

        // Find literal string in quotes: e.g. "Cancel" or 'Cancel'
        let r2 = new RegExp(`"${en}"`, 'g');
        if (r2.test(content)) {
          content = content.replace(r2, `"${ar}"`);
          modified = true;
        }

        let r3 = new RegExp(`'${en}'`, 'g');
        if (r3.test(content)) {
          content = content.replace(r3, `'${ar}'`);
          modified = true;
        }
      }

      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

walkDir(srcDir);
console.log('Done!');

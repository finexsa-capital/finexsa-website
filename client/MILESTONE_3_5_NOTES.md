# FINEXSA Client Portal — Milestone 3.5 Notes

## الهدف

تحويل واجهة Excel الحالية إلى عربية مؤقتاً مع الحفاظ على جاهزية الربط الداخلي مع Code_Map.

## ما تم تعديله

- إضافة قالب عربي:
  - `client/templates/FINEXSA_Financial_Import_Template_AR.xlsx`
- تحديث صفحة الرفع لتحميل القالب العربي.
- تحديث قارئ Excel ليفهم الأعمدة العربية والإنجليزية.
- إضافة وثيقة:
  - `client/docs/MIZAN_CODE_MAP_CONTRACT_AR.md`

## القرار المهم

القالب العربي الحالي ليس بديلاً عن Code_Map.

الواجهة تعرض أسماء عربية سهلة، لكن Milestone 4 يجب أن يربط كل حساب مع Code_Map الرسمي قبل تشغيل MIZAN.

## المرحلة التالية

Milestone 4:

- حفظ Preview كبيانات مرحلية.
- شاشة Mapping.
- ربط التصنيف العربي بـ Code_Map الرسمي.
- منع تشغيل التقرير إذا بقي حساب جوهري بلا Mapping.

// Единственное место для пользовательских строк (react.ui.strings).
// Компоненты не содержат строковых литералов — только ссылки на этот словарь.
export const he = {
  header: {
    brand: 'מנורה מבטחים',
    product: 'מרכז שירות',
    navLabel: 'ניווט ראשי',
    nav: {
      customers: 'לקוחות',
      claims: 'תביעות',
      history: 'היסטוריית קשר',
    },
  },
  customerPage: {
    title: 'תמונת לקוח 360',
    subtitle: 'כל המידע לשיחה, במקום אחד',
  },
  comingSoon: {
    text: 'בקרוב',
  },
  notFound: {
    title: 'הדף לא נמצא',
    backLink: 'חזרה לתמונת הלקוח',
  },
  states: {
    notFound: 'הלקוח לא נמצא',
    error: 'לא הצלחנו לטעון את הנתונים',
    retry: 'נסו שוב',
  },
  profileCard: {
    title: 'פרטי לקוח',
    loading: 'טוען פרטי לקוח',
    fields: {
      id: 'מס׳ לקוח',
      phone: 'טלפון',
      email: 'דוא״ל',
      city: 'עיר',
    },
  },
  customerTasks: {
    title: 'משימות טיפול',
    loading: 'טוען משימות',
    empty: 'אין משימות ללקוח',
    status: {
      open: 'פתוח',
      done: 'בוצע',
    },
  },
} as const

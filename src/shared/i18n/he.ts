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
} as const

const fs = require('fs');

const file = 'App.tsx';
let s = fs.readFileSync(file, 'utf8');

function mustReplace(from, to, label) {
  if (!s.includes(from)) throw new Error(`UI patch failed: ${label}`);
  s = s.replace(from, to);
}

// Responsive primitives
mustReplace(
  "  TextInput,\n  View,\n} from 'react-native';",
  "  TextInput,\n  useWindowDimensions,\n  View,\n} from 'react-native';",
  'useWindowDimensions import'
);

mustReplace(
  "export default function App() {\n",
  "export default function App() {\n  const { width } = useWindowDimensions();\n  const compact = width < 360;\n  const roomy = width >= 700;\n  const horizontalPadding = compact ? 12 : width < 400 ? 16 : 20;\n  const contentMaxWidth = roomy ? 720 : undefined;\n",
  'responsive app metrics'
);

mustReplace(
  "      <View style={styles.topbar}>",
  "      <View style={[styles.topbar, { paddingHorizontal: horizontalPadding }] }>",
  'responsive topbar'
);

mustReplace(
  "      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>",
  "      <ScrollView contentContainerStyle={[styles.content, { paddingHorizontal: horizontalPadding, width: '100%', maxWidth: contentMaxWidth, alignSelf: 'center' }]} showsVerticalScrollIndicator={false}>",
  'responsive content container'
);

mustReplace(
  "          <View style={styles.drawerPanel}>",
  "          <View style={[styles.drawerPanel, { width: Math.min(width * 0.88, 340) }]}>",
  'responsive drawer'
);

// Dark-gold premium theme
const colors = new Map([
  ["bg: '#090B10'", "bg: '#090806'"],
  ["panel: '#11151D'", "panel: '#14110C'"],
  ["panel2: '#171C26'", "panel2: '#1D1810'"],
  ["border: '#242B38'", "border: '#3B301E'"],
  ["text: '#F4F6F8'", "text: '#F5ECDD'"],
  ["sub: '#9099A8'", "sub: '#A99A82'"],
  ["accent: '#8FE3C1'", "accent: '#B58A47'"],
  ["accent2: '#9EB7FF'", "accent2: '#D2B277'"],
  ["warm: '#F0C98A'", "warm: '#C9A063'"],
  ["danger: '#FF9E9E'", "danger: '#D88B78'"],
]);
for (const [from, to] of colors) mustReplace(from, to, from);

s = s.replaceAll("'#07110D'", "'#140F08'");
s = s.replaceAll("'#12251E'", "'#251C0F'");
s = s.replaceAll("'#2A2117'", "'#2A2114'");
s = s.replaceAll("'#5A4528'", "'#6B512C'");
s = s.replaceAll("'#0D1118'", "'#0D0B08'");
s = s.replaceAll("'#45505F'", "'#5C4A2E'");
s = s.replaceAll("'#CBD1DB'", "'#D8CCB8'");

// Product naming from the previous design direction.
s = s.replaceAll("'个人成长工作台'", "'栖'");
s = s.replaceAll('NORTHSTAR', '栖');
s = s.replaceAll('Personal Growth OS', 'Personal Growth');

// Responsive card layout: two columns on normal phones, one column when truly narrow.
s = s.replace(
  /moduleCard:\s*\{\s*width:\s*'48\.4%',/,
  "moduleCard: { flexGrow: 1, flexBasis: 150, minWidth: 0, maxWidth: '100%',"
);

// Prevent quote text from pushing actions off screen.
s = s.replace(
  /quoteText:\s*\{([^}]*?)maxWidth:\s*280([^}]*?)\}/,
  (_m, a, b) => `quoteText: {${a}flexShrink: 1${b}}`
);

// Drawer width now comes from viewport; retain only a safe max width in static style.
s = s.replace(
  /drawerPanel:\s*\{\s*width:\s*'82%',/,
  "drawerPanel: { maxWidth: 340,"
);

// Make dense rows safer on narrow phones.
s = s.replace(
  /rowBetween:\s*\{([^}]*?)gap:\s*14([^}]*?)\}/,
  (_m, a, b) => `rowBetween: {${a}gap: 10${b}}`
);

fs.writeFileSync(file, s);
console.log('Applied responsive dark-gold UI patch.');

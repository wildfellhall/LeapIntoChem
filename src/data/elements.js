const rawElements = `
1|H|Hydrogen|1.008|1|1
2|He|Helium|4.003|1|18
3|Li|Lithium|6.94|2|1
4|Be|Beryllium|9.012|2|2
5|B|Boron|10.81|2|13
6|C|Carbon|12.011|2|14
7|N|Nitrogen|14.007|2|15
8|O|Oxygen|15.999|2|16
9|F|Fluorine|18.998|2|17
10|Ne|Neon|20.180|2|18
11|Na|Sodium|22.990|3|1
12|Mg|Magnesium|24.305|3|2
13|Al|Aluminum|26.982|3|13
14|Si|Silicon|28.085|3|14
15|P|Phosphorus|30.974|3|15
16|S|Sulfur|32.06|3|16
17|Cl|Chlorine|35.45|3|17
18|Ar|Argon|39.948|3|18
19|K|Potassium|39.098|4|1
20|Ca|Calcium|40.078|4|2
21|Sc|Scandium|44.956|4|3
22|Ti|Titanium|47.867|4|4
23|V|Vanadium|50.942|4|5
24|Cr|Chromium|51.996|4|6
25|Mn|Manganese|54.938|4|7
26|Fe|Iron|55.845|4|8
27|Co|Cobalt|58.933|4|9
28|Ni|Nickel|58.693|4|10
29|Cu|Copper|63.546|4|11
30|Zn|Zinc|65.38|4|12
31|Ga|Gallium|69.723|4|13
32|Ge|Germanium|72.630|4|14
33|As|Arsenic|74.922|4|15
34|Se|Selenium|78.971|4|16
35|Br|Bromine|79.904|4|17
36|Kr|Krypton|83.798|4|18
37|Rb|Rubidium|85.468|5|1
38|Sr|Strontium|87.62|5|2
39|Y|Yttrium|88.906|5|3
40|Zr|Zirconium|91.224|5|4
41|Nb|Niobium|92.906|5|5
42|Mo|Molybdenum|95.95|5|6
43|Tc|Technetium|98|5|7
44|Ru|Ruthenium|101.07|5|8
45|Rh|Rhodium|102.91|5|9
46|Pd|Palladium|106.42|5|10
47|Ag|Silver|107.87|5|11
48|Cd|Cadmium|112.41|5|12
49|In|Indium|114.82|5|13
50|Sn|Tin|118.71|5|14
51|Sb|Antimony|121.76|5|15
52|Te|Tellurium|127.60|5|16
53|I|Iodine|126.90|5|17
54|Xe|Xenon|131.29|5|18
55|Cs|Cesium|132.91|6|1
56|Ba|Barium|137.33|6|2
57|La|Lanthanum|138.91|6|0
58|Ce|Cerium|140.12|6|0
59|Pr|Praseodymium|140.91|6|0
60|Nd|Neodymium|144.24|6|0
61|Pm|Promethium|145|6|0
62|Sm|Samarium|150.36|6|0
63|Eu|Europium|151.96|6|0
64|Gd|Gadolinium|157.25|6|0
65|Tb|Terbium|158.93|6|0
66|Dy|Dysprosium|162.50|6|0
67|Ho|Holmium|164.93|6|0
68|Er|Erbium|167.26|6|0
69|Tm|Thulium|168.93|6|0
70|Yb|Ytterbium|173.05|6|0
71|Lu|Lutetium|174.97|6|0
72|Hf|Hafnium|178.49|6|4
73|Ta|Tantalum|180.95|6|5
74|W|Tungsten|183.84|6|6
75|Re|Rhenium|186.21|6|7
76|Os|Osmium|190.23|6|8
77|Ir|Iridium|192.22|6|9
78|Pt|Platinum|195.08|6|10
79|Au|Gold|196.97|6|11
80|Hg|Mercury|200.59|6|12
81|Tl|Thallium|204.38|6|13
82|Pb|Lead|207.2|6|14
83|Bi|Bismuth|208.98|6|15
84|Po|Polonium|209|6|16
85|At|Astatine|210|6|17
86|Rn|Radon|222|6|18
87|Fr|Francium|223|7|1
88|Ra|Radium|226|7|2
89|Ac|Actinium|227|7|0
90|Th|Thorium|232.04|7|0
91|Pa|Protactinium|231.04|7|0
92|U|Uranium|238.03|7|0
93|Np|Neptunium|237|7|0
94|Pu|Plutonium|244|7|0
95|Am|Americium|243|7|0
96|Cm|Curium|247|7|0
97|Bk|Berkelium|247|7|0
98|Cf|Californium|251|7|0
99|Es|Einsteinium|252|7|0
100|Fm|Fermium|257|7|0
101|Md|Mendelevium|258|7|0
102|No|Nobelium|259|7|0
103|Lr|Lawrencium|266|7|0
104|Rf|Rutherfordium|267|7|4
105|Db|Dubnium|268|7|5
106|Sg|Seaborgium|269|7|6
107|Bh|Bohrium|270|7|7
108|Hs|Hassium|269|7|8
109|Mt|Meitnerium|278|7|9
110|Ds|Darmstadtium|281|7|10
111|Rg|Roentgenium|282|7|11
112|Cn|Copernicium|285|7|12
113|Nh|Nihonium|286|7|13
114|Fl|Flerovium|289|7|14
115|Mc|Moscovium|290|7|15
116|Lv|Livermorium|293|7|16
117|Ts|Tennessine|294|7|17
118|Og|Oganesson|294|7|18`.trim()

export const categories = {
  alkali: { label: 'Alkali metal', color: '#ff9b84' },
  alkaline: { label: 'Alkaline earth', color: '#ffcf62' },
  transition: { label: 'Transition metal', color: '#79d8c2' },
  post: { label: 'Post-transition', color: '#8fcff2' },
  metalloid: { label: 'Metalloid', color: '#b2e56f' },
  nonmetal: { label: 'Reactive nonmetal', color: '#c7b7ff' },
  halogen: { label: 'Halogen', color: '#ff9fc5' },
  noble: { label: 'Noble gas', color: '#a5bdf8' },
  lanthanide: { label: 'Lanthanide', color: '#71d5a5' },
  actinide: { label: 'Actinide', color: '#f2a7a7' },
  unknown: { label: 'Predicted properties', color: '#bdc8c3' },
}

const metalloids = new Set([5, 14, 32, 33, 51, 52])
const postTransition = new Set([13, 31, 49, 50, 81, 82, 83, 84])
const reactiveNonmetals = new Set([1, 6, 7, 8, 15, 16, 34])

function getCategory(number, group) {
  if (number >= 57 && number <= 71) return 'lanthanide'
  if (number >= 89 && number <= 103) return 'actinide'
  if (group === 1 && number !== 1) return 'alkali'
  if (group === 2) return 'alkaline'
  if (group >= 3 && group <= 12) return 'transition'
  if (group === 17) return 'halogen'
  if (group === 18) return 'noble'
  if (metalloids.has(number)) return 'metalloid'
  if (postTransition.has(number)) return 'post'
  if (reactiveNonmetals.has(number)) return 'nonmetal'
  return 'post'
}

const isotopeOverrides = {
  1: [1, 2, 3], 2: [3, 4], 3: [6, 7], 5: [10, 11], 6: [12, 13, 14],
  7: [14, 15], 8: [16, 17, 18], 9: [19], 11: [23], 12: [24, 25, 26],
  14: [28, 29, 30], 15: [31], 16: [32, 33, 34, 36], 17: [35, 37],
  18: [36, 38, 40], 19: [39, 40, 41], 20: [40, 42, 44, 48],
  26: [54, 56, 57, 58], 29: [63, 65], 35: [79, 81], 47: [107, 109],
  53: [127], 79: [197], 82: [204, 206, 207, 208], 92: [234, 235, 238], 94: [239, 240, 242],
}

const electronegativities = {
  H: 2.2, Li: 0.98, Be: 1.57, B: 2.04, C: 2.55, N: 3.04, O: 3.44, F: 3.98,
  Na: 0.93, Mg: 1.31, Al: 1.61, Si: 1.9, P: 2.19, S: 2.58, Cl: 3.16,
  K: 0.82, Ca: 1.0, Fe: 1.83, Co: 1.88, Ni: 1.91, Cu: 1.9, Zn: 1.65,
  Br: 2.96, Ag: 1.93, I: 2.66, Au: 2.54, Hg: 2.0, Pb: 2.33, U: 1.38,
}

function shellsFor(number) {
  const orbitals = [[1,2],[2,2],[2,6],[3,2],[3,6],[4,2],[3,10],[4,6],[5,2],[4,10],[5,6],[6,2],[4,14],[5,10],[6,6],[7,2],[5,14],[6,10],[7,6]]
  let remaining = number
  const shells = Array(7).fill(0)
  orbitals.forEach(([principal, capacity]) => {
    if (remaining <= 0) return
    const electrons = Math.min(capacity, remaining)
    shells[principal - 1] += electrons
    remaining -= electrons
  })
  const transfers = {
    24: [4,3,1], 29: [4,3,1], 41: [5,4,1], 42: [5,4,1], 44: [5,4,1], 45: [5,4,1], 46: [5,4,2], 47: [5,4,1],
    57: [4,5,1], 64: [4,5,1], 78: [6,5,1], 79: [6,5,1], 89: [5,6,1], 90: [5,6,2], 91: [5,6,1], 92: [5,6,1], 96: [5,6,1], 103: [6,7,1],
  }
  const transfer = transfers[number]
  if (transfer) {
    const [from, to, count] = transfer
    shells[from - 1] -= count
    shells[to - 1] += count
  }
  return shells.filter((count) => count > 0)
}

function reactivityFor(category) {
  return {
    alkali: 'Extremely reactive; forms +1 ions and reacts vigorously with water.',
    alkaline: 'Reactive metal; usually loses two electrons to form a +2 ion.',
    transition: 'Variable reactivity and oxidation states; often forms colorful compounds.',
    post: 'Metallic behavior with moderate reactivity and relatively soft bonding.',
    metalloid: 'Intermediate behavior; often a semiconductor with directional covalent bonds.',
    nonmetal: 'Usually shares or gains electrons and forms many covalent compounds.',
    halogen: 'Very reactive electron-gainer; commonly forms a −1 ion in salts.',
    noble: 'Very low reactivity because its outer electron shell is filled.',
    lanthanide: 'Reactive silvery metal, most commonly found in the +3 oxidation state.',
    actinide: 'Radioactive heavy metal with multiple oxidation states.',
    unknown: 'Short-lived synthetic element; bulk chemistry is mostly predicted.',
  }[category]
}

export const elements = rawElements.split('\n').map((line) => {
  const [number, symbol, name, mass, period, group] = line.split('|')
  const atomicNumber = Number(number)
  const category = getCategory(atomicNumber, Number(group))
  const isotopes = isotopeOverrides[atomicNumber] || [Math.round(Number(mass))]
  return {
    number: atomicNumber,
    symbol,
    name,
    mass: Number(mass),
    period: Number(period),
    group: Number(group),
    category,
    isotopes,
    electronegativity: electronegativities[symbol] ?? null,
    shells: shellsFor(atomicNumber),
    reactivity: reactivityFor(category),
  }
})

export const elementBySymbol = Object.fromEntries(elements.map((element) => [element.symbol, element]))

export function periodicPosition(element) {
  if (element.number >= 57 && element.number <= 71) return { row: 8, col: element.number - 54 }
  if (element.number >= 89 && element.number <= 103) return { row: 9, col: element.number - 86 }
  return { row: element.period, col: element.group }
}

export const propertyNotes = {
  H: ['Lightest element', 'Fuel for stars', 'Forms polar bonds with oxygen'],
  He: ['Lowest boiling point', 'Inert noble gas', 'Made by fusion in stars'],
  C: ['Backbone of life', 'Four covalent bonds', 'Diamond and graphite allotropes'],
  N: ['78% of Earth’s air', 'Triple-bonded as N₂', 'Essential in proteins'],
  O: ['Supports combustion', 'Highly electronegative', 'Essential for respiration'],
  Na: ['Soft, silvery metal', 'Reacts with water', 'Pairs readily with chlorine'],
  Cl: ['Green-yellow gas', 'Strong oxidizer', 'Forms chloride salts'],
  Fe: ['Ferromagnetic metal', 'Core of hemoglobin', 'Rusts with oxygen and water'],
  Cu: ['Excellent conductor', 'Forms green patina', 'Often has +1 or +2 charge'],
  U: ['Dense radioactive metal', 'U-235 is fissile', 'Used as nuclear fuel'],
}

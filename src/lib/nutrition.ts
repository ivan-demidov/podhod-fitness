const food = (
  label: string, category: string, kcal: number, protein: number, fat: number, carbs: number, fiber = 0,
) => ({ label, category, kcal, protein, fat, carbs, fiber })

export const cappuccino = { ml: 350, milkGrams: 250, espressoMl: 30, kcal: 133, protein: 7.5, fat: 6.25, carbs: 12.25 }
const per100ml = 100 / cappuccino.ml

export const foods = {
  cappuccino: food('Капучино без сахара', 'Напитки', cappuccino.kcal * per100ml, cappuccino.protein * per100ml, cappuccino.fat * per100ml, cappuccino.carbs * per100ml),
  oats: food('Овсяные хлопья, сухие', 'Крупы и хлеб', 370, 13, 7, 62, 10),
  rice: food('Рис, сухой', 'Крупы и хлеб', 360, 7, 1, 79, 1),
  buckwheat: food('Гречка, сухая', 'Крупы и хлеб', 343, 13, 3.4, 72, 10),
  pasta: food('Макароны из твёрдых сортов, сухие', 'Крупы и хлеб', 356, 13, 2, 72, 4),
  bread: food('Цельнозерновой хлеб', 'Крупы и хлеб', 247, 11, 3.4, 43, 6),
  lentils: food('Чечевица, сухая', 'Крупы и хлеб', 353, 25, 1.1, 60, 11),
  beans: food('Нут консервированный, без жидкости', 'Крупы и хлеб', 139, 7, 2.5, 22, 6),
  chicken: food('Куриная грудка, сырая', 'Мясо и яйца', 120, 22.5, 2.6, 0),
  turkey: food('Филе индейки, сырое', 'Мясо и яйца', 114, 23.7, 1.5, 0),
  beef: food('Говяжий фарш 5%, сырой', 'Мясо и яйца', 137, 21.4, 5, 0),
  egg: food('Яйца без скорлупы', 'Мясо и яйца', 143, 12.6, 9.5, 0.7),
  cottage: food('Творог 5%', 'Молочные продукты', 121, 17, 5, 2),
  yogurt: food('Греческий йогурт 2% без сахара', 'Молочные продукты', 73, 9.8, 2, 4),
  milk: food('Молоко 2,5%', 'Молочные продукты', 52, 3, 2.5, 4.7),
  kefir: food('Кефир 2,5%', 'Молочные продукты', 53, 3, 2.5, 4.2),
  cheese: food('Твёрдый сыр', 'Молочные продукты', 356, 25, 27, 1),
  potato: food('Картофель, сырой', 'Овощи и фрукты', 77, 2, 0.1, 17.5, 2.1),
  carrot: food('Морковь', 'Овощи и фрукты', 41, 0.9, 0.2, 10, 2.8),
  pepper: food('Сладкий перец', 'Овощи и фрукты', 31, 1, 0.3, 6, 2.1),
  cabbage: food('Капуста', 'Овощи и фрукты', 25, 1.3, 0.1, 5.8, 2.5),
  broccoli: food('Брокколи', 'Овощи и фрукты', 34, 2.8, 0.4, 6.6, 2.6),
  tomato: food('Томаты', 'Овощи и фрукты', 18, 0.9, 0.2, 3.9, 1.2),
  cucumber: food('Огурцы', 'Овощи и фрукты', 15, 0.7, 0.1, 3.6, 0.5),
  zucchini: food('Кабачок', 'Овощи и фрукты', 17, 1.2, 0.3, 3.1, 1),
  apple: food('Яблоки', 'Овощи и фрукты', 52, 0.3, 0.2, 14, 2.4),
  banana: food('Бананы без кожуры', 'Овощи и фрукты', 89, 1.1, 0.3, 22.8, 2.6),
  orange: food('Апельсины без кожуры', 'Овощи и фрукты', 47, 0.9, 0.1, 11.8, 2.4),
  berries: food('Замороженные ягоды без сахара', 'Овощи и фрукты', 50, 1, 0.4, 11, 4),
  oil: food('Рапсовое масло', 'Масло, орехи и семена', 884, 0, 100, 0),
  walnuts: food('Грецкие орехи', 'Масло, орехи и семена', 654, 15.2, 65.2, 13.7, 6.7),
  flax: food('Молотый лён', 'Масло, орехи и семена', 534, 18.3, 42.2, 28.9, 27.3),
  honey: food('Мёд', 'Другое', 304, 0, 0, 82, 0),
}
type FoodId = keyof typeof foods
type Ingredient = [FoodId, number]
type Meal = { name: string; steps: string[]; items: Ingredient[] }
const meal = (name: string, steps: string[], ...items: Ingredient[]): Meal => ({ name, steps, items })

const oatBowl = meal('Овсянка, йогурт и банан', [
  'Смешай 120 г молока из списка со 100–120 мл воды и нагрей почти до кипения.',
  'Всыпь хлопья, убавь огонь и вари, помешивая, по инструкции на упаковке. Если загустело слишком сильно, долей немного воды.',
  'Переложи в миску, дай чуть остыть. После варки добавь йогурт, нарезанный банан и молотый лён сверху.',
], ['oats', 55], ['milk', 120], ['yogurt', 170], ['banana', 100], ['flax', 10])
const toastEgg = meal('Омлет, тосты и овощи', [
  'Взбей яйца вилкой со щепоткой соли. Вылей на антипригарную сковороду и готовь на слабом огне под крышкой, пока яйца полностью не схватятся.',
  'Подсуши хлеб. Положи сыр на тосты и подай их с омлетом и нарезанными томатами. Апельсин съешь отдельно.',
], ['egg', 150], ['bread', 70], ['tomato', 150], ['cheese', 20], ['orange', 160])
const cottageBowl = meal('Творог с ягодами и тостом', [
  'Разморозь ягоды по инструкции на упаковке. В миске смешай творог с ягодами и мёдом, сверху добавь измельчённые орехи.',
  'Подсуши хлеб и съешь его отдельно вместе с творогом.',
], ['cottage', 180], ['berries', 150], ['bread', 45], ['walnuts', 10], ['honey', 5])
const chickenRice = meal('Курица с рисом и брокколи', [
  'Промой рис и отвари по инструкции на упаковке. Брокколи и нарезанную морковь приготовь на пару 6–10 минут до нужной мягкости.',
  'Нарежь курицу кубиками и приготовь с указанным маслом на сковороде, переворачивая кусочки. Внутри курицы должно быть 74 °C. Подай с рисом и овощами.',
], ['chicken', 160], ['rice', 70], ['broccoli', 180], ['carrot', 80], ['oil', 8])
const turkeyGrain = meal('Индейка с гречкой и салатом', [
  'Промой гречку, залей водой примерно 1:2 по объёму, вари под крышкой около 15–20 минут до впитывания воды.',
  'Нарежь филе индейки полосками. Часть масла используй для сковороды и доведи мясо до 74 °C внутри.',
  'Нарежь огурец и перец, заправь оставшимся маслом. Подай салат отдельно от гречки с индейкой.',
], ['turkey', 180], ['buckwheat', 80], ['cucumber', 140], ['pepper', 100], ['oil', 15])
const beefPasta = meal('Макароны с говядиной и томатами', [
  'Поставь макароны вариться по инструкции. Нарежь кабачок и томаты кубиками.',
  'Разогрей масло, разбей фарш лопаткой и готовь, пока он не достигнет 71 °C внутри. Добавь кабачок и томаты, туши 8–12 минут. При необходимости долей немного воды.',
  'Слей воду с макарон и смешай их с мясным соусом прямо на сковороде.',
], ['pasta', 80], ['beef', 150], ['tomato', 180], ['zucchini', 120], ['oil', 5])
const bakedChicken = meal('Запечённая курица с картофелем', [
  'Разогрей духовку до 200 °C. Нарежь картофель дольками, перемешай с частью масла и поставь запекаться.',
  'Через 10 минут выложи рядом курицу. Запекай до мягкости картофеля и 74 °C в самой толстой части грудки. Время зависит от её толщины.',
  'Нашинкуй капусту, натри морковь и заправь оставшимся маслом. Подай салат к курице и картофелю.',
], ['chicken', 200], ['potato', 325], ['cabbage', 150], ['carrot', 80], ['oil', 13])
const turkeyLentil = meal('Тушёная индейка с чечевицей', [
  'Промой чечевицу и отвари до мягкости по инструкции на упаковке.',
  'Нарежь индейку и морковь, обжарь на указанном масле, добавь нарезанные томаты и немного воды. Туши до мягкости моркови и 74 °C внутри индейки.',
  'Добавь готовую чечевицу и прогрей пару минут. Хлеб подай отдельно.',
], ['turkey', 120], ['lentils', 67], ['carrot', 100], ['tomato', 160], ['oil', 14], ['bread', 30])
const beefRice = meal('Говядина с рисом и перцем', [
  'Промой рис и отвари по инструкции. Нарежь перец и кабачок полосками или кубиками.',
  'На сковороде с указанным маслом разбей фарш лопаткой. Готовь до 71 °C внутри, добавь овощи и туши 6–10 минут до мягкости.',
  'Выложи мясо и овощи поверх готового риса. Если суховато, подлей воду во время тушения.',
], ['beef', 150], ['rice', 70], ['pepper', 150], ['zucchini', 100], ['oil', 5])
const chickpeaPlate = meal('Тёплый салат с нутом и индейкой', [
  'Нарежь картофель кубиками и отвари до мягкости. Слей жидкость с нута, промой его и прогрей вместе с картофелем.',
  'Нарежь индейку полосками и приготовь с частью масла до 74 °C внутри.',
  'Нарежь свежие огурец и перец. Смешай с тёплыми картофелем, нутом и индейкой. Заправь оставшимся маслом.',
], ['turkey', 145], ['beans', 160], ['potato', 175], ['pepper', 120], ['cucumber', 100], ['oil', 12])
const cottageSnack = meal('Творог, яблоко и орехи', [
  'Нарежь яблоко кубиками и добавь в творог вместе с орехами. Если берёшь с собой, нарежь яблоко перед едой или съешь отдельно.',
], ['cottage', 150], ['apple', 180], ['walnuts', 18])
const yogurtSnack = meal('Йогурт, банан и орехи', [
  'Положи йогурт в миску. Добавь нарезанный банан и рубленые орехи. Подсластитель в расчёт не входит.',
], ['yogurt', 220], ['banana', 120], ['walnuts', 20])
const kefirSnack = meal('Кефир, яблоко и тост с сыром', [
  'Подсуши хлеб и положи на него нарезанный сыр. Кефир выпей отдельно, яблоко съешь вместе с перекусом или после.',
], ['kefir', 250], ['apple', 170], ['bread', 45], ['cheese', 25])
const cottageOrange = meal('Творог, апельсин и орехи', [
  'Очисти апельсин и нарежь дольки в творог. Добавь орехи сверху. При желании съешь фрукт отдельно.',
], ['cottage', 130], ['orange', 180], ['walnuts', 18])

function breakfast(main: Meal): Meal {
  return {
    ...main,
    steps: [...main.steps, 'К завтраку выпей капучино 350 мл. Для домашнего варианта вспень молоко, влей в эспрессо и дополни чашку пеной.'],
    items: [...main.items, ['cappuccino', cappuccino.ml]],
  }
}

export const menu = [
  { day: 'Понедельник', short: 'Пн', meals: [breakfast(oatBowl), chickenRice, cottageSnack, turkeyLentil] },
  { day: 'Вторник', short: 'Вт', meals: [breakfast(toastEgg), turkeyGrain, yogurtSnack, beefRice] },
  { day: 'Среда', short: 'Ср', meals: [breakfast(cottageBowl), beefPasta, kefirSnack, chickpeaPlate] },
  { day: 'Четверг', short: 'Чт', meals: [breakfast(oatBowl), beefRice, cottageOrange, bakedChicken] },
  { day: 'Пятница', short: 'Пт', meals: [breakfast(toastEgg), chickenRice, yogurtSnack, turkeyLentil] },
  { day: 'Суббота', short: 'Сб', meals: [breakfast(cottageBowl), turkeyGrain, kefirSnack, beefPasta] },
  { day: 'Воскресенье', short: 'Вс', meals: [breakfast(oatBowl), chickpeaPlate, cottageSnack, beefRice] },
]

export const mealLabels = ['Завтрак', 'Обед', 'Перекус', 'Ужин']
export function nutrition(items: Ingredient[]) {
  return items.reduce((total, [id, amount]) => {
    const { kcal, protein, fat, carbs, fiber } = foods[id]
    const serving = amount / 100
    return {
      kcal: total.kcal + kcal * serving,
      protein: total.protein + protein * serving,
      fat: total.fat + fat * serving,
      carbs: total.carbs + carbs * serving,
      fiber: total.fiber + fiber * serving,
    }
  }, { kcal: 0, protein: 0, fat: 0, carbs: 0, fiber: 0 })
}

export const shopping = Object.entries(menu.flatMap(d => d.meals).flatMap(m => m.items)
  .reduce<Partial<Record<FoodId, number>>>((result, [id, amount]) => {
    result[id] = (result[id] ?? 0) + amount
    return result
  }, {})).map(([id, amount]) => ({ id: id as FoodId, amount, ...foods[id as FoodId] }))

export function targets(profile: { age: number; height: number; weight: number; sex: 'male' | 'female'; activity: number; deficit: number }) {
  const rmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age + (profile.sex === 'male' ? 5 : -161)
  const expenditure = rmr * profile.activity
  const kcal = Math.round((expenditure - profile.deficit) / 50) * 50
  const protein = Math.round(profile.weight * 1.9 / 5) * 5
  const fat = Math.round(profile.weight * 0.85 / 5) * 5
  const carbs = Math.max(0, Math.round((kcal - protein * 4 - fat * 9) / 4))
  return { rmr, expenditure, kcal, protein, fat, carbs, fiber: 30 }
}

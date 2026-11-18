const food = (
  label: string, category: string, kcal: number, protein: number, fat: number, carbs: number, fiber = 0,
) => ({ label, category, kcal, protein, fat, carbs, fiber })

export const foods = {
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
type Meal = { name: string; items: Ingredient[] }
const meal = (name: string, ...items: Ingredient[]): Meal => ({ name, items })

const oatBowl = meal('Овсянка, йогурт и банан', ['oats', 65], ['milk', 200], ['yogurt', 170], ['banana', 120], ['flax', 10])
const toastEgg = meal('Яйца, тосты и овощи', ['egg', 150], ['bread', 90], ['tomato', 150], ['cheese', 25], ['orange', 160])
const cottageBowl = meal('Творог с ягодами и хлебом', ['cottage', 180], ['berries', 150], ['bread', 60], ['walnuts', 15], ['honey', 10])
const chickenRice = meal('Курица с рисом и брокколи', ['chicken', 160], ['rice', 80], ['broccoli', 180], ['carrot', 80], ['oil', 8])
const turkeyGrain = meal('Индейка с гречкой и салатом', ['turkey', 180], ['buckwheat', 85], ['cucumber', 140], ['pepper', 100], ['oil', 15])
const beefPasta = meal('Макароны с говядиной и томатами', ['pasta', 90], ['beef', 150], ['tomato', 180], ['zucchini', 120], ['oil', 5])
const bakedChicken = meal('Запечённая курица с картофелем', ['chicken', 200], ['potato', 350], ['cabbage', 150], ['carrot', 80], ['oil', 13])
const turkeyLentil = meal('Тушёная индейка с чечевицей', ['turkey', 120], ['lentils', 67], ['carrot', 100], ['tomato', 160], ['oil', 14], ['bread', 30])
const beefRice = meal('Говядина с рисом и перцем', ['beef', 150], ['rice', 85], ['pepper', 150], ['zucchini', 100], ['oil', 5])
const chickpeaPlate = meal('Тёплый салат с нутом и индейкой', ['turkey', 145], ['beans', 160], ['potato', 200], ['pepper', 120], ['cucumber', 100], ['oil', 12])
const cottageSnack = meal('Творог, яблоко и орехи', ['cottage', 150], ['apple', 180], ['walnuts', 18])
const yogurtSnack = meal('Йогурт, банан и орехи', ['yogurt', 220], ['banana', 120], ['walnuts', 20])
const kefirSnack = meal('Кефир, яблоко и тост с сыром', ['kefir', 250], ['apple', 170], ['bread', 45], ['cheese', 25])
const cottageOrange = meal('Творог, апельсин и орехи', ['cottage', 130], ['orange', 180], ['walnuts', 18])

export const menu = [
  { day: 'Понедельник', short: 'Пн', meals: [oatBowl, chickenRice, cottageSnack, turkeyLentil] },
  { day: 'Вторник', short: 'Вт', meals: [toastEgg, turkeyGrain, yogurtSnack, beefRice] },
  { day: 'Среда', short: 'Ср', meals: [cottageBowl, beefPasta, kefirSnack, chickpeaPlate] },
  { day: 'Четверг', short: 'Чт', meals: [oatBowl, beefRice, cottageOrange, bakedChicken] },
  { day: 'Пятница', short: 'Пт', meals: [toastEgg, chickenRice, yogurtSnack, turkeyLentil] },
  { day: 'Суббота', short: 'Сб', meals: [cottageBowl, turkeyGrain, kefirSnack, beefPasta] },
  { day: 'Воскресенье', short: 'Вс', meals: [oatBowl, chickpeaPlate, cottageSnack, beefRice] },
]

export const mealLabels = ['Завтрак', 'Обед', 'Перекус', 'Ужин']
export function nutrition(items: Ingredient[]) {
  return items.reduce((total, [id, grams]) => {
    const { kcal, protein, fat, carbs, fiber } = foods[id]
    const serving = grams / 100
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
  .reduce<Partial<Record<FoodId, number>>>((result, [id, grams]) => {
    result[id] = (result[id] ?? 0) + grams
    return result
  }, {})).map(([id, grams]) => ({ id: id as FoodId, grams, ...foods[id as FoodId] }))

export function targets(profile: { age: number; height: number; weight: number; sex: 'male' | 'female'; activity: number; deficit: number }) {
  const rmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age + (profile.sex === 'male' ? 5 : -161)
  const expenditure = rmr * profile.activity
  const kcal = Math.round((expenditure - profile.deficit) / 50) * 50
  const protein = Math.round(profile.weight * 1.9 / 5) * 5
  const fat = Math.round(profile.weight * 0.85 / 5) * 5
  const carbs = Math.max(0, Math.round((kcal - protein * 4 - fat * 9) / 4))
  return { rmr, expenditure, kcal, protein, fat, carbs, fiber: 30 }
}

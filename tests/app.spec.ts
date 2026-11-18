import { expect, test, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { readFile } from 'node:fs/promises'

const fixture = {
  kind: 'podhod-setup', version: 1,
  profile: {
    name: 'Тест', age: 30, height: 180, weight: 80, sex: 'male',
    activity: 1.4, deficit: 250, notes: 'Синтетические данные.',
    supplement: '',
    fitbit: { period: 'Тестовый период', steps: 6000, phoneSteps: 5000, sleepMinutes: 448, shortNights: 2, notes: 'Синтетическая сводка.' },
  },
}

async function visit(page: Page, section = 'today') {
  await page.goto('./#' + section)
}

async function chooseFile(page: Page, name: string, value: unknown) {
  await page.locator('input[type=file]').setInputFiles({ name, mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(value)) })
}

test('профиль, оба плана, семь дней меню, список покупок и источники', async ({ page }) => {
  await visit(page)
  await expect(page.getByRole('heading', { name: 'Сегодня' })).toBeVisible()
  await page.getByRole('link', { name: 'Замер', exact: true }).click()
  await expect(page.getByRole('dialog').getByText('Новый замер')).toBeVisible()
  await visit(page)
  await chooseFile(page, 'setup.json', fixture)
  await page.getByRole('button', { name: 'Импортировать' }).click()
  await expect(page.getByRole('heading', { name: 'Привет, Тест' })).toBeVisible()
  await visit(page, 'training')
  await expect(page.getByRole('button', { name: '3 дня' })).toHaveAttribute('aria-pressed', 'true')
  await page.getByText('Жим штанги лёжа', { exact: true }).click()
  await expect(page.locator('details[open]').getByText('Рабочие подходы')).toBeVisible()
  await expect(page.getByText(/3–4 повторения в запасе/).first()).toBeVisible()
  await page.getByRole('button', { name: '4 дня' }).click()
  await expect(page.getByRole('button', { name: /задняя цепь/ })).toBeVisible()
  await page.reload()
  await expect(page.getByRole('button', { name: '4 дня' })).toHaveAttribute('aria-pressed', 'true')

  await visit(page, 'nutrition')
  await expect(page.getByRole('heading', { name: 'Твой дневной ориентир' })).toBeVisible()
  for (const day of ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье']) {
    await page.getByRole('button', { name: day, exact: true }).click()
    await expect(page.getByRole('heading', { name: day, exact: true })).toBeVisible()
    await expect(page.locator('.meal-card')).toHaveCount(4)
    await expect(page.locator('.menu-totals')).toContainText(/ккал · Б .* г · Ж .* г · У .* г/)
  }
  await page.getByRole('button', { name: 'Покупки' }).click()
  const oats = page.getByRole('checkbox', { name: /Овсяные хлопья/ })
  await oats.check()
  await page.reload()
  await page.getByRole('button', { name: 'Покупки' }).click()
  await expect(oats).toBeChecked()
  await visit(page, 'knowledge')
  await page.locator('summary').getByText('ACSM · силовые тренировки', { exact: true }).click()
  await expect(page.locator('.guides').getByRole('link', { name: /ACSM/ })).toHaveAttribute('href', /PMC12965823/)
  await visit(page, 'profile')
  await expect(page.getByRole('heading', { name: 'Fitbit Air' })).toBeVisible()
  await page.getByRole('button', { name: 'Тёмная', exact: true }).click()
  await expect(page.locator('html')).toHaveClass('dark')
  await page.reload()
  await expect(page.locator('html')).toHaveClass('dark')
  await chooseFile(page, 'wrong.json', { wrong: true })
  await expect(page.getByText(/Файл не прочитан/)).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Fitbit Air' })).toBeVisible()
})

test('запись и правка веса и времени, история, графики и резервная копия', async ({ page, browser }) => {
  await visit(page)
  await page.getByRole('button', { name: 'Начать тренировку' }).click()
  await expect(page.getByRole('heading', { name: 'Дневник', exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Сохранить подход' }).click()
  await expect(page.getByRole('alert')).toContainText('Введи')
  await page.getByRole('textbox', { name: 'Вес · кг со штангой', exact: true }).fill('40')
  await page.getByLabel('Повторения', { exact: true }).fill('8')
  await page.getByRole('button', { name: 'Сохранить подход' }).click()
  await expect(page.getByText('40 кг со штангой × 8', { exact: true })).toBeVisible()
  await expect(page.getByRole('timer')).toBeVisible()
  await page.reload()
  await expect(page.getByRole('timer')).toBeVisible()
  await page.getByRole('button', { name: /Редактировать подход/ }).click()
  await page.getByRole('dialog').getByRole('textbox', { name: 'Вес · кг со штангой', exact: true }).fill('42,5')
  await page.getByRole('button', { name: 'Сохранить изменения' }).click()
  await expect(page.getByText('42,5 кг со штангой × 8', { exact: true })).toBeVisible()

  await page.getByRole('button', { name: 'Завершить тренировку' }).click()
  await page.getByRole('button', { name: 'Завершить', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Прошлые тренировки' })).toBeVisible()
  await visit(page, 'training')
  await page.getByRole('button', { name: /Корпус и подвижность/ }).click()
  await page.getByRole('button', { name: 'В дневник' }).click()
  await page.getByRole('combobox', { name: 'Упражнение', exact: true }).selectOption('plank')
  await page.getByLabel('Время, с на сторону', { exact: true }).fill('20')
  await page.getByRole('button', { name: 'Сохранить подход' }).click()
  await expect(page.getByText('20 с / сторона', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: /Редактировать подход/ }).click()
  await page.getByRole('dialog').getByLabel('Время, с на сторону', { exact: true }).fill('25')
  await page.getByRole('button', { name: 'Сохранить изменения' }).click()
  await expect(page.getByText('25 с / сторона', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Завершить тренировку' }).click()
  await page.getByRole('button', { name: 'Завершить', exact: true }).click()

  await visit(page, 'progress')
  for (const [index, [weight, waist]] of [['80', '89'], ['79,6', '88,5']].entries()) {
    await page.getByRole('button', { name: 'Добавить замер' }).click()
    const dialog = page.getByRole('dialog')
    if (index === 0) await dialog.getByLabel('Дата', { exact: true }).fill('2025-01-10')
    await dialog.getByLabel('Вес, кг').fill(weight)
    await dialog.getByLabel('Талия, см').fill(waist)
    await dialog.getByRole('button', { name: 'Сохранить замер' }).click()
    await expect(dialog).toHaveCount(0)
  }
  await expect(page.getByRole('img', { name: /Изменение веса, 2 точек/ })).toBeVisible()
  await page.getByRole('button', { name: 'Талия', exact: true }).click()
  await expect(page.getByRole('img', { name: /Изменение талии, 2 точек/ })).toBeVisible()
  await visit(page, 'profile')
  const downloading = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Экспорт' }).click()
  const backup = JSON.parse(await readFile((await (await downloading).path())!, 'utf8'))
  expect(backup.data.sets).toHaveLength(2)
  expect(backup.data.measures).toHaveLength(2)
  expect(backup.data.workouts).toHaveLength(2)

  const restored = await browser.newContext({ baseURL: page.url().split('#')[0] })
  try {
    const fresh = await restored.newPage()
    await visit(fresh, 'profile')
    for (let i = 0; i < 2; i++) {
      await chooseFile(fresh, 'backup.json', backup)
      await fresh.getByRole('button', { name: 'Импортировать' }).click()
      await expect(fresh.getByRole('dialog')).toHaveCount(0)
    }
    await visit(fresh, 'diary')
    await fresh.getByRole('button', { name: 'История' }).click()
    await fresh.getByText('Всё тело · жим', { exact: true }).click()
    await expect(fresh.getByText(/42,5 кг со штангой/)).toBeVisible()
    await visit(fresh, 'progress')
    await expect(fresh.locator('.progress-lists .record-row')).toHaveCount(4)
  } finally {
    await restored.close()
  }
})

test('проверка кэша, перезапуска без сети, навигации и офлайн-записи', async ({ page, context }) => {
  await visit(page, 'profile')
  await expect(page.getByText('Основные экраны готовы к офлайн-работе')).toBeVisible({ timeout: 15000 })
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller))
  await context.setOffline(true)
  try {
    await page.reload({ waitUntil: 'domcontentloaded' })
    await expect(page.getByRole('heading', { name: 'Профиль', exact: true })).toBeVisible()
    for (const [path, label] of [['training', 'Тренировки'], ['nutrition', 'Питание'], ['knowledge', 'Добавки и знания'], ['progress', 'Прогресс'], ['today', 'Сегодня']]) {
      await page.evaluate(section => location.hash = section, path)
      await expect(page.getByRole('heading', { name: label, exact: true })).toBeVisible()
    }
    await page.getByRole('button', { name: 'Начать тренировку' }).click()
    await page.getByRole('textbox', { name: 'Вес · кг со штангой', exact: true }).fill('35')
    await page.getByLabel('Повторения', { exact: true }).fill('7')
    await page.getByRole('button', { name: 'Сохранить подход' }).click()
    await page.reload({ waitUntil: 'domcontentloaded' })
    await expect(page.getByText('35 кг со штангой × 7', { exact: true })).toBeVisible()
  } finally {
    await context.setOffline(false)
  }
})

test('все разделы вмещаются в экран, навигация и контраст', async ({ page }) => {
  await visit(page)
  for (const section of ['today', 'training', 'diary', 'progress', 'nutrition', 'knowledge', 'profile']) {
    await visit(page, section)
    await expect(page.locator('h1')).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toEqual(true)
  }
  if (await page.locator('.side-nav').isVisible()) {
    for (const section of ['today', 'profile']) {
      await visit(page, section)
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
      expect(results.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) }))).toEqual([])
    }
  }
})

test('меню «Ещё» целиком видно у нижнего края и открывает все разделы', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.setViewportSize({ width: 440, height: 956 })
  await visit(page, 'progress')
  await expect(page.getByRole('heading', { name: 'Прогресс', exact: true })).toBeVisible()
  const trigger = page.getByRole('button', { name: 'Ещё', exact: true })
  const menu = page.getByRole('dialog', { name: 'Разделы' })

  for (const [width, height] of [[440, 956], [320, 640], [740, 340]]) {
    await page.setViewportSize({ width, height })
    await trigger.click()
    await expect(menu).toBeVisible()
    await expect.poll(() => menu.evaluate(el => {
      const { left, right, top, bottom } = el.getBoundingClientRect()
      return left >= -1 && right <= innerWidth + 1 && top >= 0 && Math.abs(bottom - innerHeight) <= 1
    })).toBe(true)
    await menu.getByRole('button', { name: 'Закрыть', exact: true }).click()
    await expect(menu).toHaveCount(0)
    await expect(trigger).toBeFocused()
  }

  for (const title of ['Питание', 'Добавки и знания', 'Профиль']) {
    await trigger.click()
    await menu.getByRole('link', { name: title, exact: true }).click()
    await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible()
    await expect(menu).toHaveCount(0)
  }
  await trigger.click()
  await page.keyboard.press('Escape')
  await expect(menu).toHaveCount(0)
  await expect(trigger).toBeFocused()
})

import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'

const source = fs.readFileSync('src/components/auth/AuthModal.vue', 'utf8')

test('registration keeps the existing auth payload and owns eight local industry cards', () => {
  assert.match(source, /authStore\.register\(\{[\s\S]*email:[\s\S]*password:[\s\S]*name:/)
  assert.doesNotMatch(source.match(/authStore\.register\(\{[\s\S]*?\}\)/)?.[0] || '', /interests|industryCategories|category/)

  const optionsBlock = source.match(/const interestOptions = \[[\s\S]*?\n\s*\]/)?.[0] || ''
  assert.ok(optionsBlock, 'interestOptions must be declared')
  const optionObjects = [...optionsBlock.matchAll(/\{[\s\S]*?\}/g)].map((match) => match[0])
  const keys = optionObjects.map((option) => option.match(/key:\s*'([A-Z]+)'/)?.[1]).filter(Boolean)
  assert.deepEqual(keys, ['CA', 'CB', 'TX', 'LT', 'MV', 'FT', 'CT', 'OTHER'])

  const categoryExpectations = {
    CA: ['甲種小客車', 'industryCaCarImage', 'industry-ca-car.png'],
    CB: ['乙種小客車', 'industryCbCarImage', 'industry-cb-car.png'],
    TX: ['計程車', 'industryTaxiImage', 'industry-taxi.png'],
    LT: ['小貨車', 'industryLightTruckImage', 'industry-light-truck.png'],
    MV: ['搬家公司', 'industryMovingImage', 'industry-moving.png'],
    FT: ['汽車貨運', 'industryFreightImage', 'industry-freight.png'],
    CT: ['貨櫃貨運', 'industryContainerImage', 'industry-container.png'],
    OTHER: ['其他產業', 'industryOtherImage', 'industry-other.png']
  }

  for (const [key, [label, imageVariable, asset]] of Object.entries(categoryExpectations)) {
    const option = optionObjects.find((candidate) => candidate.includes(`key: '${key}'`))
    assert.ok(option, `missing registration category: ${key}`)
    assert.match(option, new RegExp(`label:\\s*'${label}'`))
    assert.match(option, new RegExp(`image:\\s*${imageVariable}`))
    assert.match(source, new RegExp(`import\\s+${imageVariable}\\s+from\\s+['\"][^'\"]*${asset.replace('.', '\\.')}`))
  }

  assert.match(source, /interests: \{[\s\S]*CA: false[\s\S]*OTHER: false/)
  assert.match(source, /registerForm\.interests\[item\.key\]/)
  assert.match(source, /<Stepper[\s\S]*:value="1"[\s\S]*:value="2"[\s\S]*:value="3"/)
  assert.ok(source.includes('<div class="brand-badge">KQJ</div>'))
  for (const label of ['建立三瑝會員帳號', '基本資料', '產業意向', '完成註冊', '其他產業', '甲種小客車', '乙種小客車', '計程車', '小貨車', '搬家公司', '汽車貨運', '貨櫃貨運']) {
    assert.ok(source.includes(label), `missing registration label: ${label}`)
  }
  assert.ok(source.includes('會員帳號建立成功！'))
  assert.ok(source.includes('驗證信已寄至您的 Email'))
  assert.ok(source.includes('請完成信箱驗證後再登入會員中心。'))
  assert.ok(source.includes('我知道了'))
  assert.match(source, /const finishRegister = \(\) => \{[\s\S]*authStore\.closeAuthModal\(\)[\s\S]*authStore\.authMode = 'login'/)
})

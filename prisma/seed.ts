import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  const sampleSource = await prisma.source.upsert({
    where: { name: 'sample' },
    update: {},
    create: {
      name: 'sample',
      baseUrl: 'https://example.com',
      isActive: true,
      rateLimitMs: 1000,
      config: JSON.stringify({
        enabled: true,
        searchPath: '/search',
        headers: {
          'Accept': 'application/json'
        }
      })
    }
  })

  const sampleCard = await prisma.card.upsert({
    where: { 
      setName_setNumber: { 
        setName: 'Sample Set', 
        setNumber: '001' 
      } 
    },
    update: {},
    create: {
      name: 'Pikachu',
      japanName: 'ピカチュウ',
      setName: 'Sample Set',
      setNumber: '001',
      rarity: 'Rare',
      cardType: 'Pokemon',
      series: 'Sample Series',
      imageUrl: 'https://example.com/pikachu.jpg'
    }
  })

  await prisma.priceRecord.create({
    data: {
      cardId: sampleCard.id,
      sourceId: sampleSource.id,
      price: 5000,
      currency: 'JPY',
      condition: 'mint',
      inStock: true,
      productUrl: 'https://example.com/pikachu-001'
    }
  })

  console.log('✅ Seed completed successfully')
  console.log(`📊 Created source: ${sampleSource.name}`)
  console.log(`🃏 Created card: ${sampleCard.name}`)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
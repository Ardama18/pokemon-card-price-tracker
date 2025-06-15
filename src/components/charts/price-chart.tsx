'use client'

import { useState, useEffect } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import 'chartjs-adapter-date-fns'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
)

interface PriceRecord {
  id: number
  price: number
  currency: string
  condition?: string
  scrapedAt: string
  source: {
    name: string
  }
}

interface PriceChartProps {
  cardId: number
}

export function PriceChart({ cardId }: PriceChartProps) {
  const [priceData, setPriceData] = useState<PriceRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedSource, setSelectedSource] = useState<string>('all')
  const [selectedCurrency, setSelectedCurrency] = useState<string>('all')

  useEffect(() => {
    const fetchPriceHistory = async () => {
      try {
        const response = await fetch(`/api/cards/${cardId}/prices`)
        if (response.ok) {
          const data = await response.json()
          setPriceData(data)
        }
      } catch (error) {
        console.error('Failed to fetch price history:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPriceHistory()
  }, [cardId])

  if (isLoading) {
    return <div className="animate-pulse bg-gray-200 h-64 rounded-lg"></div>
  }

  if (priceData.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">価格履歴がありません</p>
      </div>
    )
  }

  // Get unique sources and currencies
  const sources = Array.from(new Set(priceData.map(p => p.source.name)))
  const currencies = Array.from(new Set(priceData.map(p => p.currency)))

  // Filter data based on selections
  const filteredData = priceData.filter(record => {
    const sourceMatch = selectedSource === 'all' || record.source.name === selectedSource
    const currencyMatch = selectedCurrency === 'all' || record.currency === selectedCurrency
    return sourceMatch && currencyMatch
  })

  // Group data by source for multiple lines
  const dataBySource = filteredData.reduce((acc, record) => {
    const key = `${record.source.name}-${record.currency}`
    if (!acc[key]) {
      acc[key] = []
    }
    acc[key].push(record)
    return acc
  }, {} as Record<string, PriceRecord[]>)

  // Colors for different sources
  const colors = [
    '#3B82F6', // blue
    '#EF4444', // red
    '#10B981', // green
    '#F59E0B', // amber
    '#8B5CF6', // purple
    '#06B6D4', // cyan
  ]

  const datasets = Object.entries(dataBySource).map(([sourceKey, records], index) => {
    const [sourceName, currency] = sourceKey.split('-')
    return {
      label: `${sourceName} (${currency})`,
      data: records
        .sort((a, b) => new Date(a.scrapedAt).getTime() - new Date(b.scrapedAt).getTime())
        .map(record => ({
          x: new Date(record.scrapedAt),
          y: record.price,
        })),
      borderColor: colors[index % colors.length],
      backgroundColor: colors[index % colors.length] + '20',
      fill: false,
      tension: 0.1,
    }
  })

  const chartData = {
    datasets,
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: '価格推移',
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const currency = context.dataset.label.match(/\(([^)]+)\)/)?.[1] || ''
            const symbol = currency === 'JPY' ? '¥' : currency === 'USD' ? '$' : '€'
            return `${context.dataset.label}: ${symbol}${context.parsed.y.toLocaleString()}`
          },
        },
      },
    },
    scales: {
      x: {
        type: 'time' as const,
        time: {
          displayFormats: {
            day: 'MM/dd',
            week: 'MM/dd',
            month: 'MM/yyyy'
          }
        },
        title: {
          display: true,
          text: '日付',
        },
      },
      y: {
        title: {
          display: true,
          text: '価格',
        },
        ticks: {
          callback: function(value: any) {
            return value.toLocaleString()
          },
        },
      },
    },
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            販売元
          </label>
          <select
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="all">すべて</option>
            {sources.map(source => (
              <option key={source} value={source}>{source}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            通貨
          </label>
          <select
            value={selectedCurrency}
            onChange={(e) => setSelectedCurrency(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="all">すべて</option>
            {currencies.map(currency => (
              <option key={currency} value={currency}>{currency}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg">
        <Line data={chartData} options={options} />
      </div>
    </div>
  )
}
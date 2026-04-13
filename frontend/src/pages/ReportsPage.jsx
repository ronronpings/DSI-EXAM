import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded'
import PrintRoundedIcon from '@mui/icons-material/PrintRounded'
import {
  Box,
  Button,
  Card,
  CardContent,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import toast from 'react-hot-toast'
import api from '../api/axios.js'
import getApiErrorMessage from '../utils/getApiErrorMessage.js'

function ReportsPage() {
  const [filters, setFilters] = useState({
    date_from: '',
    date_to: '',
    status: '',
  })
  const [downloading, setDownloading] = useState(false)
  const [printing, setPrinting] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setFilters((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const buildParams = () => {
    return {
      date_from: filters.date_from || undefined,
      date_to: filters.date_to || undefined,
      status: filters.status || undefined,
    }
  }

  const handleDownloadExcel = async () => {
    try {
      setDownloading(true)

      const response = await api.get('/reports/sales/download', {
        params: buildParams(),
        responseType: 'blob',
      })

      const blob = new Blob([
        response.data,
      ], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })

      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `sales-report-${Date.now()}.xlsx`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      toast.success('Excel report downloaded successfully.')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to download Excel report.'))
    } finally {
      setDownloading(false)
    }
  }

  const handlePrintReport = async () => {
    try {
      setPrinting(true)

      const response = await api.get('/reports/sales/print', {
        params: buildParams(),
        responseType: 'blob',
      })

      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      window.open(url, '_blank')

      toast.success('Printable report opened successfully.')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to open printable report.'))
    } finally {
      setPrinting(false)
    }
  }

  return (
    <Stack spacing={3}>
      <BoxTitle
        title="Reports"
        subtitle="Generate printable and downloadable sales reports by date range."
      />

      <Card>
        <CardContent>
          <Stack spacing={3}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
             <TextField
                name="date_from"
                type="date"
                value={filters.date_from}
                onChange={handleChange}
                fullWidth
                label="Date From"
                slotProps={{
                  inputLabel: { shrink: true },
                }}
              />

              <TextField
                name="date_to"
                type="date"
                value={filters.date_to}
                onChange={handleChange}
                fullWidth
                label="Date To"
                slotProps={{
                  inputLabel: { shrink: true },
                }}
              />


              <TextField
                select
                label="Status"
                name="status"
                value={filters.status}
                onChange={handleChange}
                fullWidth
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="paid">Paid</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
                <MenuItem value="partially_returned">Partially Returned</MenuItem>
                <MenuItem value="returned">Returned</MenuItem>
              </TextField>
            </Stack>

            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                startIcon={<DownloadRoundedIcon />}
                onClick={handleDownloadExcel}
                disabled={downloading}
              >
                {downloading ? 'Downloading...' : 'Download Excel'}
              </Button>

              <Button
                variant="outlined"
                startIcon={<PrintRoundedIcon />}
                onClick={handlePrintReport}
                disabled={printing}
              >
                {printing ? 'Opening...' : 'Print Report'}
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  )
}

function BoxTitle({ title, subtitle }) {
  return (
    <div>
      <Typography variant="h4" gutterBottom>
        {title}
      </Typography>
      <Typography color="text.secondary">{subtitle}</Typography>
    </div>
  )
}

export default ReportsPage

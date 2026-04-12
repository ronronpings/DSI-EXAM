import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded'
import PrintRoundedIcon from '@mui/icons-material/PrintRounded'
import {
  Button,
  Card,
  CardContent,
  Stack,
  Typography,
} from '@mui/material'

function ReportsPage() {
  return (
    <Stack spacing={3}>
      <BoxTitle
        title="Reports"
        subtitle="Generate printable and downloadable sales reports by date range."
      />

      <Card>
        <CardContent>
          <Stack direction="row" spacing={2}>
            <Button variant="contained" startIcon={<DownloadRoundedIcon />}>
              Download CSV
            </Button>
            <Button variant="outlined" startIcon={<PrintRoundedIcon />}>
              Print Report
            </Button>
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

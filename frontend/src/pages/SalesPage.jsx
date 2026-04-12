import AddShoppingCartRoundedIcon from '@mui/icons-material/AddShoppingCartRounded'
import {
  Button,
  Card,
  CardContent,
  Stack,
  Typography,
} from '@mui/material'

function SalesPage() {
  return (
    <Stack spacing={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <BoxTitle
          title="Sales"
          subtitle="Create transactions, review invoices, and track posted sales records."
        />
        <Button variant="contained" startIcon={<AddShoppingCartRoundedIcon />}>
          Create Sale
        </Button>
      </Stack>

      <Card>
        <CardContent>
          <Typography color="text.secondary">
            Sales transaction workspace will be connected next.
          </Typography>
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

export default SalesPage

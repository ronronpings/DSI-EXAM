import AddRoundedIcon from '@mui/icons-material/AddRounded'
import {
  Button,
  Card,
  CardContent,
  Stack,
  Typography,
} from '@mui/material'

function CustomersPage() {
  return (
    <Stack spacing={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <BoxTitle
          title="Customers"
          subtitle="Maintain buyer records used in sales transactions and reporting."
        />
        <Button variant="contained" startIcon={<AddRoundedIcon />}>
          New Customer
        </Button>
      </Stack>

      <Card>
        <CardContent>
          <Typography color="text.secondary">
            Customer table will be connected next.
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

export default CustomersPage

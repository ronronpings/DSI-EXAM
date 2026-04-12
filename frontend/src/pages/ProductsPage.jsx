import AddRoundedIcon from '@mui/icons-material/AddRounded'
import {
  Button,
  Card,
  CardContent,
  Stack,
  Typography,
} from '@mui/material'

function ProductsPage() {
  return (
    <Stack spacing={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <BoxTitle
          title="Products"
          subtitle="Manage sellable inventory, pricing, active status, and stock levels."
        />
        <Button variant="contained" startIcon={<AddRoundedIcon />}>
          Add Product
        </Button>
      </Stack>

      <Card>
        <CardContent>
          <Typography color="text.secondary">
            Product inventory table will be connected next.
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

export default ProductsPage

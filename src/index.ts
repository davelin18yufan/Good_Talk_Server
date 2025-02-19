import { config } from "dotenv"

import { app } from "./server"
import { PORT_APP } from "./constants/config"

config()

app.listen(PORT_APP || 3000, () => {
  console.log(`Server running on port ${PORT_APP}.`)
})

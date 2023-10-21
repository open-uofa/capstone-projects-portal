import * as React from "react"
import ReactDOM from "react-dom"
import CssBaseline from "@mui/material/CssBaseline"
import { ThemeProvider } from "@mui/material/styles"
import App from "./App"
import UAlbertaTheme from "./theme"

ReactDOM.render(
    <ThemeProvider theme={UAlbertaTheme}>
        {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
        <CssBaseline />
        <App />
    </ThemeProvider>,
    document.querySelector("#root")
)

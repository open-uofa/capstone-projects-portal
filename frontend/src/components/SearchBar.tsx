import SearchIcon from "@mui/icons-material/Search"
import { InputAdornment, TextField } from "@mui/material"
import type { ChangeEvent } from "react"

export default function SearchBar(props: {
    value: string
    onChange: (
        event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
    ) => void
}): JSX.Element {
    const { value, onChange } = props

    return (
        <TextField
            color="primary"
            fullWidth
            variant="outlined"
            placeholder="Search"
            sx={{ backgroundColor: "#ffffff" }}
            InputProps={{
                startAdornment: (
                    <InputAdornment position="start">
                        <SearchIcon />
                    </InputAdornment>
                ),
            }}
            value={value}
            onChange={onChange}
        />
    )
}

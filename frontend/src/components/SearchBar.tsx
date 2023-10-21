import * as React from "react"
import { ChangeEvent } from "react"
import { InputAdornment, TextField } from "@mui/material"
import SearchIcon from "@mui/icons-material/Search"

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

import { Chip, type ChipTypeMap, useTheme } from "@mui/material"
import type * as React from "react"

export default function ProjectChip(props: {
    color: ChipTypeMap["props"]["color"]
    value: string
    onClick?: React.MouseEventHandler<HTMLDivElement>
}): JSX.Element {
    const { color, value, onClick = undefined } = props

    const theme = useTheme()

    return (
        <Chip
            color={color}
            label={value}
            size="small"
            sx={{
                [theme.breakpoints.down("sm")]: {
                    mb: 0.7,
                },
            }}
            onClick={onClick}
        />
    )
}

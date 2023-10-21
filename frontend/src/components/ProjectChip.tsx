import * as React from "react"
import { Chip, ChipTypeMap, useTheme } from "@mui/material"

export default function ProjectChip(props: {
    color: ChipTypeMap["props"]["color"]
    value: string
    onClick?: React.MouseEventHandler<HTMLDivElement>
}): JSX.Element {
    const { color, value, onClick } = props

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
ProjectChip.defaultProps = {
    onClick: undefined,
}

interface ErrorDescription {
    title: string
    message: string
}

const errors: { [key: string]: ErrorDescription } = {
    "404": {
        title: "404 Not Found",
        message: "The page you are looking for does not exist",
    },
}

export default errors

// Selenium WebDriver
import selenium from "selenium-webdriver"
import chrome from "selenium-webdriver/chrome"
import "chromedriver"

import express from "express"
import { Server } from "http"
import { LoginResult, LoginWithOAuth2ProviderRequest } from "../models/login"

// Code that does not authenticate with GitHub
const BAD_CODE_ERROR_MESSAGE = "Bad code"

// Code that authenticates with GitHub with a portal user
const GOOD_CODE = "1"
const USER_NAME = "GitHub User"

// Code that authenticates with GitHub with a non-portal user
const UNKNOWN_USER_CODE = "2"
const UNKNOWN_USER_ERROR_MESSAGE = "Unknown user"

// http server for mocking API responses from our server and GitHub
const app = express()
app.use(express.json())
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", req.headers.origin ?? "*")
    res.header("Access-Control-Allow-Headers", "Content-Type")
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
    next()
})

// Mock API responses from our OAuth2 login endpoint
app.post("/api/login/oauth2/", (req, res) => {
    // Delay response so the client can see the loading spinner
    setTimeout(() => {
        const requestData = req.body as LoginWithOAuth2ProviderRequest
        if (requestData.code === GOOD_CODE) {
            // Send success response if the code is GOOD_CODE
            const responseData: LoginResult = {
                success: true,
                token: "HEREISYOURTOKEN",
                user: {
                    logged_in: true,
                    is_superuser: false,
                    has_password: false,
                    id: "f5f5f5f5-f5f5-f5f5-f5f5-f5f5f5f5f5f5",
                    name: USER_NAME,
                    image: undefined,
                },
            }
            res.status(200).json(responseData)
        } else if (requestData.code === UNKNOWN_USER_CODE) {
            // Send error response if the code is UNKNOWN_USER_CODE
            const responseData: LoginResult = {
                success: false,
                error: UNKNOWN_USER_ERROR_MESSAGE,
            }
            res.status(401).json(responseData)
        } else {
            // Otherwise, send error response with BAD_CODE_ERROR_MESSAGE
            const responseData: LoginResult = {
                success: false,
                error: BAD_CODE_ERROR_MESSAGE,
            }
            res.status(400).json(responseData)
        }
    }, 500)
})

// Mock GitHub API login page that contains buttons to generate
// each of the possible responses from the OAuth2 login endpoint
app.get("/api/mock-github/login/oauth/authorize", (req, res) => {
    res.status(200).sendFile("github-login.html", { root: __dirname })
})

let server: Server
beforeAll((done) => {
    server = app.listen(8192, () => done())
})

const makeDriver = (): selenium.ThenableWebDriver => {
    const chromeOptions = new chrome.Options()
        .headless()
        .addArguments(
            "--no-sandbox",
            "--disable-gpu",
            "--disable-dev-shm-usage"
        )
    if (process.env.CHROME_BINARY_PATH)
        chromeOptions.setChromeBinaryPath(process.env.CHROME_BINARY_PATH)

    const driver = new selenium.Builder()
        .forBrowser("chrome")
        .setChromeOptions(chromeOptions)
        .build()
    driver.manage().setTimeouts({ implicit: 5000, pageLoad: 5000 })
    return driver
}

it("handles successful login with GitHub", async () => {
    const driver = makeDriver()

    await driver.get("http://localhost:3356/login")
    await driver
        .findElement(selenium.By.id("continue-with-github-button"))
        .click()
    await driver.findElement(selenium.By.id("valid-login")).click()
    await driver.findElement(selenium.By.id("loading-indicator"))
    await driver.findElement(
        selenium.By.css(`[aria-label="Logged in as ${USER_NAME}"]`)
    )

    await driver.quit()
})

it("handles unsuccessful login with GitHub due to bad code", async () => {
    const driver = makeDriver()

    await driver.get("http://localhost:3356/login")
    await driver
        .findElement(selenium.By.id("continue-with-github-button"))
        .click()
    await driver
        .findElement(selenium.By.id("invalid-login-due-to-bad-code"))
        .click()
    await driver.findElement(selenium.By.id("loading-indicator"))
    const errorMessageEl = await driver.findElement(
        selenium.By.id("login-error-message")
    )
    expect(await errorMessageEl.getText()).toBe(BAD_CODE_ERROR_MESSAGE)

    await driver.quit()
})

it("handles unsuccessful login with GitHub due to bad state", async () => {
    const driver = makeDriver()

    await driver.get("http://localhost:3356/login")
    await driver
        .findElement(selenium.By.id("continue-with-github-button"))
        .click()
    await driver
        .findElement(selenium.By.id("invalid-login-due-to-bad-state"))
        .click()
    const errorMessageEl = await driver.findElement(
        selenium.By.id("login-error-message")
    )
    expect(await errorMessageEl.getText()).toBe("State does not match")

    await driver.quit()
})

it("handles unsuccessful login with GitHub due to unknown user", async () => {
    const driver = makeDriver()

    await driver.get("http://localhost:3356/login")
    await driver
        .findElement(selenium.By.id("continue-with-github-button"))
        .click()
    await driver
        .findElement(selenium.By.id("invalid-login-due-to-unknown-user"))
        .click()
    await driver.findElement(selenium.By.id("loading-indicator"))
    const errorMessageEl = await driver.findElement(
        selenium.By.id("login-error-message")
    )
    expect(await errorMessageEl.getText()).toBe(UNKNOWN_USER_ERROR_MESSAGE)

    await driver.quit()
})

afterAll(() => server.close())

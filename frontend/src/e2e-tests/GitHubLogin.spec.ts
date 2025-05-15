import { test as base, expect } from "@playwright/test"
import type { LoginResult } from "../models/login"

const test = base.extend({
    page: async ({ page }, use) => {
        await page.route("https://mockgithub.test/**/*", async (route) => {
            await route.fulfill({
                path: import.meta.dirname + "/github-login.html",
            })
        })

        await use(page)
    },
})

test("handles successful login with GitHub", async ({ page }) => {
    const userName = "GitHub User"

    await page.route(
        "https://mockportalapi.test/api/login/oauth2/",
        async (route) => {
            const responseData: LoginResult = {
                success: true,
                token: "HEREISYOURTOKEN",
                user: {
                    logged_in: true,
                    is_superuser: false,
                    has_password: false,
                    id: "f5f5f5f5-f5f5-f5f5-f5f5-f5f5f5f5f5f5",
                    name: userName,
                    image: undefined,
                },
            }

            await route.fulfill({ json: responseData })
        }
    )

    await page.goto("http://localhost:3356/login")
    await page.locator("#continue-with-github-button").click()
    await page.locator("#login-with-good-state").click()
    await page.locator(`[aria-label="Logged in as ${userName}"]`).isVisible()
})

test("handles unsuccessful login with GitHub due to bad code", async ({
    page,
}) => {
    const badCodeErrorMessage = "Bad code"

    await page.route(
        "https://mockportalapi.test/api/login/oauth2/",
        async (route) => {
            const responseData: LoginResult = {
                success: false,
                error: badCodeErrorMessage,
            }

            await route.fulfill({ status: 400, json: responseData })
        }
    )

    await page.goto("http://localhost:3356/login")
    await page.locator("#continue-with-github-button").click()
    await page.locator("#login-with-good-state").click()
    await expect(page.locator("#login-error-message")).toBeVisible()
    await expect(page.locator("#login-error-message")).toHaveText(
        badCodeErrorMessage
    )
})

test("handles unsuccessful login with GitHub due to bad state", async ({
    page,
}) => {
    await page.goto("http://localhost:3356/login")
    await page.locator("#continue-with-github-button").click()
    await page.locator("#login-with-bad-state").click()
    await expect(page.locator("#login-error-message")).toBeVisible()
    await expect(page.locator("#login-error-message")).toHaveText(
        "State does not match"
    )
})

test("handles unsuccessful login with GitHub due to unknown user", async ({
    page,
}) => {
    const unknownUserErrorMessage = "Unknown user"

    await page.route(
        "https://mockportalapi.test/api/login/oauth2/",
        async (route) => {
            const responseData: LoginResult = {
                success: false,
                error: unknownUserErrorMessage,
            }

            await route.fulfill({ status: 400, json: responseData })
        }
    )

    await page.goto("http://localhost:3356/login")
    await page.locator("#continue-with-github-button").click()
    await page.locator("#login-with-good-state").click()
    await expect(page.locator("#login-error-message")).toBeVisible()
    await expect(page.locator("#login-error-message")).toHaveText(
        unknownUserErrorMessage
    )
})

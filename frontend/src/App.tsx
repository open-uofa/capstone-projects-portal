import * as React from "react"
import {
    BrowserRouter as Router,
    Redirect,
    Route,
    Switch,
} from "react-router-dom"
import { useContext, useEffect, useState } from "react"
import HomePage from "./pages/Home"
import AboutPage from "./pages/About"
import ActivatePage from "./pages/Activate"
import RequestPasswordResetPage from "./pages/RequestPasswordReset"
import ResetPasswordPage from "./pages/ResetPassword"
import LoginPage from "./pages/Login"
import SettingsPage from "./pages/Settings"
import ProfilePage from "./pages/ViewProfile"
import LoginCallbackPage from "./pages/LoginCallback"
import ProjectPage from "./pages/Project"
import EditProfilePage from "./pages/EditProfile"
import EditProjectPage from "./pages/EditProject"
import EditClient from "./pages/EditClient"
import ProposalPage from "./pages/Proposal"
import ThankYouPage from "./pages/ThankYou"
import ClientOrgPage from "./pages/ViewClientOrg"
import ViewClientsPage from "./pages/ViewClients"
import ViewProjectsPage from "./pages/ViewProjects"
import GlobalStateProvider from "./global-state/provider"
import Navbar from "./components/Navbar"
import ImportPage from "./pages/ImportPage"
import { portalApiInstance } from "./api/portal-api"
import GlobalContext from "./global-state/context"
import ErrorPage from "./pages/Error"

function AppRouter(): JSX.Element | null {
    const { dispatch } = useContext(GlobalContext)

    const [
        didFinishGettingCurrentUserInfo,
        setDidFinishGettingCurrentUserInfo,
    ] = useState(false)

    // Get the current user's info on first load
    useEffect(() => {
        if (localStorage.getItem("token") === null) {
            setDidFinishGettingCurrentUserInfo(true)
        } else {
            portalApiInstance
                .getCurrentUserInfo()
                .then((currentUserInfo) => {
                    dispatch({
                        type: "SET_CURRENT_USER",
                        value: currentUserInfo,
                    })
                })
                .finally(() => {
                    setDidFinishGettingCurrentUserInfo(true)
                })
        }
    }, [dispatch])

    // Wait until the request to get current user info is finished before rendering the app
    return didFinishGettingCurrentUserInfo ? (
        <Router>
            <Navbar />
            <Switch>
                <Route path="/" exact component={HomePage} />
                <Route path="/about" exact component={AboutPage} />

                <Route path="/login" exact component={LoginPage} />
                <Route
                    path="/login/callback"
                    exact
                    component={LoginCallbackPage}
                />
                <Route path="/activate/:key" exact component={ActivatePage} />
                <Route
                    path="/reset-password/:key?"
                    exact
                    component={ResetPasswordPage}
                />
                <Route
                    path="/request-password-reset"
                    exact
                    component={RequestPasswordResetPage}
                />

                <Route path="/settings" exact component={SettingsPage} />

                <Route path="/profiles/:id/edit" component={EditProfilePage} />
                <Route path="/profiles/:id" exact component={ProfilePage} />

                <Route path="/proposal" exact component={ProposalPage} />

                <Route path="/thankyou" exact component={ThankYouPage} />
                <Route path="/projects/:id/edit" component={EditProjectPage} />
                <Route path="/projects/:id" exact component={ProjectPage} />
                <Route path="/projects" exact component={ViewProjectsPage} />
                <Route path="/clients/:id" exact component={ClientOrgPage} />
                <Route path="/clients/:id/edit" component={EditClient} />
                <Route path="/clients" exact component={ViewClientsPage} />
                <Route path="/import" exact component={ImportPage} />
                <Route path="/error/:code" exact component={ErrorPage} />
                <Route path="*" exact>
                    <Redirect to="/error/404" />
                </Route>
            </Switch>
        </Router>
    ) : null
}

export default function App(): JSX.Element {
    return (
        <GlobalStateProvider>
            <AppRouter />
        </GlobalStateProvider>
    )
}

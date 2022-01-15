import About from "../pages/About"
import BlankMarkdown from "../pages/BlankMarkdown"
import Feed from "../pages/Feed"
import Help from "../pages/Help"
import LocalPollens from "../pages/LocalPollens"

export const ExactRoutes = [
    { path: 'feed', element: <Feed/> },
    { path: 'about', element: <About /> },
    { path: 'help', element: <Help/> },
    { path: 'blankMarkdown', element: <BlankMarkdown/> },
]

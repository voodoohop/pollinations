import { Navigate, Route, Routes } from "react-router"
import { SEOMetadata } from "./components/Helmet"
import PageTemplate from "./components/PageTemplate"
import TopBar from "./components/TopBar"
import Footer from "./components/Footer"
import Home from "./pages/Home/"
import ReactGA from "react-ga4";
import SITE_METADATA from "./siteMetadata"

ReactGA.initialize(SITE_METADATA.analytics);

ReactGA.send({ hitType: 'pageview', page: window.location.pathname });
const AppRoutes = [
  {
    exact: true,
    path: '/',
    element: <Home />,
    key: 'home'
  },
  {
    exact: true,
    path: '/impressum',
    element: <PageTemplate label='impressum'/>,
    key: 'impressum'
  },
  {
    path: '*',
    element: <Navigate to="/" replace={true} />,
    key: '404'
  },
]

const App = () => <>
  <SEOMetadata/>
  <TopBar />
  <Routes>
    {
      AppRoutes.map( route => <Route {...route}/>)
    }
  </Routes>
  <Footer />
</>;

export default App

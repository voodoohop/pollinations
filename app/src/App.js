import Container from "@material-ui/core/Container"
import awaitSleep from "await-sleep"
import Debug from "debug"
import fetch from "node-fetch"
import { useCallback, useEffect } from "react"
import { Navigate, Route, Routes, useNavigate, useParams } from "react-router"
import { BrowserRouter } from "react-router-dom"
import Footer from "./components/Footer"
import PageTemplate from "./components/PageTemplate"
// Components
import ToolBar from "./components/ToolBar"
import TopBar from "./components/TopBar"
import useAWSNode from "./hooks/useAWSNode"
// Hooks
import useColabNode from "./hooks/useColabNode"
import useIPFS from "./hooks/useIPFS"
import useIPFSWrite from "./hooks/useIPFSInputWrite"
import usePollenDone from "./hooks/usePollenDone"
// Pages
import Creator from "./pages/Create"
import Feed from "./pages/Feed"
import Home from "./pages/Home"
import Models from "./pages/Models"
import ResultViewer from "./pages/ResultViewer"

const debug = Debug("AppContainer")

const ROUTES = {
  about: { label: "about", to: "/about" },
  feed: { label: "feed", to: "/feed" },
  help: { label: "help", to: "/help" },
  impressum: { label: "impressum", to: "/impressum" },
  models: { label: "create", to: '/c' },
  // integrate: { label: "integrate", to: "/integrate" },
  // myPollens: { label: "my pollens", to: "/localpollens" },
  // expo: { children: "made with pollinations", to: "/expo" },
}
const MAIN_NAV_ROUTES = [
  ROUTES.models,
  ROUTES.about, 
  ROUTES.feed,
  ROUTES.help, 
  // ROUTES.integrate, 
  // ROUTES.myPollens
]
const PAGE_ROUTES = [
  ROUTES.about,
  ROUTES.help,
  ROUTES.impressum,
  // ROUTES.integrate
]

const App = () => (
  <BrowserRouter>
    <Pollinations />
  </BrowserRouter>
)

const Pollinations = () => {
  const { node, overrideContentID, overrideNodeID } = useColabNode()
  debug("got colab node info", node)

  const navigate = useNavigate()

  const navigateToNode = useCallback((node=node) => {
    if (node.nodeID) navigate(`/n/${node.nodeID}`)
    else {
      console.error("For some reason NodeID is not set...", node)
    }
  }, [node.nodeID])

  return (
    <>
      <TopBar node={node} showNode={navigateToNode} navRoutes={MAIN_NAV_ROUTES} />

      {/* Children that get IPFS state */}
      <Container maxWidth="lg">
        <Routes>
          <Route exact path='/' element={<Home />} />
          <Route exact path={ROUTES.feed.to} element={<Feed />} />
          {
            PAGE_ROUTES.map( route => (
              <Route 
                key={route.label}
                exact
                path={route.to}
                element={<PageTemplate label={route.label} />}
              />
            ))
          }

          <Route path="c/:selected" element={<Models />} />

          <Route
            path="n/:nodeID"
            element={<NodeWithData node={node} overrideNodeID={overrideNodeID} />}
          />

          <Route
            path="envisioning"
            element={<Envisioning navigateToNode={navigateToNode} />}
          />
          <Route
            path="p/:contentID/*"
            element={
              <ModelRoutes
                node={node}
                navigateToNode={navigateToNode}
                overrideContentID={overrideContentID}
              />
            }
          />
          <Route exact path='c' element={<Navigate replace to="Anything" />} />
        </Routes>
        <Footer />
      </Container>

      <ToolBar node={node} showNode={navigateToNode} />
    </>
  )
}

const Envisioning = ({navigateToNode}) => {
  
  const ipfs = useIPFS("QmZ9aFQN1Pi8D5XDmxYNwG4HUAnH3ZbDjrYUAaehLfAeBq")
  const { node, overrideNodeID, overrideContentID } = useAWSNode()

  const dispatchInput = useIPFSWrite(ipfs, node)

  
  const dispatch = useCallback(
    async (inputs) => {
      debug("aws dispatching inputs", inputs)
      const contentID = await dispatchInput(inputs)
      debug("aws dispatched Form", contentID)
      if (overrideContentID) 
        overrideContentID(contentID)
      // POST contentID to Eleph-beecl-1OHF1H6OP0ANU-1012574990.us-east-1.elb.amazonaws.com/pollen/
      const response = await fetch("https://eleph-beecl-1OHF1H6OP0ANU-1012574990.us-east-1.elb.amazonaws.com/pollen", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({"notebook":"latent-diffusion","ipfs":contentID})
      })
      debug("waiting for response",response)
      debug("aws response", await response.text())
      
      navigateToNode(node)
    },
    [ipfs?.input, dispatchInput, node]
  )

  
  debug("got aws node", node)
  return (<div>
      <h1>Envisioning</h1>
      <Creator 
              ipfs={ipfs} 
              node={node} 
              businessEndpoint={true} 
              dispatch={dispatch}
              overrideContentID={overrideContentID} 
              navigateToNode={navigateToNode}
              />
      </div>
  )
}

const NodeWithData = ({ node, overrideNodeID }) => {
  const ipfs = useIPFS(node.contentID)
  const { nodeID } = useParams()
  const navigateTo = useNavigate()
  useEffect(() => {
    if (nodeID) overrideNodeID(nodeID)
  }, [nodeID])

  const done = usePollenDone(ipfs)
  useEffect(() => {
    if (done) {
      ;(async () => {
        await awaitSleep(300)
        navigateTo(`/p/${ipfs[".cid"]}`)
      })()
    }
  }, [done, ipfs, navigateTo])

  return <ResultViewer ipfs={ipfs} />
}

const ModelRoutes = ({ node, navigateToNode, overrideContentID }) => {
  const { contentID } = useParams()

  const ipfs = useIPFS(contentID)

  const dispatchInput = useIPFSWrite(ipfs, node)

  const dispatch = useCallback(
    async (inputs) => {
      debug("dispatching inputs", inputs)
      const contentID = await dispatchInput(inputs)
      debug("dispatched Form")
      if (overrideContentID) overrideContentID(contentID)
      navigateToNode()
    },
    [ipfs?.input, dispatchInput]
  )

  return (
    <Routes>
      <Route index element={<Navigate replace to="view" />} />
      <Route path="view" element={<ResultViewer ipfs={ipfs} />} />
      <Route path="create" element={<Creator ipfs={ipfs} node={node} dispatch={dispatch} />} />
    </Routes>
  )
}

export default App

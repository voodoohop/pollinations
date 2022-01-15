import Container from "@material-ui/core/Container"
import Link from '@material-ui/core/Link'
import awaitSleep from "await-sleep"
import Debug from "debug"
import { useCallback, useEffect } from "react"
import { Navigate, Route, Routes, useNavigate, useParams } from "react-router"
import { BrowserRouter } from "react-router-dom"

import TopBar from "./components/organisms/TopBar"
import ToolBar from "./components/ToolBar"

import useColabNode from "./hooks/useColabNode"
import useIPFS from "./hooks/useIPFS"
import useLocalPollens from "./hooks/useLocalPollens"
import usePollenDone from "./hooks/usePollenDone"

import Home from "./pages/Home"
import LocalPollens from "./pages/LocalPollens"
import Models from "./pages/Models"
import ResultViewer from "./pages/ResultViewer"
import ModelRoutes from "./routes/ModelRoutes"
import { ExactRoutes } from "./routes/PublicRoutes"

const debug = Debug("AppContainer");

const App = () => (
    <BrowserRouter>
        <Pollinations />
    </BrowserRouter>
)

const Pollinations = () => {
    const { node, overrideContentID, overrideNodeID } = useColabNode();
    debug("got colab node info", node);
    
    const navigate = useNavigate()
    
    // to save pollens since we are not necessarily on the localpollens page
    useLocalPollens(node)
    
    const navigateToNode = useCallback(() => {
        if (node.nodeID)
        navigate(`/n/${node.nodeID}`)
        else {
            // history.go(0)
            console.error("For some reason NodeID is not set...", node)
        }
    }, [node.nodeID])
        
    return <>

        <TopBar node={node} showNode={navigateToNode}/>

        <Container maxWidth='lg'>
            <Routes>
                {
                    // Exact routes without props
                    ExactRoutes
                    .map( route => <Route key={route.path} exact {...route}/>
                    )
                }
                <Route exact path='localpollens' element={<LocalPollens node={node}/>}/>
                

                <Route path='n/:nodeID' element={<NodeWithData node={node} overrideNodeID={overrideNodeID} />} />
                <Route path='p/:contentID/*' element={<ModelRoutes node={node} navigateToNode={navigateToNode} overrideContentID={overrideContentID} />} />
                <Route path='c/:selected' element={<Home />} />
                
                <Route path='models' element={<Models />}/>
                <Route index element={<Navigate replace to="c/Anything" />} />
            </Routes>
            <More />
        </Container>

        {/* <ToolBar node={node} showNode={navigateToNode} /> */}
    </>
}


const NodeWithData = ({ node, overrideNodeID }) => {
    const ipfs = useIPFS(node.contentID)
    const { nodeID } = useParams()
    const navigateTo = useNavigate()
    useEffect(() => {
        if (nodeID)
            overrideNodeID(nodeID)
    }, [nodeID])

    const done = usePollenDone(ipfs)
    useEffect(() => {  
        if (done) {
            (async () => {
                await awaitSleep(300)
                navigateTo(`/p/${ipfs[".cid"]}`)
            })()
        }
    }, [done, ipfs, navigateTo])


    return <ResultViewer ipfs={ipfs} />
}



const More = () => <div style={{ margin: '1em auto 4em auto' }}>
    Discuss, get help and contribute on
    <Link href="https://github.com/pollinations/pollinations" target="_blank"> [ Github ] </Link>
    or <Link href="https://discord.gg/XXd99CrkCr" target="_blank">[ Discord ]</Link>.
</div>

export default App;
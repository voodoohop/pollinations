import { Routes, Route, useParams, Navigate } from "react-router"
import { BrowserRouter } from "react-router-dom"
import Debug from "debug"

import useColabNode from "./hooks/useColabNode"
import useIPFS from "./hooks/useIPFS"

import Container from "@material-ui/core/Container"
import Link from '@material-ui/core/Link'

import ToolBar from "./components/ToolBar"
import AppBar from "./components/AppBar"

import ResultViewer from "./pages/ResultViewer"
import Creator from "./pages/Create"
import Home from "./pages/Home"


const debug = Debug("AppContainer");

export default function App(){

    const node = useColabNode()
    debug("got colab node info", node)
    
    return (<><BrowserRouter>
        {/* Nav Bar     */}
        <AppBar/>
        {/* Children that get IPFS state */}
        <Container maxWidth="md" >
            <Routes>
                <Route path='n/:nodeID' element={<NodeWithData { ...node } />} />
                <Route path='p/:contentID/*' element={<ModelRoutes node={node} />} />
                <Route path='/' element={<HomeWithData />} />
            </Routes>
            <More/>
        </Container>

        <ToolBar {...node}/>
    </BrowserRouter></>)
}

const HomeWithData =() => {
    const ipfs = useIPFS("/ipns/k51qzi5uqu5dhpj5q7ya9le4ru112fzlx9x1jk2k68069wmuy6gps5i4nc8888" );
    
    debug("home ipfs",ipfs);
    
    return <Home ipfs={ipfs} />
}

const NodeWithData = ({ contentID }) => {
    const ipfs = useIPFS(contentID)
    
    if (ipfs?.output?.done) return <Navigate to={`/p/${ipfs[".cid"]}`}/>
    
    return <ResultViewer ipfs={ipfs} />
}

const ModelRoutes = ({ node }) => {
    const { contentID } = useParams();
    const ipfs = useIPFS(contentID);
    return (
        <Routes>
            <Route index element={<Navigate replace to="view" />} />
            <Route path='view' element={<ResultViewer ipfs={ipfs} />} />
            <Route path='create' element={<Creator ipfs={ipfs} node={node} />} />
        </Routes>
    )
}

const More = () => <div style={{margin: '1em auto 4em auto'}}>
  Discuss, get help and contribute on 
  <Link href="https://github.com/pollinations/pollinations/discussions" target="_blank"> [ Github ] </Link>  
  or <Link href="https://discord.gg/XXd99CrkCr" target="_blank">[ Discord ]</Link>.
</div>
